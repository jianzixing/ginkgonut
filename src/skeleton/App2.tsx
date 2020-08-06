import Ginkgo, {CSSProperties, GinkgoNode} from "ginkgoes";
import Button from "../button/Button";
import ButtonGroup from "../button/ButtonGroup";
import Panel from "../panel/Panel";
import FormPanel from "../panel/FormPanel";
import TextField from "../form/TextField";
import NumberTextField from "../form/NumberTextField";
import TreePanel from "../tree/TreePanel";

export default class App2 extends Ginkgo.Component {
    render(): GinkgoNode {
        let style: CSSProperties = {width: "100%", overflow: "hidden"}
        return <div>
            {/*<div style={style}>*/}
            {/*    <Button text={"按钮"} menuModels={[*/}
            {/*        {text: "Menu1"},*/}
            {/*        {text: "Menu2"},*/}
            {/*        {text: "Menu3"}*/}
            {/*    ]}></Button>*/}
            {/*</div>*/}
            {/*<div style={style}>*/}
            {/*    <ButtonGroup buttons={[*/}
            {/*        {text: "按钮1"},*/}
            {/*        {text: "按钮2"},*/}
            {/*        {text: "按钮3"}*/}
            {/*    ]}/>*/}
            {/*</div>*/}
            {/*<div style={style}>*/}
            {/*    <Panel title={"Panel"} width={500} height={200} border={true}>*/}
            {/*        <span>refactor code</span>*/}
            {/*    </Panel>*/}
            {/*</div>*/}
            {/*<div style={style}>*/}
            {/*    <FormPanel title={"Form Panel"} width={500} height={100} layout={{column: 2}}>*/}
            {/*        <span>a</span>*/}
            {/*        <span>b</span>*/}
            {/*    </FormPanel>*/}
            {/*</div>*/}
            {/*<div style={style}>*/}
            {/*    <FormPanel title={"Form Panel"} width={500} height={380} layout={{column: 2}}>*/}
            {/*        <TextField fieldLabel={"文本"} value={"abc"}/>*/}
            {/*        <NumberTextField fieldLabel={"数字文本"}/>*/}
            {/*    </FormPanel>*/}
            {/*</div>*/}
            <div style={style}>
                <TreePanel title={"TreePanel"}
                           width={500}
                           height={200}
                           data={[
                               {
                                   text: "A", children: [
                                       {text: "B"},
                                       {text: "C"}
                                   ]
                               }
                           ]}></TreePanel>
            </div>
        </div>
    }
}
