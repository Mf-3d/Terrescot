// モジュール読み込み
const electron = require("electron");
const Store = require('electron-store');
const express = require("express");
const bodyParser = require('body-parser');
const RssParser = require('rss-parser');
const fs = require('fs');
const schedule = require('node-schedule'); // 定期実行

// Sleep
const sleep = (time) => {
  return new Promise((resolve, reject) => {
      setTimeout(() => {
          resolve()
      }, time)
  })
}

// 設定ファイル
const store = new Store({
  name: 'config'
});

// ウィンドウの変数
let win;
let swin;

// ウィンドウが開いているかの変数
let win_visible = false;
let swin_visible = false;

// API権限設定
var api = {
  read_rss: store.get('config.api.read_rss') || false
};
// ポート設定
var PORT = store.get('config.port') || 1212;
// RSS設定
var RSS = store.get('config.rss') || 'https://nitter.net/ZIP_Muryobochi/rss'; // なぜかデフォルトはZIP氏のツイート
// RSSのタイトル要素を設定
var rss_title_element = store.get('config.rss_elements.title') || 'contentSnippet';
var rss_title;

// localhostサーバーの作成
const app = express();

// node-staticのかわり
app.use(express.static(__dirname + '/src'));

server = app.listen(PORT, function(){
  console.log("Node.js is listening to PORT:" + server.address().port);
});

// 独自のAPIを計画中
// POSTされたとき
app.post('/soleil_api/', (req, res, next) => {
  var result = {
    "name": "terrescot",
    "api": "soleil_api",
    "api_version": "0.0.1",
    "result": {}
  }
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(result);
});

// GETされたとき
app.get('/soleil_api/', (req, res, next) => {
  var result = {
    "name": "terrescot",
    "api": "soleil_api",
    "api_version": "0.0.1",
    "result": {
      "status": 200,
      "message": "Success!"
    }
  }
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(result);
});

// 関数実行
app.use('/soleil_api/run_function/', express.json());
app.post('/soleil_api/run_function/', (req, res) => {
  if(req.body.function == 'read_rss'){
    try{
      // RSS読み上げが許可されているか
      if(api.read_rss === true){
        get_rss();
        win.webContents.send('read_rss', rss_title);
        var result = {
          "name": "terrescot",
          "api": "soleil_api",
          "api_version": "0.0.1",
          "result": {
            "status": 200,
            "message": "Success!"
          }
        }
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.send(result);
      }
      else{
        var result = {
          "name": "terrescot",
          "api": "soleil_api",
          "api_version": "0.0.1",
          "result": {
            "status": 401,
            "message": "This API is not allowed."
          }
        }
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.send(result);
      }
    }
    // 関数実行が失敗したとき
    catch(e){
      var result = {
        "name": "terrescot",
        "api": "soleil_api",
        "api_version": "0.0.1",
        "result": {
          "status": 500,
          "message": "The function could not be executed."
        }
      }
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.send(result);
    }
  }
  // アニメーションを切り替え
  else if(req.body.function == 'animation'){
    win.webContents.send('animation', {
      animation: req.body.animation || 1
    });
    var result = {
      "name": "terrescot",
      "api": "soleil_api",
      "api_version": "0.0.1",
      "result": {
        "status": 200,
        "message": "Success!"
      },
      "order_content": req.body
    }
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send(result);
  }
});

// var file = new nodeStatic.Server(__dirname + '/src');

// require('http').createServer(function (request, response) {
//   request.addListener('end', function () {
//       file.serve(request, response);
//   }).resume();
// }).listen(PORT); // デフォルトのポートは1212、Xascotと被らないように。

// 多重起動防止用
const gotTheLock = electron.app.requestSingleInstanceLock();
if (!gotTheLock) {
  electron.app.quit();
}

// メインウィンドウ生成
function nw(){
  // 自動で音声を再生することを許可
  // ここはいじらないで
  electron.app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');
  win = new electron.BrowserWindow({
    resizable: false,
    hasShadow:  false,
    width: 200,
    height: 400,
    transparent: true,
    frame: false,
    toolbar: false,
    alwaysOnTop: true,
    icon: `${__dirname}/icon.png`,
    webPreferences: {
      preload: `${__dirname}/src/preload/preload.js`
    }
  });

  // ウィンドウを表示したことを知らせる
  win_visible = true;

  // localhostになっている
  win.webContents.loadURL(`http://localhost:${store.get(`config.port`)}`);
  win.webContents.reloadIgnoringCache();

  win.on('closed', function() {
    console.debug(PORT);
    store.set('config.port', PORT);
    store.set('config.rss', RSS);
    store.set('config.rss_elements.title', rss_title_element);
    store.set('config.api.read_rss', api.read_rss);
    win = null;
    win_visible = false;
  });

  // 一応起動時に取得
  get_rss();
};

// 設定ウィンドウ生成
function setting_nw() {
  swin = new electron.BrowserWindow({
    resizable: true,
    hasShadow:  true,
    width: 500,
    height: 300,
    transparent: false,
    frame: true,
    toolbar: false,
    alwaysOnTop: false,
    icon: `${__dirname}/icon.png`,
    webPreferences: {
      preload: `${__dirname}/src/preload/preload.js`
    }
  });

  swin.webContents.loadURL(`http://localhost:${store.get(`config.port`)}/setting.html`);
  swin.webContents.reloadIgnoringCache();

  // 設定ウィンドウが起動したことを知らせる
  swin_visible = true;

  swin.on('close',() => {
    swin_visible = false;
  });
}

// macOS以外はウィンドウをすべて閉じたらアプリを終了するように
electron.app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});

// アプリを起動するための関数
electron.app.on('ready',nw);

// -----------------------------
// IPC通信系
// -----------------------------

// 設定ウィンドウの起動
electron.ipcMain.handle('toggle_settingvisiblity', (event, data) => {
  if(data.visible === true){
    // 表示させたいとき
    setting_nw();
  }
  else if(data.visible === false){
    // 非表示にさせたいとき
    swin.close();
    swin_visible = false;
  }
  else{
    // 切替するとき
    if(swin_visible === false){
      setting_nw();
    }
    else if(swin_visible === true){
      swin.close();
      swin_visible = false;
    }
  }
});

// 設定読み込み、保存用
electron.ipcMain.handle('setting', (event, data) => {
  console.debug(data);
  // 設定を保存するとき
  if(data !== undefined){
    store.set('config.port',data.port);
    store.set('config.rss',data.rss);
    store.set('config.rss_elements.title',data.rss_title_element);
    store.set('config.api.read_rss',data.api.read_rss);
    // 終了時に設定が戻されないように
    PORT = data.port;
    RSS = data.rss;
    rss_title_element = data.rss_title_element;
    api.read_rss = data.api.read_rss;
    console.debug(data);
  }
  // 設定を読み込むとき
  else{
    return {
      port: store.get('config.port') || 1212,
      rss: store.get('config.rss') || 'https://nitter.net/ZIP_Muryobochi/rss',
      rss_title_element: store.get('config.rss_elements.title') || 'title',
      api: {
        read_rss: store.get('config.api.read_rss') || false
      }
    }
  }
});

// RSS
electron.ipcMain.handle('get_rss', async (event, data) => {
  get_rss();
  return rss_title;
});

function get_rss(){
  const rssParser = new RssParser();
  rssParser.parseURL(RSS, (err, feed) => {
    console.log('RSS 取得成功', feed.items[0][rss_title_element]);
    rss_title = feed.items[0][rss_title_element];
  });
}

var alerm_job_1 = schedule.scheduleJob({
  minute:  00
}, function () {
  win.webContents.send('alerm', {});
});

var alerm_job_2 = schedule.scheduleJob({
  minute:  30
}, function () {
  win.webContents.send('alerm', {});
});