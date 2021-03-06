import Ginkgo, {CSSProperties, GinkgoNode, RefObject} from "ginkgoes";
import TreePanel from "../tree/TreePanel";
import FormLayout from "../layout/FormLayout";
import Button from "../button/Button";

import BorderLayout, {BorderLayoutItem} from "../layout/BorderLayout";
import Component, {ComponentProps} from "../component/Component";
import APIModule from "./APIModule";

export interface NavModuleModel {
    key?: string;
    text?: string;
    icon?: string;
    iconType?: string;
    name?: string;
    module?: any;
    props?: any;
    selected?: boolean;
    data?: any;
}

export interface AppNavigationProps extends ComponentProps {
    data: Array<any>;
    onModuleItemClick?: (value: NavModuleModel) => void;
}

const GlobalAuthorizes = {};

export default class AppNavigation extends Component<AppNavigationProps> {
    protected treePanelRef: RefObject<TreePanel<any>> = Ginkgo.createRef();
    protected modules: Array<NavModuleModel> = [];

    drawing(): GinkgoNode {
        let buttonStyle = {
            width: "100%",
            height: 36,
            fontSize: 12
        }

        let buttons = [];
        for (let b of this.modules) {
            buttons.push(<Button style={buttonStyle}
                                 action={"none"}
                                 text={b.text}
                                 icon={b.icon}
                                 pressing={b.selected}
                                 outerStyle={{border: 0, color: "#000000"}}
                                 onClick={e => {
                                     this.onButtonClick(b);
                                 }}/>)
        }

        return (
            <BorderLayout>
                <BorderLayoutItem type={"north"}>
                    <FormLayout column={3}
                                spacingH={0}
                                spacingV={0}
                                padding={"0 0"}
                                style={{backgroundColor: "#ffffff"}}>
                        {buttons}
                    </FormLayout>
                </BorderLayoutItem>
                <BorderLayoutItem type={"center"}>
                    <TreePanel
                        key={"tree"}
                        ref={this.treePanelRef}
                        showCheckbox={true}
                        title={"Examples"}
                        titleIconType={"university"}
                        onTreeItemClick={(e, model) => {
                            if (this.props.onModuleItemClick) {
                                let data = model.data;

                                this.props.onModuleItemClick({
                                    text: data['text'],
                                    name: data['linkModule'],
                                    icon: data['icon'],
                                    iconType: data['iconType'],
                                    module: data['module'],
                                    props: data['props'],
                                    data: data
                                });
                            }
                        }}
                        onCheckboxChange={(item, checked, checkItems) => {
                            console.log(checkItems)
                        }}
                    />
                </BorderLayoutItem>
            </BorderLayout>
        );
    }

    componentRenderUpdate() {
        if (this.modules && this.modules.length > 0) {
            let hasSelected = false;
            for (let m of this.modules) {
                if (m.selected) hasSelected = true;
            }
            if (!hasSelected) {
                this.onButtonClick(this.modules[0]);
            }
        }
    }

    protected onButtonClick(module: NavModuleModel) {
        for (let m of this.modules) {
            m.selected = false;
        }
        module.selected = true;
        this.setState();

        this.onModuleButtonClick(module);
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == "data" && newValue != oldValue) {
            this.modules = [];
            for (let v of newValue) {
                this.modules.push({
                    text: v['text'],
                    name: v['module'],
                    icon: v['tabIcon'],
                    iconType: v['icon'],
                    module: v['module'],
                    data: v
                })
            }
        }
        return false;
    }

    onModuleButtonClick(module) {
        let name = module.name;
        try {
            APIModule.getTreeAuthModules(name)
                .progress(e => {
                    console.log(e);
                })
                .load(data => {
                    let auths = data['auths'];
                    GlobalAuthorizes[module] = auths;
                    if (auths && auths instanceof Array && auths.length > 0) {
                        for (let auth of auths) {
                            if (!Ginkgo.TakeParts) Ginkgo.TakeParts = [];
                            if (Ginkgo.TakeParts.indexOf(auth) == -1) {
                                Ginkgo.TakeParts.push(auth['key']);
                            }
                        }
                    }
                    if (this.treePanelRef && this.treePanelRef.instance) {
                        this.treePanelRef.instance.set({data: data['modules'], title: module['text']});
                    }
                });
        } catch (e) {
            console.error(e);
        }
    }

    protected getRootStyle(): CSSProperties {
        let style = super.getRootStyle();
        style.width = "100%";
        style.height = "100%";
        return style;
    }
}
