import {Request} from "../http/Request";

export default class APIModule {

    @Request
    public static getModules(): any {

    }

    @Request
    public static getTreeAuthModules(module: string): any {

    }
}
