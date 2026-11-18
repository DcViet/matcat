import cauHinh from '../cauhinh-portfolio.json';
import du_an from '../data/portfolio.json';
import type { Lang } from './i18n';

export type CheDo = 'tat' | 'an' | 'hien';
export const CHE_DO = (['tat', 'an', 'hien'].includes(cauHinh.cheDo) ? cauHinh.cheDo : 'tat') as CheDo;

// "tat": không tạo trang. "an": có trang nhưng không công khai. "hien": công khai.
export const CO_PORTFOLIO = CHE_DO !== 'tat';
export const HIEN_TREN_MENU = CHE_DO === 'hien';

type Chu = Record<Lang, string>;
export interface DuAn {
  slug: string;
  so: string;
  title: Chu;
  typology: Chu;
  location: Chu;
  country: Chu;
  status: 'completed' | 'design' | string;
  imageKind: 'photo' | 'render' | string;
  summary: Chu;
  concept: Chu;
  brief: Chu;
  challenges: Chu[];
  solutions: Chu[];
  cover: string;
  gallery: string[];
  // Ảnh phụ: hiện nhỏ ở cuối trang, bên dưới các ảnh chính.
  phu?: string[];
}
export const DU_AN = du_an as DuAn[];
