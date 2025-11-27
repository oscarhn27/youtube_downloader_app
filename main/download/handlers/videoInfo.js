import { getVideoInfo } from "../ytDlp.js";

export function registerVideoInfoHandler(ipcMain, ytDlpWrap) {
  ipcMain.handle("fetch-video-info", async (_event, url) => {
    return getVideoInfo(ytDlpWrap, url);
  });
}
