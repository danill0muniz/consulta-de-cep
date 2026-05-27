import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Consulta de CEP',
    short_name: 'CEP',
    description: 'API gratuita para consulta de CEP com base oficial dos Correios',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0a14',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
