import { getPlaylistInfo } from "../ytDlp.js";

export function registerPlaylistInfoHandler(ipcMain, ytDlpWrap) {
  ipcMain.handle("fetch-playlist-info", async (_event, url) => {
    return getPlaylistInfo(ytDlpWrap, url);
  });
}




