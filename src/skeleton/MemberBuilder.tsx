import Ginkgo, {GinkgoNode} from "ginkgoes";

import "./MemberBuilder.scss";
import {AppManager, AppManagerProps} from "./AppPanel";
import FormPanel from "../panel/FormPanel";
import Button from "../button/Button";
import Toolbar from "../toolbar/Toolbar";

export interface MemberBuilderProps extends AppManagerProps {

}

export default class MemberBuilder<P extends MemberBuilderProps> extends AppManager<P> {

    render(): GinkgoNode {
        return (
            <FormPanel
                layout={false}
                toolbars={[
                    <Toolbar>
                        <Button iconType={"reply"}
                                iconColor={"#b8288a"}
                                text={"返回列表"}
                                onClick={e => {
                                    this.back();
                                }}/>
                        <Button iconType={"save"}
                                iconColor={"#30c461"}
                                text={"保存会员"}
                                type={"submit"}/>
                    </Toolbar>
                ]}
                onSubmit={(values, formData) => {
                    console.log(values);
                }}>

                <div className={"mg-member-builder"}>
                    <div className={"mg-member-builder-left"}>

                    </div>
                    <div className={"mg-member-builder-right"}>

                    </div>
                </div>

            </FormPanel>
        )
    }
}
