import React, { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BookMarked,
  Briefcase,
  Compass,
  Cpu,
  Flame,
  HeartHandshake,
  Library,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useGurukul } from '../context/GurukulContext';
import { AGE_GROUPS } from '../data/seedCatalog';
import { AgeGroup, BusinessVenture, UniqueHubId } from '../types/gurukul';

interface UniqueHubsProps {
  activeHub: UniqueHubId;
  onSelectHub: (hub: UniqueHubId) => void;
  onAskAI: (topic: string) => void;
}

const HUB_ITEMS: { id: UniqueHubId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'my-gurukul', label: 'My Gurukul', icon: Flame },
  { id: 'my-homeschool', label: 'My Homeschool', icon: HeartHandshake },
  { id: 'my-business-lab', label: 'My Business Lab', icon: Briefcase },
  { id: 'my-sports-academy', label: 'My Sports Academy', icon: Activity },
  { id: 'my-sanskrit-shastra', label: 'My Sanskrit & Shastra', icon: BookMarked },
  { id: 'my-skill-academy', label: 'My Skill Academy', icon: Sparkles },
  { id: 'my-innovation-lab', label: 'My Innovation Lab', icon: Cpu },
  { id: 'my-career-path', label: 'My Career Path', icon: Compass },
  { id: 'my-life-academy', label: 'My Life Academy', icon: Award },
  { id: 'bharat-library', label: 'Bharat Knowledge Library', icon: Library },
];

const SHASTRA_MODULES = [
  {
    source: 'Bhagavad Gita · Chapter 2, Verse 47',
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
    transliteration: 'Karmanye vadhikaraste ma phaleshu kadachana',
    context: 'Spoken in the Mahabharata dialogue as a framework for focused, wholehearted effort without anxiety over outcomes.',
    inquiry: 'How does focusing on the quality of today’s practice instead of exam anxiety improve long-term mastery?',
  },
  {
    source: 'Taittiriya Upanishad · Shiksha Valli',
    sanskrit: 'सत्यं वद । धर्मं चर । स्वाध्यायान्मा प्रमदः',
    transliteration: 'Satyam vada, dharmam chara, svadhyayan ma pramadah',
    context: 'Ancient Gurukul convocation counsel given to graduating scholars as they entered civic and family life.',
    inquiry: 'Why did classical teachers place lifelong self-study (svadhyaya) alongside truthfulness and civic responsibility?',
  },
  {
    source: 'Baudhayana Sulba Sutra · Geometry',
    sanskrit: 'दीर्घचतुरस्रस्याक्ष्णया रज्जुः पार्श्वमानी तिर्यङ्मानी च',
    transliteration: 'Dirghachaturasrasyaksnaya rajjuh parsvamani tiryanmani cha',
    context: 'Geometric rule describing how the diagonal rope of a rectangle produces the sum of areas of its sides (~800 BCE).',
    inquiry: 'How can string-and-peg surveying prove geometric area relationships outdoors without modern instruments?',
  },
  {
    source: 'Chanakya Niti · Ethical Governance',
    sanskrit: 'विद्वत्त्वं च नृपत्वं च नैव तुल्यं कदाचन',
    transliteration: 'Vidvattvam cha nripattvam cha naiva tulyam kadachana',
    context: 'Contrasts regional political power with enduring knowledge that earns respect across all boundaries.',
    inquiry: 'What makes verifiable skill and character more durable than positional authority?',
  },
];

export const UniqueHubs: React.FC<UniqueHubsProps> = ({ activeHub, onSelectHub, onAskAI }) => {
  const {
    firebaseUser,
    profile,
    signInWithGoogle,
    enrollments,
    homeschoolPlans,
    saveHomeschoolPlan,
    deleteHomeschoolPlan,
    ventures,
    saveBusinessVenture,
    updateVentureStage,
    sportsLogs,
    saveSportsLog,
    libraryResources,
  } = useGurukul();

  // Homeschool form
  const [hsChild, setHsChild] = useState('');
  const [hsAge, setHsAge] = useState<AgeGroup>('Preparatory (9-11)');
  const [hsPace, setHsPace] = useState<'Gentle' | 'Balanced' | 'Accelerated'>('Balanced');
  const [hsInterests, setHsInterests] = useState('Sanskrit, Applied Math, Gardening');
  const [hsGoals, setHsGoals] = useState('');
  const [hsSchedule, setHsSchedule] = useState('08:00 Yoga · 09:00 Core Academics · 11:30 Practical Lab');

  // Business Lab form
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('Eco-Crafts & Stationery');
  const [bizTagline, setBizTagline] = useState('');
  const [bizProblem, setBizProblem] = useState('');
  const [bizBudget, setBizBudget] = useState(500);

  // Sports Academy form
  const [sportName, setSportName] = useState('Archery');
  const [sportMetricLabel, setSportMetricLabel] = useState('20m Grouping Score');
  const [sportMetricValue, setSportMetricValue] = useState('54 / 60');
  const [sportDuration, setSportDuration] = useState(45);

  // Innovation Lab interactive robotics simulator
  const [roverSpeed, setRoverSpeed] = useState(65);
  const [sensorThresholdCm, setSensorThresholdCm] = useState(30);
  const [targetDistanceCm, setTargetDistanceCm] = useState(42);

  // Career Path explorer
  const [careerInterest, setCareerInterest] = useState<'STEM & AI' | 'Enterprise' | 'Heritage & Arts' | 'Sports & Ecology'>('STEM & AI');

  // Life Academy daily habit check-ins (client state)
  const [habits, setHabits] = useState<Record<string, boolean>>({
    'Morning Surya Namaskar & Breath': true,
    '30 Min Uninterrupted Deep Reading': true,
    'Helping Family or Community Service': false,
    'Evening Gratitude & Tomorrow Plan': false,
  });

  // Library filter
  const [libFilter, setLibFilter] = useState<string>('All');

  const filteredLibrary = useMemo(() => {
    if (libFilter === 'All') return libraryResources;
    return libraryResources.filter((r) => r.resourceType === libFilter);
  }, [libraryResources, libFilter]);

  const stoppingMarginCm = targetDistanceCm - sensorThresholdCm;
  const roverStatus =
    stoppingMarginCm <= 0
      ? 'BRAKE & PIVOT ACTIVE'
      : stoppingMarginCm < 15
        ? 'CAUTION — DECELERATING'
        : 'CRUISING NOMINAL';

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-14 space-y-8">
      <div className="border-b border-[var(--border-hairline)] pb-6 space-y-2">
        <p className="text-xs font-medium text-[var(--accent-secondary)]">
          10 Specialized Learning Workspaces
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
          Bharat Gurukul 360 Academies & Labs
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          Every pillar has a live interactive space—manage homeschool plans, launch student mini-ventures, track sports performance, simulate robotics sensors, and explore classical Indian knowledge.
        </p>
      </div>

      {/* Horizontal 10-Hub Selector */}
      <div className="flex flex-wrap gap-2">
        {HUB_ITEMS.map((hub) => {
          const Icon = hub.icon;
          const active = activeHub === hub.id;
          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => onSelectHub(hub.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{hub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. My Gurukul */}
      {activeHub === 'my-gurukul' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)]">
              <p className="text-xs text-[var(--text-muted)]">Learning Points</p>
              <p className="font-mono-num text-3xl font-semibold text-[var(--accent-secondary)] mt-1">
                {profile?.points ?? 120}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Earned through lessons & consistency</p>
            </div>
            <div className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)]">
              <p className="text-xs text-[var(--text-muted)]">Daily Streak</p>
              <p className="font-mono-num text-3xl font-semibold text-[var(--text-primary)] mt-1">
                {profile?.streakDays ?? 3} days
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Keep daily learning rhythm</p>
            </div>
            <div className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)]">
              <p className="text-xs text-[var(--text-muted)]">Active Courses</p>
              <p className="font-mono-num text-3xl font-semibold text-[var(--text-primary)] mt-1">
                {enrollments.length}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {enrollments.filter((e) => e.certificateIssued).length} certificates issued
              </p>
            </div>
            <div className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)]">
              <p className="text-xs text-[var(--text-muted)]">Achievement Badges</p>
              <p className="font-mono-num text-3xl font-semibold text-[var(--text-primary)] mt-1">
                {profile?.badges?.length ?? 2}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                {profile?.badges?.join(', ') || 'First Step Scholar'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4">
              <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                Weekly Challenge & Effort Leaderboard
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Rankings reward consistency, project completion, and mentorship help—not exam scores alone.
              </p>
              <div className="divide-y divide-[var(--border-hairline)]">
                {[
                  { rank: '01', name: 'Diya Deshpande', domain: 'Sanskrit & Math', pts: '1,480 pts', streak: '28d' },
                  { rank: '02', name: 'Aarav Nair', domain: 'Business Lab', pts: '1,320 pts', streak: '21d' },
                  { rank: '03', name: 'Saanvi Reddy', domain: 'Sports & Yoga', pts: '1,190 pts', streak: '30d' },
                  {
                    rank: '04',
                    name: profile?.displayName || 'You (Current Learner)',
                    domain: profile?.ageGroup || 'Middle School',
                    pts: `${profile?.points ?? 120} pts`,
                    streak: `${profile?.streakDays ?? 3}d`,
                  },
                ].map((row) => (
                  <div key={row.rank} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-num text-xs text-[var(--text-muted)]">{row.rank}</span>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{row.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{row.domain}</p>
                      </div>
                    </div>
                    <div className="text-right font-mono-num text-xs">
                      <p className="font-semibold text-[var(--accent-secondary)]">{row.pts}</p>
                      <p className="text-[var(--text-muted)]">{row.streak} streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-4">
              <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--accent-secondary)]" />
                <span>This Week’s Gurukul Quest</span>
              </h2>
              <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
                <li className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-hairline)]">
                  Complete 1 Sulba Sutra or Robotics lesson and record your practical worksheet.
                </li>
                <li className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-hairline)]">
                  Log 30 minutes of physical exercise or Pranayama in My Sports Academy.
                </li>
                <li className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-hairline)]">
                  Draft a neighborhood problem statement in My Business Lab.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. My Homeschool */}
      {activeHub === 'my-homeschool' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!firebaseUser) {
                await signInWithGoogle();
                return;
              }
              if (!hsChild.trim()) return;
              await saveHomeschoolPlan({
                childName: hsChild,
                ageGroup: hsAge,
                learningPace: hsPace,
                interests: hsInterests.split(',').map((s) => s.trim()).filter(Boolean),
                weeklyGoals: hsGoals || 'Build consistent morning math, Sanskrit reading, and outdoor play.',
                scheduleSummary: hsSchedule,
              });
              setHsChild('');
              setHsGoals('');
            }}
            className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4 self-start"
          >
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Create Custom Homeschool Plan
            </h2>
            <input
              type="text"
              required
              value={hsChild}
              onChange={(e) => setHsChild(e.target.value)}
              placeholder="Child’s name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={hsAge}
                onChange={(e) => setHsAge(e.target.value as AgeGroup)}
                className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              >
                {AGE_GROUPS.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
              <select
                value={hsPace}
                onChange={(e) => setHsPace(e.target.value as 'Gentle' | 'Balanced' | 'Accelerated')}
                className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              >
                <option value="Gentle">Gentle Pace</option>
                <option value="Balanced">Balanced Pace</option>
                <option value="Accelerated">Accelerated Pace</option>
              </select>
            </div>
            <input
              type="text"
              value={hsInterests}
              onChange={(e) => setHsInterests(e.target.value)}
              placeholder="Interests (comma separated)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <textarea
              rows={2}
              value={hsGoals}
              onChange={(e) => setHsGoals(e.target.value)}
              placeholder="Weekly learning goals..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <textarea
              rows={2}
              value={hsSchedule}
              onChange={(e) => setHsSchedule(e.target.value)}
              placeholder="Daily rhythm..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{firebaseUser ? 'Save Homeschool Plan' : 'Sign In to Save Plan'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Saved Family Learning Plans ({homeschoolPlans.length})
            </h2>
            {homeschoolPlans.length === 0 ? (
              <div className="p-8 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)]">
                No homeschool schedules saved yet. Create one on the left or generate one with Acharya AI.
              </div>
            ) : (
              homeschoolPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[var(--accent-secondary)] font-medium">
                        {plan.ageGroup} · {plan.learningPace} Pace
                      </p>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        {plan.childName}’s Learning Plan
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteHomeschoolPlan(plan.id)}
                      className="p-2 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                      aria-label="Delete homeschool plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    <strong>Interests:</strong> {plan.interests.join(' · ')}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    <strong>Weekly Goal:</strong> {plan.weeklyGoals}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-hairline)]">
                    {plan.scheduleSummary}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. My Business Lab */}
      {activeHub === 'my-business-lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!firebaseUser) {
                await signInWithGoogle();
                return;
              }
              if (!bizName.trim()) return;
              await saveBusinessVenture({
                founderName: profile?.displayName || firebaseUser.displayName || 'Young Founder',
                ventureName: bizName,
                category: bizCategory,
                tagline: bizTagline || 'Student-built practical solution',
                problemSolved: bizProblem || 'Solving an everyday school or community need sustainably.',
                budgetInr: Number(bizBudget) || 500,
                revenueInr: 0,
                stage: 'Idea',
                isPublic: true,
                mentorFeedback: 'Submitted to My Business Lab — ready for unit-economics review.',
              });
              setBizName('');
              setBizTagline('');
              setBizProblem('');
            }}
            className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4 self-start"
          >
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Launch a Mini-Business Venture
            </h2>
            <input
              type="text"
              required
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="Venture / Brand Name (e.g., NeemCraft Pens)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={bizCategory}
                onChange={(e) => setBizCategory(e.target.value)}
                placeholder="Category"
                className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <input
                type="number"
                min={0}
                value={bizBudget}
                onChange={(e) => setBizBudget(Number(e.target.value))}
                placeholder="Seed Budget (INR)"
                className="px-3 py-2 text-xs font-mono-num rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
            <input
              type="text"
              value={bizTagline}
              onChange={(e) => setBizTagline(e.target.value)}
              placeholder="One-line brand promise"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <textarea
              rows={2}
              value={bizProblem}
              onChange={(e) => setBizProblem(e.target.value)}
              placeholder="What customer problem does your product solve?"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              {firebaseUser ? 'Register Mini-Venture' : 'Sign In to Launch Venture'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Student Marketplace Ventures ({ventures.length})
            </h2>
            {ventures.length === 0 ? (
              <div className="p-8 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)]">
                Launch your first mini-business on the left to track seed budget, revenue, and marketplace stages.
              </div>
            ) : (
              ventures.map((v) => {
                const stages: BusinessVenture['stage'][] = ['Idea', 'Prototype', 'Marketplace', 'Pitch'];
                const nextStage = stages[Math.min(stages.indexOf(v.stage) + 1, stages.length - 1)];
                const isOwner = v.ownerId === firebaseUser?.uid;
                return (
                  <div
                    key={v.id}
                    className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-[var(--accent-secondary)] font-medium">
                          {v.category} · Stage: {v.stage} · Founder: {v.founderName}
                        </p>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {v.ventureName}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">{v.tagline}</p>
                      </div>
                      <div className="text-right font-mono-num text-xs">
                        <p className="text-[var(--text-muted)]">Budget: ₹{v.budgetInr}</p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Revenue: ₹{v.revenueInr}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{v.problemSolved}</p>
                    {isOwner && v.stage !== 'Pitch' && (
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-hairline)]">
                        <span className="text-xs text-[var(--text-muted)]">{v.mentorFeedback}</span>
                        <button
                          type="button"
                          onClick={() => updateVentureStage(v.id, nextStage, v.revenueInr + 350)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-secondary)] text-white cursor-pointer"
                        >
                          Advance to {nextStage} (+₹350 sale)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. My Sports Academy */}
      {activeHub === 'my-sports-academy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!firebaseUser) {
                await signInWithGoogle();
                return;
              }
              await saveSportsLog({
                athleteName: profile?.displayName || firebaseUser.displayName || 'Athlete',
                sport: sportName,
                metricLabel: sportMetricLabel,
                metricValue: sportMetricValue,
                durationMinutes: Number(sportDuration) || 45,
                coachNote: 'Consistent effort logged in My Sports Academy.',
              });
            }}
            className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4 self-start"
          >
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Log Training & Fitness Session
            </h2>
            <select
              value={sportName}
              onChange={(e) => setSportName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            >
              {[
                'Archery', 'Yoga & Pranayama', 'Cricket', 'Football', 'Kabaddi',
                'Kho-Kho', 'Athletics', 'Badminton', 'Chess', 'Swimming', 'Wrestling',
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={sportMetricLabel}
                onChange={(e) => setSportMetricLabel(e.target.value)}
                placeholder="Metric (e.g., 5km Pace)"
                className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                value={sportMetricValue}
                onChange={(e) => setSportMetricValue(e.target.value)}
                placeholder="Result (e.g., 24 min)"
                className="px-3 py-2 text-xs font-mono-num rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={300}
                value={sportDuration}
                onChange={(e) => setSportDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-num rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              {firebaseUser ? 'Save Performance Log' : 'Sign In to Log Session'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Athletic Performance History ({sportsLogs.length})
            </h2>
            {sportsLogs.length === 0 ? (
              <div className="p-8 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)]">
                Log your first cricket, archery, yoga, or athletics training session to build your seasonal stamina profile.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-hairline)] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)]">
                {sportsLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {log.sport} · {log.metricLabel}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {log.athleteName} · {log.coachNote}
                      </p>
                    </div>
                    <div className="text-right font-mono-num">
                      <p className="text-sm font-semibold text-[var(--accent-secondary)]">
                        {log.metricValue}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{log.durationMinutes} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. My Sanskrit & Shastra */}
      {activeHub === 'my-sanskrit-shastra' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SHASTRA_MODULES.map((item) => (
            <div
              key={item.source}
              className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <p className="text-xs font-medium text-[var(--accent-secondary)]">{item.source}</p>
                <p className="font-display text-xl font-semibold text-[var(--text-primary)] leading-snug">
                  {item.sanskrit}
                </p>
                <p className="text-xs italic text-[var(--text-muted)]">{item.transliteration}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.context}</p>
                <div className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)]">
                  <strong>Critical Reflection:</strong> {item.inquiry}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAskAI(`Explain ${item.source}: ${item.transliteration}`)}
                className="self-start px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white cursor-pointer"
              >
                Explore Deeper with Acharya AI
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 6. My Skill Academy */}
      {activeHub === 'my-skill-academy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: 'Public Speaking & Debate',
              track: 'Life Skills · Beginner to Advanced',
              task: 'Deliver a 2-minute structured talk using claim, evidence, and civic example.',
            },
            {
              title: 'Cyber Safety & Digital Citizenship',
              track: 'Technology · All Ages',
              task: 'Audit password hygiene, recognize phishing attempts, and practice respectful dialogue.',
            },
            {
              title: 'Organic Gardening & Water Conservation',
              track: 'Nature & Practical Life',
              task: 'Measure household greywater reuse and prepare a balcony compost bin.',
            },
            {
              title: 'First Aid & Community Care',
              track: 'Practical Life Readiness',
              task: 'Assemble a family emergency kit and learn basic wound dressing & CPR awareness.',
            },
            {
              title: 'Financial Literacy & Compounding',
              track: 'Entrepreneurship',
              task: 'Track 30 days of allowance split into Spend, Save, Invest, and Give.',
            },
            {
              title: 'Design Thinking & Indian Folk Craft',
              track: 'Art & Creativity',
              task: 'Interview a user and sketch 3 iterative improvements to an everyday tool.',
            },
          ].map((skill) => (
            <div
              key={skill.title}
              className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)]">{skill.track}</p>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{skill.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{skill.task}</p>
              </div>
              <button
                type="button"
                onClick={() => onAskAI(`Create a practical 7-day challenge for ${skill.title}`)}
                className="self-start text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Start Guided Practice →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 7. My Innovation Lab (Two-Zone Educational Sandbox) */}
      {activeHub === 'my-innovation-lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--accent-secondary)]">
                  Interactive Robotics Simulation
                </p>
                <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                  Autonomous Ultrasonic Braking Lab
                </h2>
              </div>
              <span className="font-mono-num text-xs font-semibold px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)]">
                {roverStatus}
              </span>
            </div>

            {/* Interactive SVG Schematic Stage */}
            <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
              <svg viewBox="0 0 560 180" className="w-full h-44">
                <line x1="20" y1="140" x2="540" y2="140" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
                {/* Rover body */}
                <g transform={`translate(${Math.max(30, 440 - targetDistanceCm * 3.5)}, 78)`}>
                  <rect width="74" height="44" rx="8" fill="var(--accent-primary)" />
                  <circle cx="16" cy="48" r="9" fill="var(--text-primary)" />
                  <circle cx="58" cy="48" r="9" fill="var(--text-primary)" />
                  <rect x="64" y="12" width="12" height="16" rx="2" fill="var(--accent-secondary)" />
                  {/* Ultrasonic beam */}
                  <polygon
                    points="76,20 140,4 140,36"
                    fill={stoppingMarginCm <= 0 ? '#dc2626' : '#0284c7'}
                    fillOpacity="0.22"
                  />
                </g>
                {/* Wall Obstacle */}
                <rect x="500" y="36" width="22" height="104" rx="3" fill="var(--accent-secondary)" />
                <text x="488" y="26" fontSize="11" fill="currentColor">
                  Obstacle
                </text>
              </svg>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[var(--border-hairline)] text-xs font-mono-num">
                <div>
                  <span className="text-[var(--text-muted)]">Distance:</span>{' '}
                  <strong>{targetDistanceCm} cm</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Safety Margin:</span>{' '}
                  <strong>{stoppingMarginCm} cm</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Motor PWM:</span>{' '}
                  <strong>{stoppingMarginCm <= 0 ? '0%' : `${roverSpeed}%`}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Control Parameters
              </h3>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Rover Target Distance</span>
                  <span className="font-mono-num font-semibold">{targetDistanceCm} cm</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={targetDistanceCm}
                  onChange={(e) => setTargetDistanceCm(Number(e.target.value))}
                  className="w-full accent-[var(--accent-primary)]"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Stop Threshold</span>
                  <span className="font-mono-num font-semibold">{sensorThresholdCm} cm</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={60}
                  value={sensorThresholdCm}
                  onChange={(e) => setSensorThresholdCm(Number(e.target.value))}
                  className="w-full accent-[var(--accent-secondary)]"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Base Motor Speed</span>
                  <span className="font-mono-num font-semibold">{roverSpeed}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={roverSpeed}
                  onChange={(e) => setRoverSpeed(Number(e.target.value))}
                  className="w-full accent-[var(--accent-primary)]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onAskAI(
                  `Explain closed-loop PID braking for an autonomous rover stopping at ${sensorThresholdCm} cm.`
                )
              }
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              Explain Control Logic with Acharya AI
            </button>
          </div>
        </div>
      )}

      {/* 8. My Career Path */}
      {activeHub === 'my-career-path' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {(['STEM & AI', 'Enterprise', 'Heritage & Arts', 'Sports & Ecology'] as const).map((track) => (
              <button
                key={track}
                type="button"
                onClick={() => setCareerInterest(track)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                  careerInterest === track
                    ? 'bg-[var(--accent-secondary)] text-white border-[var(--accent-secondary)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-hairline)]'
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(careerInterest === 'STEM & AI'
              ? [
                  { role: 'Robotics & Embedded Systems Engineer', path: 'Physics + Coding + Innovation Lab' },
                  { role: 'Applied AI & Computational Linguist', path: 'Mathematics + Sanskrit Grammar + AI' },
                  { role: 'Clean Energy & Water Systems Architect', path: 'Chemistry + Environmental Science + DIY' },
                ]
              : careerInterest === 'Enterprise'
                ? [
                    { role: 'Social Impact Founder', path: 'Business Lab + Financial Math + Public Speaking' },
                    { role: 'Product Designer & Brand Strategist', path: 'Design Thinking + Customer Psychology' },
                    { role: 'Agri-Tech & Supply Chain Builder', path: 'Indian Agriculture + Economics + Data' },
                  ]
                : careerInterest === 'Heritage & Arts'
                  ? [
                      { role: 'Indology & Classical Sanskrit Researcher', path: 'Sanskrit + Vedas + Historical Inquiry' },
                      { role: 'Classical Performing Artist & Educator', path: 'Bharatanatyam / Classical Music + Theatre' },
                      { role: 'Temple Architecture & Heritage Restorer', path: 'Geometry + History + 3D Design' },
                    ]
                  : [
                      { role: 'Sports Scientist & Athletic Coach', path: 'Athletics + Nutrition + Anatomy' },
                      { role: 'Yoga & Preventive Wellness Mentor', path: 'Ashtanga Yoga + Pranayama + Ayurveda' },
                      { role: 'Regenerative Farming Specialist', path: 'Organic Farming + Soil Science + Water' },
                    ]
            ).map((c) => (
              <div
                key={c.role}
                className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3"
              >
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{c.role}</h3>
                <p className="text-xs text-[var(--text-secondary)]">Recommended Foundation: {c.path}</p>
                <button
                  type="button"
                  onClick={() => onAskAI(`Create a 5-year student portfolio roadmap for ${c.role}`)}
                  className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  Build Portfolio Roadmap →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. My Life Academy */}
      {activeHub === 'my-life-academy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4">
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Daily Discipline & Character Check-In
            </h2>
            <div className="space-y-2.5">
              {Object.entries(habits).map(([habit, done]) => (
                <button
                  key={habit}
                  type="button"
                  onClick={() => setHabits((prev) => ({ ...prev, [habit]: !prev[habit] }))}
                  className="w-full p-3.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">{habit}</span>
                  <span
                    className={`text-xs font-semibold ${
                      done ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {done ? 'Completed' : 'Pending'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Values, Emotional Intelligence & Leadership
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              True education builds self-awareness, calm decision making under pressure, respectful teamwork, and service to one’s family and community.
            </p>
            <button
              type="button"
              onClick={() => onAskAI('Give me a practical scenario to practice emotional intelligence and calm leadership today.')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              Practice Leadership Scenario with AI
            </button>
          </div>
        </div>
      )}

      {/* 10. Bharat Knowledge Library */}
      {activeHub === 'bharat-library' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {['All', 'Book', 'Story', 'Worksheet', 'Shastra', 'Project'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLibFilter(type)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  libFilter === type
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-hairline)]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredLibrary.map((res) => (
              <div
                key={res.id}
                className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <p className="text-xs text-[var(--accent-secondary)] font-medium">
                    {res.resourceType} · {res.category} · {res.ageGroup}
                  </p>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{res.title}</h3>
                  <p className="text-xs text-[var(--text-muted)]">By {res.author}</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{res.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAskAI(`Summarize key lessons and discussion questions from "${res.title}"`)}
                  className="self-start text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  Open Reading Companion →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
