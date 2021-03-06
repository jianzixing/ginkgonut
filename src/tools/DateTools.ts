export default class DateTools {
    public static format(date: Date, fmt: string) {
        let o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "H+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1,
                    (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    public static toDate(value: any): Date {
        if (value instanceof Date) {
            return value;
        }
        if (typeof value == "string") {
            let s = value.split(" ");
            let s1 = s[0], s2 = s.length > 1 ? s[1] : null;
            let year = "0", month = "0", day = "0", hour = "0", minute = "0", second = "0";
            let cache = "", type = 0;
            for (let i = 0; i < s1.length; i++) {
                if (s1.charAt(i) >= '0' && s1.charAt(i) <= '9') {
                    cache += parseInt(s1.charAt(i));
                } else {
                    if (type == 0) year = cache;
                    if (type == 1) month = cache;
                    if (type == 2) day = cache;
                    type++;
                    cache = "";
                }
            }
            if (type == 2) day = cache;
            type = 0;
            cache = "";
            for (let i = 0; i < s2.length; i++) {
                if (s2.charAt(i) >= '0' && s2.charAt(i) <= '9') {
                    cache += parseInt(s2.charAt(i));
                } else {
                    if (type == 0) hour = cache;
                    if (type == 1) minute = cache;
                    if (type == 2) second = cache;
                    type++;
                    cache = "";
                }
            }
            if (type == 2) second = cache;

            let date = new Date(parseInt(year), parseInt(month), parseInt(day),
                parseInt(hour), parseInt(minute), parseInt(second));
            return date;
        }
        if (typeof value === "number") {
            if (("" + value).length == 13) {
                return new Date(value);
            }
            if (("" + value).length == 10) {
                return new Date(value * 1000);
            }
        }
        return null;
    }
}
