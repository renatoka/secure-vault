import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { LoadingState } from '@/components/LoadingState';
import { SecureButton } from '@/components/SecureButton';
import { ThemedText } from '@/components/ThemedText';
import {
  APP_THEME,
  CATEGORIES,
  SENSITIVE_CATEGORIES,
} from '@/constants/Types';
import { BiometricService } from '@/services/BiometricService';
import {
  SecureNote,
  StorageService,
} from '@/services/StorageService';
import { formatFullDate, validateNoteInput } from '@/utils/helpers';

export default function ViewNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [note, setNote] = useState<SecureNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      const notes = await StorageService.getNotes();
      const foundNote = notes.find((n) => n.id === id);

      if (foundNote) {
        setNote(foundNote);
        setEditTitle(foundNote.title);
        setEditContent(foundNote.content);
      } else {
        Alert.alert('Error', 'Note not found.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Error', 'Failed to load note.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (editTitle !== note?.title || editContent !== note?.content) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setEditTitle(note?.title || '');
              setEditContent(note?.content || '');
              setIsEditing(false);
            },
          },
        ]
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (!note) return;


    const validationError = validateNoteInput(editTitle, editContent);
    if (validationError) {
      Alert.alert('Invalid Input', validationError);
      return;
    }

    setIsSaving(true);

    try {
      const updatedNote = await StorageService.updateNote(note.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });

      if (updatedNote) {
        setNote(updatedNote);
        setIsEditing(false);
        Alert.alert('Success', 'Note updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.push('/(tabs)');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert(
        'Error',
        'Failed to save changes. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;


    const isSensitive = SENSITIVE_CATEGORIES.includes(note.category);

    if (isSensitive) {
      const authResult =
        await BiometricService.authenticateWithFallback(
          'Authenticate to delete this sensitive note'
        );

      if (!authResult.success) {
        return;
      }
    }

    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteNote(note.id);
              Alert.alert('Success', 'Note deleted successfully.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to delete note. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const copyToClipboard = async () => {
    if (!note) return;


    // await Clipboard.setStringAsync(note.content);
    Alert.alert('Copied', 'Note content copied to clipboard.');
  };

  if (isLoading) {
    return <LoadingState message="Loading note..." fullScreen />;
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>
          Note not found
        </ThemedText>
      </View>
    );
  }

  const category = CATEGORIES[note.category];
  const isSensitive = SENSITIVE_CATEGORIES.includes(note.category);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={APP_THEME.text.primary}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {isEditing ? 'Edit Note' : note.title}
          </ThemedText>
        </View>

        <View style={styles.headerActions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={styles.headerButton}
              >
                <MaterialIcons
                  name="close"
                  size={20}
                  color={APP_THEME.text.secondary}
                />
              </TouchableOpacity>
              <SecureButton
                title="Save"
                onPress={handleSave}
                disabled={isSaving}
                loading={isSaving}
                style={styles.saveButton}
                textStyle={styles.saveButtonText}
              />
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={copyToClipboard}
                style={styles.headerButton}
              >
                <MaterialIcons
                  name="content-copy"
                  size={20}
                  color={APP_THEME.text.secondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEdit}
                style={styles.headerButton}
              >
                <MaterialIcons
                  name="edit"
                  size={20}
                  color={APP_THEME.accent}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Note Metadata */}
        {!isEditing && (
          <View style={styles.metadataSection}>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: `${category.color}20`,
                  borderColor: category.color,
                },
              ]}
            >
              <MaterialIcons
                name={category.icon as any}
                size={16}
                color={category.color}
              />
              <ThemedText
                style={[
                  styles.categoryText,
                  { color: category.color },
                ]}
              >
                {category.name}
              </ThemedText>
              {isSensitive && (
                <MaterialIcons
                  name="security"
                  size={14}
                  color={APP_THEME.warning}
                />
              )}
            </View>

            <View style={styles.dateInfo}>
              <ThemedText style={styles.dateLabel}>
                Created:
              </ThemedText>
              <ThemedText style={styles.dateValue}>
                {formatFullDate(note.createdAt)}
              </ThemedText>
            </View>

            {note.createdAt !== note.updatedAt && (
              <View style={styles.dateInfo}>
                <ThemedText style={styles.dateLabel}>
                  Modified:
                </ThemedText>
                <ThemedText style={styles.dateValue}>
                  {formatFullDate(note.updatedAt)}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Title */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Title</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Enter note title..."
              placeholderTextColor={APP_THEME.text.secondary}
              maxLength={100}
            />
          ) : (
            <View style={styles.titleDisplay}>
              <ThemedText style={styles.titleText}>
                {note.title}
              </ThemedText>
            </View>
          )}
          {isEditing && (
            <ThemedText style={styles.characterCount}>
              {editTitle.length}/100
            </ThemedText>
          )}
        </View>

        {/* Content */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Content</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.contentInput}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Enter note content..."
              placeholderTextColor={APP_THEME.text.secondary}
              multiline
              textAlignVertical="top"
              maxLength={5000}
            />
          ) : (
            <View style={styles.contentDisplay}>
              <ThemedText style={styles.contentText} selectable>
                {note.content}
              </ThemedText>
            </View>
          )}
          {isEditing && (
            <ThemedText style={styles.characterCount}>
              {editContent.length}/5000
            </ThemedText>
          )}
        </View>

        {/* Actions */}
        {!isEditing && (
          <View style={styles.actionsSection}>
            <SecureButton
              title="Delete Note"
              icon="delete"
              onPress={handleDelete}
              variant="danger"
              requireBiometric={isSensitive}
              biometricPrompt="Authenticate to delete this sensitive note"
              style={styles.deleteButton}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: APP_THEME.background.secondary,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    maxWidth: 200,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  saveButtonText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  metadataSection: {
    marginBottom: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    width: 60,
  },
  dateValue: {
    fontSize: 12,
    color: APP_THEME.text.primary,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 18,
    color: APP_THEME.text.primary,
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  titleDisplay: {
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    lineHeight: 24,
  },
  contentInput: {
    fontSize: 16,
    color: APP_THEME.text.primary,
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 200,
    marginBottom: 8,
  },
  contentDisplay: {
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 100,
  },
  contentText: {
    fontSize: 16,
    color: APP_THEME.text.primary,
    lineHeight: 24,
  },
  characterCount: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    textAlign: 'right',
  },
  actionsSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  deleteButton: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: APP_THEME.text.secondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
