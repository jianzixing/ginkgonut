const execa = require('execa');
const sass = require('node-sass');
const fs = require('fs');
const path = require('path');

async function runBuildWebpack() {
    const child1 = await execa('./node_modules/webpack/bin/webpack.js', ["--config", "webpack.config.js"], {});
    const child2 = await execa('./node_modules/typescript/bin/tsc');

}


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


let filesList = [];
readFileList("./src", filesList);
for (let file of filesList) {
    let path = file.toString();
    if (path.endsWith(".scss") &&
        !(path.startsWith("src/icon") && path.indexOf("_") >= 0)) {
        let outPath = path.substring(3, path.length - 5);
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
