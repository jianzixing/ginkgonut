import Ginkgo, {CSSProperties, GinkgoNode} from "ginkgoes";
import Button from "../button/Button";
import ButtonGroup from "../button/ButtonGroup";

export default class App2 extends Ginkgo.Component {
    render(): GinkgoNode {
        let style: CSSProperties = {width: "100%", overflow: "hidden"}
        return <div>
            <div style={style}>
                <Button text={"按钮"} menuModels={[
                    {text: "Menu1"},
                    {text: "Menu2"},
                    {text: "Menu3"}
                ]}></Button>
            </div>
            <div style={style}>
                <ButtonGroup buttons={[
                    {text: "按钮1"},
                    {text: "按钮2"},
                    {text: "按钮3"}
                ]}/>
            </div>
            <div style={style}>
            </div>
        </div>
    }
}
