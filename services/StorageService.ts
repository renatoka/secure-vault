import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SecureNote {
  id: string;
  title: string;
  content: string;
  category: 'personal' | 'passwords' | 'financial' | 'documents';
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  biometricEnabled: boolean;
  requireBiometricForSensitiveActions: boolean;
  lastBackupDate?: string;
}

export class StorageService {
  private static readonly NOTES_KEY = '@secure_vault_notes';
  private static readonly SETTINGS_KEY = '@secure_vault_settings';
  private static readonly USER_AUTHENTICATED_KEY =
    '@user_authenticated';

  // Mock initial data
  private static mockNotes: SecureNote[] = [
    {
      id: '1',
      title: 'Personal Email',
      content: 'Gmail: john.doe@gmail.com\nPassword: SecurePass123!',
      category: 'passwords',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'Bank Account Info',
      content:
        'Account: 1234-5678-9012-3456\nRouting: 987654321\nBank: Example Bank',
      category: 'financial',
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-10T14:20:00Z',
    },
    {
      id: '3',
      title: 'Personal Notes',
      content:
        'Remember to call mom on Sunday.\nPickup groceries: milk, bread, eggs.',
      category: 'personal',
      createdAt: '2024-01-20T09:15:00Z',
      updatedAt: '2024-01-20T09:15:00Z',
    },
    {
      id: '4',
      title: 'Passport Details',
      content:
        'Passport Number: A12345678\nExpiry: 2030-12-31\nIssued: New York',
      category: 'documents',
      createdAt: '2024-01-05T16:45:00Z',
      updatedAt: '2024-01-05T16:45:00Z',
    },
  ];

  private static defaultSettings: AppSettings = {
    biometricEnabled: true,
    requireBiometricForSensitiveActions: true,
    lastBackupDate: undefined,
  };

  // Authentication state
  static async setUserAuthenticated(
    isAuthenticated: boolean
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_AUTHENTICATED_KEY,
        JSON.stringify(isAuthenticated)
      );
    } catch (error) {
      console.error('Error setting authentication state:', error);
    }
  }

  static async isUserAuthenticated(): Promise<boolean> {
    try {
      const authState = await AsyncStorage.getItem(
        this.USER_AUTHENTICATED_KEY
      );
      return authState ? JSON.parse(authState) : false;
    } catch (error) {
      console.error('Error getting authentication state:', error);
      return false;
    }
  }

  // Notes management
  static async getNotes(): Promise<SecureNote[]> {
    try {
      const notesJson = await AsyncStorage.getItem(this.NOTES_KEY);
      if (notesJson) {
        return JSON.parse(notesJson);
      } else {
        // First time - initialize with mock data
        await this.saveNotes(this.mockNotes);
        return this.mockNotes;
      }
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  static async saveNotes(notes: SecureNote[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.NOTES_KEY,
        JSON.stringify(notes)
      );
    } catch (error) {
      console.error('Error saving notes:', error);
      throw error;
    }
  }

  static async addNote(
    note: Omit<SecureNote, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SecureNote> {
    try {
      const notes = await this.getNotes();
      const newNote: SecureNote = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      notes.push(newNote);
      await this.saveNotes(notes);
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  static async updateNote(
    id: string,
    updates: Partial<SecureNote>
  ): Promise<SecureNote | null> {
    try {
      const notes = await this.getNotes();
      const noteIndex = notes.findIndex((note) => note.id === id);

      if (noteIndex === -1) {
        return null;
      }

      notes[noteIndex] = {
        ...notes[noteIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.saveNotes(notes);
      return notes[noteIndex];
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  static async deleteNote(id: string): Promise<boolean> {
    try {
      const notes = await this.getNotes();
      const filteredNotes = notes.filter((note) => note.id !== id);

      if (filteredNotes.length === notes.length) {
        return false; // Note not found
      }

      await this.saveNotes(filteredNotes);
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  static async getNotesByCategory(
    category: SecureNote['category']
  ): Promise<SecureNote[]> {
    try {
      const notes = await this.getNotes();
      return notes.filter((note) => note.category === category);
    } catch (error) {
      console.error('Error getting notes by category:', error);
      return [];
    }
  }

  // Settings management
  static async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(
        this.SETTINGS_KEY
      );
      if (settingsJson) {
        return {
          ...this.defaultSettings,
          ...JSON.parse(settingsJson),
        };
      } else {
        await this.saveSettings(this.defaultSettings);
        return this.defaultSettings;
      }
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.defaultSettings;
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.SETTINGS_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  static async updateSettings(
    updates: Partial<AppSettings>
  ): Promise<AppSettings> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...updates };
      await this.saveSettings(newSettings);
      return newSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.NOTES_KEY,
        this.SETTINGS_KEY,
        this.USER_AUTHENTICATED_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  static async exportData(): Promise<string> {
    try {
      const notes = await this.getNotes();
      const settings = await this.getSettings();

      const exportData = {
        notes,
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}
