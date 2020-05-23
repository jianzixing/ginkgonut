import {Request} from "../http/Request";

export default class APIUser {

    @Request
    public static getUsers(start?: number, limit?: number): any {

    }
}
