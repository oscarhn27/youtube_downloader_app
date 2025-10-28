import {showDialog} from "../pages/dialog.js";

let downloadDirectory = null;

/**
 * 
 * @param {Electron.IpcMain} ipcMain 
 * @param {Electron.App} app 
 */
export function setupDownloadDirectoryHandlers(ipcMain, app) {
  // Establecer directorio por defecto al iniciar la app
  downloadDirectory = app.getPath('downloads');
  console.debug("Directorio de descarga por defecto:", downloadDirectory);

  // Obtener directorio de descarga actual
  ipcMain.handle("get-download-directory", () => downloadDirectory);

  // Seleccionar directorio de descarga
  ipcMain.handle("select-download-directory", async (event) => {
    /** @type {Parameters<typeof showDialog>[1]} */
    const options = {
      properties: ["openDirectory"],
      title: "Seleccionar directorio de descarga",
      defaultPath: downloadDirectory,
    }
    const result = await showDialog(event.sender, options);
    if (result && !result.canceled && result.filePaths.length) {
      downloadDirectory = result.filePaths[0];
      console.log("Directorio de descarga actualizado:", downloadDirectory);
      return downloadDirectory;
    }
    return null;
  });
}

export function getDownloadDirectory() {
  return downloadDirectory;
}
