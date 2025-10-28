import path from "node:path";
import fs from "node:fs";

export function registerDownloaderHandler(ipcMain, ytDlpWrap, getDownloadDirectory) {
  ipcMain.on("start-download", (event, { url, format }) => {
    const outputPath = getDownloadDirectory();
    try {
      fs.mkdirSync(outputPath, { recursive: true });
    } catch (e) {
      console.error("No se pudo crear el directorio de salida:", outputPath, e);
    }

    const commonArgs = [
      url,
      "--no-playlist",
      "--newline",
      "--progress-template",
      "[%(progress.downloaded_bytes)s/%(progress.total_bytes)s] %(progress.eta)s",
    ];
    const args =
      format === "mp3"
        ? [...commonArgs, "-x", "--audio-format", "mp3", "-o", path.join(outputPath, "%(title)s.%(ext)s")]
        : [
            ...commonArgs,
            "--format",
            "mp4/best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best",
            "-o",
            path.join(outputPath, "%(title)s.%(ext)s"),
          ];
    event.reply("download-log", "Ejecutando yt-dlp-wrap con args:", args);
    try {
      const ee = ytDlpWrap.exec(args);
      event.reply("download-log", "Post exec");
      const re = /^(\d+)\/(\d+)$/g;
      ee.on("ytDlpEvent", (e) => {
        if (re.test(e)) {
          const [downloaded, total] = e.split("/").map((str) => Number.parseInt(str, 10));
          return event.reply("download-progress", { downloaded, total });
        }
        let msg = "";
        try {
          if (typeof e === "string") msg = e;
          else if (e && typeof e === "object" && Object.prototype.hasOwnProperty.call(e, "text")) msg = String(e["text"]);
          else msg = JSON.stringify(e);
        } catch {
          msg = String(e);
        }
        if (msg) event.reply("download-log", `ytDlpEvent: ${msg}`);
      });
      ee.on("error", (err) => {
        console.error("yt-dlp-wrap error:", err);
        event.reply("download-error", { success: false, error: err?.message || "Error en yt-dlp" });
      });
      ee.on("close", (code) => {
        console.error("yt-dlp-wrap close code:", code);
        if (code === 0) {
          event.reply("download-complete", { success: true });
        } else {
          event.reply("download-error", { success: false, error: `yt-dlp terminó con código: ${code}` });
        }
      });
    } catch (err) {
      console.error("Excepción al ejecutar yt-dlp-wrap:", err);
      event.reply("download-error", { success: false, error: err?.message || "Fallo ejecutando yt-dlp-wrap" });
    }
  });
}
