/// <reference path="./types/yt.d.ts" />

import { downloadFormListener } from "./src/download.js";
import { load as loadDownloadDirectoryOpt } from "./src/downloadDirectory.js"

async function main () {
  /** @type {HTMLElement | null} */
  const versionEl = document.querySelector('#version')

  
  if (!versionEl) return
  
  versionEl.innerText = await yt.getVersion() ?? 'Not found';

  await loadDownloadDirectoryOpt()
  downloadFormListener()
}

window.addEventListener('DOMContentLoaded', main)
