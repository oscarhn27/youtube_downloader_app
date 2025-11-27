/**
 * Valida si una URL es de YouTube
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidYouTubeUrl(url) {
  try {
    const urlObj = new URL(url)
    const validHosts = ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com']
    const validPaths = [
      '/watch',
      '/embed',
      '/v/',
      '/playlist',
      '/channel',
      '/c/',
      '/user'
    ]
    
    return (
      validHosts.includes(urlObj.hostname) &&
      (validPaths.some(path => urlObj.pathname.includes(path)) || urlObj.pathname.length > 1)
    )
  } catch {
    return false
  }
}