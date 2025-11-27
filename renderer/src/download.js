import { showMessage } from "./info.js"
import { renderPreview } from "./previewVideo.js"
import { renderPlaylistView } from "./playlistView.js"
import { isValidYouTubeUrl } from "./validation.js"

/**
 * Inicia la descarga según formato
 * @param {string} url 
 * @param {'mp3'|'mp4'} format 
 */
export async function startDownload(url, format) {
  // Mostrar barra de progreso
  const progressSection = document.getElementById('progress')
  /** @type {HTMLProgressElement | null} */
  const progressEl = /** @type {HTMLProgressElement | null} */ (document.getElementById('progress-el'))
  const progressText = document.getElementById('progress-text')
  
  if (progressSection && progressEl && progressText) {
    progressSection.classList.remove('hidden')
    progressEl.value = 0
    progressEl.max = 1
    progressText.textContent = `Iniciando descarga ${format.toUpperCase()}...`
  }
  
  // Configurar listener de progreso
  yt.onDownloadProgress((event, progressData) => {
    if (progressEl && progressText && progressData.total) {
      progressEl.max = progressData.total
      progressEl.value = progressData.downloaded || 0
      const percentage = progressData.percentage ?? Math.round((progressEl.value / progressEl.max) * 100)
      const downloadedMB = (progressEl.value / 1024 / 1024).toFixed(1)
      const totalMB = (progressEl.max / 1024 / 1024).toFixed(1)
      progressText.textContent = `${percentage}% - ${downloadedMB}MB / ${totalMB}MB`
    }
  })
  
  // Configurar listeners para respuestas
  yt.onDownloadComplete((event, data) => {
    if (progressText) {
      progressText.textContent = '¡Descarga completada!'
    }
    showMessage('¡Descarga completada!', 'success')
    
    // Ocultar progreso después de 2 segundos
    setTimeout(() => {
      if (progressSection) {
        progressSection.classList.add('hidden')
      }
    }, 2000)
    
    // Limpiar listeners
    yt.removeAllListeners('download-complete')
    yt.removeAllListeners('download-error')
    yt.removeAllListeners('download-progress')
  })
  
  yt.onDownloadError((event, error) => {
    console.error(JSON.stringify(error));
    showMessage(`Error: ${error.error}`, 'error')
    if (progressSection) {
      progressSection.classList.add('hidden')
    }
    
    // Limpiar listeners
    yt.removeAllListeners('download-complete')
    yt.removeAllListeners('download-error')
    yt.removeAllListeners('download-progress')
  })
  
  // Iniciar descarga
  yt.startDownload({ url, format })
}

/**
 * Actualiza el estado del botón
 * @param {boolean} isLoading 
 */
export function setButtonLoading(isLoading) {
  /** @type {HTMLButtonElement | null} */
  const button = document.querySelector('button[type="submit"]')
  /** @type {HTMLInputElement | null} */
  const input = document.querySelector('#yt-url')
  
  if (button && input) {
    if (isLoading) {
      button.disabled = true
      button.textContent = 'Cargando...'
      input.disabled = true
    } else {
      button.disabled = false
      button.textContent = 'Cargar url'
      input.disabled = false
    }
  }
}

/**
 * Inicia la descarga de una playlist
 * @param {string[]} urls Array de URLs de videos
 * @param {'mp3'|'mp4'} format
 * @param {string} playlistName
 */
export async function startPlaylistDownload(urls, format, playlistName) {
  // Mostrar barra de progreso
  const progressSection = document.getElementById('progress')
  /** @type {HTMLProgressElement | null} */
  const progressEl = /** @type {HTMLProgressElement | null} */ (document.getElementById('progress-el'))
  const progressText = document.getElementById('progress-text')
  
  if (progressSection && progressEl && progressText) {
    progressSection.classList.remove('hidden')
    progressEl.value = 0
    progressEl.max = 1
    progressText.textContent = `Iniciando descarga de ${urls.length} videos en formato ${format.toUpperCase()}...`
  }
  
  // Configurar listener de progreso global
  yt.onDownloadProgress((event, progressData) => {
    if (progressEl && progressText && progressData.total && progressData.currentVideo) {
      progressEl.max = progressData.total
      progressEl.value = progressData.downloaded || 0
      const percentage = progressData.percentage ?? Math.round((progressEl.value / progressEl.max) * 100)
      const downloadedMB = (progressEl.value / 1024 / 1024).toFixed(1)
      const totalMB = (progressEl.max / 1024 / 1024).toFixed(1)
      progressText.textContent = `Video ${progressData.currentVideo}/${progressData.totalVideos}: ${percentage}% - ${downloadedMB}MB / ${totalMB}MB`
    }
  })
  
  // Configurar listener de progreso de playlist
  yt.onPlaylistVideoProgress((event, data) => {
    if (progressText) {
      progressText.textContent = `Descargando video ${data.current}/${data.total}...`
    }
  })
  
  yt.onPlaylistVideoComplete((event, data) => {
    if (progressText) {
      progressText.textContent = `Completado: ${data.current}/${data.total} videos`
    }
  })
  
  // Configurar listeners para respuestas
  yt.onDownloadComplete((event, data) => {
    if (progressText) {
      progressText.textContent = '¡Descarga completada!'
    }
    showMessage('¡Descarga de playlist completada!', 'success')
    
    // Ocultar progreso después de 2 segundos
    setTimeout(() => {
      if (progressSection) {
        progressSection.classList.add('hidden')
      }
    }, 2000)
    
    // Limpiar listeners
    yt.removeAllListeners('download-complete')
    yt.removeAllListeners('download-error')
    yt.removeAllListeners('download-progress')
    yt.removeAllListeners('playlist-video-progress')
    yt.removeAllListeners('playlist-video-complete')
  })
  
  yt.onDownloadError((event, error) => {
    console.error(JSON.stringify(error));
    showMessage(`Error: ${error.error}`, 'error')
    if (progressSection) {
      progressSection.classList.add('hidden')
    }
    
    // Limpiar listeners
    yt.removeAllListeners('download-complete')
    yt.removeAllListeners('download-error')
    yt.removeAllListeners('download-progress')
    yt.removeAllListeners('playlist-video-progress')
    yt.removeAllListeners('playlist-video-complete')
  })
  
  // Iniciar descarga de playlist
  yt.startPlaylistDownload({ urls, format, playlistName })
}

export function downloadFormListener() {
  const form = /** @type {HTMLFormElement} */(document.querySelector('.download-form'))
  const input = /** @type {HTMLInputElement} */(document.querySelector('#yt-url'))
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const url = input.value.trim()
    
    if (!url) {
      showMessage('Por favor, ingresa una URL', 'error')
      return
    }

    if (!isValidYouTubeUrl(url)) {
      showMessage('Por favor, ingresa una URL válida de YouTube', 'error')
      return
    }

    setButtonLoading(true)
    showMessage('Obteniendo información...', 'success')
    
    // Ocultar vistas anteriores
    const previewSection = document.getElementById('preview')
    const playlistSection = document.getElementById('playlist-view')
    if (previewSection) previewSection.classList.add('hidden')
    if (playlistSection) playlistSection.classList.add('hidden')
    
    // Primero intentamos como playlist
    try {
      const playlistData = await yt.fetchPlaylistInfo(url)
      // Si llegamos aquí, es una playlist
      renderPlaylistView(playlistData, url)
    } catch (e) {
      // Si falla, intentamos como video individual
      try {
        const videoData = await yt.fetchInfo(url)
        renderPreview(videoData, url)
      } catch (err) {
        showMessage('No se pudo obtener la información del video o playlist', 'error')
        console.error('Error al cargar:', err)
      }
    } finally {
      setButtonLoading(false)
    }
  })

}
