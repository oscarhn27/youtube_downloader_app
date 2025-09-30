/**
 * Muestra un mensaje al usuario
 * @param {string} message 
 * @param {'success'|'error'} type 
 */
export function showMessage(message, type = 'success') {
  const existingMessage = document.querySelector('.message')
  if (existingMessage) {
    existingMessage.remove()
  }

  const messageEl = document.createElement('div')
  messageEl.className = `message message-${type}`
  messageEl.textContent = message
  
  const form = document.querySelector('.download-form')
  if (form?.parentNode) {
    form.parentNode.insertBefore(messageEl, form.nextSibling)
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove()
      }
    }, 3000)
  }
}

yt.onDownloadLog((event, payload) => {
  console.log(payload)
})