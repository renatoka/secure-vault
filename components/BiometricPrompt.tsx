import { ThemedText } from '@/components/ThemedText';
import { APP_THEME } from '@/constants/Types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface BiometricPromptProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  biometricType: string;
  onAuthenticate: () => void;
  onCancel: () => void;
  onFallback?: () => void;
  showFallback?: boolean;
}

export function BiometricPrompt({
  visible,
  title,
  subtitle,
  biometricType,
  onAuthenticate,
  onCancel,
  onFallback,
  showFallback = true,
}: BiometricPromptProps) {
  const getBiometricIcon = () => {
    if (biometricType.includes('Face')) {
      return 'face';
    } else if (
      biometricType.includes('Touch') ||
      biometricType.includes('Fingerprint')
    ) {
      return 'fingerprint';
    }
    return 'security';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={getBiometricIcon() as any}
                size={48}
                color={APP_THEME.accent}
              />
            </View>

            <ThemedText style={styles.title}>{title}</ThemedText>

            {subtitle && (
              <ThemedText style={styles.subtitle}>
                {subtitle}
              </ThemedText>
            )}
          </View>

          <View style={styles.content}>
            <ThemedText style={styles.instructionText}>
              Use {biometricType} to authenticate
            </ThemedText>

            <TouchableOpacity
              style={styles.authenticateButton}
              onPress={onAuthenticate}
            >
              <MaterialIcons
                name={getBiometricIcon() as any}
                size={24}
                color={APP_THEME.text.primary}
              />
              <ThemedText style={styles.authenticateButtonText}>
                Use {biometricType}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            {showFallback && onFallback && (
              <TouchableOpacity
                style={styles.fallbackButton}
                onPress={onFallback}
              >
                <ThemedText style={styles.fallbackButtonText}>
                  Use Passcode
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <ThemedText style={styles.cancelButtonText}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  container: {
    backgroundColor: APP_THEME.background.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: APP_THEME.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: APP_THEME.accent,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 16,
    color: APP_THEME.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  authenticateButton: {
    backgroundColor: APP_THEME.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  authenticateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
  },
  footer: {
    width: '100%',
    gap: 12,
  },
  fallbackButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: APP_THEME.background.secondary,
    alignItems: 'center',
  },
  fallbackButtonText: {
    fontSize: 14,
    color: APP_THEME.text.primary,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
  },
});
