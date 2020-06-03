import WindowPanel from "./Window";

export default class WindowManager {
    private static windows: Array<{ dom: HTMLElement, win: WindowPanel<any>, zIndex: number }> = [];
    private static masks: Array<{ dom: HTMLElement, mask: HTMLElement }> = [];

    addWindow(win: WindowPanel<any>) {
        if (win instanceof WindowPanel) {
            let parent = win.getParentElement();
            let isShow = WindowManager.windows.filter(value => {
                if (value.win == win && value.dom == parent) {
                    return value;
                }
            })
            if (!isShow || isShow.length == 0) {
                WindowManager.windows.push({dom: parent, win: win, zIndex: 0});

                if (parent) {
                    if (win.isMaskLayer()) {
                        let maskArr = WindowManager.masks.filter(value => value.dom === parent);
                        let mask;
                        if (!maskArr || maskArr.length == 0) {
                            mask = {};
                            mask.dom = parent;
                            mask.mask = document.createElement("div");
                            parent.append(mask.mask);
                            WindowManager.masks.push(mask);
                        } else {
                            mask = maskArr[0];
                        }

                        mask.mask.className = win.getMaskClassNames();
                        mask.mask.style.display = "none";
                    }
                }
            }
        }
    }

    activeWindow(win: WindowPanel<any>) {
        if (win instanceof WindowPanel) {
            WindowManager.windows.sort((a, b) => b.zIndex - a.zIndex);
            let index = 1000 + WindowManager.windows.length + 1;

            WindowManager.windows.map(value => {
                if (value.win == win) {
                    win.setZIndex(index);
                    value.zIndex = index;
                    index--;

                    if (win.isMaskLayer()) {
                        let parent = win.getParentElement();
                        let maskArr = WindowManager.masks.filter(value => value.dom === parent);
                        if (maskArr && maskArr.length > 0) {
                            maskArr[0].mask.style.display = "block";
                            maskArr[0].mask.style.zIndex = index + "";
                        }
                    }
                    index--;
                }
            });

            WindowManager.windows.map(value => {
                if (value.win != win) {
                    value.win.setZIndex(index);
                    value.zIndex = index;
                    index--;
                }
            });


        }
    }

    removeWindow(win: WindowPanel<any>) {
        if (win instanceof WindowPanel) {
            let parent = win.getParentElement();
            let i = 0;
            let lastWin: { win: WindowPanel<any>, zIndex: number };
            WindowManager.windows.map((value, index) => {
                if (value.win == win) {
                    i = index;
                } else {
                    if (value.dom == parent) {
                        if (!lastWin) {
                            lastWin = value;
                        } else if (lastWin.zIndex < value.zIndex) {
                            lastWin = value;
                        }
                    }
                }
            })
            WindowManager.windows.splice(i, 1);
            if (parent) {
                if (lastWin) {
                    this.activeWindow(lastWin.win);
                } else {
                    this.removeMasks(parent);
                }

            }
        }
    }

    removeMasks(parent) {
        let i = 0;
        for (let mask of [...WindowManager.masks]) {
            let pp = mask.dom;
            if (pp == parent) {
                pp.removeChild(mask.mask);
                WindowManager.masks.splice(i, 1);
            }
            i++;
        }
    }
}
