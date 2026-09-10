import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GR7 Tools Hub - Private Image & PDF Studio',
    short_name: 'GR7 Tools',
    description: 'Fastest 100% private local browser tools for Images, PDFs and Calculators.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#9A1750',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}