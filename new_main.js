//////////////////////////////////////////////
//
//  このファイルで変数など従来より簡単にいじることができます。
//
//////////////////////////////////////////////


// モジュール読み込み

const Store = require('electron-store');
const main = require('./main');
const electron = require('electron');
const RssParser = require('rss-parser'); // RSS読み込み
const schedule = require('node-schedule'); // 定期実行

///////////
//       //
//  変数  //
//       //
///////////


//  ウィンドウ関連


// ウィンドウの設定

// メインウィンドウ
let win = {
  name: 'win', // ここでウィンドウの名前を指定してください
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
}; 

// 設定ウィンドウ
let swin = {
  name: 'swin',
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
}; 

// メモウィンドウ
let mwin = {
  name: 'mwin',
  resizable: true,
  hasShadow:  true,
  width: 275,
  height: 350,
  transparent: false,
  frame: true,
  toolbar: false,
  alwaysOnTop: false,
  icon: `${__dirname}/icon.png`,
  webPreferences: {
    preload: `${__dirname}/src/preload/preload.js`
  }
};

// テスト用ウィンドウ
let test_win = {
  name: 'test_win',
  resizable: true,
  hasShadow:  true,
  width: 300,
  height: 300,
  transparent: false,
  frame: true,
  toolbar: false,
  alwaysOnTop: false,
  icon: `${__dirname}/icon.png`,
  webPreferences: {
    preload: `${__dirname}/src/preload/preload.js`
  }
};

// 日記ウィンドウ
let diary_win = {
  name: 'diary_win',
  resizable: true,
  hasShadow:  true,
  width: 500,
  height: 400,
  transparent: false,
  frame: true,
  toolbar: false,
  alwaysOnTop: false,
  icon: `${__dirname}/icon.png`,
  webPreferences: {
    preload: `${__dirname}/src/preload/preload.js`
  }
}; 

// アラームウィンドウ
let alarm_win = {
  name: 'alarm_win',
  resizable: true,
  hasShadow:  true,
  width: 400,
  height: 300,
  transparent: false,
  frame: true,
  toolbar: false,
  alwaysOnTop: false,
  icon: `${__dirname}/icon.png`,
  webPreferences: {
    preload: `${__dirname}/src/preload/preload.js`
  }
}; 

// ウィンドウが開いているかの変数
// ここでは全てfalseにしましょう
let win_visible = false; // メインウィンドウ
let swin_visible = false; // 設定ウィンドウ
let mwin_visible = false; // メモウィンドウ
let test_win_visible = false; // テスト用ウィンドウ
let diary_win_visible = false; // 日記ウィンドウ
let alarm_win_visible = false; // アラームウィンドウ

// ウィンドウのサイズの変数
let win_size = false; // メインウィンドウ
let swin_size = false; // 設定ウィンドウ
let mwin_size = false; // メモウィンドウ
let test_win_size; // テスト用ウィンドウ
let diary_win_size = false; // 日記ウィンドウ
let alarm_win_size = false; // アラームウィンドウ

// ウィンドウのID
let win_id;
let swin_id;
let mwin_id;
let test_win_id;
let diary_win_id;
let alarm_win_id;


//  設定関連


// 設定ファイル
// これはいじらないでおきましょう
const store = new Store({
  name: 'config'
});

const diary = new Store({
  name: 'diary'
});

// アンチエイリアスの変数
let antialiasing = store.get('config.antialiasing', true);

// API権限設定
let api = {
  read_rss: store.get('config.api.read_rss',false)
};

// ポート設定
let PORT = store.get('config.port',1212);

// RSS設定
let RSS = store.get('config.rss','https://nitter.net/ZIP_Muryobochi/rss'); // なぜかデフォルトはZIP氏のツイート

// RSSのタイトル要素を設定
let rss_title_element = store.get('config.rss_elements.title','title');


//  RSS関連


// RSSのタイトルの変数
let rss_title;


//  メモ帳、日記関連


// メモ帳の変数
let memo = {
  content: store.get('config.memo.text',''),
  date: store.get('config.memo.date','')
}

// 日記の変数
let diary_data = diary.get('diary', []);


//  API関連


// 静的ファイル設定
let static_route = [
  {
    path: '/',
    static_path: __dirname + '/src'
  },
  {
    path: '/three',
    static_path: __dirname + '/src/js/three'
  }
];

// APIルート設定
// 簡単に言うとどこに何を表示するのかを決めることだと思われる
let route = [
  {
    method: 'post', // method = 方法
    path: '/soleil_api/', // pathはどの場所にこの設定を適用するか、(未記入の場合は"/"になる)
    function: () => {
      return {
        "name": "terrescot",
        "api": "soleil_api",
        "api_version": "0.0.1",
        "result": {
          "status": 200,
          "message": "Success!"
        }
      }
    }
  },
  {
    method: 'get',
    path: '/soleil_api/',
    function: () => {
      return {
        "name": "terrescot",
        "api": "soleil_api",
        "api_version": "0.0.1",
        "result": {
          "status": 200,
          "message": "Success!"
        }
      }
    }
  },
  {
    method: 'post',
    path: '/soleil_api/run_function',
    function_name: 'read_rss', // function_nameがBodyのfunctionと一致したらfunctionが実行される
    function: () => {
      if(api.read_rss === true){
        // get_rss();
        main.send(win.name,'read_rss', rss_title);
        // returnでresultを返すこともできる
        return {
          "name": "terrescot",
          "api": "soleil_api",
          "api_version": "0.0.1",
          "result": {
            "status": 200,
            "message": "Success!"
          }
        }
      }
      else{
        return {
          "name": "terrescot",
          "api": "soleil_api",
          "api_version": "0.0.1",
          "result": {
            "status": 401,
            "message": "This API is not allowed."
          }
        }
      }
    }
  },
  {
    method: 'post',
    path: '/soleil_api/run_function',
    function_name: 'animation',
    function: () => {
      main.send(win.name,'animation', {
        animation: req.body.animation
      });
      return {
        "name": "terrescot",
        "api": "soleil_api",
        "api_version": "0.0.1",
        "result": {
          "status": 200,
          "message": "Success!"
        }
      }
    }
  },
  {
    method: 'post',
    path: '/soleil_api/run_function',
    function_name: 'read_text',
    function: () => {
      main.send(win.name, 'read_text', req.body.text);
      return {
        "name": "terrescot",
        "api": "soleil_api",
        "api_version": "0.0.1",
        "result": {
          "status": 200,
          "message": "Success!"
        }
      }
    }
  }
];

//　 時計関連

var clock_job_1 = schedule.scheduleJob({
  minute:  00
}, function () {
  win.webContents.send('alarm', {});
  win.webContents.send('animation', {
    animation: 2
  });
});

var clock_job_2 = schedule.scheduleJob({
  minute:  30
}, function () {
  win.webContents.send('alarm', {});
  win.webContents.send('animation', {
    animation: 2
  });
});

// アラーム
var alarm_job_1 = schedule.scheduleJob({
  hour: store.get('config.alarm')[0],
  minute: store.get('config.alarm')[1]
}, function () {
  win.webContents.send('alarm', {});
  win.webContents.send('animation', {
    animation: 2
  });
});

///////////
//       //
//  関数  //
//       //
///////////


// すべてラッパー関数です。(音楽系のラッパーではありません)

// アプリを起動するための関数
electron.app.on('ready', async () => {
  main.nserver(route, PORT, static_route);

  setIPC();

  win_id = await main.nw(win, win_size, {Url: `http://localhost:${store.get(`config.port`)}`});
  // swin_id = await main.nw(swin, swin_size, {Url: `http://localhost:${store.get(`config.port`)}/setting.html`});
  // mwin_id = await main.nw(mwin, mwin_size, {Url: `http://localhost:${store.get(`config.port`)}/memo.html`});
  // test_win_id = await main.nw(test_win, test_win_size, {Url: `http://localhost:${store.get(`config.port`)}/test.html`});
  // diary_win_id = await main.nw(diary_win, diary_win_size, {Url: `http://localhost:${store.get(`config.port`)}/diary.html`});
  // alarm_win_id = await main.nw(alarm_win, alarm_win_size, {Url: `http://localhost:${store.get(`config.port`)}/alarm.html`});
});

// IPC
function setIPC() {
  // main.receiveはipcMain.handleとほぼ構造は同じ
  // 設定ウィンドウの起動
  main.receive('toggle_settingvisiblity', (event, data) => {
    if(data.visible === true){
      // 表示させたいとき
      main.nw(swin, swin_size, {Url: `http://localhost:${store.get(`config.port`)}/setting.html`});
    }
    else if(data.visible === false){
      // 非表示にさせたいとき
      main.close(swin.name);
      swin_visible = false;
    }
    else{
      // 切替するとき
      if(swin_visible === false){
        main.nw(swin, swin_size, {Url: `http://localhost:${store.get(`config.port`)}/setting.html`});
      }
      else if(swin_visible === true){
        main.close(swin.name);
        swin_visible = false;
      }
    }
  });
  // 設定読み込み、保存用
  main.receive('setting', (event, data) => {
    console.debug(data);
    // 設定を保存するとき
    if(data !== undefined){
      store.set('config.port',data.port);
      store.set('config.rss',data.rss);
      store.set('config.rss_elements.title',data.rss_title_element);
      store.set('config.api.read_rss',data.api.read_rss);
      store.set('config.antialiasing',data.antialiasing);
      // 終了時に設定が戻されないように
      antialiasing = data.antialiasing;
      PORT = data.port;
      RSS = data.rss;
      rss_title_element = data.rss_title_element;
      api.read_rss = data.api.read_rss;
      console.debug(data);
    }
    // 設定を読み込むとき
    else{
      console.debug(antialiasing);
      return {
        port: store.get('config.port') || 1212,
        rss: store.get('config.rss') || 'https://nitter.net/ZIP_Muryobochi/rss',
        rss_title_element: store.get('config.rss_elements.title') || 'title',
        api: {
          read_rss: store.get('config.api.read_rss') || false
        },
        antialiasing: store.get('config.antialiasing') || antialiasing
      }
    }
  });

  // メモウィンドウの起動
  main.receive('toggle_memovisiblity', (event, data) => {
    if(data.visible === true){
      // 表示させたいとき
      main.nw(mwin, mwin_size, {Url: `http://localhost:${store.get(`config.port`)}/memo.html`});
    }
    else if(data.visible === false){
      // 非表示にさせたいとき
      main.close(mwin.name);
      mwin_visible = false;
    }
    else{
      // 切替するとき
      if(mwin_visible === false){
        main.nw(mwin, mwin_size, {Url: `http://localhost:${store.get(`config.port`)}/memo.html`});
      }
      else if(mwin_visible === true){
        main.close(mwin.name);
        mwin_visible = false;
      }
    }
  });

  // メモ読み込み、保存用
  main.receive('memo', (event, data) => {
    // メモを保存するとき
    if(data !== undefined){
      store.set('config.memo.content', data.content);
      // 終了時にメモが戻されないように
      memo.content = data.content;
      console.debug(data);
    }
    // メモを読み込むとき
    else{
      console.debug(antialiasing);
      return {
        content: store.get('config.memo.content', memo.content)
      }
    }
  });

  // テストウィンドウの起動
  main.receive('toggle_test_winvisiblity', (event, data) => {
    if(data.visible === true){
      // 表示させたいとき
      main.nw(mwin, mwin_size, {Url: `http://localhost:${store.get(`config.port`)}/memo.html`});
    }
    else if(data.visible === false){
      // 非表示にさせたいとき
      main.close(test_win.name);
      test_win_visible = false;
    }
    else{
      // 切替するとき
      if(test_win_visible === false){
        main.nw(mwin, mwin_size, {Url: `http://localhost:${store.get(`config.port`)}/memo.html`});
      }
      else if(test_win_visible === true){
        main.close(test_win.name);
        test_win_visible = false;
      }
    }
  });

  // 日記ウィンドウを起動
  main.receive('toggle_diary_winvisiblity', (event, data) => {
    if(data.visible === true){
      // 表示させたいとき
      main.nw(diary_win, diary_win_size, {Url: `http://localhost:${store.get(`config.port`)}/diary.html`});
    }
    else if(data.visible === false){
      // 非表示にさせたいとき
      main.close(diary_win.name);
      diary_win_visible = false;
    }
    else{
      // 切替するとき
      if(diary_win_visible === false){
        main.nw(diary_win, diary_win_size, {Url: `http://localhost:${store.get(`config.port`)}/diary.html`});
      }
      else if(diary_win_visible === true){
        main.close(diary_win.name);
        diary_win_visible = false;
      }
    }
  });

  // 日記読み込み、保存用
  main.receive('diary', (event, data) => {
    console.debug(data);
    // 日記を保存するとき
    if(data.op == 'write'){
      diary_data.push({
        content: data.content,
        edited_date: data.edited_date,
        created_date: data.created_date
      });
      diary.set('diary', diary_data);
      console.debug(data);
      main.reload(diary_win.name);
    }
    else if(data.op == 'delete'){
      diary_data.splice(data.start, 1);
      diary.set('diary', diary_data);
      console.debug(data);
    }
    // 日記を読み込むとき
    else if(data.op == 'load'){
      return diary.get('diary', diary_data);
    }
  });

  // アラームウィンドウの起動
  main.receive('toggle_alarm_winvisiblity', async (event, data) => {
    if(data.visible === true){
      // 表示させたいとき
      alarm_win_id = await main.nw(alarm_win, alarm_win_size, {Url: `http://localhost:${store.get(`config.port`)}/alarm.html`});
    }
    else if(data.visible === false){
      // 非表示にさせたいとき
      main.close(alarm_win.name);
      alarm_win_visible = false;
    }
    else{
      // 切替するとき
      if(alarm_win_visible === false){
        alarm_win_id = await main.nw(alarm_win, alarm_win_size, {Url: `http://localhost:${store.get(`config.port`)}/alarm.html`});
      }
      else if(alarm_win_visible === true){
        main.close(alarm_win.name);
        alarm_win_visible = false;
      }
    }
  });

  // アラーム読み込み、保存用
  main.receive('op_alarm', (event, data) => {
    console.debug(data);
    // アラームを保存するとき
    if(data.op == 'write'){
      let export_data = [data.content[0],data.content[1]]
      store.set('config.alarm', export_data);
      console.debug(data);
      main.reload(alarm_win.name);
      alarm_job_1.cancel();
      alarm_job_1 = schedule.scheduleJob({
        hour: store.get('config.alarm')[0],
        minute: store.get('config.alarm')[1]
      }, function () {
        win.webContents.send('alarm', {});
        win.webContents.send('animation', {
          animation: 2
        });
      });
    }
    else if(data.op == 'delete'){
      store.set('config.alarm', undefined);
      console.debug(data);
      alarm_job_1.cancel();
      main.reload(alarm_win.name);
    }
    // アラームを読み込むとき
    else if(data.op == 'load'){
      console.debug(store.get('config.alarm'));
      return store.get('config.alarm', [7,0]);
    }
  });

  // RSS
  main.receive('get_rss', async (event, data) => {
    get_rss();
    return rss_title;
  });
}

// RSS取得
function get_rss(){
  const rssParser = new RssParser();
  rssParser.parseURL(RSS, (err, feed) => {
    console.log('RSS 取得成功', feed.items[0][rss_title_element]);
    rss_title = feed.items[0][rss_title_element];
  });
}