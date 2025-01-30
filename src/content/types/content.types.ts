export type Genre =
  | 'Комедия'
  | 'Аниме'
  | 'Спорт'
  | 'Фэнтези'
  | 'Мистика'
  | 'Музыка'
  | 'Криминал'
  | 'Детектив'
  | 'Мультфильмы'
  | 'Драма'
  | 'Экшн'
  | 'Триллер'
  | 'Хоррор'
  | 'Романтика'
  | 'Документальные'
  | 'Сай-Фай'
  | 'Анимация';

export type Country =
  | 'Россия'
  | 'Канада'
  | 'США'
  | 'Франция'
  | 'Великобритания'
  | 'Германия'
  | 'Италия'
  | 'Испания'
  | 'Южная Корея'
  | 'Китай'
  | 'Япония'
  | 'СССР'
  | 'Австралия'
  | 'Беларусь'
  | 'Казахстан'
  | 'Финляндия'
  | 'Тайланд'
  | 'Чехия'
  | 'Польша'
  | 'Швеция'
  | 'Турция'
  | 'Швейцария';
export type ContentType = 'movie' | 'series';
export interface IContentItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  releaseYear: number;
  ageRating: string;
  country: string;
  duration: string | null;
  posterUrl: string;
  Movie?: MovieItem;
  genres: GenreItem[];
  Series?: SeriesItem;
  averageRating: IAvgRating;
}
export interface IAvgRating {
  _avg: { rating: number };
  _count: { _all: number };
}
export interface MovieItem {
  id: string;
  contentId: string;
}
export interface GenreItem {
  id: string;
  name: string;
}
export interface SeriesItem {
  id: string;
  contentId: string;
  seasons: Season[];
}
export interface Season {
  id: string;
  number: string;
  seriesId: string;
  episodes: Episode[];
}
export interface Episode {
  id: string;
  title: string;
  number: string;
  isFree: boolean;
  posterUrl: string;
  description: string;
  duration: string;
  seasonId: string;
}
