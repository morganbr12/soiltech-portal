export const APP_NAME = 'SoilTech Portal';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Agricultural Supply Chain Management';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 25,
  LIMIT_OPTIONS: [10, 25, 50, 100],
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'st_access_token',
  REFRESH_TOKEN: 'st_refresh_token',
  USER: 'st_user',
  THEME: 'st_theme',
  SIDEBAR_COLLAPSED: 'st_sidebar_collapsed',
  LANGUAGE: 'st_lang',
  PERMISSIONS: 'st_permissions',
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM D, YYYY',
  DISPLAY_TIME: 'MMM D, YYYY HH:mm',
  INPUT: 'YYYY-MM-DD',
  API: 'YYYY-MM-DDTHH:mm:ss[Z]',
  TIME: 'HH:mm',
  SHORT: 'D MMM',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
  'Western North', 'Bono', 'Bono East', 'Ahafo', 'Savannah',
  'North East', 'Oti',
] as const;

export const CROP_TYPES = [
  'Cocoa', 'Coffee', 'Cashew', 'Shea', 'Cotton', 'Maize',
  'Rice', 'Cassava', 'Yam', 'Plantain', 'Oil Palm', 'Groundnut',
] as const;

export const CURRENCY = 'GHS';
export const CURRENCY_SYMBOL = '₵';

export const MAP_CENTER = { lat: 7.9465, lng: -1.0232 }; // Ghana center
export const MAP_ZOOM = 7;
