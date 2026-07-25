import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { IS_DEMO } from '../lib/demo';
import { useMemosStore } from '../store/useMemos';
import type { VoiceMemo } from '../lib/types';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  return 'Just now';
}

function MemoCard({ memo, onPress, onDelete }: { memo: VoiceMemo; onPress: () => void; onDelete: () => void }) {
  const completedCount = memo.actionItems.filter((a) => a.completed).length;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={onPress}
      onLongPress={onDelete}
      accessibilityLabel={`Voice memo: ${memo.title}`}
      accessibilityHint="Tap to view. Long press to delete."
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {memo.title}
        </Text>
        <Text style={styles.cardTime}>{timeAgo(memo.createdAt)}</Text>
      </View>

      <Text style={styles.cardTranscript} numberOfLines={2}>
        {memo.transcript ?? 'Processing…'}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>🎙 {formatDuration(memo.duration)}</Text>
          {memo.actionItems.length > 0 && (
            <Text style={styles.metaText}>
              ✅ {completedCount}/{memo.actionItems.length} tasks
            </Text>
          )}
        </View>
        <View style={styles.tagRow}>
          {memo.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎙</Text>
      <Text style={styles.emptyTitle}>No voice memos yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the button below to record your first memo. AI will transcribe and organize it for you.
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const memos = useMemosStore((s) => s.memos);
  const deleteMemo = useMemosStore((s) => s.deleteMemo);

  const handleDelete = useCallback(
    (id: string, title: string) => {
      if (IS_DEMO) return;
      Alert.alert('Delete memo?', `"${title}" will be permanently deleted.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMemo(id) },
      ]);
    },
    [deleteMemo],
  );

  const handleRecord = useCallback(() => {
    router.push('/record');
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>VoiceMemo+</Text>
          <Text style={styles.headerSubtitle}>AI-powered voice notes</Text>
        </View>
        {IS_DEMO && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>DEMO</Text>
          </View>
        )}
      </View>

      <FlatList
        data={memos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemoCard
            memo={item}
            onPress={() => router.push(`/results/${item.id}`)}
            onDelete={() => handleDelete(item.id, item.title)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={[styles.list, memos.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleRecord}
          activeOpacity={0.85}
          accessibilityLabel="Record new voice memo"
          accessibilityRole="button"
        >
          <Text style={styles.fabIcon}>🎙</Text>
          <Text style={styles.fabText}>New Memo</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  cardTranscript: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 20,
  },
  fabText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
