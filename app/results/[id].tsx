import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { IS_DEMO } from '../../lib/demo';
import { useMemosStore } from '../../store/useMemos';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDueDate(due: string | null): string {
  if (!due) return '';
  const d = new Date(due);
  const today = new Date();
  const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`;
  return `Due in ${diffDays}d`;
}

function dueDateColor(due: string | null): string {
  if (!due) return Colors.textMuted;
  const diffDays = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
  if (diffDays < 0) return Colors.danger;
  if (diffDays <= 1) return Colors.warning;
  return Colors.accent;
}

export default function ResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const getMemo = useMemosStore((s) => s.getMemo);
  const toggleActionItem = useMemosStore((s) => s.toggleActionItem);
  const memo = getMemo(id ?? '');

  const handleToggle = useCallback(
    async (itemId: string) => {
      if (IS_DEMO) {
        Toast.show({
          type: 'info',
          text1: 'Demo mode',
          text2: 'Changes are not saved in demo mode.',
          visibilityTime: 2000,
        });
        return;
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleActionItem(id ?? '', itemId);
    },
    [id, toggleActionItem],
  );

  if (!memo) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Memo not found</Text>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.backLink}>Go home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = memo.actionItems.filter((a) => a.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.replace('/')}
          accessibilityLabel="Done, go back to home"
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
        {IS_DEMO && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>DEMO</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Meta */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{memo.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>🎙 {formatDuration(memo.duration)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{formatDate(memo.createdAt)}</Text>
          </View>
        </View>

        {/* Tags */}
        {memo.tags.length > 0 && (
          <View style={styles.tagRow}>
            {memo.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Key Points */}
        {memo.keyPoints.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>✨ Key Points</Text>
            {memo.keyPoints.map((point, i) => (
              <View key={i} style={styles.keyPointRow}>
                <View style={styles.keyPointBullet} />
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Items */}
        {memo.actionItems.length > 0 && (
          <View style={styles.card}>
            <View style={styles.actionHeader}>
              <Text style={styles.sectionTitle}>✅ Action Items</Text>
              <Text style={styles.actionCount}>
                {completedCount}/{memo.actionItems.length}
              </Text>
            </View>
            {memo.actionItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.actionRow,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => handleToggle(item.id)}
                accessibilityLabel={item.text}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.completed }}
              >
                <View style={[styles.checkbox, item.completed && styles.checkboxDone]}>
                  {item.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[styles.actionText, item.completed && styles.actionTextDone]}
                    numberOfLines={2}
                  >
                    {item.text}
                  </Text>
                  {item.dueDate && (
                    <Text style={[styles.dueDateText, { color: dueDateColor(item.dueDate) }]}>
                      {formatDueDate(item.dueDate)}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Transcript */}
        {memo.transcript && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📝 Transcript</Text>
            <Text style={styles.transcriptText}>{memo.transcript}</Text>
          </View>
        )}

        {IS_DEMO && (
          <View style={styles.demoNote}>
            <Text style={styles.demoNoteText}>
              Demo mode — add your OpenAI API key to record and analyze real voice memos.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  doneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  doneBtnText: {
    color: Colors.primaryLight,
    fontSize: 17,
    fontWeight: '600',
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 16,
  },
  titleSection: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  metaDot: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  keyPointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
    marginTop: 7,
    flexShrink: 0,
  },
  keyPointText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCount: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  actionContent: {
    flex: 1,
    gap: 3,
  },
  actionText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 21,
  },
  actionTextDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transcriptText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  demoNote: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoNoteText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 15,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
});
