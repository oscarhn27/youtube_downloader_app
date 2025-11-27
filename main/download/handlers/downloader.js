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

  // Handler para descargar playlists
  ipcMain.on("start-playlist-download", (event, { urls, format, playlistName }) => {
    const baseOutputPath = getDownloadDirectory();
    // Sanitizar nombre de playlist para usarlo como nombre de carpeta
    const sanitizedName = sanitizeFolderName(playlistName);
    const playlistFolder = path.join(baseOutputPath, sanitizedName);
    
    try {
      fs.mkdirSync(playlistFolder, { recursive: true });
    } catch (e) {
      console.error("No se pudo crear el directorio de playlist:", playlistFolder, e);
    }

    // Descargar videos secuencialmente
    let currentIndex = 0;
    const totalVideos = urls.length;

    const downloadNext = async () => {
      if (currentIndex >= totalVideos) {
        // Todos los videos descargados
        event.reply("download-complete", { success: true });
        return;
      }

      const url = urls[currentIndex];
      event.reply("playlist-video-progress", { current: currentIndex + 1, total: totalVideos, url });

      const commonArgs = [
        url,
        "--no-playlist",
        "--newline",
        "--progress-template",
        "[%(progress.downloaded_bytes)s/%(progress.total_bytes)s] %(progress.eta)s",
      ];
      const args =
        format === "mp3"
          ? [...commonArgs, "-x", "--audio-format", "mp3", "-o", path.join(playlistFolder, "%(title)s.%(ext)s")]
          : [
              ...commonArgs,
              "--format",
              "mp4/best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best",
              "-o",
              path.join(playlistFolder, "%(title)s.%(ext)s"),
            ];

      try {
        const ee = ytDlpWrap.exec(args);
        const re = /^(\d+)\/(\d+)$/g;
        
        ee.on("ytDlpEvent", (e) => {
          if (re.test(e)) {
            const [downloaded, total] = e.split("/").map((str) => Number.parseInt(str, 10));
            event.reply("download-progress", { downloaded, total, currentVideo: currentIndex + 1, totalVideos: totalVideos });
            return;
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
          console.error("yt-dlp-wrap error en video", currentIndex + 1, ":", err);
          event.reply("download-log", `Error en video ${currentIndex + 1}: ${err?.message || "Error desconocido"}`);
          // Continuar con el siguiente video aunque haya error
          currentIndex++;
          downloadNext();
        });

        ee.on("close", (code) => {
          console.log("Video", currentIndex + 1, "terminado con código:", code);
          if (code === 0) {
            event.reply("playlist-video-complete", { current: currentIndex + 1, total: totalVideos });
          } else {
            event.reply("download-log", `Video ${currentIndex + 1} terminó con código: ${code}`);
          }
          // Continuar con el siguiente video
          currentIndex++;
          downloadNext();
        });
      } catch (err) {
        console.error("Excepción al ejecutar yt-dlp-wrap para video", currentIndex + 1, ":", err);
        event.reply("download-log", `Excepción en video ${currentIndex + 1}: ${err?.message || "Error desconocido"}`);
        // Continuar con el siguiente video
        currentIndex++;
        downloadNext();
      }
    };

    // Iniciar descarga del primer video
    downloadNext();
  });
}

function sanitizeFolderName(name) {
  if (!name) return "playlist";
  // Eliminar caracteres inválidos para nombres de carpetas
  // Reemplazar caracteres problemáticos con guiones bajos
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100); // Limitar longitud
}
