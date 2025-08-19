import { ThemedText } from '@/components/ThemedText';
import {
    APP_THEME,
    CATEGORIES,
    SENSITIVE_CATEGORIES,
} from '@/constants/Types';
import { SecureNote } from '@/services/StorageService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface NoteCardProps {
  note: SecureNote;
  onPress: (note: SecureNote) => void;
  onDelete?: (note: SecureNote) => void;
  showCategory?: boolean;
  compact?: boolean;
}

export function NoteCard({
  note,
  onPress,
  onDelete,
  showCategory = true,
  compact = false,
}: NoteCardProps) {
  const categoryInfo = CATEGORIES[note.category];
  const isSensitive = SENSITIVE_CATEGORIES.includes(note.category);

  const formatDate = (dateString: string) => {
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

  const getPreviewText = (
    content: string,
    maxLength: number = 100
  ) => {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer]}
      onPress={() => onPress(note)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {showCategory && (
              <MaterialIcons
                name={categoryInfo?.icon as any}
                size={compact ? 16 : 20}
                color={categoryInfo?.color}
              />
            )}
            <ThemedText
              style={[styles.title, compact && styles.compactTitle]}
              numberOfLines={1}
            >
              {note.title}
            </ThemedText>
            {isSensitive && (
              <MaterialIcons
                name="security"
                size={compact ? 12 : 16}
                color={APP_THEME.warning}
              />
            )}
          </View>
          <ThemedText
            style={[styles.date, compact && styles.compactDate]}
          >
            {formatDate(note.updatedAt)}
          </ThemedText>
        </View>

        {!compact && (
          <ThemedText style={styles.preview} numberOfLines={2}>
            {getPreviewText(note.content, 120)}
          </ThemedText>
        )}

        <View style={styles.footer}>
          {showCategory && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryInfo?.color + '20' },
                compact && styles.compactCategoryBadge,
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryText,
                  { color: categoryInfo?.color },
                  compact && styles.compactCategoryText,
                ]}
              >
                {categoryInfo?.name}
              </ThemedText>
            </View>
          )}

          <View style={styles.spacer} />

          {note.createdAt !== note.updatedAt && (
            <MaterialIcons
              name="edit"
              size={compact ? 12 : 14}
              color={APP_THEME.text.disabled}
            />
          )}
        </View>
      </View>

      {onDelete && (
        <TouchableOpacity
          style={[
            styles.deleteButton,
            compact && styles.compactDeleteButton,
          ]}
          onPress={() => onDelete(note)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name="delete"
            size={compact ? 16 : 20}
            color={APP_THEME.error}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  compactContainer: {
    padding: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    marginLeft: 8,
  },
  compactDate: {
    fontSize: 11,
  },
  preview: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compactCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  compactCategoryText: {
    fontSize: 10,
  },
  spacer: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
    borderRadius: 6,
  },
  compactDeleteButton: {
    padding: 6,
    marginLeft: 8,
  },
});
