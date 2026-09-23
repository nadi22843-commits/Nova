import type { ReferenceSet } from '../types';

/**
 * Бренды одежды и обуви. Плоский список: модельный ряд меняется каждый
 * сезон, вести его в справочнике бессмысленно.
 */
const clothingBrands: ReferenceSet = {
  id: 'clothing-brands',
  depth: 1,
  entries: [
  { id: 'nike', name: 'Nike', popular: true, aliases: ['Найк'] },
  { id: 'adidas', name: 'Adidas', popular: true, aliases: ['Адидас'] },
  { id: 'zara', name: 'Zara', popular: true },
  { id: 'h-m', name: 'H&M', popular: true, aliases: ['HM'] },
  { id: 'uniqlo', name: 'Uniqlo', popular: true },
  { id: 'puma', name: 'Puma' },
  { id: 'reebok', name: 'Reebok' },
  { id: 'new-balance', name: 'New Balance' },
  { id: 'the-north-face', name: 'The North Face' },
  { id: 'levis', name: 'Levi\'s', aliases: ['Левайс', 'Levis'] },
  { id: 'tommy-hilfiger', name: 'Tommy Hilfiger' },
  { id: 'calvin-klein', name: 'Calvin Klein' },
  { id: 'lacoste', name: 'Lacoste' },
  { id: 'massimo-dutti', name: 'Massimo Dutti' },
  { id: 'bershka', name: 'Bershka' },
  { id: 'pull-bear', name: 'Pull&Bear' },
  { id: 'stradivarius', name: 'Stradivarius' },
  { id: 'mango', name: 'Mango' },
  { id: 'cos', name: 'COS' },
  { id: 'gucci', name: 'Gucci' },
  { id: 'prada', name: 'Prada' },
  { id: 'balenciaga', name: 'Balenciaga' },
  { id: 'louis-vuitton', name: 'Louis Vuitton' },
  { id: 'burberry', name: 'Burberry' },
  { id: 'ralph-lauren', name: 'Ralph Lauren' },
  { id: 'hugo-boss', name: 'Hugo Boss' },
  { id: 'columbia', name: 'Columbia' },
  { id: 'salomon', name: 'Salomon' },
  { id: 'asics', name: 'Asics' },
  { id: 'converse', name: 'Converse' },
  { id: 'vans', name: 'Vans' },
  { id: 'timberland', name: 'Timberland' },
  { id: 'dr-martens', name: 'Dr. Martens' },
  { id: 'crocs', name: 'Crocs' },
  { id: 'skechers', name: 'Skechers' },
  { id: 'ostin', name: 'Ostin', popular: true },
  { id: 'gloria-jeans', name: 'Gloria Jeans', popular: true },
  { id: 'befree', name: 'Befree' },
  { id: 'zolla', name: 'Zolla' },
  { id: 'sela', name: 'Sela' },
  { id: 'finn-flare', name: 'Finn Flare' },
  { id: 'baon', name: 'Baon' },
  { id: 'bez-brenda', name: 'Без бренда', popular: true },
  { id: 'drugoy', name: 'Другой' },
  ],
};

export default clothingBrands;
