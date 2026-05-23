import type { Quest, QuestCategory, QuestTemplate, Skill, Stats } from '../types';

export function categoryToStat(cat: QuestCategory): 'str' | 'int' | 'per' | null {
  switch (cat) {
    case 'body': return 'str';
    case 'skill': case 'work': case 'mind': return 'int';
    case 'ritual': return 'per';
    case 'recovery': return null;
  }
}

export const TITLES: Record<number, string> = {
  0: 'The Awakened',   1: 'The Grinder',     2: 'Iron Willed',
  3: 'Shadow Walker',  4: 'Rank B Hunter',   5: 'Rank A Hunter',
  6: 'Rank S Hunter',  7: 'Monarch Aspirant', 8: 'The Feared',
  9: 'Shadow Monarch',
};

export const SKILL_XP_PER_LEVEL = 50;

export const BASE_STATS: Stats = { str: 0, int: 0, per: 0, hp: 0, mp: 0 };

export const SKILL_CATEGORY: Record<string, QuestCategory> = {
  'Strength Training': 'body',    'Running': 'body',         'Martial Arts': 'body',
  'Yoga': 'recovery',             'Programming': 'skill',    'Deep Work': 'work',
  'Public Speaking': 'work',      'Writing': 'skill',        'Speed Reading': 'mind',
  'Investing': 'mind',            'Meditation': 'ritual',    'Nutrition': 'recovery',
  'Cold Exposure': 'recovery',    'Journaling': 'ritual',    'Chess': 'mind',
  'Language Learning': 'skill',   'Drawing': 'skill',        'Music': 'skill',
  'Sales': 'work',                'Entrepreneurship': 'work', 'Data Analysis': 'mind',
  'Negotiation': 'work',          'Photography': 'skill',    'Sleep Mastery': 'recovery',
  'Consistency': 'ritual',        'Inner Peace': 'ritual',   'Will Power': 'ritual',
};

export const SKILL_POOL: string[] = [
  'Strength Training', 'Running',        'Martial Arts',    'Yoga',
  'Programming',       'Deep Work',      'Public Speaking', 'Writing',
  'Speed Reading',     'Investing',      'Meditation',      'Nutrition',
  'Cold Exposure',     'Journaling',     'Chess',           'Language Learning',
  'Drawing',           'Music',          'Sales',           'Entrepreneurship',
  'Data Analysis',     'Negotiation',    'Photography',     'Sleep Mastery',
  'Consistency',       'Inner Peace',    'Will Power',
];

export const canonicalQuests: Quest[] = [
  { id: 'q1', label: 'Wake Up — No Phone', category: 'ritual',   skill: 'Consistency',      xpReward: 10, completedToday: false, stat: 'per' },
  { id: 'q2', label: 'Meditate',           category: 'ritual',   skill: 'Inner Peace',      xpReward: 15, completedToday: false, stat: 'per' },
  { id: 'q3', label: 'Exercise',           category: 'body',     skill: 'Strength Training',xpReward: 30, completedToday: false, stat: 'str' },
  { id: 'q4', label: 'Cold Shower',        category: 'ritual',   skill: 'Will Power',       xpReward: 10, completedToday: false, stat: 'per' },
  { id: 'q5', label: 'Wind Down',          category: 'ritual',   skill: 'Sleep Mastery',    xpReward: 10, completedToday: false, stat: 'per' },
  { id: 'q6', label: 'Sleep',              category: 'recovery', skill: 'Sleep Mastery',    xpReward: 15, completedToday: false, stat: null  },
];

export const QUEST_TEMPLATES: Record<string, QuestTemplate[]> = {
  'Strength Training': [
    { label: 'Morning Lift Session',      category: 'body',     skill: 'Strength Training', xpReward: 35 },
    { label: 'Bodyweight Circuit',        category: 'body',     skill: 'Strength Training', xpReward: 20 },
    { label: 'Mobility & Cooldown',       category: 'body',     skill: 'Strength Training', xpReward: 10 },
  ],
  'Running': [
    { label: 'Long Distance Run',         category: 'body',     skill: 'Running',           xpReward: 35 },
    { label: 'Tempo Run — 20 min',        category: 'body',     skill: 'Running',           xpReward: 20 },
    { label: 'Zone 2 Jog',                category: 'body',     skill: 'Running',           xpReward: 10 },
  ],
  'Martial Arts': [
    { label: 'Sparring Session',          category: 'body',     skill: 'Martial Arts',      xpReward: 35 },
    { label: 'Technique Drills',          category: 'body',     skill: 'Martial Arts',      xpReward: 20 },
    { label: 'Shadow Work — 10 min',      category: 'body',     skill: 'Martial Arts',      xpReward: 10 },
  ],
  'Yoga': [
    { label: 'Full Flow — 45 min',        category: 'recovery', skill: 'Yoga',              xpReward: 35 },
    { label: 'Evening Stretch',           category: 'recovery', skill: 'Yoga',              xpReward: 20 },
    { label: 'Breath & Posture',          category: 'recovery', skill: 'Yoga',              xpReward: 10 },
  ],
  'Programming': [
    { label: 'Ship a Feature',            category: 'skill',    skill: 'Programming',       xpReward: 35 },
    { label: 'Coding Practice — 30 min',  category: 'skill',    skill: 'Programming',       xpReward: 20 },
    { label: 'Read Documentation',        category: 'skill',    skill: 'Programming',       xpReward: 10 },
  ],
  'Deep Work': [
    { label: 'Deep Work — 90 min',        category: 'work',     skill: 'Deep Work',         xpReward: 35 },
    { label: 'Focus Block — 45 min',      category: 'work',     skill: 'Deep Work',         xpReward: 20 },
    { label: 'Plan the Day',              category: 'work',     skill: 'Deep Work',         xpReward: 10 },
  ],
  'Public Speaking': [
    { label: 'Deliver a Talk or Pitch',   category: 'work',     skill: 'Public Speaking',   xpReward: 35 },
    { label: 'Record & Review Yourself',  category: 'work',     skill: 'Public Speaking',   xpReward: 20 },
    { label: 'Vocal Warm-Up',             category: 'work',     skill: 'Public Speaking',   xpReward: 10 },
  ],
  'Writing': [
    { label: 'Publish a Piece',           category: 'skill',    skill: 'Writing',           xpReward: 35 },
    { label: 'Write 500 Words',           category: 'skill',    skill: 'Writing',           xpReward: 20 },
    { label: 'Morning Pages',             category: 'skill',    skill: 'Writing',           xpReward: 10 },
  ],
  'Speed Reading': [
    { label: 'Read a Full Chapter',       category: 'mind',     skill: 'Speed Reading',     xpReward: 35 },
    { label: 'Read 20 Pages',             category: 'mind',     skill: 'Speed Reading',     xpReward: 20 },
    { label: 'Read 10 Minutes',           category: 'mind',     skill: 'Speed Reading',     xpReward: 10 },
  ],
  'Investing': [
    { label: 'Portfolio Review & Rebalance', category: 'mind',  skill: 'Investing',         xpReward: 35 },
    { label: 'Market Research — 20 min',  category: 'mind',     skill: 'Investing',         xpReward: 20 },
    { label: 'Track Expenses',            category: 'mind',     skill: 'Investing',         xpReward: 10 },
  ],
  'Meditation': [
    { label: 'Meditate 30 min',           category: 'ritual',   skill: 'Meditation',        xpReward: 35 },
    { label: 'Meditate 15 min',           category: 'ritual',   skill: 'Meditation',        xpReward: 20 },
    { label: 'Box Breathing — 5 min',     category: 'ritual',   skill: 'Meditation',        xpReward: 10 },
  ],
  'Nutrition': [
    { label: 'Cook a Clean Meal',         category: 'recovery', skill: 'Nutrition',         xpReward: 35 },
    { label: 'Hit Protein Target',        category: 'recovery', skill: 'Nutrition',         xpReward: 20 },
    { label: 'Drink 3L Water',            category: 'recovery', skill: 'Nutrition',         xpReward: 10 },
  ],
  'Cold Exposure': [
    { label: 'Ice Bath — 3 min',          category: 'recovery', skill: 'Cold Exposure',     xpReward: 35 },
    { label: 'Cold Shower — 2 min',       category: 'recovery', skill: 'Cold Exposure',     xpReward: 20 },
    { label: 'Cold Rinse — 30 sec',       category: 'recovery', skill: 'Cold Exposure',     xpReward: 10 },
  ],
  'Journaling': [
    { label: 'Long-Form Reflection',      category: 'ritual',   skill: 'Journaling',        xpReward: 35 },
    { label: 'Evening Review',            category: 'ritual',   skill: 'Journaling',        xpReward: 20 },
    { label: 'Gratitude — 3 lines',       category: 'ritual',   skill: 'Journaling',        xpReward: 10 },
  ],
  'Chess': [
    { label: 'Study an Opening',          category: 'mind',     skill: 'Chess',             xpReward: 35 },
    { label: 'Play a Rated Game',         category: 'mind',     skill: 'Chess',             xpReward: 20 },
    { label: 'Solve 5 Puzzles',           category: 'mind',     skill: 'Chess',             xpReward: 10 },
  ],
  'Language Learning': [
    { label: 'Speak for 20 Minutes',      category: 'skill',    skill: 'Language Learning', xpReward: 35 },
    { label: 'Flashcards — 15 min',       category: 'skill',    skill: 'Language Learning', xpReward: 20 },
    { label: 'Listen to a Podcast',       category: 'skill',    skill: 'Language Learning', xpReward: 10 },
  ],
  'Drawing': [
    { label: 'Finished Study Piece',      category: 'skill',    skill: 'Drawing',           xpReward: 35 },
    { label: 'Gesture Sketches — 30 min', category: 'skill',    skill: 'Drawing',           xpReward: 20 },
    { label: 'Warm-Up Doodles',           category: 'skill',    skill: 'Drawing',           xpReward: 10 },
  ],
  'Music': [
    { label: 'Record a Full Take',        category: 'skill',    skill: 'Music',             xpReward: 35 },
    { label: 'Practice — 30 min',         category: 'skill',    skill: 'Music',             xpReward: 20 },
    { label: 'Scales & Warm-Up',          category: 'skill',    skill: 'Music',             xpReward: 10 },
  ],
  'Sales': [
    { label: 'Close or Pitch a Deal',     category: 'work',     skill: 'Sales',             xpReward: 35 },
    { label: 'Cold Outreach — 20 touches',category: 'work',     skill: 'Sales',             xpReward: 20 },
    { label: 'Review Your Pipeline',      category: 'work',     skill: 'Sales',             xpReward: 10 },
  ],
  'Entrepreneurship': [
    { label: 'Ship to Customers',         category: 'work',     skill: 'Entrepreneurship',  xpReward: 35 },
    { label: 'Customer Interview',        category: 'work',     skill: 'Entrepreneurship',  xpReward: 20 },
    { label: 'Review KPIs',               category: 'work',     skill: 'Entrepreneurship',  xpReward: 10 },
  ],
  'Data Analysis': [
    { label: 'Build a Dashboard',         category: 'mind',     skill: 'Data Analysis',     xpReward: 35 },
    { label: 'Run an Analysis',           category: 'mind',     skill: 'Data Analysis',     xpReward: 20 },
    { label: 'Clean a Dataset',           category: 'mind',     skill: 'Data Analysis',     xpReward: 10 },
  ],
  'Negotiation': [
    { label: 'Live Negotiation',          category: 'work',     skill: 'Negotiation',       xpReward: 35 },
    { label: 'Role-Play a Scenario',      category: 'work',     skill: 'Negotiation',       xpReward: 20 },
    { label: 'Study a Case',              category: 'work',     skill: 'Negotiation',       xpReward: 10 },
  ],
  'Photography': [
    { label: 'Full Shoot & Edit',         category: 'skill',    skill: 'Photography',       xpReward: 35 },
    { label: 'Photo Walk — 30 min',       category: 'skill',    skill: 'Photography',       xpReward: 20 },
    { label: 'Review Your Archive',       category: 'skill',    skill: 'Photography',       xpReward: 10 },
  ],
  'Sleep Mastery': [
    { label: 'Sleep 8 Hours',             category: 'recovery', skill: 'Sleep Mastery',     xpReward: 35 },
    { label: 'Asleep by 22:30',           category: 'recovery', skill: 'Sleep Mastery',     xpReward: 20 },
    { label: 'Screen-Free Wind Down',     category: 'recovery', skill: 'Sleep Mastery',     xpReward: 10 },
  ],
  'Consistency': [
    { label: 'Perfect Day — All Quests',  category: 'ritual',   skill: 'Consistency',       xpReward: 35 },
    { label: 'Morning Anchor Complete',   category: 'ritual',   skill: 'Consistency',       xpReward: 20 },
    { label: 'Check In on Habit Tracker', category: 'ritual',   skill: 'Consistency',       xpReward: 10 },
  ],
  'Inner Peace': [
    { label: 'Meditation — 30 min',       category: 'ritual',   skill: 'Inner Peace',       xpReward: 35 },
    { label: 'Breathwork Session',        category: 'ritual',   skill: 'Inner Peace',       xpReward: 20 },
    { label: 'Mindful Walk — 15 min',     category: 'ritual',   skill: 'Inner Peace',       xpReward: 10 },
  ],
  'Will Power': [
    { label: 'Cold Shower — Full 3 min',  category: 'ritual',   skill: 'Will Power',        xpReward: 35 },
    { label: 'Cold Shower — 1 min',       category: 'ritual',   skill: 'Will Power',        xpReward: 20 },
    { label: 'Do the Hard Thing First',   category: 'ritual',   skill: 'Will Power',        xpReward: 10 },
  ],
};

export const SKILL_MESSAGES: Record<string, string[]> = {
  'Strength Training': [
    'Your body is the only weapon that sharpens through use.',
    'Weak men rest. You train.',
    'Every rep is a vote for who you are becoming.',
  ],
  'Running': [
    'The road does not care about your mood.',
    'Lungs burn. Keep moving. That\'s the point.',
    'Most people stop when it gets hard. You know what to do.',
  ],
  'Martial Arts': [
    'Technique is discipline made physical.',
    'Train so the threat never arrives.',
    'Controlled violence is a skill. Build it daily.',
  ],
  'Yoga': [
    'Stillness is not weakness. It is precision under control.',
    'Recovery is output. Invest in it.',
    'Flexibility compounds. So does neglect.',
  ],
  'Programming': [
    'Code is thought made executable. Think clearly.',
    'Ship something. Perfect is the enemy of shipped.',
    'One function, fully understood, beats ten half-known.',
  ],
  'Deep Work': [
    'Distraction is the modern enemy. Guard your focus.',
    'Depth is rare. That is why it pays.',
    'Your attention is the asset. Spend it intentionally.',
  ],
  'Public Speaking': [
    'Confidence is not given. It is built through reps.',
    'The room belongs to whoever stops being afraid first.',
    'Speak anyway. Clarity follows courage.',
  ],
  'Writing': [
    'Write badly first. Edit into something real.',
    'The blank page loses every time you show up.',
    'Words compound. Write today\'s entry.',
  ],
  'Speed Reading': [
    'Knowledge accumulation is a superpower. Few train it.',
    'Read more than you talk. Ideas compound.',
    'Every book is someone\'s lifetime condensed. Take it.',
  ],
  'Investing': [
    'Time in market beats timing the market. Stay in.',
    'Financial literacy is the meta-skill of adulthood.',
    'Your future self is watching today\'s decisions.',
  ],
  'Meditation': [
    'The mind that is still can see everything.',
    'Ten minutes of silence does more than ten hours of noise.',
    'Presence is a discipline. Practice it now.',
  ],
  'Nutrition': [
    'You cannot out-train a bad diet. Fuel properly.',
    'What you eat today is who you perform as tomorrow.',
    'Clean inputs. Clean outputs.',
  ],
  'Cold Exposure': [
    'The cold does not get easier. You get harder.',
    'Comfort is the enemy of adaptation. Step in.',
    'Discipline enters where heat exits.',
  ],
  'Journaling': [
    'Clarity is not found. It is written.',
    'The unexamined day is lost.',
    'Your journal is the one place that never judges.',
  ],
  'Chess': [
    'Think three moves ahead. In chess and in life.',
    'Every game is a lesson. Win or lose, extract it.',
    'Pattern recognition is a muscle. Train it.',
  ],
  'Language Learning': [
    'A new language is a new operating system for thought.',
    'Fluency is embarrassment survived daily.',
    'Speak badly and often. That\'s how it starts.',
  ],
  'Drawing': [
    'Seeing clearly is the skill. Drawing follows.',
    'Consistent practice turns clumsy lines into control.',
    'Art is observation made permanent.',
  ],
  'Music': [
    'Every master was once a beginner who didn\'t quit.',
    'Play through the hard parts. That\'s where it unlocks.',
    'Music is math for the soul.',
  ],
  'Sales': [
    'Rejection is data. Collect it efficiently.',
    'You don\'t close deals. You open relationships.',
    'The best salespeople listen more than they talk.',
  ],
  'Entrepreneurship': [
    'Build as if it will scale. Act as if it won\'t survive complacency.',
    'The market doesn\'t care about your plan. Ship and learn.',
    'Every empire started with one uncomfortable decision.',
  ],
  'Data Analysis': [
    'Without data you\'re just another person with an opinion.',
    'Find the signal. Ignore the noise.',
    'Numbers lie only when you don\'t question them.',
  ],
  'Negotiation': [
    'The person who needs the deal less holds all the power.',
    'Silence after a number is not weakness — it\'s leverage.',
    'Prepare so thoroughly that confidence is the only option.',
  ],
  'Photography': [
    'Great shots are found by those who show up.',
    'Light is the medium. Learn to see it.',
    'The camera rewards patience and punishes rush.',
  ],
  'Sleep Mastery': [
    'Sleep is not rest. It is the consolidation of everything you built today.',
    'Elite performers protect their sleep before all else.',
    'Win the night and you win the morning.',
  ],
  'Consistency': [
    'Showing up average every day beats occasional brilliance.',
    'The streak is the system. Protect it.',
    'Consistency is a vote. Every day is an election.',
  ],
  'Inner Peace': [
    'A calm mind cuts through noise. Train the stillness.',
    'Equanimity is not distance. It is presence without attachment.',
    'Chaos is the test. Peace is the skill.',
  ],
  'Will Power': [
    'The body protests. You proceed anyway. That is will.',
    'Discipline is choosing the harder thing before your excuses arrive.',
    'Will bends reality. Everything else just waits.',
  ],
};

export const DEFAULT_MESSAGES: string[] = [
  'The gate is open. Begin.',
  'Every day above ground is a day to level up.',
  'Do what the version of you six months from now would thank you for.',
];

export const canonicalSkills: Skill[] = [
  { id: 's1', name: 'Consistency',       level: 0, xp: 0, xpToNext: SKILL_XP_PER_LEVEL },
  { id: 's2', name: 'Inner Peace',       level: 0, xp: 0, xpToNext: SKILL_XP_PER_LEVEL },
  { id: 's3', name: 'Strength Training', level: 0, xp: 0, xpToNext: SKILL_XP_PER_LEVEL },
  { id: 's4', name: 'Will Power',        level: 0, xp: 0, xpToNext: SKILL_XP_PER_LEVEL },
  { id: 's5', name: 'Sleep Mastery',     level: 0, xp: 0, xpToNext: SKILL_XP_PER_LEVEL },
];
