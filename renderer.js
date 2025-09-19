/**
 * @typedef {Object} YTAPI
 * @property {() => Promise<string>} getVersion
 * @property {(callback: (event: any, data: any) => void) => void} onVideoInfo
 * @property {(callback: (event: any, data: any) => void) => void} onDownloadComplete
 * @property {(callback: (event: any, data: any) => void) => void} onDownloadError
 * @property {(callback: (event: any, data: any) => void) => void} onDownloadLog
 * @property {(channel: string) => void} removeAllListeners
 * @property {(url: string) => Promise<any>} fetchInfo
 * @property {(payload: {url: string, format: 'mp3'|'mp4'}) => Promise<{success: boolean, error?: string}>} startDownload
 * @property {(callback: (event: any, data: any) => void) => void} onDownloadProgress
 * @property {() => Promise<string>} getDownloadDirectory
 * @property {() => Promise<string|null>} selectDownloadDirectory
 */

/** @type {(Window & typeof globalThis) & { yt?: YTAPI }} */
const w = window

/**
 * Valida si una URL es de YouTube
 * @param {string} url 
 * @returns {boolean}
 */
function isValidYouTubeUrl(url) {
  try {
    const urlObj = new URL(url)
    return (
      (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com' || urlObj.hostname === 'youtu.be') &&
      (urlObj.pathname.includes('/watch') || urlObj.pathname.includes('/embed') || urlObj.pathname.includes('/v/') || urlObj.pathname.length > 1)
    )
  } catch {
    return false
  }
}

/**
 * Muestra un mensaje al usuario
 * @param {string} message 
 * @param {'success'|'error'} type 
 */
function showMessage(message, type = 'success') {
  const existingMessage = document.querySelector('.message')
  if (existingMessage) {
    existingMessage.remove()
  }

  const messageEl = document.createElement('div')
  messageEl.className = `message message-${type}`
  messageEl.textContent = message
  
  const form = document.querySelector('.download-form')
  if (form && form.parentNode) {
    form.parentNode.insertBefore(messageEl, form.nextSibling)
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove()
      }
    }, 3000)
  }
}

/**
 * Actualiza el estado del botón
 * @param {boolean} isLoading 
 */
function setButtonLoading(isLoading) {
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

window.addEventListener('DOMContentLoaded', async () => {
  /** @type {HTMLFormElement | null} */
  const form = document.querySelector('.download-form')
  /** @type {HTMLInputElement | null} */
  const input = document.querySelector('#yt-url')
  /** @type {HTMLButtonElement | null} */
  const button = document.querySelector('button[type="submit"]')
  /** @type {HTMLInputElement | null} */
  const downloadPathInput = document.querySelector('#download-path')
  /** @type {HTMLButtonElement | null} */
  const selectDirectoryBtn = document.querySelector('#select-directory')
  /** @type {HTMLButtonElement | null} */
  const settingsToggleBtn = document.querySelector('#settings-toggle')
  /** @type {HTMLElement | null} */
  const downloadSettings = document.querySelector('#download-settings')
  /** @type {HTMLElement | null} */
  const versionEl = document.querySelector('#version')

  
  if (!form || !input || !button || !downloadPathInput || !selectDirectoryBtn || !settingsToggleBtn || !downloadSettings || !versionEl) return
  
  versionEl.innerText = await w.yt?.getVersion() ?? 'Not found';
  // Cargar directorio actual
  if (w.yt && typeof w.yt.getDownloadDirectory === 'function') {
    try {
      const currentPath = await w.yt.getDownloadDirectory()
      downloadPathInput.value = currentPath
    } catch (error) {
      console.error('Error al obtener directorio:', error)
    }
  }

  // Manejar toggle de configuración
  settingsToggleBtn.addEventListener('click', () => {
    downloadSettings.classList.toggle('hidden')
    
    // Rotar el icono cuando se abre/cierra
    const svg = settingsToggleBtn.querySelector('svg')
    if (svg) {
      svg.style.transform = downloadSettings.classList.contains('hidden') 
        ? 'rotate(0deg)' 
        : 'rotate(90deg)'
    }
  })

  // Manejar selección de directorio
  selectDirectoryBtn.addEventListener('click', async () => {
    if (w.yt && typeof w.yt.selectDownloadDirectory === 'function') {
      try {
        const selectedPath = await w.yt.selectDownloadDirectory()
        if (selectedPath) {
          downloadPathInput.value = selectedPath
        }
      } catch (error) {
        console.error('Error al seleccionar directorio:', error)
        showMessage('Error al seleccionar directorio', 'error')
      }
    }
  })

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

    if (w.yt && typeof w.yt.fetchInfo === 'function') {
      setButtonLoading(true)
      showMessage('Obteniendo información del video...', 'success')
      try {
        const data = await w.yt.fetchInfo(url)
        renderPreview(data, url)
      } catch (e) {
        showMessage('No se pudo obtener la información del video', 'error')
      } finally {
        setButtonLoading(false)
      }
    }
  })
})

/**
 * Renderiza la vista previa con acciones
 * @param {{title:string, uploader?:string, duration?:number, thumbnail?:string}} info 
 * @param {string} url
 */
function renderPreview(info, url) {
  const container = document.getElementById('preview')
  if (!container) return
  container.classList.remove('hidden')
  container.innerHTML = `
    <div class="preview-card">
      <img class="preview-thumb" src="${info.thumbnail || ''}" alt="Miniatura" onerror="this.style.display='none'" />
      <div>
        <h2 class="preview-title">${escapeHtml(info.title || 'Video')}</h2>
        <div class="preview-actions">
          <button class="btn btn-mp4" id="btn-mp4">Descargar MP4</button>
          <button class="btn btn-mp3" id="btn-mp3">Descargar MP3</button>
        </div>
      </div>
    </div>
  `

  const btnMp4 = document.getElementById('btn-mp4')
  const btnMp3 = document.getElementById('btn-mp3')
  if (btnMp4) {
    btnMp4.addEventListener('click', async () => {
      await startDownload(url, 'mp4')
    })
  }
  if (btnMp3) {
    btnMp3.addEventListener('click', async () => {
      await startDownload(url, 'mp3')
    })
  }
}

/**
 * Inicia la descarga según formato
 * @param {string} url 
 * @param {'mp3'|'mp4'} format 
 */
async function startDownload(url, format) {
  if (!w.yt || typeof w.yt.startDownload !== 'function') return
  
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
  w.yt.onDownloadProgress((event, progressData) => {
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
  w.yt.onDownloadComplete((event, data) => {
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
    if (w.yt) {
      w.yt.removeAllListeners('download-complete')
      w.yt.removeAllListeners('download-error')
      w.yt.removeAllListeners('download-progress')
    }
  })
  
  w.yt.onDownloadError((event, error) => {
    console.error(JSON.stringify(error));
    showMessage(`Error: ${error.error}`, 'error')
    if (progressSection) {
      progressSection.classList.add('hidden')
    }
    
    // Limpiar listeners
    if (w.yt) {
      w.yt.removeAllListeners('download-complete')
      w.yt.removeAllListeners('download-error')
      w.yt.removeAllListeners('download-progress')
    }
  })
  
  // Iniciar descarga
  w.yt.startDownload({ url, format })
}

w.yt?.onDownloadLog((event, payload) => {
  console.log(payload)
})

/** Escapar HTML básico */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}