export function registerVideoInfoHandler(ipcMain, ytDlpWrap) {
  ipcMain.handle("fetch-video-info", async (_event, url) => {
    const info = await ytDlpWrap.getVideoInfo(url);
    let thumbnail = undefined;
    if (Array.isArray(info.thumbnails) && info.thumbnails.length > 0) {
      const sorted = [...info.thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
      thumbnail = sorted[0]?.url;
    } else if (info.thumbnail) {
      thumbnail = info.thumbnail;
    }
    return {
      id: info.id,
      title: info.title,
      uploader: info.uploader,
      duration: info.duration,
      thumbnail,
    };
  });
}
