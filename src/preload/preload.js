const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('terrescot_api', {
  // レンダラーからメインに送る
    toggle_settingvisiblity: async (data) => await ipcRenderer.invoke('toggle_settingvisiblity', data),
    setting: async (data) => await ipcRenderer.invoke('setting', data),
    get_rss: async (data) => await ipcRenderer.invoke('get_rss', data),

    // メインからレンダラーへ送る
    on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
  }
);