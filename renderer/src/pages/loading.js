function loadingMain() {
  window.yt.onDownloadBinYtDlp(showDownloadingSpan);
}

function showDownloadingSpan() {
  /** @type {HTMLElement | null} */
  const loadingSpan = document.querySelector(".downloading");
  if (!loadingSpan) return;
  loadingSpan.style.visibility = "visible";
}

document.addEventListener("DOMContentLoaded", loadingMain);
