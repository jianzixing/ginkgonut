import Ginkgo, {GinkgoElement} from "ginkgoes";
import Toolbar, {ToolbarProps, ToolbarSplit} from "./Toolbar";
import Button from "../button/Button";
import {IconTypes} from "../icon/IconTypes";
import TextField from "../form/TextField";
import {StoreAutoLoad, StoreProcessor} from "../store/DataStore";
import "./PagingToolbar.scss";

export interface PagingToolbarProps extends ToolbarProps {
    pageCount?: number;
    hideLabel?: boolean;
}

export default class PagingToolbar<P extends PagingToolbarProps> extends Toolbar<P> implements StoreProcessor, StoreAutoLoad {
    protected page = 1;
    protected totalPage = 0;
    protected totalRecord = 0;
    protected isLoading: boolean = false;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);
    }

    protected drawingToolbarChildren(): Array<GinkgoElement> {
        this.totalPage = Math.ceil(this.totalRecord / (this.props.pageCount || 20));

        let label;
        if (this.props.hideLabel !== true) {
            if (this.totalRecord == 0) {
                label = <label>Empty Data</label>;
            } else {
                label = <label>Displaying {this.page} - {this.totalPage} of {this.totalRecord}</label>;
            }
        }

        return [
            <Button iconType={IconTypes._tbarPageFirst}
                    action={"none"}
                    disabled={this.page == 1}
                    onClick={e => {
                        this.onPageFirstClick(e);
                    }}/>,
            <Button iconType={IconTypes._tbarPagePrev}
                    action={"none"}
                    disabled={this.page == 1}
                    onClick={e => {
                        this.onPagePrevClick(e);
                    }}/>,
            <ToolbarSplit type={"split"}/>,
            <label>Page</label>,
            <TextField width={48}
                       value={this.page}
                       focusSelection={true}
                       disable={this.totalRecord == 0}
                       onChange={(field, value) => {
                           this.onPageChange(value);
                       }}/>,
            <label>of {this.totalPage}</label>,
            <ToolbarSplit type={"split"}/>,
            <Button iconType={IconTypes._tbarPageNext}
                    action={"none"}
                    disabled={this.page == this.totalPage || this.totalPage == 0}
                    onClick={e => {
                        this.onPageNextClick(e);
                    }}/>,
            <Button iconType={IconTypes._tbarPageLast}
                    action={"none"}
                    disabled={this.page == this.totalPage || this.totalPage == 0}
                    onClick={e => {
                        this.onPageLastClick(e);
                    }}/>,
            <ToolbarSplit type={"split"}/>,
            <Button iconType={IconTypes.sync}
                    action={"none"}
                    onClick={e => {
                        this.loading();
                    }}/>,
            <ToolbarSplit type={"align"}/>,
            label
        ];
    }

    protected onPageFirstClick(e) {
        this.page = 1;
        this.setState();

        this.loading();
    }

    protected onPagePrevClick(e) {
        if (this.page > 1) {
            this.page = this.page - 1;
            this.setState();

            this.loading();
        }
    }

    protected onPageChange(value) {
        let v = parseInt(value);
        if (v >= 1 && v <= this.totalPage) {
            let reload = false;
            if (this.page != v) {
                reload = true;
            }
            this.page = v;
            this.setState();

            if (reload) {
                this.loading();
            }
        } else {
            this.setState();
        }
    }

    protected onPageNextClick(e) {
        if (this.page < this.totalPage) {
            this.page = this.page + 1;
            this.setState();

            this.loading();
        }
    }

    protected onPageLastClick(e) {
        this.page = this.totalPage;
        this.setState();

        this.loading();
    }

    protected loading() {
        let store = this.props.store;
        if (store) {
            store.setParam(this.getStoreParam());
            store.load();
        }
    }

    private getStoreParam() {
        let param = {};
        param["page"] = this.page;
        param["start"] = (this.page - 1) * (this.props.pageCount || 20);
        param["limit"] = this.props.pageCount || 20;
        return param;
    }

    storeBeforeLoad?(): void {
        this.isLoading = true;
        // this.setState();
    }

    storeLoaded(data: Object | Object[], total?: number, originData?: any): void {
        this.isLoading = false;
        this.totalRecord = total;
        this.setState();
    }

    storeAutoLoad(): void {
        this.loading();
    }
}
