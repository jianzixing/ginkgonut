import Ginkgo from "ginkgoes";
import MessageBox from "../window/MessageBox";

export const server = process.env.NODE_ENV == 'development' ? "http://localhost:8080" : 'https://www.jianzixing.com.cn';
export const run_env = process.env.NODE_ENV;
export const ext = "jhtml";

console.log(server)

interface Parameter {
    name: string;
    index: number;
}

const MethodMappingParams: { [key: string]: Array<Parameter> } = {};

/**
 * type == 1 : 返回域名+url地址
 * type == 2 : 返回域名+admin+地址+页面后缀
 *
 * @param url
 * @param type
 */
export const getRequestMapping = function (url?: string, type?: number): string {
    if (type == 1) {
        return server + url;
    }
    if (type == 2) {
        return server + "/admin" + url + "." + ext;
    }
    return server + url + "." + ext;
};

export const getFileMapping = function (fileName: string, suffix?: string): string {
    if (typeof fileName === "string") {
        suffix = suffix || "";
        fileName = fileName.trim();
        if (fileName.toLowerCase().indexOf("http://") == 0
            || fileName.toLowerCase().indexOf("https://") == 0) {
            return fileName;
        } else if (fileName.toLowerCase().indexOf("local://") == 0) {
            return server + fileName.substring(7, fileName.length);
        } else if (fileName.indexOf("/") >= 0) {
            if (fileName.startsWith("/")) {
                return `${server}/${suffix}${fileName}`;
            } else {
                return `${server}/${suffix}/${fileName}`;
            }
        } else {
            // return `${server}/web/file/load.html?f=${fileName}`;
            return `${server}/web/loadfile/${fileName}`;
        }
    }
    return "";
};

/**
 * 声明一个装饰器，第三个参数是 "成员的属性描述符"，如果代码输出目标版本(target)小于 ES5 返回值会被忽略。
 */
export const Request = function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let originalApiName = target.name;
    let methodName = propertyKey;
    let method = descriptor.value;

    let apiName = "";
    if (originalApiName.indexOf('API') === 0) {
        apiName = originalApiName.substring(3, originalApiName.length);
    }

    descriptor.value = (...obj: any) => {
        const reqs = new Submit(apiName, methodName, method);
        let arrParams: Array<Parameter> = MethodMappingParams[originalApiName + '.' + methodName];
        if (arrParams && arrParams.length > 0) {
            let paramObj: { [key: string]: Object } = {};

            for (let param of arrParams) {
                let name = param.name;
                let index: number = param.index;
                paramObj[name] = obj[index];
            }
            reqs.setParams(paramObj);
        }
        return reqs;
    }
};

export const RequestMapping = function (url: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let originalApiName = target.name;
        let methodName = propertyKey;
        let method = descriptor.value;
        let myUrl = url;

        let apiName = "";
        if (originalApiName.indexOf('API') === 0) {
            apiName = originalApiName.substring(3, originalApiName.length);
        }

        descriptor.value = (...obj: any) => {
            const reqs = new Submit(apiName, methodName, method);
            if (myUrl) reqs.setUrl(myUrl);
            let arrParams: Array<Parameter> = MethodMappingParams[originalApiName + '.' + methodName];
            if (arrParams && arrParams.length > 0) {
                let paramObj: { [key: string]: Object } = {};

                for (let param of arrParams) {
                    let name = param.name;
                    let index: number = param.index;
                    paramObj[name] = obj[index];
                }
                reqs.setParams(paramObj);
            }
            return reqs;
        }
    }
};

/**
 * 声明一个装饰器，用来放在参数上标识参数的名称
 */
export const Required = function (name: string) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        let apiName = target.name;
        let methodName = propertyKey;
        let arr: Array<Parameter> = MethodMappingParams[apiName + '.' + methodName];
        if (!arr) arr = [];
        arr.push({name, index: parameterIndex});
        MethodMappingParams[apiName + '.' + methodName] = arr;
    }
};

export class Submit {
    private readonly apiName: string;
    private readonly methodName: string;
    private url: string;
    private method: any;

    private params: { [key: string]: Object };
    private extParams: { [key: string]: Object | undefined } | undefined;
    private callAnyway: () => void;

    constructor(apiName: string, methodName: string, method: any) {
        this.apiName = apiName;
        this.methodName = methodName;
        this.method = method;
    }

    anyway(called: () => void): Submit {
        this.callAnyway = called;
        return this;
    };


    load = (succ?: (data: any) => void, fail?: (message: any) => any) => {
        this.fetch(undefined, succ, fail);
    };

    /**
     * 拉取网络数据
     * @param module 当前请求的模板
     * @param succ 请求成功的回调(code=100),默认情况下参数是data['data']
     * @param fail 请求失败的回调
     * @param keepStruct 保持succ函数的参数是返回的值
     */
    fetch = (module?: string | undefined, succ?: (data: any) => void, fail?: (message: any) => any, keepStruct?: boolean) => {
        let url = "", self = this;
        if (this.url) {
            url = server + this.url;
        } else {
            url = server + '/admin/' + this.apiName + "/" + this.methodName + "." + ext;
        }
        Ginkgo.post(url, this.getParamEncoding(module))
            .then(function (response) {
                let data: any = response.data;
                if (typeof data != "object") {
                    data = JSON.parse(response.data);
                }
                if (self.callAnyway) {
                    try {
                        self.callAnyway()
                    } catch (e) {
                        console.error(e);
                    }
                }
                if (("" + data['code']) == "100") {
                    if (succ) {
                        try {
                            if (keepStruct) {
                                succ(data);
                            } else {
                                succ(data['data'])
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                } else {
                    let isShowError: any = true;
                    if (fail) isShowError = fail(data);
                    if (isShowError != false) {
                        self.showAjaxError(data, 1);
                    }
                }
            })
            .catch(function (error) {
                let isShowError: any = true;
                if (self.callAnyway) {
                    try {
                        self.callAnyway()
                    } catch (e) {
                        console.error(e);
                    }
                }
                if (fail) isShowError = fail(error);
                if (isShowError != false) {
                    self.showAjaxError(error, 2);
                }
            });
        return this;
    };

    setParams(params: { [key: string]: Object }) {
        this.params = params;
    };

    getParams(): { [key: string]: Object } {
        return this.params;
    };

    addExtParams(params: { [key: string]: Object }) {
        if (!this.extParams) {
            this.extParams = params;
        } else {
            this.extParams = {
                ...this.extParams,
                ...params
            }
        }
    };

    removeExtParams(params: { [key: string]: Object }) {
        if (this.extParams) {
            for (const key in params) {
                this.extParams[key] = undefined;
            }
        }
    };

    getExtParams(): any {
        return this.extParams;
    }

    hasExtParams(obj: any): boolean {
        if (this.extParams != undefined) {
            if (this.extParams[obj]) {
                return true;
            }
        }
        return false;
    }

    clearExtParams() {
        this.extParams = undefined;
    };

    setUrl(url: string) {
        this.url = url;
    };

    getUrl(): string {
        let url = "";
        if (this.url) {
            url = server + this.url;
        } else {
            url = server + '/admin/' + this.apiName + "/" + this.methodName + "." + ext;
        }
        return url;
    }

    getParamUrl() {
        let url = this.getUrl();
        let params = this.getParamEncoding();
        if (params) {
            url = url + "?" + params;
        }
        return url;
    }

    private getParamEncoding(module?: string) {
        const copyParams = {...this.params, ...this.extParams};

        if (copyParams && typeof copyParams === "object") {
            const str = [];
            for (let i in copyParams) {
                const obj = copyParams[i];
                str.push(i + "=" + encodeURIComponent(this.getParamValue(obj)));
            }
            if (module) {
                str.push("_page=" + module);
            }
            if (str.length > 0) {
                return str.join("&");
            } else {
                return "";
            }
        }
        return copyParams;
    }

    private getParamValue(obj: any): string {
        if (typeof obj === "object") {
            return JSON.stringify(obj);
        }
        if (obj instanceof Array) {
            return JSON.stringify(obj);
        }
        if (typeof obj === "function") {
            return this.getParamValue(obj());
        }
        if (typeof obj === "string") {
            return obj;
        }
        if (typeof obj === "number") {
            return "" + obj;
        }

        if (obj === null || obj === undefined) {
            return "";
        }

        return "" + obj;
    }

    private showAjaxError(error: any, type: number): void {
        if (type == 1) {
            if (error && ("" + error['code']) != "100") {
                MessageBox.showAlert("请求数据出错", error['msg'])
            }
        }
        if (type == 2) {
            MessageBox.showAlert("请求数据出错", error.message)
        }
    }
}
