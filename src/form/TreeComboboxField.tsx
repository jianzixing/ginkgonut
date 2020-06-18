import Ginkgo, {CSSProperties, GinkgoElement, GinkgoNode, InputComponent, RefObject} from "ginkgoes";
import ComboboxField, {ComboboxFieldProps, ComboboxModel} from "./ComboboxField";
import Tree from "../tree/Tree";
import Loading from "../loading/Loading";
import DataEmpty from "../empty/DataEmpty";

export interface TreeComboboxFieldProps extends ComboboxFieldProps {
    
}

export default class TreeComboboxField<P extends TreeComboboxFieldProps> extends ComboboxField<P> {
    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);
    }

    protected buildFieldPicker(): GinkgoNode {
        if (this.props.picker) {
            console.warn("TreeComboboxField can't support picker props");
        }

        let list = null, style: CSSProperties = {};
        if (this.isLoading) {
            list = (
                <Loading/>
            );
            style.height = 80;
        } else {
            if (this.data && this.data instanceof Array && this.data.length > 0) {
                list = <Tree data={this.data}
                             displayField={this.props.displayField}
                             onTreeItemClick={(e, data) => {
                                 let model = this.data2Models([data.data]);
                                 if (model && model.length > 0) {
                                     this.onItemClick(e, model[0]);
                                 }
                             }}></Tree>;
            } else {
                list = (
                    <DataEmpty/>
                )
            }
        }
        return (
            <div
                className={ComboboxField.comboboxFieldPicker}
                style={style}>
                {list}
            </div>)
    }
}
