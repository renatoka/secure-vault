import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';

import { LoadingState } from '@/components/LoadingState';
import { SecureButton } from '@/components/SecureButton';
import { ThemedText } from '@/components/ThemedText';
import { APP_THEME } from '@/constants/Types';
import { BiometricService } from '@/services/BiometricService';
import {
    AppSettings,
    StorageService,
} from '@/services/StorageService';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  destructive?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  rightComponent,
  destructive = false,
}) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingsItemLeft}>
      <MaterialIcons
        name={icon as any}
        size={24}
        color={destructive ? APP_THEME.error : APP_THEME.accent}
      />
      <View style={styles.settingsItemText}>
        <ThemedText
          style={[
            styles.settingsItemTitle,
            destructive && { color: APP_THEME.error },
          ]}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText style={styles.settingsItemSubtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </View>
    {rightComponent ||
      (onPress && (
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={APP_THEME.text.secondary}
        />
      ))}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    checkBiometricSupport();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await StorageService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBiometricSupport = async () => {
    try {
      const isSupported =
        await BiometricService.checkBiometricSupport();
      setBiometricSupported(isSupported);

      if (isSupported) {
        const supportedTypes =
          await BiometricService.getSupportedBiometrics();
        const typeText =
          BiometricService.getBiometricTypeText(supportedTypes);
        setBiometricType(typeText);
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const updateSetting = async (
    key: keyof AppSettings,
    value: any
  ) => {
    if (!settings) return;

    try {
      const updatedSettings = await StorageService.updateSettings({
        [key]: value,
      });
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert(
        'Error',
        'Failed to update settings. Please try again.'
      );
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && !biometricSupported) {
      Alert.alert(
        'Biometric Authentication Unavailable',
        'Biometric authentication is not available on this device.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (enabled) {

      const authResult = await BiometricService.authenticateAsync(
        'Authenticate to enable biometric security'
      );

      if (!authResult.success) {
        Alert.alert(
          'Authentication Failed',
          'Please ensure biometric authentication is properly set up on your device.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    await updateSetting('biometricEnabled', enabled);
  };

  const handleSecureActionsToggle = async (enabled: boolean) => {
    if (enabled && !settings?.biometricEnabled) {
      Alert.alert(
        'Enable Biometric Authentication First',
        'You must enable biometric authentication before securing sensitive actions.',
        [{ text: 'OK' }]
      );
      return;
    }

    await updateSetting(
      'requireBiometricForSensitiveActions',
      enabled
    );
  };

  const handleExportData = async () => {
    try {
      const exportData = await StorageService.exportData();
      const fileName = `securevault_backup_${
        new Date().toISOString().split('T')[0]
      }.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, exportData);















      await updateSetting('lastBackupDate', new Date().toISOString());
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert(
        'Error',
        'Failed to export data. Please try again.'
      );
    }
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your notes and settings. This action cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert(
                'Data Cleared',
                'All data has been permanently deleted.',
                [{ text: 'OK' }]
              );

              loadSettings();
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to clear data. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About SecureVault',
      'SecureVault v1.0.0\n\nA secure note-taking app with biometric authentication.\n\nBuilt with React Native and Expo.',
      [{ text: 'OK' }]
    );
  };

  if (isLoading || !settings) {
    return <LoadingState message="Loading settings..." fullScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons
            name="settings"
            size={32}
            color={APP_THEME.accent}
          />
          <ThemedText style={styles.title}>Settings</ThemedText>
          <ThemedText style={styles.subtitle}>
            Configure your secure vault
          </ThemedText>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Security
          </ThemedText>

          <SettingsItem
            title="Biometric Authentication"
            subtitle={
              biometricSupported
                ? `Use ${biometricType} to secure your vault`
                : 'Not available on this device'
            }
            icon="fingerprint"
            rightComponent={
              <Switch
                value={settings.biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{
                  false: APP_THEME.text.disabled,
                  true: APP_THEME.accent,
                }}
                thumbColor={APP_THEME.text.primary}
                disabled={!biometricSupported}
              />
            }
          />

          <SettingsItem
            title="Secure Sensitive Actions"
            subtitle="Require biometric authentication for sensitive operations"
            icon="security"
            rightComponent={
              <Switch
                value={settings.requireBiometricForSensitiveActions}
                onValueChange={handleSecureActionsToggle}
                trackColor={{
                  false: APP_THEME.text.disabled,
                  true: APP_THEME.accent,
                }}
                thumbColor={APP_THEME.text.primary}
                disabled={!settings.biometricEnabled}
              />
            }
          />
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Data Management
          </ThemedText>

          <SecureButton
            title="Export Data"
            icon="file-download"
            onPress={handleExportData}
            requireBiometric={
              settings.requireBiometricForSensitiveActions
            }
            biometricPrompt="Authenticate to export your data"
            variant="secondary"
            style={styles.exportButton}
          />

          {settings.lastBackupDate && (
            <ThemedText style={styles.lastBackupText}>
              Last backup:{' '}
              {new Date(settings.lastBackupDate).toLocaleDateString()}
            </ThemedText>
          )}

          <SecureButton
            title="Clear All Data"
            icon="delete-forever"
            onPress={handleClearAllData}
            requireBiometric={
              settings.requireBiometricForSensitiveActions
            }
            biometricPrompt="Authenticate to clear all data"
            variant="danger"
            style={styles.clearButton}
          />
        </View>

        {/* Information Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Information
          </ThemedText>

          <SettingsItem
            title="About SecureVault"
            subtitle="Version, credits, and more"
            icon="info"
            onPress={handleAbout}
          />

          <SettingsItem
            title="Privacy Policy"
            subtitle="How we protect your data"
            icon="privacy-tip"
            onPress={() => {
              Alert.alert(
                'Privacy Policy',
                'Your data is stored locally on your device and encrypted. We do not collect or transmit any personal information.',
                [{ text: 'OK' }]
              );
            }}
          />
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <ThemedText style={styles.statsTitle}>
            Statistics
          </ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {settings.biometricEnabled ? 'Enabled' : 'Disabled'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                Biometric Auth
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {settings.lastBackupDate ? 'Yes' : 'Never'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                Backed Up
              </ThemedText>
            </View>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: APP_THEME.background.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    marginLeft: 16,
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: APP_THEME.text.primary,
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
    lineHeight: 18,
  },
  exportButton: {
    marginBottom: 8,
  },
  lastBackupText: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearButton: {
    marginTop: 8,
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 20,
    backgroundColor: APP_THEME.background.card,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_THEME.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
  },
});
