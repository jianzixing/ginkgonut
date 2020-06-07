import Ginkgo, {GinkgoNode} from "ginkgoes";
import DataStore from "../store/DataStore";
import {TableItemModel} from "../grid/Table";
import TreeGridPanel from "../tree/TreeGridPanel";
import DisplayImage from "../image/DisplayImage";
import Button from "../button/Button";
import Toolbar from "../toolbar/Toolbar";
import MessageBox from "../window/MessageBox";
import {AppManager, AppManagerProps} from "./AppPanel";
import {getImageDownload} from "./App";

export interface GoodsGroupManagerProps extends AppManagerProps {

}

export default class GoodsGroupManager extends AppManager<GoodsGroupManagerProps> {
    protected store = new DataStore({
        api: "http://localhost:8080/admin/GoodsGroup/getGoodsGroups.jhtml",
        module: GoodsGroupManager.name,
        autoLoad: true,
        root: true,
        dataField: "data"
    });
    protected selects: Array<TableItemModel>;

    render(): GinkgoNode {
        return (
            <TreeGridPanel
                store={this.store}
                columns={[
                    {title: '分组名称', width: 300, dataIndex: 'name'},
                    {
                        title: '分类图片', width: 100, dataIndex: 'logo',
                        render: value => {
                            return <DisplayImage src={getImageDownload(value)}/>
                        }
                    },
                    {title: '排序', width: 100, dataIndex: 'pos'},
                    {title: '描述', width: 400, dataIndex: 'detail'}
                ]}
                treeDataIndex={"name"}
                onSelectChange={(sel) => {
                    this.selects = sel;
                }}
                toolbars={[
                    <Toolbar>
                        <Button iconType={"list"}
                                text={"列出商品分类"}
                                iconColor={"#4c82b1"}
                                onClick={e => {
                                    this.store && this.store.load();
                                }}/>
                        <Button iconType={"plus"}
                                text={"添加商品分类"}
                                iconColor={"#1db0b8"}
                                onClick={e => {
                                }}/>
                        <Button iconType={"trash-alt"}
                                text={"批量删除"}
                                iconColor={"#B31800"}
                                onClick={e => {
                                    if (this.selects && this.selects.length > 0) {
                                        let ids = [];
                                        for (let sel of this.selects) {
                                            ids.push(sel.data['id']);
                                        }
                                        MessageBox.showConfirm("删除商品分组", "确定删除所选商品分组吗？", e => {

                                        });
                                    }
                                }}/>
                    </Toolbar>
                ]}/>
        )
    }
}
