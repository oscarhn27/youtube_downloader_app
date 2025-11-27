import path from "node:path";
import YTDlpWrapModule from "yt-dlp-wrap";
import { binResourcesPath, binYtDlpFilename, isPackaged } from "../config.js";
import { access, chmod, constants, copyFile, mkdir } from "node:fs/promises";
import { app } from "electron";
import { checkLatestVersion } from "../binReleases/check.js";
import { update } from "../binReleases/update.js";
import { writeFileSync } from "node:fs";

/** @type {typeof YTDlpWrapModule} */
// @ts-ignore
const YTDlpWrap = YTDlpWrapModule.default;

export function getYtDlpWrapPath() {
  if (!app.isPackaged) return binResourcesPath;
  const userDataDir = app.getPath("userData");
  return path.join(userDataDir, "bin", binYtDlpFilename);
}

function existBinaryFile() {
  const ytDlpWrapPath = getYtDlpWrapPath();
  return access(ytDlpWrapPath, constants.X_OK | constants.R_OK)
    .then(() => true)
    .catch(() => false);
}

/**
 * @returns {Promise<YTDlpWrapModule>}
 */
export async function createYtDlpWrap() {
  if (!(await existBinaryFile())) {
    await copyBinaries()
  }
  let ytDlpWrap = loadDlpWrap()
  const {updated, lastVersion} = await checkLatestVersion(ytDlpWrap);
  if (!updated) {
    await update(lastVersion);
    ytDlpWrap = loadDlpWrap()
  }
  return ytDlpWrap;
}

function loadDlpWrap() {
  const ytDlpWrapPath = getYtDlpWrapPath();
  console.log({ ytDlpWrapPath, isPackaged: app.isPackaged });
  return new YTDlpWrap(ytDlpWrapPath);
}

async function copyBinaries() {
  if (!isPackaged) return;
  const src = binResourcesPath;
  const dst = getYtDlpWrapPath();
  const pathDir = path.dirname(dst);
  console.log(`Dirname to copy: ${pathDir}`);
  await mkdir(pathDir, { recursive: true })
  await copyFile(src, dst);
  return chmod(dst, '777')
}
export async function getVideoInfo(ytDlpWrap, url) {
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
}

export async function getPlaylistInfo(ytDlpWrap, url) {
  // Intentar obtener información básica para determinar si es playlist
  let playlistInfo;
  try {
    playlistInfo = await ytDlpWrap.getVideoInfo(url);
  } catch (e) {
    throw new Error('La URL no es válida o no se pudo obtener información');
  }
  writeFileSync('playlistInfo.json', JSON.stringify(playlistInfo, null, 2));
  
  // Verificar si es una playlist
  // const isPlaylist = playlistInfo._type === 'playlist' || 
  //                    (Array.isArray(playlistInfo.entries) && playlistInfo.entries.length > 1);
  
  // if (!isPlaylist) {
  //   console.log('playlistInfo', playlistInfo);
  //   throw new Error('La URL no corresponde a una playlist');
  // }
  
  // Si ya tenemos entries con la info completa, usarlas
  if (Array.isArray(playlistInfo/* .entries */)) {
    const videos = [];
    for (const entry of playlistInfo/* .entries */) {
      let thumbnail = undefined;
      if (Array.isArray(entry.thumbnails) && entry.thumbnails.length > 0) {
        const sorted = [...entry.thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
        thumbnail = sorted[0]?.url;
      } else if (entry.thumbnail) {
        thumbnail = entry.thumbnail;
      }
      
      videos.push({
        id: entry.id,
        title: entry.title,
        duration: entry.duration,
        thumbnail,
        url: entry.webpage_url || entry.url || `https://www.youtube.com/watch?v=${entry.id}`
      });
    }
    
    return {
      playlistTitle: /* playlistInfo.title ||  */playlistInfo[0].playlist_title,
      playlistId: /* playlistInfo.id || */ playlistInfo[0].playlist_id,
      videos
    };
  }
  
  // Si no tenemos entries, necesitamos obtenerlos con flat-playlist
  // Obtener todos los videos de la playlist en formato flat con JSON
  const videosData = await ytDlpWrap.getVideoInfo([url, '--flat-playlist']);
  
  // Verificar que retornó un array
  if (!Array.isArray(videosData) || videosData.length === 0) {
    throw new Error('La playlist está vacía o no se pudieron obtener los videos');
  }
  
  // Procesar cada video de la playlist
  const videos = [];
  for (const videoData of videosData) {
    // Skip si no tiene datos mínimos
    if (!videoData.id || !videoData.title) {
      continue;
    }
    
    let thumbnail = undefined;
    if (Array.isArray(videoData.thumbnails) && videoData.thumbnails.length > 0) {
      const sorted = [...videoData.thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
      thumbnail = sorted[0]?.url;
    } else if (videoData.thumbnail) {
      thumbnail = videoData.thumbnail;
    }
    
    videos.push({
      id: videoData.id,
      title: videoData.title,
      duration: videoData.duration,
      thumbnail,
      url: videoData.webpage_url || videoData.url || `https://www.youtube.com/watch?v=${videoData.id}`
    });
  }
  
  return {
    playlistTitle: playlistInfo.title || 'Playlist sin título',
    playlistId: playlistInfo.id || 'unknown',
    videos
  };
}
