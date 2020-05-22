const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = function (webpackEnv) {
    return {
        mode: 'development',
        entry: {
            ginkgonut: './src/ginkgonut.tsx'
        },
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].js",
            library: "ginkgonut",
            libraryTarget: "umd"
        },
        externals: {
            ginkgoes: "ginkgoes"
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        //注意：这里的顺序很重要，不要乱了顺序
                        MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        //注意：这里的顺序很重要，不要乱了顺序
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        //注意：这里的顺序很重要，不要乱了顺序
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'less-loader'
                    ]
                },
                {
                    test: /\.(jpg|png|gif|svg|jp?g|woff|woff2|ttf|eot|ico)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 0,
                                outputPath: "assests",
                                name: "/[name].[ext]" // [hash-8]
                            }
                        }
                    ]
                },
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /(node_modules|bower_components)/,//排除掉node_module目录
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env', '@babel/typescript'], //转码规则
                            plugins: [
                                // 开启typescript的注解/装饰器
                                ["@babel/plugin-proposal-decorators", {"legacy": true}],
                                ["@babel/proposal-class-properties", {"loose": true}],
                                "@babel/proposal-object-rest-spread",
                                "transform-class-properties",
                                [
                                    "transform-react-jsx",
                                    {
                                        "pragma": "Ginkgo.createElement",
                                        "pragmaFrag": "Ginkgo.Fragment"
                                    }
                                ],
                                "babel-plugin-import-ginkgo",
                            ]
                        }
                    }
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                // 类似 webpackOptions.output里面的配置 可以忽略
                filename: '[name].css',
                chunkFilename: '[id].css',
            }),
        ],
        resolve: {
            // 必须填写后缀名称,否则会 Module not found: Error: Can't resolve 错误
            // 后缀名称必须是 .xxx 否则会报各种 Module not found
            extensions: [
                '.ts', '.tsx', '.js', '.jsx'
            ]
        }
    };
};
