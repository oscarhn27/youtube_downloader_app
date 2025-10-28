import path from 'node:path';
import { app } from "electron";
import { binResourcesPath, isPackaged } from "../config.js";
import { chmod, copyFile, mkdir } from 'node:fs/promises';
import { getYtDlpWrapPath } from '../download/ytDlp.js';

export async function copyBinaries() {
  if (!isPackaged) return;
  const src = binResourcesPath;
  const dst = getYtDlpWrapPath(app);
  await mkdir(path.dirname(dst), { recursive: true })
  await copyFile(src, dst);
  return chmod(dst, '777')
}