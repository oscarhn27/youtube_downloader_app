const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const YTDlpWrap = require("yt-dlp-wrap").default;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
};

// Variable global para almacenar el directorio de descarga seleccionado
let downloadDirectory = null;

app.whenReady().then(() => {
  createWindow();
  // Establecer directorio por defecto
  downloadDirectory = app.getPath('downloads')
  console.log("Directorio de descarga por defecto:", downloadDirectory);
});

// Configurar yt-dlp-wrap con el binario correcto (packaged o dev)
const ytDlpWrapPath = path.join(
  app.isPackaged ? process.resourcesPath : 'bin',
  process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
);
console.log({ytDlpWrapPath, isPackaged: app.isPackaged});

const ytDlpWrap = new YTDlpWrap(ytDlpWrapPath);

ipcMain.handle("version-info", () => app.getVersion());

// Obtener información del video sin descargar
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

// Obtener directorio de descarga actual
ipcMain.handle("get-download-directory", () => {
  return downloadDirectory
});

// Seleccionar directorio de descarga
ipcMain.handle("select-download-directory", async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return null;

  const result = await dialog.showOpenDialog(window, {
    properties: ["openDirectory"],
    title: "Seleccionar directorio de descarga",
    defaultPath: downloadDirectory,
  });

  if (!result.canceled && result.filePaths.length > 0) {
    downloadDirectory = result.filePaths[0];
    console.log("Directorio de descarga actualizado:", downloadDirectory);
    return downloadDirectory;
  }

  return null;
});

// Iniciar la descarga indicando formato (mp3/mp4)
ipcMain.on("start-download", (event, { url, format }) => {
  const outputPath = downloadDirectory
  try {
    require("fs").mkdirSync(outputPath, { recursive: true });
  } catch (e) {
    console.error("No se pudo crear el directorio de salida:", outputPath, e);
  }

  // Resolver binario correcto y asegurar permisos
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
    // Ejecutar con yt-dlp-wrap para obtener eventos de progreso estructurados
    const ee = ytDlpWrap.exec(args);
    event.reply("download-log", "Post exec");

    const re = /^(\d+)\/(\d+)$/;
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
      console.log("yt-dlp-wrap close code:", code);
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
