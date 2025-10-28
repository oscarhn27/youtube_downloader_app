/**
 * @param {Electron.IpcMain} ipcMain 
 * @param {Electron.App} app 
 */
export function registerVersionInfoHandler(ipcMain, app) {
  ipcMain.handle("version-info", () => app.getVersion());
}