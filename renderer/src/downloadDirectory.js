import { showMessage } from "./info.js";

/** @type {HTMLButtonElement} */
let settingsToggleBtn;
/** @type {HTMLElement} */
let downloadSettings;
/** @type {HTMLButtonElement} */
let selectDirectoryBtn;
/** @type {HTMLInputElement} */
let downloadPathInput;

function settingButtonListener() {
  if (!settingsToggleBtn || !downloadSettings) throw Error();
  settingsToggleBtn.addEventListener("click", () => {
    downloadSettings.classList.toggle("hidden");

    // Rotar el icono cuando se abre/cierra
    const svg = settingsToggleBtn.querySelector("svg");
    if (svg) {
      svg.style.transform = downloadSettings.classList.contains("hidden") ? "rotate(0deg)" : "rotate(90deg)";
    }
  });
}

function selectDirectoryButtonListener() {
  if (!selectDirectoryBtn || !downloadPathInput) throw new Error();
  selectDirectoryBtn.addEventListener("click", async () => {
    try {
      const selectedPath = await yt.selectDownloadDirectory();
      if (selectedPath) {
        downloadPathInput.value = selectedPath;
      }
    } catch (error) {
      console.error("Error al seleccionar directorio:", error);
      showMessage('Error al seleccionar directorio', 'error')
    }
  });
}

export async function load() {
  settingsToggleBtn = /** @type {HTMLButtonElement} */ (document.querySelector("#settings-toggle"));
  downloadSettings = /** @type {HTMLElement} */ (document.querySelector("#download-settings"));
  selectDirectoryBtn = /** @type {HTMLButtonElement} */ (document.querySelector("#select-directory"));
  downloadPathInput = /** @type {HTMLInputElement} */ (document.querySelector("#download-path"));

  try {
    const currentPath = await yt.getDownloadDirectory();
    downloadPathInput.value = currentPath;
  } catch (error) {
    console.error("Error al obtener directorio:", error);
  }
  (settingButtonListener(), selectDirectoryButtonListener());
}
