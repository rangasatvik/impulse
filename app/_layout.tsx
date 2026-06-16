import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PulseLogo } from '../components/aurora';
import { ToastProvider } from '../components/Toast';
import { colors, gradients, radius, spacing } from '../lib/theme';
import { useStore } from '../stores/appStore';

export default function RootLayout() {
  const hydrated = useStore((s) => s.hydrated);

  // Resolve hydration via the official persist API plus a hard timeout fallback,
  // so the app can never get stuck on the loading view if a rehydrate callback
  // doesn't fire (which can happen on web).
  useEffect(() => {
    const finish = () => {
      const st = useStore.getState();
      if (!st.hydrated) st.setHydrated(true);
      try {
        st.ensureSeeded();
      } catch {
        useStore.persist.clearStorage();
      }
    };
    if (useStore.persist.hasHydrated()) finish();
    const unsub = useStore.persist.onFinishHydration(finish);
    const fallback = setTimeout(finish, 1500);
    return () => {
      unsub?.();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="light" />
          {!hydrated ? (
            <LinearGradient
              colors={gradients.hero}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}
            >
              <View
                style={{
                  position: 'absolute',
                  width: 280,
                  height: 280,
                  borderRadius: 140,
                  backgroundColor: colors.blush + '24',
                  top: 110,
                  right: -120,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  backgroundColor: colors.ai + '24',
                  bottom: 90,
                  left: -100,
                }}
              />
              <PulseLogo size={92} />
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: spacing.lg, textAlign: 'center' }}>
                Every connection starts with an Impulse.
              </Text>
              <Text style={{ color: colors.blush, fontSize: 15, lineHeight: 22, marginTop: spacing.sm, textAlign: 'center' }}>
                Your AI social agent is waking up...
              </Text>
              <View
                style={{
                  width: 170,
                  height: 6,
                  borderRadius: radius.pill,
                  backgroundColor: '#FFFFFF30',
                  marginTop: spacing.xl,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient colors={gradients.brandSoft} style={{ width: '72%', height: 6 }} />
              </View>
            </LinearGradient>
          ) : (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="match/[id]" />
              <Stack.Screen name="agent/my-agent" />
              <Stack.Screen name="agent/training" />
              <Stack.Screen name="agent/conversation/[id]" />
              <Stack.Screen name="profile/[id]" />
              <Stack.Screen name="premium/index" />
              <Stack.Screen name="modal/mood-check" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="modal/copilot" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            </Stack>
          )}
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
