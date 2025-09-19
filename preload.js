const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('yt', {
  fetchInfo:                (url)     => ipcRenderer.invoke('fetch-video-info', url),
  getDownloadDirectory:     ()        => ipcRenderer.invoke('get-download-directory'),
  getVersion:               ()        => ipcRenderer.invoke('version-info'),
  onDownloadComplete:       (cb)      => ipcRenderer.on('download-complete', cb),
  onDownloadError:          (cb)      => ipcRenderer.on('download-error', cb),
  onDownloadLog:            (payload) => ipcRenderer.on('download-log', payload),
  onDownloadProgress:       (cb)      => ipcRenderer.on('download-progress', cb),
  onVideoInfo:              (cb)      => ipcRenderer.on('video-info', cb),
  removeAllListeners:       (channel) => ipcRenderer.removeAllListeners(channel),
  selectDownloadDirectory:  ()        => ipcRenderer.invoke('select-download-directory'),
  startDownload:            (payload) => ipcRenderer.send('start-download', payload),
})


