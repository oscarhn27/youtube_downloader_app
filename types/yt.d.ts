// Tipos globales para la API expuesta por preload (`window.yt`)

type DownloadFormat = 'mp3' | 'mp4'

interface DownloadPayload {
  url: string
  format: DownloadFormat
}

interface ProgressData {
  total?: number
  downloaded?: number
  percentage?: number
}

interface VideoInfo {
  title: string
  uploader?: string
  duration?: number
  thumbnail?: string
}

export interface YTAPI {
  fetchInfo: (url: string) => Promise<VideoInfo>
  getDownloadDirectory: () => Promise<string>
  getVersion: () => Promise<string | undefined>
  onDownloadComplete: (cb: (event: any, data: any) => void) => void
  onDownloadError: (cb: (event: any, error: { error: string }) => void) => void
  onDownloadLog: (cb: (event: any, payload: any) => void) => void
  onDownloadProgress: (cb: (event: any, progress: ProgressData) => void) => void
  onVideoInfo: (cb: (event: any, info: VideoInfo) => void) => void
  removeAllListeners: (channel: string) => void
  selectDownloadDirectory: () => Promise<string>
  startDownload: (payload: DownloadPayload) => void
}

declare global {
  const yt: YTAPI
  interface Window {
    yt: YTAPI
  }
}

export {}


