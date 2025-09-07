import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Harta Hidranți',
    short_name: 'Harta Hidranți',
    description: 'O aplicatie pentru cautare, adaugare si editare hidranti.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#da3939ff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}