import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://consultadecep.com', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://consultadecep.com/consulta', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://consultadecep.com/mcp', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://consultadecep.com/exemplo/javascript', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://consultadecep.com/exemplo/jquery', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://consultadecep.com/exemplo/react', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://consultadecep.com/privacidade', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
