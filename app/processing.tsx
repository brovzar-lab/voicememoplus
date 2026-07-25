import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { IS_DEMO, DEMO_FRESH_RESULTS } from '../lib/demo';
import { useMemosStore } from '../store/useMemos';
import { transcribeAudio, analyzeTranscript } from '../lib/openai';
import type { VoiceMemo, ActionItem } from '../lib/types';

const STEPS = [
  'Transcribing audio…',
  'Extracting key points…',
  'Finding action items…',
  'Tagging topics…',
  'Finalizing…',
];

function PulseRing({ delay }: { delay: number }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(withTiming(2.4, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(0, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false),
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.pulseRing, style]} />;
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ audioUri?: string; duration?: string }>();
  const addMemo = useMemosStore((s) => s.addMemo);
  const updateMemo = useMemosStore((s) => s.updateMemo);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const memoIdRef = useRef<string>(generateId());

  useEffect(() => {
    let stepTimer: ReturnType<typeof setInterval>;

    if (IS_DEMO) {
      stepTimer = setInterval(() => {
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
      }, 500);

      const timeout = setTimeout(() => {
        clearInterval(stepTimer);
        const pick = DEMO_FRESH_RESULTS[Math.floor(Math.random() * DEMO_FRESH_RESULTS.length)];
        if (!pick) return;
        const newId = memoIdRef.current;
        const memo: VoiceMemo = {
          ...pick,
          id: newId,
          createdAt: new Date().toISOString(),
          actionItems: pick.actionItems.map((a, i) => ({
            ...a,
            id: `${newId}-ai-${i}`,
            completed: false,
          })),
        };
        addMemo(memo);
        router.replace(`/results/${newId}`);
      }, 2600);

      return () => {
        clearInterval(stepTimer);
        clearTimeout(timeout);
      };
    }

    // Real mode
    const duration = parseInt(params.duration ?? '0', 10);
    const audioUri = params.audioUri ?? '';
    const newId = memoIdRef.current;

    const stub: VoiceMemo = {
      id: newId,
      title: 'New voice memo',
      duration,
      audioUri,
      createdAt: new Date().toISOString(),
      status: 'processing',
      transcript: null,
      keyPoints: [],
      actionItems: [],
      tags: [],
    };
    addMemo(stub);

    stepTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 1400);

    async function processAudio() {
      try {
        setStep(0);
        const transcript = await transcribeAudio(audioUri);

        setStep(1);
        const analysis = await analyzeTranscript(transcript);

        setStep(4);
        const actionItems: ActionItem[] = (analysis.actionItems ?? []).map((a, i) => ({
          id: `${newId}-ai-${i}`,
          text: a.text,
          dueDate: a.dueDate ?? null,
          completed: false,
        }));

        updateMemo(newId, {
          title: analysis.title ?? 'Voice memo',
          transcript,
          keyPoints: analysis.keyPoints ?? [],
          actionItems,
          tags: analysis.tags ?? [],
          status: 'done',
        });

        clearInterval(stepTimer);
        router.replace(`/results/${newId}`);
      } catch (err) {
        clearInterval(stepTimer);
        const msg = err instanceof Error ? err.message : 'Processing failed';
        setError(msg);
        updateMemo(newId, { status: 'error' });
      }
    }

    processAudio();
    return () => clearInterval(stepTimer);
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <Text
          style={styles.errorBack}
          onPress={() => router.replace('/')}
        >
          Go back home
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pulseContainer}>
        <PulseRing delay={0} />
        <PulseRing delay={533} />
        <PulseRing delay={1066} />
        <View style={styles.centerOrb}>
          <Text style={styles.orbIcon}>✨</Text>
        </View>
      </View>

      <Text style={styles.title}>AI Analysis</Text>
      <Text style={styles.stepText}>{STEPS[step] ?? STEPS[0]}</Text>

      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i <= step && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  pulseContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  centerOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 16,
  },
  orbIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  stepText: {
    fontSize: 15,
    color: Colors.textSecondary,
    minHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  errorMsg: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  errorBack: {
    fontSize: 15,
    color: Colors.primaryLight,
    fontWeight: '600',
    marginTop: 8,
  },
});
