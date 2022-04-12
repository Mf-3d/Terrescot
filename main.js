// モジュール読み込み
const electron = require("electron");
const Store = require('electron-store');
const nodeStatic = require('node-static');
// 設定ファイル
const store = new Store({
  name: 'config'
});

// ウィンドウの変数
let win;

// ポート設定
var PORT = store.get('config.port') || 1212;

// localhostサーバーの作成

var file = new nodeStatic.Server(__dirname + '/src');

require('http').createServer(function (request, response) {
  request.addListener('end', function () {
      file.serve(request, response);
  }).resume();
}).listen(PORT); // デフォルトのポートは1212、Xascotと被らないように。

// 多重起動防止用
const gotTheLock = electron.app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// メインウィンドウ生成
function nw(){
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

  // localhostになっている
  win.webContents.loadURL(`http://localhost:${store.get(`config.port`)}`);
  win.webContents.reloadIgnoringCache();

  win.on('closed', function() {
    store.set('config.port', PORT);
    win = null;
  });

  // win.on("focus", () => {
  //   win.setSkipTaskbar(true);
  // });
  // win.on("blur", () => {
  //   win.setSkipTaskbar(true);
  // });
};

// macOS以外はウィンドウをすべて閉じたらアプリを終了するように
electron.app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});

// アプリを起動するための関数
electron.app.on('ready',nw);