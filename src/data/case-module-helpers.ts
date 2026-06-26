import type { GalleryItem } from '@/lib/portfolio/types';

export const makeGallery = (items: Array<{ id: string; title: string; description: string }>): GalleryItem[] =>
  items.map((item) => ({
    id: item.id,
    artifactId: item.id,
    title: item.title,
    description: item.description,
  }));
