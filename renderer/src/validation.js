/**
 * Valida si una URL es de YouTube
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidYouTubeUrl(url) {
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