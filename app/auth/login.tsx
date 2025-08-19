import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LoadingState } from '@/components/LoadingState';
import { ThemedText } from '@/components/ThemedText';
import { APP_THEME } from '@/constants/Types';
import { BiometricService } from '@/services/BiometricService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { onAuthSuccess } = useLocalSearchParams as {
    onAuthSuccess?: () => void;
  };
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const pulseAnimation = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    checkBiometricSupport();
    startAnimations();
  }, []);

  const startAnimations = () => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );
  };

  const checkBiometricSupport = async () => {
    try {
      const isSupported =
        await BiometricService.checkBiometricSupport();
      setBiometricAvailable(isSupported);

      if (isSupported) {
        const supportedTypes =
          await BiometricService.getSupportedBiometrics();
        const typeText =
          BiometricService.getBiometricTypeText(supportedTypes);
        setBiometricType(typeText);
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setBiometricAvailable(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricAvailable) {
      Alert.alert(
        'Biometric Authentication Unavailable',
        'Biometric authentication is not available on this device. Please ensure you have set up Touch ID, Face ID, or fingerprint authentication in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await BiometricService.authenticateAsync(
        'Authenticate to access your secure vault',
        'Use Passcode'
      );

      if (result.success) {
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess();
        }
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Authentication Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackAuth = () => {
    Alert.alert(
      'Alternative Authentication',
      'In a real app, this would show a PIN/password input screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Demo Login',
          onPress: () => {
            if (typeof onAuthSuccess === 'function') {
              onAuthSuccess();
            }
          },
        },
      ]
    );
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowAnimation.value,
  }));

  const getBiometricIcon = () => {
    if (biometricType.includes('Face')) return 'face';
    if (
      biometricType.includes('Touch') ||
      biometricType.includes('Fingerprint')
    )
      return 'fingerprint';
    return 'security';
  };

  if (isLoading) {
    return <LoadingState message="Authenticating..." fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons
          name="security"
          size={48}
          color={APP_THEME.accent}
          style={styles.headerIcon}
        />
        <ThemedText style={styles.title}>SecureVault</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your personal secure note storage
        </ThemedText>
      </View>

      {/* Main authentication area */}
      <View style={styles.authContainer}>
        <View style={styles.biometricContainer}>
          {/* Glow effect */}
          <Animated.View
            style={[styles.glowCircle, animatedGlowStyle]}
          />

          {/* Main biometric button */}
          <Animated.View style={animatedPulseStyle}>
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
              disabled={!biometricAvailable}
            >
              <MaterialIcons
                name={getBiometricIcon() as any}
                size={64}
                color={
                  biometricAvailable
                    ? APP_THEME.text.primary
                    : APP_THEME.text.disabled
                }
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <ThemedText style={styles.instructionText}>
          {biometricAvailable
            ? `Tap to authenticate with ${biometricType}`
            : 'Biometric authentication not available'}
        </ThemedText>

        {biometricAvailable && (
          <ThemedText style={styles.securityNote}>
            🔒 Your notes are protected with end-to-end encryption
          </ThemedText>
        )}
      </View>

      {/* Footer with fallback options */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.fallbackButton}
          onPress={handleFallbackAuth}
        >
          <MaterialIcons
            name="key"
            size={20}
            color={APP_THEME.accent}
          />
          <ThemedText style={styles.fallbackText}>
            Use Alternative Method
          </ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.versionText}>
          SecureVault v1.0.0
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: APP_THEME.background.secondary,
    opacity: 0.3,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  headerIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: APP_THEME.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  biometricContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: APP_THEME.accent,
    opacity: 0.1,
  },
  biometricButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: APP_THEME.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: APP_THEME.accent,
    elevation: 10,
    shadowColor: APP_THEME.accent,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  instructionText: {
    fontSize: 18,
    color: APP_THEME.text.primary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  securityNote: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_THEME.accent,
    marginBottom: 30,
    gap: 8,
  },
  fallbackText: {
    fontSize: 16,
    color: APP_THEME.accent,
  },
  versionText: {
    fontSize: 12,
    color: APP_THEME.text.disabled,
  },
});
