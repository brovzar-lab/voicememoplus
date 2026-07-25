import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Colors } from '../constants/colors';
import { IS_DEMO } from '../lib/demo';

const BAR_COUNT = 20;
const BAR_HEIGHTS = [6, 18, 32, 44, 28, 14, 36, 48, 20, 8, 40, 26, 12, 38, 22, 46, 16, 30, 10, 24];

function WaveformBar({ index, isRecording }: { index: number; isRecording: boolean }) {
  const height = useSharedValue(4);

  useEffect(() => {
    if (isRecording) {
      const target = BAR_HEIGHTS[index % BAR_HEIGHTS.length] ?? 12;
      const delay = index * 55;
      height.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(target, { duration: 380, easing: Easing.inOut(Easing.quad) }),
            withTiming(4, { duration: 380, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        ),
      );
    } else {
      cancelAnimation(height);
      height.value = withTiming(4, { duration: 200 });
    }
  }, [isRecording, index]);

  const animStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <Animated.View
      style={[
        styles.bar,
        animStyle,
        { opacity: isRecording ? 1 : 0.3 },
      ]}
    />
  );
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function RecordScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recordingRef = useRef<any>(null);
  const elapsedRef = useRef(0);

  // Demo auto-stop after 3s
  useEffect(() => {
    if (IS_DEMO && isRecording) {
      const timeout = setTimeout(() => {
        handleStop(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isRecording]);

  const startTimer = () => {
    elapsedRef.current = 0;
    setElapsed(0);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (IS_DEMO) {
      setIsRecording(true);
      startTimer();
      return;
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setIsRecording(true);
      startTimer();
    } catch {
      setPermissionDenied(true);
    }
  };

  const handleStop = useCallback(
    async (auto = false) => {
      if (!isRecording && !auto) return;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      stopTimer();
      setIsRecording(false);

      const duration = elapsedRef.current;

      if (IS_DEMO) {
        router.replace({
          pathname: '/processing',
          params: { duration: String(duration) },
        });
        return;
      }

      let uri: string | null = null;
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
          uri = recordingRef.current.getURI() ?? null;
        } catch {
          // ignore
        }
        recordingRef.current = null;
      }

      router.replace({
        pathname: '/processing',
        params: { audioUri: uri ?? '', duration: String(duration) },
      });
    },
    [isRecording, router],
  );

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopTimer();
    setIsRecording(false);
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // ignore
      }
      recordingRef.current = null;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancel}
          accessibilityLabel="Cancel recording"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        {IS_DEMO && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>DEMO</Text>
          </View>
        )}
      </View>

      <View style={styles.centerContent}>
        <Text style={styles.timerText}>{formatTimer(elapsed)}</Text>
        <Text style={styles.statusText}>
          {isRecording ? 'Recording…' : 'Ready to record'}
        </Text>

        <View style={styles.waveform}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <WaveformBar key={i} index={i} isRecording={isRecording} />
          ))}
        </View>

        {permissionDenied && (
          <Text style={styles.permissionError}>
            Microphone permission denied. Enable it in Settings.
          </Text>
        )}
      </View>

      <View style={styles.bottomSection}>
        {isRecording ? (
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={() => handleStop(false)}
            activeOpacity={0.8}
            accessibilityLabel="Stop recording"
          >
            <View style={styles.stopIcon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.micBtn, permissionDenied && styles.micBtnDisabled]}
            onPress={handleStart}
            activeOpacity={0.8}
            disabled={permissionDenied}
            accessibilityLabel="Start recording"
          >
            <Text style={styles.micIcon}>🎙</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hintText}>
          {isRecording
            ? IS_DEMO
              ? 'Demo mode — auto-stops in 3s'
              : 'Tap stop when done'
            : 'Tap to start recording'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  demoBadge: {
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  demoBadgeText: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 48,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 60,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryLight,
  },
  permissionError: {
    color: Colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 48,
    gap: 16,
  },
  micBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.recordRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.recordRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  micBtnDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0,
  },
  micIcon: {
    fontSize: 40,
  },
  stopBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.recordRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.recordRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  stopIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
