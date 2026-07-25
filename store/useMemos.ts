import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VoiceMemo, ActionItem } from '../lib/types';
import { IS_DEMO, DEMO_MEMOS } from '../lib/demo';

interface MemosState {
  memos: VoiceMemo[];
  addMemo: (memo: VoiceMemo) => void;
  updateMemo: (id: string, updates: Partial<VoiceMemo>) => void;
  deleteMemo: (id: string) => void;
  toggleActionItem: (memoId: string, itemId: string) => void;
  getMemo: (id: string) => VoiceMemo | undefined;
}

export const useMemosStore = create<MemosState>()(
  IS_DEMO
    ? (set, get) => ({
        memos: DEMO_MEMOS,
        addMemo: (memo) => set((s) => ({ memos: [memo, ...s.memos] })),
        updateMemo: (id, updates) =>
          set((s) => ({ memos: s.memos.map((m) => (m.id === id ? { ...m, ...updates } : m)) })),
        deleteMemo: (id) => set((s) => ({ memos: s.memos.filter((m) => m.id !== id) })),
        toggleActionItem: (memoId, itemId) =>
          set((s) => ({
            memos: s.memos.map((m) =>
              m.id === memoId
                ? {
                    ...m,
                    actionItems: m.actionItems.map((a) =>
                      a.id === itemId ? { ...a, completed: !a.completed } : a,
                    ),
                  }
                : m,
            ),
          })),
        getMemo: (id) => get().memos.find((m) => m.id === id),
      })
    : persist(
        (set, get) => ({
          memos: [],
          addMemo: (memo) => set((s) => ({ memos: [memo, ...s.memos] })),
          updateMemo: (id, updates) =>
            set((s) => ({ memos: s.memos.map((m) => (m.id === id ? { ...m, ...updates } : m)) })),
          deleteMemo: (id) => set((s) => ({ memos: s.memos.filter((m) => m.id !== id) })),
          toggleActionItem: (memoId, itemId) =>
            set((s) => ({
              memos: s.memos.map((m) =>
                m.id === memoId
                  ? {
                      ...m,
                      actionItems: m.actionItems.map((a) =>
                        a.id === itemId ? { ...a, completed: !a.completed } : a,
                      ),
                    }
                  : m,
              ),
            })),
          getMemo: (id) => get().memos.find((m) => m.id === id),
        }),
        {
          name: 'voicememoplus-memos',
          storage: createJSONStorage(() => AsyncStorage),
        },
      ),
);
