import { ThemedText } from '@/components/ThemedText';
import { APP_THEME } from '@/constants/Types';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  size = 'large',
  fullScreen = false,
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={APP_THEME.accent} />
        <ThemedText style={styles.message}>{message}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={APP_THEME.accent} />
      {message && (
        <ThemedText style={styles.message}>{message}</ThemedText>
      )}
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'inbox',
  title,
  subtitle,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <ThemedText style={styles.emptyIcon}>
          {icon === 'inbox'
            ? '📥'
            : icon === 'note'
            ? '📝'
            : icon === 'search'
            ? '🔍'
            : '📁'}
        </ThemedText>
      </View>

      <ThemedText style={styles.emptyTitle}>{title}</ThemedText>

      {subtitle && (
        <ThemedText style={styles.emptySubtitle}>
          {subtitle}
        </ThemedText>
      )}

      {actionTitle && onAction && (
        <TouchableOpacity
          style={styles.emptyAction}
          onPress={onAction}
        >
          <ThemedText style={styles.emptyActionText}>
            {actionTitle}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_THEME.background.primary,
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: APP_THEME.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: APP_THEME.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAction: {
    backgroundColor: APP_THEME.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME.text.primary,
  },
});
