import Ginkgo, {HTMLComponent, RefObject} from "ginkgoes";
import Panel, {PanelProps} from "../panel/Panel";
import {IconTypes} from "../icon/IconTypes";
import ViewPort from "../panel/ViewPort";
import BorderLayout, {BorderLayoutItem} from "../layout/BorderLayout";

import AppHeader from "./AppHeader";
import AppNavigation from "./AppNavigation";
import AppContent, {TabContentModel} from "./AppContent";
import TestManager from "./TestManager";
import Login from "./Login";
import "./App.scss";
import APIAdmin from "./APIAdmin";
import {setRequestServer} from "../http/Request";
import APIModule from "./APIModule";
import {ViewMapping} from "./mapping";

setRequestServer(params => {
    if (params.url) {
        return params.url;
    }
    if (params.className && params.methodName) {
        return "http://localhost:8080/admin/" + params.className.toLowerCase() + "/" + params.methodName.toLowerCase() + ".jhtml";
    }
})

export function getImageDownload(f: string) {
    if (f) {
        if (f && f.startsWith("http://")) return f;
        return "http://localhost:8080/web/image/load.jhtml?f=" + f;
    }
    return undefined;
}

export default class App extends Ginkgo.Component {
    protected appContentRef: RefObject<AppContent<any>> = Ginkgo.createRef();
    protected isUserLogin = false;
    protected isCheckLogin = true;
    protected moduleList;
    protected contents: Array<TabContentModel> = [
        {
            key: "home",
            title: "主页",
            iconType: IconTypes.home,
            action: true,
            module: {module: TestManager},
            closable: false
        }
    ];

    render() {
        if (!this.isUserLogin) {
            return <Login
                enableValidCode={true}
                checkLogin={this.isCheckLogin}
                codeUrl={"http://localhost:8080/valcode/image.jhtml"}
                onLoginClick={(info, login) => {
                    login.setStatus("正在登录", 1);
                    APIAdmin.login(info.userName, info.password)
                        .load(data => {
                            login.setStatus("正在加载权限", 1);
                            APIModule.getModules()
                                .load(data => {
                                    this.moduleList = data;
                                    localStorage.setItem("$jianzixing_modules", JSON.stringify(data));
                                    this.isUserLogin = true;
                                    this.forceRender();
                                })
                        }, message => {
                            login.setStatus("登录", 0);
                        })
                }}/>
        } else {
            return (
                <ViewPort>
                    <BorderLayout>
                        <BorderLayoutItem type={"north"} height={52}>
                            <AppHeader
                                title={"简子行建站平台"}
                                onLoginOut={() => {
                                    APIAdmin.loginOut()
                                        .load(data => {
                                            this.isUserLogin = false;
                                            this.forceRender();
                                        });
                                }}/>
                        </BorderLayoutItem>
                        <BorderLayoutItem type={"west"} split={true} width={215}>
                            <Panel title={"工作台"} collapse={true} collapseType={"left"}>
                                <AppNavigation
                                    data={this.moduleList}
                                    onModuleItemClick={model => {
                                        let key = model.key;
                                        for (let content of this.contents) {
                                            if (content.key == key) {
                                                return;
                                            }
                                        }
                                        let comp = ViewMapping[model.module];
                                        model.module = comp;
                                        this.contents.map(value => value.action = false);
                                        this.contents.push({
                                            key: model.text,
                                            title: model.text,
                                            action: true,
                                            module: model,
                                            icon: model.icon,
                                            iconType: model.iconType
                                        });
                                        if (this.appContentRef.instance) {
                                            this.appContentRef.instance.setItemsAndRedrawing(this.contents);
                                        }
                                    }}/>
                            </Panel>
                        </BorderLayoutItem>
                        <BorderLayoutItem type={"center"}>
                            <AppContent ref={this.appContentRef} items={this.contents}/>
                        </BorderLayoutItem>
                    </BorderLayout>
                </ViewPort>
            )
        }
    }

    componentDidMount() {
        this.isCheckLogin = true;
        APIAdmin.isLogin()
            .load(data => {
                try {
                    let user;
                    if (typeof data == "string") {
                        user = JSON.parse(data);
                    } else {
                        user = data;
                    }
                    let modules = localStorage.getItem("$jianzixing_modules");
                    modules = JSON.parse(modules);
                    if (user.type == "1" && modules && modules.length > 0) {
                        this.isUserLogin = true;
                        this.isCheckLogin = false;
                        this.moduleList = modules;
                        this.forceRender();
                    } else {
                        this.isCheckLogin = false;
                        this.forceRender();
                    }
                } catch (e) {
                    this.isCheckLogin = false;
                    this.forceRender();
                }
            })
    }
}
