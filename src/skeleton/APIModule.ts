import {Request} from "../http/Request";

export default class APIModule {

    @Request
    public static getModules(): any {

    }

    @Request
    public static getTreeModules(module: string): any {

    }
}
