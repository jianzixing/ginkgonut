import {Request, Submit} from "../http/Request";

export default class APIAdmin {
    @Request
    public static getAdmins(name: string): Submit | any {

    }
}
