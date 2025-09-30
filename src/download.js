import { showMessage } from "./info.js"
import { renderPreview } from "./previewVideo.js"
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
    showMessage('Obteniendo información del video...', 'success')
    try {
      const data = await yt.fetchInfo(url)
      renderPreview(data, url)
    } catch (e) {
      showMessage('No se pudo obtener la información del video', 'error')
    } finally {
      setButtonLoading(false)
    }
  })

}
