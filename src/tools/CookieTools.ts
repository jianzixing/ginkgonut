export default class CookieTools {
    public static setCookie(name, value, expires?: number): void {
        let seconds = 30 * 24 * 60 * 60;
        if (expires || expires == 0) {
            seconds = expires;
        }
        let exp = new Date();
        exp.setTime(exp.getTime() + seconds * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toUTCString() + ";path=/";
    }

    public static getCookie(name): string {
        let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return (arr[2]);
        } else {
            return null;
        }
    }

    public static delCookie(name): void {
        let exp = new Date();
        exp.setTime(exp.getTime() - 1);
        let v = CookieTools.getCookie(name);
        if (v != null) {
            document.cookie = name + "=" + v + ";expires=" + exp.toUTCString() + ";path=/";
        }
    }
}
