export default class ObjectTools {
    public static valueFromTemplate(obj: any, template: string) {
        if (obj && template) {
            let str1 = template.split(".");
            let str3 = [];
            for (let str2 of str1) {
                let str4 = "";
                for (let i = 0; i < str2.length; i++) {
                    let str5 = str2.charAt(i);
                    if (str5 == '[') {
                        if (str4 && str4 != "") {
                            str3.push({type: 0, str: str4});
                        }
                        str4 = "";
                    } else if (str5 == ']') {
                        if (str4 && str4 != "") {
                            str3.push({type: 1, str: str4});
                        }
                        str4 = "";
                    } else {
                        str4 += str5;
                    }
                }
                if (str4 && str4 != "") {
                    str3.push({type: 0, str: str4});
                }
            }

            let getValue = function (lastObj, strArr: Array<any>): any {
                for (let str6 of strArr) {
                    if (str6.type == 0) {
                        lastObj = lastObj[str6.str];
                    } else if (str6.type == 1) {
                        if (str6.str == "*") {
                            let arr = [];
                            for (let k = 0; k < lastObj.length; k++) {
                                strArr.splice(0, strArr.indexOf(str6) + 1);
                                let r = getValue(lastObj[k], strArr);
                                if (r instanceof Array) {
                                    r.map(value => {
                                        if (value) arr.push(value)
                                    });
                                } else {
                                    if (r) arr.push(r);
                                }
                            }
                            return arr;
                        } else {
                            lastObj = lastObj[parseInt(str6.str)];
                        }
                    }
                    if (!lastObj) break;
                }
                return lastObj;
            }

            return getValue(obj, str3);
        }
        return undefined;
    }
}
