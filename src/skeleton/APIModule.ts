import {Request, Submit} from "../http/Request";

export default class APIModule {

    @Request
    public static getModules(): Submit | any {

    }

    @Request
    public static getTreeAuthModules(module: string): Submit | any {

    }
}
