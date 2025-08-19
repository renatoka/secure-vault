import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

import { SecureButton } from '@/components/SecureButton';
import { ThemedText } from '@/components/ThemedText';
import {
  APP_THEME,
  CATEGORIES,
  SENSITIVE_CATEGORIES,
} from '@/constants/Types';
import {
  SecureNote,
  StorageService,
} from '@/services/StorageService';
import { validateNoteInput } from '@/utils/helpers';

interface CategorySelectorProps {
  selectedCategory: SecureNote['category'];
  onSelect: (category: SecureNote['category']) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect,
}) => (
  <View style={styles.categorySelector}>
    <ThemedText style={styles.sectionTitle}>Category</ThemedText>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.categoryList}>
        {Object.entries(CATEGORIES).map(([categoryId, category]) => {
          const isSelected = selectedCategory === categoryId;
          const isSensitive =
            SENSITIVE_CATEGORIES.includes(categoryId);

          return (
            <TouchableOpacity
              key={categoryId}
              style={[
                styles.categoryItem,
                isSelected && styles.categoryItemSelected,
              ]}
              onPress={() =>
                onSelect(categoryId as SecureNote['category'])
              }
            >
              <View style={styles.categoryItemContent}>
                <MaterialIcons
                  name={category.icon as any}
                  size={24}
                  color={
                    isSelected
                      ? APP_THEME.text.primary
                      : category.color
                  }
                />
                {isSensitive && (
                  <MaterialIcons
                    name="security"
                    size={16}
                    color={
                      isSelected
                        ? APP_THEME.text.primary
                        : APP_THEME.warning
                    }
                    style={styles.securityIcon}
                  />
                )}
              </View>
              <ThemedText
                style={[
                  styles.categoryItemText,
                  isSelected && styles.categoryItemTextSelected,
                ]}
              >
                {category.name}
              </ThemedText>
              <ThemedText
                style={[
                  styles.categoryItemDescription,
                  isSelected &&
                    styles.categoryItemDescriptionSelected,
                ]}
              >
                {category.description}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  </View>
);

export default function AddNoteScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] =
    useState<SecureNote['category']>('personal');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {

    const validationError = validateNoteInput(title, content);
    if (validationError) {
      Alert.alert('Invalid Input', validationError);
      return;
    }

    setIsSaving(true);

    try {

      const isSensitive = SENSITIVE_CATEGORIES.includes(category);


      const newNote = await StorageService.addNote({
        title: title.trim(),
        content: content.trim(),
        category,
      });


      const successMessage = isSensitive
        ? 'Secure note created successfully! This note is protected with enhanced security.'
        : 'Note created successfully!';

      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            router.push('/(tabs)');
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const isSensitiveCategory = SENSITIVE_CATEGORIES.includes(category);
  const canSave =
    title.trim().length > 0 && content.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.cancelButton}
        >
          <MaterialIcons
            name="close"
            size={24}
            color={APP_THEME.text.primary}
          />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>New Note</ThemedText>
        <SecureButton
          title="Save"
          onPress={handleSave}
          disabled={!canSave || isSaving}
          loading={isSaving}
          requireBiometric={isSensitiveCategory}
          biometricPrompt="Authenticate to save this sensitive note"
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
        />
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Input */}
        <View style={styles.inputSection}>
          <ThemedText style={styles.sectionTitle}>Title</ThemedText>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter note title..."
            placeholderTextColor={APP_THEME.text.secondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            autoFocus
          />
          <ThemedText style={styles.characterCount}>
            {title.length}/100
          </ThemedText>
        </View>

        {/* Category Selection */}
        <CategorySelector
          selectedCategory={category}
          onSelect={setCategory}
        />

        {/* Security Notice for Sensitive Categories */}
        {isSensitiveCategory && (
          <View style={styles.securityNotice}>
            <MaterialIcons
              name="security"
              size={20}
              color={APP_THEME.warning}
            />
            <ThemedText style={styles.securityNoticeText}>
              This note will be stored in a secure category and may
              require biometric authentication for certain actions.
            </ThemedText>
          </View>
        )}

        {/* Content Input */}
        <View style={styles.inputSection}>
          <ThemedText style={styles.sectionTitle}>Content</ThemedText>
          <TextInput
            style={styles.contentInput}
            placeholder="Enter your note content here..."
            placeholderTextColor={APP_THEME.text.secondary}
            value={content}
            onChangeText={setContent}
            maxLength={5000}
            multiline
            textAlignVertical="top"
          />
          <ThemedText style={styles.characterCount}>
            {content.length}/5000
          </ThemedText>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <ThemedText style={styles.tipsTitle}>💡 Tips</ThemedText>
          <View style={styles.tipItem}>
            <ThemedText style={styles.tipText}>
              • Choose the appropriate category for better
              organization
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedText style={styles.tipText}>
              • Sensitive categories (Passwords, Financial, Documents)
              have enhanced security
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedText style={styles.tipText}>
              • Your notes are automatically encrypted and stored
              securely
            </ThemedText>
          </View>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: APP_THEME.background.secondary,
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_THEME.text.primary,
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
  },
  inputSection: {
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
  characterCount: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    textAlign: 'right',
  },
  categorySelector: {
    marginBottom: 24,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryItem: {
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    padding: 16,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    backgroundColor: APP_THEME.accent,
    borderColor: APP_THEME.accent,
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityIcon: {
    marginLeft: 4,
  },
  categoryItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: APP_THEME.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryItemTextSelected: {
    color: APP_THEME.text.primary,
  },
  categoryItemDescription: {
    fontSize: 11,
    color: APP_THEME.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  categoryItemDescriptionSelected: {
    color: APP_THEME.text.primary,
    opacity: 0.8,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.warning + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: 13,
    color: APP_THEME.text.secondary,
    lineHeight: 18,
  },
  tipsSection: {
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: APP_THEME.text.secondary,
    lineHeight: 18,
  },
});
