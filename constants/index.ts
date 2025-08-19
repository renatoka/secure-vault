export {
    APP_THEME, BIOMETRIC_ACTIONS, CATEGORIES, SENSITIVE_CATEGORIES
} from './Types';

export type { BiometricAction, CategoryInfo } from './Types';


export const APP_CONFIG = {
  MAX_TITLE_LENGTH: 100,
  MAX_CONTENT_LENGTH: 5000,
  MAX_NOTES_PER_CATEGORY: 1000,
  DEBOUNCE_DELAY: 300,
  AUTO_SAVE_DELAY: 2000,
  SESSION_TIMEOUT: 30 * 60 * 1000,
} as const;


export const STORAGE_KEYS = {
  NOTES: '@secure_vault_notes',
  SETTINGS: '@secure_vault_settings',
  USER_AUTH: '@user_authenticated',
  LAST_ACCESS: '@last_access_time',
} as const;


export const BIOMETRIC_ERRORS = {
  NOT_AVAILABLE: 'BIOMETRIC_NOT_AVAILABLE',
  NOT_ENROLLED: 'BIOMETRIC_NOT_ENROLLED',
  AUTH_FAILED: 'BIOMETRIC_AUTH_FAILED',
  USER_CANCELLED: 'BIOMETRIC_USER_CANCELLED',
  SYSTEM_ERROR: 'BIOMETRIC_SYSTEM_ERROR',
} as const;


export const APP_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
} as const;
