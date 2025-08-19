import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export class BiometricService {
  static async checkBiometricSupport(): Promise<boolean> {
    try {
      const hasHardware =
        await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return false;
    }
  }

  static async getSupportedBiometrics(): Promise<
    LocalAuthentication.AuthenticationType[]
  > {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported biometrics:', error);
      return [];
    }
  }

  static async authenticateAsync(
    promptMessage: string = 'Authenticate to continue',
    fallbackLabel: string = 'Use Passcode'
  ): Promise<BiometricAuthResult> {
    try {
      const isSupported = await this.checkBiometricSupport();

      if (!isSupported) {
        return {
          success: false,
          error:
            'Biometric authentication is not available on this device',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel,
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Authentication error: ${error}`,
      };
    }
  }

  static async authenticateWithFallback(
    promptMessage: string = 'Authenticate to continue'
  ): Promise<BiometricAuthResult> {
    const biometricResult = await this.authenticateAsync(
      promptMessage
    );

    if (!biometricResult.success) {
      Alert.alert(
        'Authentication Failed',
        'Biometric authentication is required for this action.',
        [{ text: 'OK' }]
      );
    }

    return biometricResult;
  }

  static getBiometricTypeText(
    types: LocalAuthentication.AuthenticationType[]
  ): string {
    if (
      types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      )
    ) {
      return 'Face ID';
    } else if (
      types.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT
      )
    ) {
      return 'Touch ID';
    } else if (
      types.includes(LocalAuthentication.AuthenticationType.IRIS)
    ) {
      return 'Iris Recognition';
    }
    return 'Biometric Authentication';
  }
}
