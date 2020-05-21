const execa = require('execa');
const sass = require('node-sass');
const fs = require('fs');
const path = require('path');

function readFileList(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((item, index) => {
        let fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            readFileList(path.join(dir, item), filesList);  //递归读取文件
        } else {
            filesList.push(fullPath);
        }
    });
    return filesList;
}

async function runBuildWebpack() {
    console.log("start webpack...");
    const child1 = await execa('./node_modules/webpack/bin/webpack.js', ["--config", "webpack.config.js"], {});
    console.log("start tsc...");
    const child2 = await execa('./node_modules/typescript/bin/tsc');

    console.log("start build scss...");
    let filesList = [];
    readFileList("./src", filesList);

    let scssImports = [];
    let scssExports = [];

    for (let file of filesList) {
        let path = file.toString();
        if (path.endsWith(".scss") &&
            !(path.startsWith("src/icon") && path.indexOf("_") >= 0)) {
            scssImports.push("@import \"" + path + "\";");
            let outPath = path.substring(3, path.length - 5);
            scssExports.push("@import \"./lib" + path.substring(3) + "\";");
            let outFile = __dirname + "/" + "dist/lib" + outPath + ".css";
            let result = sass.renderSync({
                file: __dirname + "/" + path,
                outFile: __dirname + "/" + outFile,
                sourceMap: true
            })
            if (result) {
                fs.writeFileSync(outFile,
                    result.css,
                    function (err) {
                        if (!err) {
                            //file written on disk
                        }
                    });
                fs.writeFileSync(__dirname + "/" + "dist/lib" + path.substring(3),
                    fs.readFileSync(__dirname + "/" + path),
                    function (err) {

                    }
                )
            }
        }
    }

    let result = sass.renderSync({
        data: scssImports.join("\n"),
    });
    fs.writeFileSync(__dirname + "/" + "dist/ginkgonut.scss", scssExports.join("\n"), function (err) {

    })
    // fs.writeFileSync(__dirname + "/" + "dist/ginkgonut.css", result.css, function (err) {
    //
    // })
    fs.writeFileSync(__dirname + "/" + "dist/package.json",
        fs.readFileSync(__dirname + "/package.dist.json"), function (err) {

        })
    console.log("finish")
}

runBuildWebpack();
