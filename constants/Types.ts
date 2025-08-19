export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  personal: {
    id: 'personal',
    name: 'Personal Notes',
    icon: 'person',
    color: '#4CAF50',
    description: 'Personal thoughts and reminders',
  },
  passwords: {
    id: 'passwords',
    name: 'Passwords',
    icon: 'key',
    color: '#FF9800',
    description: 'Login credentials and passwords',
  },
  financial: {
    id: 'financial',
    name: 'Financial Info',
    icon: 'account-balance',
    color: '#2196F3',
    description: 'Bank accounts and financial data',
  },
  documents: {
    id: 'documents',
    name: 'Documents',
    icon: 'description',
    color: '#9C27B0',
    description: 'Important documents and IDs',
  },
};

export const BIOMETRIC_ACTIONS = {
  LOGIN: 'login',
  DELETE_NOTE: 'delete_note',
  ADD_SENSITIVE_NOTE: 'add_sensitive_note',
  EXPORT_DATA: 'export_data',
  CLEAR_ALL_DATA: 'clear_all_data',
  CHANGE_SETTINGS: 'change_settings',
} as const;

export type BiometricAction =
  (typeof BIOMETRIC_ACTIONS)[keyof typeof BIOMETRIC_ACTIONS];

export const SENSITIVE_CATEGORIES = [
  'passwords',
  'financial',
  'documents',
];

export const APP_THEME = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#0f4c75',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
    disabled: '#666666',
  },
  background: {
    primary: '#0d1117',
    secondary: '#161b22',
    card: '#21262d',
  },
};
