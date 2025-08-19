import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { EmptyState, LoadingState } from '@/components/LoadingState';
import { NoteCard } from '@/components/NoteCard';
import { SecureButton } from '@/components/SecureButton';
import { ThemedText } from '@/components/ThemedText';
import { APP_THEME, CATEGORIES } from '@/constants/Types';
import { BiometricService } from '@/services/BiometricService';
import {
  SecureNote,
  StorageService,
} from '@/services/StorageService';

export default function NotesScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();

  const [notes, setNotes] = useState<SecureNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<SecureNote[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    (category as string) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, selectedCategory, searchQuery]);

  const loadNotes = async () => {
    try {
      const allNotes = await StorageService.getNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (note) => note.category === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );

    setFilteredNotes(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotes();
  }, []);

  const handleNotePress = (note: SecureNote) => {
    router.push(`/notes/${note.id}`);
  };

  const handleDeleteNote = async (note: SecureNote) => {
    const sensitiveCategories = [
      'passwords',
      'financial',
      'documents',
    ];
    const isSensitive = sensitiveCategories.includes(note.category);

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
              loadNotes();
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

  const handleAddNote = () => {
    router.push('/notes/add');
  };

  const renderCategoryFilter = () => {
    const categories = [
      {
        id: 'all',
        name: 'All Notes',
        icon: 'notes',
        color: APP_THEME.accent,
      },
      ...Object.entries(CATEGORIES).map(([id, cat]) => ({
        id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
      })),
    ];

    return (
      <View style={styles.categoryFilter}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryFilterItem,
                selectedCategory === item.id &&
                  styles.categoryFilterItemActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <MaterialIcons
                name={item.icon as any}
                size={18}
                color={
                  selectedCategory === item.id
                    ? APP_THEME.text.primary
                    : item.color
                }
              />
              <ThemedText
                style={[
                  styles.categoryFilterText,
                  selectedCategory === item.id &&
                    styles.categoryFilterTextActive,
                ]}
              >
                {item.name}
              </ThemedText>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <MaterialIcons
        name="search"
        size={20}
        color={APP_THEME.text.secondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search notes..."
        placeholderTextColor={APP_THEME.text.secondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={() => setSearchQuery('')}
          style={styles.clearButton}
        >
          <MaterialIcons
            name="clear"
            size={20}
            color={APP_THEME.text.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <ThemedText style={styles.title}>
            {selectedCategory === 'all'
              ? 'All Notes'
              : CATEGORIES[selectedCategory]?.name || 'Notes'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {filteredNotes.length} note
            {filteredNotes.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </ThemedText>
        </View>
        <SecureButton
          title="Add"
          icon="add"
          onPress={handleAddNote}
          style={styles.addButton}
          textStyle={styles.addButtonText}
        />
      </View>
      {renderSearchBar()}
      {renderCategoryFilter()}
    </View>
  );

  const renderNote = ({ item }: { item: SecureNote }) => (
    <NoteCard
      note={item}
      onPress={handleNotePress}
      onDelete={handleDeleteNote}
      showCategory={selectedCategory === 'all'}
    />
  );

  const renderEmptyState = () => {
    if (searchQuery) {
      return (
        <EmptyState
          icon="search"
          title="No matching notes"
          subtitle={`No notes found matching "${searchQuery}"`}
        />
      );
    }

    if (selectedCategory !== 'all') {
      const categoryName =
        CATEGORIES[selectedCategory]?.name || 'this category';
      return (
        <EmptyState
          icon="note"
          title={`No notes in ${categoryName}`}
          subtitle="Create your first note in this category"
          actionTitle="Add Note"
          onAction={handleAddNote}
        />
      );
    }

    return (
      <EmptyState
        icon="note"
        title="No notes yet"
        subtitle="Create your first secure note to get started"
        actionTitle="Add Note"
        onAction={handleAddNote}
      />
    );
  };

  if (isLoading) {
    return <LoadingState message="Loading notes..." fullScreen />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={APP_THEME.accent}
            colors={[APP_THEME.accent]}
            progressBackgroundColor={APP_THEME.background.card}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  listContainer: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  addButtonText: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: APP_THEME.text.primary,
  },
  clearButton: {
    padding: 4,
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryList: {
    paddingHorizontal: 0,
  },
  categoryFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: APP_THEME.background.card,
    borderRadius: 20,
    gap: 6,
  },
  categoryFilterItemActive: {
    backgroundColor: APP_THEME.accent,
  },
  categoryFilterText: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: APP_THEME.text.primary,
  },
});
