import { startDownload } from "./download.js"
import { escapeHtml } from "./utils.js"

/**
 * Renderiza la vista previa con acciones
 * @param {{title:string, uploader?:string, duration?:number, thumbnail?:string}} info 
 * @param {string} url
 */
export function renderPreview(info, url) {
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