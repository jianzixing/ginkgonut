import Ginkgo from "ginkgoes";
import MessageBox from "../window/MessageBox";

let getServerFunction: (params: { className?: string, methodName?: string, url?: string }) => string = (params => {
    if (params.url) {
        return params.url;
    }
    if (params.className && params.methodName) {
        return "/" + params.className.toLowerCase() + "/" + params.methodName.toLowerCase();
    }
    return "";
});

export function setRequestServer(callback: (params: { className?: string, methodName?: string, url?: string }) => string) {
    getServerFunction = callback;
}

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
        let methodStr = method.toString();
        let s1 = methodStr.match(/\(.*?\)/g);
        let m1 = s1[0].substring(1, s1[0].length - 1).split(",");
        let params: { [key: string]: Object } = {};
        for (let i = 0; i < m1.length; i++) {
            let m2 = m1[i];
            params[m2] = obj[i];
        }
        const reqs = new Submit(apiName, methodName, method);
        reqs.setParams(params);

        return reqs;
    }
};

export interface RequestDecoratorConfig {
    url?: string;
    module?: string; // className
    action?: string; // methodName
    keys?: string[]; // 方法参数字段名称
}

export const Requests = function (config: RequestDecoratorConfig) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let originalApiName = target.name;
        let methodName = propertyKey;
        let method = descriptor.value;
        let myUrl = config.url;

        let apiName = "";
        if (config.module) {
            apiName = config.module;
        } else {
            if (originalApiName.indexOf('API') === 0) {
                apiName = originalApiName.substring(3, originalApiName.length);
            }
        }
        if (config.action) {
            methodName = config.action;
        }

        descriptor.value = (...obj: any) => {
            const reqs = new Submit(apiName, methodName, method);
            if (myUrl) {
                reqs.setUrl(myUrl);
            }
            let keys;
            if (config.keys) {
                keys = config.keys;
            } else {
                let methodStr = method.toString();
                let s1 = methodStr.match(/\(.*?\)/g);
                keys = s1[0].substring(1, s1[0].length - 1).split(",");
            }
            let params: { [key: string]: Object } = {};
            for (let i = 0; i < keys.length; i++) {
                let m2 = keys[i];
                params[m2] = obj[i];
            }
            reqs.setParams(params);

            return reqs;
        }
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
            url = getServerFunction({url: this.url});
        } else {
            url = getServerFunction({className: this.apiName, methodName: this.methodName});
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
            url = getServerFunction({url: this.url});
        } else {
            url = getServerFunction({className: this.apiName, methodName: this.methodName});
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
            let msg = error.message || "";
            msg += "响应码 " + error['statusCode'] + ""
            MessageBox.showAlert("请求数据出错", msg)
        }
    }
}
