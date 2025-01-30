import {
  GenreItem,
  IAvgRating,
  MovieItem,
} from 'src/content/types/content.types';

export interface ICollectionWithContentItem {
  id: string;
  name: string;
  description: string;
  posterUrl: string;
  createdAt: Date;
  updatedAt: Date;
  contents: ICollectionContent[];
}
export interface ICollectionContent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  releaseYear: string;
  ageRating: string;
  country: string;
  duration: string;
  posterUrl: string;
  trailerUrl: string;
  averageRating: { _avg: { rating: number | null }; _count: { _all: number } };
  genres: GenreItem[];
  Movie?: {
    id: string;
    contentId: string;
  }[];
  Series?: {
    id: string;
    contentId: string;
  }[];
}
export interface ICollection {
  id: string;
  name: string;
  description: string;
  posterUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
