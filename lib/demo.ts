import type { VoiceMemo } from './types';

export const IS_DEMO =
  !process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  process.env.EXPO_PUBLIC_OPENAI_API_KEY === 'your-api-key-here';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const DEMO_MEMOS: VoiceMemo[] = [
  {
    id: 'demo-001',
    title: 'Monday standup recap',
    duration: 142,
    audioUri: null,
    createdAt: daysAgo(0),
    status: 'done',
    transcript:
      "Okay so quick standup recap. The Q3 launch has been pushed to August 12th — Sarah confirmed this with the stakeholders. The mobile team is currently blocked on API rate limits from the third-party data provider, Marcus is investigating alternatives including a caching layer. Design needs to do a review of the onboarding flow by end of week, the latest prototype is in Figma. Sarah is leading a new user research sprint starting Thursday, she wants three founders in the first round of interviews. Budget approval for the cloud infra upgrade is still pending legal review.",
    keyPoints: [
      'Q3 launch moved to August 12th — stakeholder confirmed',
      'Mobile team blocked on third-party API rate limits',
      'Design review of onboarding flow needed by end of week',
      'Sarah leading user research sprint starting Thursday',
      'Cloud infra budget approval still pending legal',
    ],
    actionItems: [
      { id: 'ai-001-1', text: 'Schedule design review for onboarding flow', dueDate: '2026-07-28', completed: false },
      { id: 'ai-001-2', text: 'Investigate API rate limit caching alternatives', dueDate: '2026-07-26', completed: true },
      { id: 'ai-001-3', text: 'Follow up with Sarah on research interview slots', dueDate: '2026-07-29', completed: false },
    ],
    tags: ['meeting', 'product', 'planning', 'Q3'],
  },
  {
    id: 'demo-002',
    title: 'Grocery and meal prep thoughts',
    duration: 67,
    audioUri: null,
    createdAt: daysAgo(1),
    status: 'done',
    transcript:
      "Need to do grocery run today. Definitely need salmon — two pounds — and a bunch of vegetables for the weekly meal prep. Broccoli, asparagus, maybe some sweet potatoes. I want to try that pasta recipe I saved, the one with the walnut pesto. I'm out of olive oil, garlic, and I think we're low on quinoa. Oh and oat milk. Also should consider doing Sunday meal prep sessions more consistently, it saves so much time during the week.",
    keyPoints: [
      'Salmon (2 lbs) and vegetables for weekly meal prep',
      'Try saved walnut pesto pasta recipe this weekend',
      'Pantry staples running low: olive oil, garlic, quinoa, oat milk',
      'Commit to Sunday meal prep routine for weekly time savings',
    ],
    actionItems: [
      { id: 'ai-002-1', text: 'Buy salmon, broccoli, asparagus, sweet potatoes', dueDate: null, completed: false },
      { id: 'ai-002-2', text: 'Restock: olive oil, garlic, quinoa, oat milk', dueDate: null, completed: false },
      { id: 'ai-002-3', text: 'Find and save walnut pesto pasta recipe', dueDate: null, completed: true },
    ],
    tags: ['shopping', 'food', 'health', 'routine'],
  },
  {
    id: 'demo-003',
    title: 'App idea: FitRoute',
    duration: 215,
    audioUri: null,
    createdAt: daysAgo(3),
    status: 'done',
    transcript:
      "So I had this idea for a fitness app called FitRoute. The core concept is GPS route tracking but with really detailed elevation data overlaid on a beautiful map view. The social angle is letting people share their favorite workout routes with friends or publicly. You could rate routes by difficulty, scenery, safety. Integration with Apple Health and Apple Watch would be huge — pull in heart rate data, calories, everything. Monetization could be through premium route packs — like curated scenic routes in different cities, maybe from local experts or influencers. The main competitor is Komoot, but that's mostly cyclists. There's a gap for runners and hikers. I should sketch wireframes before the idea gets cold.",
    keyPoints: [
      'GPS route tracking with detailed elevation visualization',
      'Social route sharing with difficulty, scenery, and safety ratings',
      'Apple Health and Apple Watch integration for biometrics',
      'Monetize through premium curated route packs by city',
      'Target gap: runners and hikers underserved vs Komoot (cyclists)',
    ],
    actionItems: [
      { id: 'ai-003-1', text: 'Sketch wireframes for map and route detail screens', dueDate: '2026-07-28', completed: false },
      { id: 'ai-003-2', text: 'Research Komoot and other competitors', dueDate: '2026-07-30', completed: false },
      { id: 'ai-003-3', text: 'Check HealthKit permissions and entitlements', dueDate: '2026-07-26', completed: false },
    ],
    tags: ['idea', 'fitness', 'app', 'startup', 'iOS'],
  },
];

export const DEMO_FRESH_RESULTS: Omit<VoiceMemo, 'id' | 'createdAt'>[] = [
  {
    title: 'Team sync recap',
    duration: 118,
    audioUri: null,
    status: 'done',
    transcript:
      "Just finished the team sync. Main updates: design is almost done with the new component library, expect handoff by Wednesday. Engineering estimated two weeks to integrate. Marketing wants a blog post ready to coincide with launch. Need to loop in legal on the updated terms of service before we ship.",
    keyPoints: [
      'Design component library handoff expected Wednesday',
      'Engineering estimates 2 weeks for integration',
      'Marketing needs a blog post ready at launch',
      'Legal review required for updated terms of service',
    ],
    actionItems: [
      { id: 'new-1', text: 'Confirm design handoff date with designer', dueDate: '2026-07-27', completed: false },
      { id: 'new-2', text: 'Brief marketing on launch timeline', dueDate: '2026-07-28', completed: false },
      { id: 'new-3', text: 'Schedule legal review for updated ToS', dueDate: '2026-07-26', completed: false },
    ],
    tags: ['meeting', 'product', 'launch'],
  },
  {
    title: 'Weekend project ideas',
    duration: 89,
    audioUri: null,
    status: 'done',
    transcript:
      "Thinking about what to build this weekend. Maybe a small CLI tool for batch-renaming files based on metadata. Or I could finally set up the home server with Plex and Jellyfin. The other idea is to start reading that book on system design — been on my list for months. Should also call mom on Sunday.",
    keyPoints: [
      'CLI tool idea: batch file renaming from metadata',
      'Home server setup with Plex and Jellyfin media',
      'Start reading system design book',
      'Personal: call mom on Sunday',
    ],
    actionItems: [
      { id: 'new-4', text: 'Spec out CLI file renamer tool', dueDate: null, completed: false },
      { id: 'new-5', text: 'Buy Raspberry Pi if doing home server', dueDate: null, completed: false },
      { id: 'new-6', text: 'Call mom on Sunday', dueDate: '2026-07-27', completed: false },
    ],
    tags: ['ideas', 'personal', 'tech', 'weekend'],
  },
];
