import { escapeHtml, formatDuration } from './utils.js'
import { startPlaylistDownload } from './download.js'

/**
 * Renderiza la vista de playlist con todos los videos
 * @param {{playlistTitle: string, playlistId: string, videos: Array}} playlistInfo
 * @param {string} originalUrl
 */
export function renderPlaylistView(playlistInfo, originalUrl) {
  const container = document.getElementById('playlist-view')
  if (!container) return
  
  container.classList.remove('hidden')
  
  container.innerHTML = `
    <div class="playlist-container">
      <div class="playlist-header">
        <h2 class="playlist-title">${escapeHtml(playlistInfo.playlistTitle)}</h2>
        <div class="playlist-controls">
          <button class="btn-playlist-select-all" id="select-all">Seleccionar todo</button>
          <button class="btn-playlist-deselect-all" id="deselect-all">Deseleccionar todo</button>
        </div>
        <div class="playlist-counter" id="playlist-counter">
          ${playlistInfo.videos.length} de ${playlistInfo.videos.length} videos seleccionados
        </div>
      </div>
      <div class="playlist-actions">
        <button class="btn btn-mp4 playlist-download-btn" id="btn-playlist-mp4">Descargar MP4</button>
        <button class="btn btn-mp3 playlist-download-btn" id="btn-playlist-mp3">Descargar MP3</button>
      </div>
      
      <div class="playlist-videos" id="playlist-videos">
        ${playlistInfo.videos.map((video, index) => `
          <div class="playlist-video-item">
            <label class="playlist-checkbox-label">
              <input type="checkbox" class="playlist-checkbox" data-index="${index}" checked>
              <div class="playlist-video-content">
                <img class="playlist-video-thumb" src="${video.thumbnail || ''}" alt="Miniatura" onerror="this.style.display='none'">
                <div class="playlist-video-details">
                  <div class="playlist-video-title">${escapeHtml(video.title)}</div>
                  <div class="playlist-video-duration">${formatDuration(video.duration)}</div>
                </div>
              </div>
            </label>
          </div>
        `).join('')}
      </div>
      
    </div>
  `
  
  // Agregar listeners para checkboxes
  const checkboxes = /** @type {NodeListOf<HTMLInputElement>} */(container.querySelectorAll('.playlist-checkbox'))
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateCounter)
  })
  
  // Listener para seleccionar todo
  const selectAllBtn = document.getElementById('select-all')
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      checkboxes.forEach(cb => cb.checked = true)
      updateCounter()
    })
  }
  
  // Listener para deseleccionar todo
  const deselectAllBtn = document.getElementById('deselect-all')
  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      checkboxes.forEach(cb => cb.checked = false)
      updateCounter()
    })
  }
  
  // Listener para botón MP4
  const btnMp4 = document.getElementById('btn-playlist-mp4')
  if (btnMp4) {
    btnMp4.addEventListener('click', () => {
      const selectedVideos = getSelectedVideos(playlistInfo.videos, checkboxes)
      if (selectedVideos.length === 0) {
        alert('Por favor, selecciona al menos un video')
        return
      }
      startPlaylistDownload(selectedVideos, 'mp4', playlistInfo.playlistTitle)
    })
  }
  
  // Listener para botón MP3
  const btnMp3 = document.getElementById('btn-playlist-mp3')
  if (btnMp3) {
    btnMp3.addEventListener('click', () => {
      const selectedVideos = getSelectedVideos(playlistInfo.videos, checkboxes)
      if (selectedVideos.length === 0) {
        alert('Por favor, selecciona al menos un video')
        return
      }
      startPlaylistDownload(selectedVideos, 'mp3', playlistInfo.playlistTitle)
    })
  }
}

/**
 * Actualiza el contador de videos seleccionados
 */
function updateCounter() {
  const counter = document.getElementById('playlist-counter')
  const checkboxes = document.querySelectorAll('.playlist-checkbox')
  const selected = Array.from(checkboxes).filter(cb => cb.checked).length
  const total = checkboxes.length
  if (counter) {
    counter.textContent = `${selected} de ${total} videos seleccionados`
  }
}

/**
 * Obtiene las URLs de los videos seleccionados
 * @param {Array} videos
 * @param {NodeList} checkboxes
 * @returns {string[]}
 */
function getSelectedVideos(videos, checkboxes) {
  const selected = []
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const index = parseInt(checkbox.dataset.index)
      if (videos[index] && videos[index].url) {
        selected.push(videos[index].url)
      }
    }
  })
  return selected
}




