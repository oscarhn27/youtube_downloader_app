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
  currentVideo?: number
  totalVideos?: number
}

interface VideoInfo {
  title: string
  uploader?: string
  duration?: number
  thumbnail?: string
}

interface PlaylistVideoInfo {
  id: string
  title: string
  duration?: number
  thumbnail?: string
  url: string
}

interface PlaylistInfo {
  playlistTitle: string
  playlistId: string
  videos: PlaylistVideoInfo[]
}

interface PlaylistDownloadPayload {
  urls: string[]
  format: DownloadFormat
  playlistName: string
}

interface PlaylistVideoProgress {
  current: number
  total: number
  url: string
}

export interface YTAPI {
  fetchInfo: (url: string) => Promise<VideoInfo>
  fetchPlaylistInfo: (url: string) => Promise<PlaylistInfo>
  getDownloadDirectory: () => Promise<string>
  getVersion: () => Promise<string | undefined>
  onDownloadBinYtDlp: (cb: (event: any, data: any) => void) => void
  onDownloadComplete: (cb: (event: any, data: any) => void) => void
  onDownloadError: (cb: (event: any, error: { error: string }) => void) => void
  onDownloadLog: (cb: (event: any, payload: any) => void) => void
  onDownloadProgress: (cb: (event: any, progress: ProgressData) => void) => void
  onPlaylistVideoComplete: (cb: (event: any, data: any) => void) => void
  onPlaylistVideoProgress: (cb: (event: any, progress: PlaylistVideoProgress) => void) => void
  onVideoInfo: (cb: (event: any, info: VideoInfo) => void) => void
  removeAllListeners: (channel: string) => void
  selectDownloadDirectory: () => Promise<string>
  startDownload: (payload: DownloadPayload) => void
  startPlaylistDownload: (payload: PlaylistDownloadPayload) => void
}

declare global {
  const yt: YTAPI
  interface Window {
    yt: YTAPI
  }
}

export {}


