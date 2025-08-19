import { Alert } from 'react-native';

/**
 * Format date for display in the UI
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours =
    (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  }
};

/**
 * Format full date with time
 */
export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get preview text with ellipsis
 */
export const getPreviewText = (
  content: string,
  maxLength: number = 100
): string => {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '...';
};

/**
 * Validate note input
 */
export const validateNoteInput = (
  title: string,
  content: string
): string | null => {
  if (!title.trim()) {
    return 'Please enter a title for your note';
  }
  if (!content.trim()) {
    return 'Please enter content for your note';
  }
  if (title.length > 100) {
    return 'Title must be less than 100 characters';
  }
  if (content.length > 5000) {
    return 'Content must be less than 5000 characters';
  }
  return null;
};

/**
 * Show confirmation dialog
 */
export const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
): void => {
  Alert.alert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
    },
    {
      text: confirmText,
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
};

/**
 * Show error dialog
 */
export const showErrorDialog = (
  message: string,
  title: string = 'Error'
): void => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

/**
 * Show success dialog
 */
export const showSuccessDialog = (
  message: string,
  onDismiss?: () => void,
  title: string = 'Success'
): void => {
  Alert.alert(title, message, [{ text: 'OK', onPress: onDismiss }]);
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return (
    Date.now().toString() + Math.random().toString(36).substr(2, 9)
  );
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if string is empty or only whitespace
 */
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  );
};

/**
 * Sleep function for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(
  jsonString: string,
  fallback: T
): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};
