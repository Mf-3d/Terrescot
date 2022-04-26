const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('terrescot_api', {
  // レンダラーからメインに送る
    toggle_settingvisiblity: async (data) => await ipcRenderer.invoke('toggle_settingvisiblity', data),
    toggle_memovisiblity: async (data) => await ipcRenderer.invoke('toggle_memovisiblity', data),
    toggle_test_winvisiblity: async (data) => await ipcRenderer.invoke('toggle_test_winvisiblity', data),
    toggle_diary_winvisiblity: async (data) => await ipcRenderer.invoke('toggle_diary_winvisiblity', data),
    toggle_alarm_winvisiblity: async (data) => await ipcRenderer.invoke('toggle_alarm_winvisiblity', data),
    setting: async (data) => await ipcRenderer.invoke('setting', data),
    memo: async (data) => await ipcRenderer.invoke('memo', data),
    diary: async (data) => await ipcRenderer.invoke('diary', data),
    op_alarm: async (data) => await ipcRenderer.invoke('op_alarm', data),
    get_rss: async (data) => await ipcRenderer.invoke('get_rss', data),

    // メインからレンダラーへ送る
    on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
  }
);