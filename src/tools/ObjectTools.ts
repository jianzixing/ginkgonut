export default class ObjectTools {
    public static valueFromTemplate(obj: any, template: string) {
        if (typeof obj == "string") {
            try {
                obj = JSON.parse(obj);
            } catch (e) {
                console.error(e);
            }
        }
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

    public static objectEqualArray(arr1: Array<any>, arr2: Array<any>, order: boolean = true): boolean {
        if (arr1 == arr2) return true;
        if (arr1 != null && arr2 != null
            && arr1.length == arr2.length) {

            if (order) {
                let i = 0;
                for (let a1 of arr1) {
                    let a2 = arr2[i];
                    if (a1 != a2) {
                        return false;
                    }
                    i++;
                }
                return true;
            } else {
                for (let a1 of arr1) {
                    let is = false;
                    for (let a2 of arr2) {
                        if (a1 == a2) {
                            is = true;
                            break;
                        }
                    }
                    if (!is) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }

    public static combineArray(arrs: Array<Array<any>>): Array<any> {
        if (arrs && arrs.length > 1) {
            let a1 = arrs[0];
            let a2 = arrs[1];
            let a3 = [];
            for (let i1 of a1) {
                for (let i2 of a2) {
                    let a5;
                    if (i1 instanceof Array) {
                        a5 = i1;
                    } else {
                        a5 = [i1];
                    }
                    if (i2 instanceof Array) {
                        i2.map(v => a5.push(v));
                    } else {
                        a5.push(i2);
                    }
                    a3.push(a5);
                }
            }
            let nextArr = arrs.filter((value, index) => index >= 2);
            if (nextArr && nextArr.length > 0) {
                nextArr.splice(0, 0, a3);
                return this.combineArray(nextArr);
            } else {
                return a3;
            }
        } else {
            return arrs;
        }
    }
}
