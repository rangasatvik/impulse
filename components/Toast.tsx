import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../lib/theme';

type ToastKind = 'info' | 'success' | 'error';
interface ToastState {
  message: string;
  kind: ToastKind;
}

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});
const useNativeDriver = Platform.OS !== 'web';
const toastShadow =
  Platform.OS === 'web'
    ? ({ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' } as any)
    : {
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      };

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      setToast({ message, kind });
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver }).start(() =>
          setToast(null)
        );
      }, 2600);
    },
    [opacity]
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const icon =
    toast?.kind === 'success' ? 'checkmark-circle' : toast?.kind === 'error' ? 'alert-circle' : 'information-circle';
  const accent =
    toast?.kind === 'success' ? colors.success : toast?.kind === 'error' ? colors.error : colors.primaryLight;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <Animated.View style={[styles.wrap, { opacity }]}>
          <View style={[styles.toast, { borderColor: accent + '66' }]}>
            <Ionicons name={icon as any} size={20} color={accent} />
            <Text style={styles.text}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: 360,
    gap: 10,
    ...toastShadow,
  },
  text: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', flexShrink: 1 },
});
