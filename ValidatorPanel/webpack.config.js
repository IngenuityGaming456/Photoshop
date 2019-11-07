module.exports = {
    entry: "./src/main.ts",
    output: {
        path: __dirname,
        filename: "main.js"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "awesome-typescript-loader",
            }    
        ]
    },
    target: "node",
    node: {__dirname: false}
};