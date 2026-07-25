import type { ActionItem } from './types';

const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export async function transcribeAudio(audioUri: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Whisper error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text;
}

interface AnalysisResult {
  title: string;
  keyPoints: string[];
  actionItems: Omit<ActionItem, 'id' | 'completed'>[];
  tags: string[];
}

const ANALYSIS_PROMPT = `You analyze voice memo transcripts and extract structured output. Return ONLY valid JSON with these exact fields:
{
  "title": "Short descriptive title (4-6 words max)",
  "keyPoints": ["3-5 concise bullet point strings"],
  "actionItems": [{"text": "Action text", "dueDate": "YYYY-MM-DD or null"}],
  "tags": ["2-5 lowercase single-word or hyphenated tags"]
}
Be concise. Action items should be specific and actionable. Tags should be broad topic categories.`;

export async function analyzeTranscript(transcript: string): Promise<AnalysisResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: ANALYSIS_PROMPT },
        { role: 'user', content: `Transcript:\n\n${transcript}` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GPT-4o error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    choices: [{ message: { content: string } }];
  };

  return JSON.parse(data.choices[0].message.content) as AnalysisResult;
}
