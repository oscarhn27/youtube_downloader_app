module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [
      'bin/yt-dlp',
      'bin/yt-dlp.exe',
    ],
    icon: 'icons/icon'
  },
  rebuildConfig: {},
  makers: [
    // {
    //   name: '@electron-forge/maker-zip',
    //   platforms: ['darwin', 'linux', 'win32'],
    // },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          productName: 'YouTube Downloader',
          maintainer: 'Óscar Hernández',
          homepage: 'https://github.com/oscarhn27/youtube_downloader_app',
          description: 'Aplicación para descargar videos de YouTube con interfaz moderna',
          productDescription: 'Descarga videos de YouTube en formato MP3 o MP4 con una interfaz moderna y fácil de usar.',
          icon: 'icons/icon.png',
          categories: ['Audio', 'Video', 'AudioVideo', 'Utility']
        },
      },
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        options: {
          name: 'YouTube.Downloader',
          description: 'Aplicación para descargar videos de YouTube con interfaz moderna',
          authors: 'Óscar Hernández',
          homepage: 'https://github.com/oscarhn27/youtube_downloader_app',
        },
      },
    },
    // Solo usar RPM si tienes rpmbuild instalado
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {
    //     options: {
    //        maintainer: 'Óscar Hernández',
    //        homepage: 'https://github.com/oscarhn27/youtube_downloader_app',
    //        description: 'Aplicación para descargar videos de YouTube con interfaz moderna',
    //        productDescription: 'Descarga videos de YouTube en formato MP3 o MP4 con una interfaz moderna y fácil de usar.',
    //     },
    //   },
    // },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};