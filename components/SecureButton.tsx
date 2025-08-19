import { ThemedText } from '@/components/ThemedText';
import { APP_THEME } from '@/constants/Types';
import { BiometricService } from '@/services/BiometricService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

interface SecureButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  style?: any;
  textStyle?: any;
  icon?: string;
  iconColor?: string;
  requireBiometric?: boolean;
  biometricPrompt?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function SecureButton({
  title,
  onPress,
  style,
  textStyle,
  icon,
  iconColor,
  requireBiometric = false,
  biometricPrompt = 'Authenticate to continue',
  disabled = false,
  loading = false,
  variant = 'primary',
}: SecureButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getButtonStyle = () => {
    const baseStyle = [styles.button];

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
    }

    if (disabled || loading || isProcessing) {
      baseStyle.push(styles.disabledButton);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButtonText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButtonText);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButtonText);
        break;
    }

    if (disabled || loading || isProcessing) {
      baseStyle.push(styles.disabledButtonText);
    }

    return baseStyle;
  };

  const handlePress = async () => {
    if (disabled || loading || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      if (requireBiometric) {
        const authResult =
          await BiometricService.authenticateWithFallback(
            biometricPrompt
          );

        if (!authResult.success) {
          return;
        }
      }

      await onPress();
    } catch (error) {
      console.error('SecureButton error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = loading || isProcessing;
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'secondary'
              ? APP_THEME.accent
              : APP_THEME.text.primary
          }
        />
      ) : (
        <>
          {icon && (
            <MaterialIcons
              name={icon as any}
              size={20}
              color={
                iconColor ||
                (variant === 'secondary'
                  ? APP_THEME.accent
                  : APP_THEME.text.primary)
              }
              style={styles.icon}
            />
          )}
          <ThemedText style={[...getTextStyle(), textStyle]}>
            {title}
          </ThemedText>
          {requireBiometric && (
            <MaterialIcons
              name="security"
              size={16}
              color={
                variant === 'secondary'
                  ? APP_THEME.warning
                  : APP_THEME.text.primary
              }
              style={styles.securityIcon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minHeight: 48,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: APP_THEME.accent,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: APP_THEME.accent,
  },
  dangerButton: {
    backgroundColor: APP_THEME.error,
  },
  disabledButton: {
    backgroundColor: APP_THEME.text.disabled,
    borderColor: APP_THEME.text.disabled,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: APP_THEME.text.primary,
  },
  secondaryButtonText: {
    color: APP_THEME.accent,
  },
  dangerButtonText: {
    color: APP_THEME.text.primary,
  },
  disabledButtonText: {
    color: APP_THEME.text.secondary,
  },
  icon: {
    marginRight: 4,
  },
  securityIcon: {
    marginLeft: 4,
    opacity: 0.8,
  },
});
