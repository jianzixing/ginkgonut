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

export default class App extends Ginkgo.Component {
    protected appContentRef: RefObject<AppContent<any>> = Ginkgo.createRef();
    protected isUserLogin = false;
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
            return <Login onLoginSuccess={() => {
                this.isUserLogin = true;
                this.forceRender();
            }}/>
        } else {
            return (
                <ViewPort>
                    <BorderLayout>
                        <BorderLayoutItem type={"north"} height={52}>
                            <AppHeader onLoginOut={() => {
                                this.isUserLogin = false;
                                this.forceRender();
                            }}/>
                        </BorderLayoutItem>
                        <BorderLayoutItem type={"west"} split={true} width={215}>
                            <Panel title={"工作台"} collapse={true} collapseType={"left"}>
                                <AppNavigation onModuleItemClick={model => {
                                    let key = model.key;
                                    for (let content of this.contents) {
                                        if (content.key == key) {
                                            return;
                                        }
                                    }
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
}
