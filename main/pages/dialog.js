import { BrowserWindow, dialog } from "electron";

/**
 *
 * @param {Electron.WebContents} sender
 * @param {Electron.OpenDialogOptions} options
 * @returns {Promise<Electron.OpenDialogReturnValue> | null}
 */
export function showDialog(sender, options) {
  const window = BrowserWindow.fromWebContents(sender);
  if (!window) return null;
  return dialog.showOpenDialog(window, options);
}
