import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  message: string;
  type?: 'success' | 'error';
  duration?: number; // ms
  onHide?: () => void;
  dark?: boolean;
};

export default function Feedback({ visible, message, type = 'success', duration = 3000, onHide, dark = false }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    if (visible) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(duration),
        Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        if (mounted && onHide) onHide();
      });
    }
    return () => {
      mounted = false;
    };
  }, [visible, anim, duration, onHide]);

  if (!visible) return null;

  const bgStyle = type === 'success' ? styles.success : styles.error;
  const bgDark = type === 'success' ? styles.successDark : styles.errorDark;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        dark ? bgDark : bgStyle,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] },
      ]}
    >
      <Text style={[styles.text, dark && styles.textDark]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 34,
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  text: { color: '#07203b', fontWeight: '700', fontSize: 16 },
  textDark: { color: '#eaf6ff' },
  success: { backgroundColor: '#d1fae5' },
  error: { backgroundColor: '#fee2e2' },
  successDark: { backgroundColor: '#07351f' },
  errorDark: { backgroundColor: '#3b0f0f' },
});
