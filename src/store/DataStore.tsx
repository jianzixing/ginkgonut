import Ginkgo from "ginkgoes";
import {Submit} from "../http/Request";

export interface StoreProcessor {
    storeBeforeLoad?(): void;

    storeLoaded(data: Object | Array<Object>, total?: number, originData?: any): void;

    storeAfterLoad?(): void;
}

export interface StoreAutoLoad {
    storeAutoLoad(): void;
}

export interface DataStoreProps {
    // 是否自动加载
    autoLoad?: boolean;
    type?: "ajax" | "storage";
    api: string | Submit;
    method?: "post" | "get",
    dataType?: "json";
    params?: any,
    module?: string; // 模块名称
    moduleName?: string; // 模块参数名称

    // 是否需要使用dataField获取数据中的数据 true 不需要 false 需要
    root?: boolean;
    totalField?: string;
    dataField?: string;
}

export default class DataStore {
    private readonly props: DataStoreProps;
    protected processor: Array<StoreProcessor>;
    protected data: any;

    protected pagingParam: Object;
    protected status = 0;
    protected isAutoLoaded = false;

    constructor(props: DataStoreProps) {
        this.props = {
            autoLoad: false,
            type: "ajax",
            method: "get",
            dataType: "json",
            root: false,
            totalField: "total",
            dataField: "records",
            ...props
        };
    }

    setPagingParam(pagingParam: Object): void {
        this.pagingParam = pagingParam;
    }

    addProcessor(processor: StoreProcessor): void {
        if (!this.processor) this.processor = [];
        if (this.processor.indexOf(processor) == -1) {
            this.processor.push(processor);
            if (this.data) {
                if (this.props.dataType == "json") {
                    this.setStoreJsonData(processor, this.data);
                }
            }
            let rms;
            for (let p of this.processor) {
                if (Ginkgo.getComponentStatus(p as any) == null) {
                    if (!rms) rms = [];
                    rms.push(p);
                }
            }
            if (rms) {
                for (let rm of rms) {
                    this.processor.splice(this.processor.indexOf(rm), 1);
                }
            }

            this.startAutoLoad();
        }
    }

    private startAutoLoad() {
        if (this.props.autoLoad && !this.isAutoLoaded) {
            setTimeout(() => {
                let isAutoLoad = false;
                if (this.processor instanceof Array) {
                    for (let p of this.processor) {
                        if (p['storeAutoLoad'] && typeof p['storeAutoLoad'] == "function") {
                            try {
                                p['storeAutoLoad']();
                                isAutoLoad = true;
                            } catch (e) {
                                console.error("processor auto load error", e);
                            }
                        }
                    }
                }
                if (!isAutoLoad) this.load();
            }, 100);

            this.isAutoLoaded = true;
        }
    }

    removeProcessor(processor: StoreProcessor): void {
        if (this.processor) {
            this.processor = this.processor.filter(value => value != processor);
        }
    }

    load(ext?: Object): void {
        try {
            if (this.props.type == "ajax") {
                let params = {
                    ...(this.props.params || {}),
                    ...(this.pagingParam || {}),
                    ...(ext || {})
                };
                if (module) params[this.props.moduleName || '_page'] = this.props.module;
                if (params) {
                    for (let k in params) {
                        if (params[k] == null) delete params[k];
                    }
                }
                if (this.props.api) {
                    this.processor && this.processor.map(value => {
                        try {
                            value && value.storeBeforeLoad && value.storeBeforeLoad();
                        } catch (e) {
                            console.error("call store before load error", e);
                        }
                    });
                    this.status = 1;
                    let promise;
                    if (this.props.api instanceof Submit) {
                        let api = this.props.api;
                        let newParams = {...api.getParams() || {}, ...params,}
                        if (newParams) {
                            for (let k in newParams) {
                                if (newParams[k] == null) delete newParams[k];
                            }
                        }

                        if (this.props.method == "post") {
                            promise = Ginkgo.post(api.getUrl(), newParams, {withCredentials: true});
                        } else {
                            promise = Ginkgo.get(api.getUrl(), newParams, {withCredentials: true});
                        }
                    } else {
                        if (this.props.method == "post") {
                            promise = Ginkgo.post(this.props.api, params, {withCredentials: true});
                        } else {
                            promise = Ginkgo.get(this.props.api, params, {withCredentials: true});
                        }
                    }

                    promise.then(value => {
                        this.status = 0;
                        this.setStoreData(value);
                        this.processor && this.processor.map(value => {
                            value && value.storeAfterLoad && value.storeAfterLoad()
                        });
                    }).catch(reason => {
                        this.status = 0;
                        this.setStoreData(null, reason);
                        this.processor && this.processor.map(value => {
                            value && value.storeAfterLoad && value.storeAfterLoad()
                        });
                    });
                } else {
                    console.error("miss api config");
                }
            }
            if (this.props.type == "storage" && this.props.api) {
                this.processor && this.processor.map(value => {
                    value && value.storeBeforeLoad && value.storeBeforeLoad()
                });
                let api = this.props.api;
                if (typeof api == "string") {
                    let value = localStorage.getItem(api);
                    this.setStoreData(value);
                    this.processor && this.processor.map(value => {
                        value && value.storeAfterLoad && value.storeAfterLoad()
                    });
                }
            }
        } catch (e) {
            console.error("load data error", e);
        }
    }

    private setStoreData(value: any, error?: any): void {
        if (value) {
            if (this.props.dataType == "json") {
                let data = value;
                if (typeof value == "string") {
                    data = JSON.parse(value);
                }
                this.data = data;
                this.setAllStoreJsonData(this.data);
            }
        } else {
            this.setAllStoreJsonData(null, error);
        }
    }

    private setAllStoreJsonData(data: Object, error?: any): void {
        if (this.processor) {
            for (let p of this.processor) {
                try {
                    this.setStoreJsonData(p, data, error);
                } catch (e) {
                    console.error("data store processor call storeLoaded error", e);
                }
            }
        }
    }

    private setStoreJsonData(processor: StoreProcessor, data: Object, error?: any): void {
        if (this.props.root) {
            processor && processor.storeLoaded(data, null, data);
        } else {
            if (data) {
                let dt = data[this.props.dataField];
                let ct = data[this.props.totalField];
                processor && processor.storeLoaded(dt, ct, data);
            } else {
                processor && processor.storeLoaded(null, 0, data);
            }
        }
    }
}
