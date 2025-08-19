import React from 'react';

import { APP_THEME } from '@/constants/Types';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { LoadingState } from '@/components/LoadingState';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BiometricService } from '@/services/BiometricService';
import { StorageService } from '@/services/StorageService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isAuthenticated, setIsAuthenticated] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      const wasAuthenticated =
        await StorageService.isUserAuthenticated();

      if (wasAuthenticated) {
        const biometricResult =
          await BiometricService.authenticateAsync(
            'Welcome back! Please authenticate to access your secure notes.',
            'Use Passcode'
          );

        if (biometricResult.success) {
          setIsAuthenticated(true);
        } else {
          await StorageService.setUserAuthenticated(false);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    await StorageService.setUserAuthenticated(true);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await StorageService.setUserAuthenticated(false);
    setIsAuthenticated(false);
  };

  if (!loaded || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: APP_THEME.background.primary,
        }}
      >
        <LoadingState
          message="Initializing SecureVault..."
          fullScreen
        />
      </View>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="notes/add"
              options={{
                title: 'Add Note',
                headerShown: true,
                headerStyle: {
                  backgroundColor: APP_THEME.background.primary,
                },
                headerTintColor: APP_THEME.text.primary,
              }}
            />
            <Stack.Screen
              name="notes/[id]"
              options={{
                title: 'Note Details',
                headerShown: true,
                headerStyle: {
                  backgroundColor: APP_THEME.background.primary,
                },
                headerTintColor: APP_THEME.text.primary,
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="auth/login"
            options={{ headerShown: false }}
            initialParams={{ onAuthSuccess: handleAuthSuccess }}
          />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar
        style="light"
        backgroundColor={APP_THEME.background.primary}
      />
    </ThemeProvider>
  );
}
