import type { ReferenceSet } from '../types';

/**
 * Марки бытовой техники. Плоский список: модель здесь человек обычно
 * не знает наизусть и вписывает в описание.
 */
const applianceBrands: ReferenceSet = {
  id: 'appliance-brands',
  depth: 1,
  entries: [
  { id: 'bosch', name: 'Bosch', popular: true, aliases: ['Бош'] },
  { id: 'samsung', name: 'Samsung', popular: true },
  { id: 'lg', name: 'LG', popular: true },
  { id: 'indesit', name: 'Indesit', popular: true, aliases: ['Индезит'] },
  { id: 'beko', name: 'Beko' },
  { id: 'electrolux', name: 'Electrolux' },
  { id: 'candy', name: 'Candy' },
  { id: 'whirlpool', name: 'Whirlpool' },
  { id: 'haier', name: 'Haier', popular: true },
  { id: 'gorenje', name: 'Gorenje' },
  { id: 'siemens', name: 'Siemens' },
  { id: 'aeg', name: 'AEG' },
  { id: 'miele', name: 'Miele' },
  { id: 'hotpoint-ariston', name: 'Hotpoint-Ariston' },
  { id: 'atlant', name: 'Atlant', popular: true, aliases: ['Атлант'] },
  { id: 'biryusa', name: 'Biryusa', aliases: ['Бирюса'] },
  { id: 'pozis', name: 'Pozis' },
  { id: 'zanussi', name: 'Zanussi' },
  { id: 'vestel', name: 'Vestel' },
  { id: 'midea', name: 'Midea' },
  { id: 'hisense', name: 'Hisense' },
  { id: 'tcl', name: 'TCL' },
  { id: 'dyson', name: 'Dyson', popular: true },
  { id: 'philips', name: 'Philips' },
  { id: 'tefal', name: 'Tefal' },
  { id: 'redmond', name: 'Redmond' },
  { id: 'polaris', name: 'Polaris' },
  { id: 'xiaomi', name: 'Xiaomi' },
  { id: 'kitfort', name: 'Kitfort' },
  { id: 'delonghi', name: 'De\'Longhi', aliases: ['Делонги'] },
  { id: 'krups', name: 'Krups' },
  { id: 'braun', name: 'Braun' },
  { id: 'rowenta', name: 'Rowenta' },
  { id: 'moulinex', name: 'Moulinex' },
  { id: 'vitek', name: 'Vitek' },
  { id: 'scarlett', name: 'Scarlett' },
  { id: 'drugaya', name: 'Другая' },
  ],
};

export default applianceBrands;
