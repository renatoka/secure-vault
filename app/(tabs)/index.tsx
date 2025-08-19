import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { EmptyState, LoadingState } from '@/components/LoadingState';
import { NoteCard } from '@/components/NoteCard';
import { ThemedText } from '@/components/ThemedText';
import { APP_THEME, CATEGORIES } from '@/constants/Types';
import {
  SecureNote,
  StorageService,
} from '@/services/StorageService';

const { width } = Dimensions.get('window');

interface CategoryStats {
  count: number;
  lastUpdated?: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<SecureNote[]>([]);
  const [categoryStats, setCategoryStats] = useState<
    Record<string, CategoryStats>
  >({});
  const [recentNotes, setRecentNotes] = useState<SecureNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const allNotes = await StorageService.getNotes();
      setNotes(allNotes);

      const stats: Record<string, CategoryStats> = {};
      Object.keys(CATEGORIES).forEach((categoryId) => {
        const categoryNotes = allNotes.filter(
          (note) => note.category === categoryId
        );
        stats[categoryId] = {
          count: categoryNotes.length,
          lastUpdated:
            categoryNotes.length > 0
              ? categoryNotes.sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                )[0].updatedAt
              : undefined,
        };
      });
      setCategoryStats(stats);

      const recent = allNotes
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        )
        .slice(0, 5);
      setRecentNotes(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/(tabs)/notes?category=${categoryId}`);
  };

  const handleNotePress = (note: SecureNote) => {
    router.push(`/notes/${note.id}`);
  };

  const handleAddNote = () => {
    router.push('/notes/add');
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours =
      (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 24 * 7)
      return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <LoadingState
        message="Loading your secure vault..."
        fullScreen
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={APP_THEME.accent}
            colors={[APP_THEME.accent]}
            progressBackgroundColor={APP_THEME.background.card}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>
              Welcome back
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              You have {notes.length} secure note
              {notes.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddNote}
          >
            <MaterialIcons
              name="add"
              size={24}
              color={APP_THEME.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons
              name="security"
              size={24}
              color={APP_THEME.accent}
            />
            <ThemedText style={styles.statNumber}>
              {notes.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Total Notes
            </ThemedText>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons
              name="shield"
              size={24}
              color={APP_THEME.success}
            />
            <ThemedText style={styles.statNumber}>
              {
                notes.filter((n) =>
                  ['passwords', 'financial', 'documents'].includes(
                    n.category
                  )
                ).length
              }
            </ThemedText>
            <ThemedText style={styles.statLabel}>Secure</ThemedText>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons
              name="update"
              size={24}
              color={APP_THEME.warning}
            />
            <ThemedText style={styles.statNumber}>
              {
                notes.filter((n) => {
                  const diffInHours =
                    (new Date().getTime() -
                      new Date(n.updatedAt).getTime()) /
                    (1000 * 60 * 60);
                  return diffInHours < 24;
                }).length
              }
            </ThemedText>
            <ThemedText style={styles.statLabel}>Today</ThemedText>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Categories
          </ThemedText>
          <View style={styles.categoriesGrid}>
            {Object.entries(CATEGORIES).map(
              ([categoryId, category]) => {
                const stats = categoryStats[categoryId] || {
                  count: 0,
                };
                return (
                  <TouchableOpacity
                    key={categoryId}
                    style={styles.categoryCard}
                    onPress={() => handleCategoryPress(categoryId)}
                  >
                    <View style={styles.categoryHeader}>
                      <MaterialIcons
                        name={category.icon as any}
                        size={28}
                        color={category.color}
                      />
                      <ThemedText style={styles.categoryCount}>
                        {stats.count}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.categoryName}>
                      {category.name}
                    </ThemedText>
                    {stats.lastUpdated && (
                      <ThemedText style={styles.categoryLastUpdated}>
                        Updated {formatLastUpdated(stats.lastUpdated)}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </View>

        {/* Recent Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Recent Notes
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/notes')}
            >
              <ThemedText style={styles.seeAllText}>
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>

          {recentNotes.length === 0 ? (
            <EmptyState
              icon="note"
              title="No notes yet"
              subtitle="Create your first secure note to get started"
              actionTitle="Add Note"
              onAction={handleAddNote}
            />
          ) : (
            <View style={styles.recentNotes}>
              {recentNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPress={handleNotePress}
                  compact
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: APP_THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_THEME.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: APP_THEME.accent,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: APP_THEME.text.primary,
    marginBottom: 4,
  },
  categoryLastUpdated: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
  },
  recentNotes: {
    gap: 8,
  },
});
