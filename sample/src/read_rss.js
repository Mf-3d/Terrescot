// モジュール読み込み
const request = require('request');
const path = require('path');
const {platform,homedir} = require("os");
const fs = require('fs');

// ポートを調べてくる
var config_path;
switch (platform()) {
    case "win32":
        config_path = path.join(homedir(), "AppData", "Roaming", "terrescot", "config.json");
        break;
    case "darwin":
        config_path = path.join(homedir(), "Library", "Application Support", "terrescot", "config.json");
        break;
    case "linux":
        config_path = path.join(homedir(), ".config", "terrescot", "config.json");
        break; 
}

var config = JSON.parse(fs.readFileSync(config_path, {encoding: 'utf-8'}));
var URL = `http://localhost:${config.config.port}/soleil_api/run_function`; // 自分の使っているポートを指定

request.post({
    uri: URL,
    headers: { "Content-type": "application/json" },
    json: {
        function: 'read_rss'
    }
}, (err, res, data) => {
    console.log(data);
});