export interface ActionItem {
  id: string;
  text: string;
  dueDate: string | null;
  completed: boolean;
}

export interface VoiceMemo {
  id: string;
  title: string;
  duration: number;
  audioUri: string | null;
  createdAt: string;
  status: 'processing' | 'done' | 'error';
  transcript: string | null;
  keyPoints: string[];
  actionItems: ActionItem[];
  tags: string[];
}
