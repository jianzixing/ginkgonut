import {Request, Submit} from "../http/Request";

export default class APIAdmin {

    @Request
    public static login(userName: string, password: string): Submit | any {

    }

    @Request
    public static getAdmins(name: string): Submit | any {

    }
}
