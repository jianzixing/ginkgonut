export default class FormatTools {
    public static money(value): string {
        if (value) {
            let str = value + "";
            if (str.indexOf(".") > 0) {
                let s1 = str.split(".");
                if (s1.length > 1) {
                    let dig = "";
                    if (s1[1].length > 2) {
                        dig = s1[1].substring(0, 2);
                    } else if (s1[1].length == 0) {
                        dig = "00";
                    } else if (s1[1].length == 1) {
                        dig = s1[1] + "0";
                    }
                    return s1[0] + "." + dig;
                }
            } else if (str.indexOf(".") == 0) {
                return "0" + str;
            } else {
                return str + ".00";
            }
        } else {
            return "0.00";
        }
    }
}
