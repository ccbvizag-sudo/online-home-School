import React, { useEffect, useState } from 'react';
import {
  BookOpenCheck,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useGurukul } from '../context/GurukulContext';
import { AGE_GROUPS, INDIAN_LANGUAGES } from '../data/seedCatalog';
import { AgeGroup, ParentalControlLevel } from '../types/gurukul';

interface AILearningAssistantProps {
  initialTopic?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface StudyPlanResult {
  planTitle: string;
  weeklyObjective: string;
  dailyBlocks: { timeSlot: string; pillar: string; activity: string }[];
  recommendedProjects: string[];
  parentTip: string;
}

interface QuizResult {
  quizTitle: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  worksheetActivities: string[];
}

export const AILearningAssistant: React.FC<AILearningAssistantProps> = ({ initialTopic = '' }) => {
  const { profile, firebaseUser, saveHomeschoolPlan, submitAssessment } = useGurukul();

  const [tab, setTab] = useState<'chat' | 'plan' | 'quiz'>('chat');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(
    profile?.ageGroup || 'Middle School (12-14)'
  );
  const [language, setLanguage] = useState<string>(profile?.preferredLanguage || 'English');
  const [parentalControl, setParentalControl] = useState<ParentalControlLevel>(
    profile?.parentalControlLevel || 'strict'
  );

  // Chat state
  const [subject, setSubject] = useState(initialTopic || 'Mathematics & Sulba Sutras');
  const [mode, setMode] = useState<'explain' | 'story' | 'revision' | 'shastra' | 'business'>(
    'explain'
  );
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Namaste! I am Acharya AI, your personal learning guide. Ask any question across academics, Sanskrit & Indian knowledge, entrepreneurship, sports nutrition, or robotics in your preferred language.',
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Study Plan state
  const [learnerName, setLearnerName] = useState(profile?.displayName || 'Aarav');
  const [interestsInput, setInterestsInput] = useState('Mathematics, Sanskrit, Robotics, Archery');
  const [pace, setPace] = useState<'Gentle' | 'Balanced' | 'Accelerated'>('Balanced');
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [planResult, setPlanResult] = useState<StudyPlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);

  // Quiz state
  const [quizTopic, setQuizTopic] = useState(initialTopic || 'Bhagavad Gita & Ethical Leadership');
  const [quizLevel, setQuizLevel] = useState('Beginner');
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSaved, setQuizSaved] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setSubject(initialTopic);
      setQuizTopic(initialTopic);
    }
  }, [initialTopic]);

  const handleSendChat = async (customPrompt?: string) => {
    const textToSend = (customPrompt ?? prompt).trim();
    if (!textToSend || chatLoading) return;
    setChatError(null);
    const nextHistory = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(nextHistory);
    if (!customPrompt) setPrompt('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          mode,
          subject,
          ageGroup,
          language,
          parentalControl,
          history: nextHistory.slice(-6),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to reach Acharya AI.');
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanLoading(true);
    setPlanSaved(false);
    setChatError(null);
    try {
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerName,
          ageGroup,
          interests: interestsInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          pace,
          hoursPerDay,
          language,
          parentalControl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate study plan.');
      setPlanResult(data);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Plan generation failed.');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleSavePlanToFirestore = async () => {
    if (!planResult || !firebaseUser) return;
    const summaryText = planResult.dailyBlocks
      .map((b) => `${b.timeSlot} [${b.pillar}]: ${b.activity}`)
      .join(' | ');
    await saveHomeschoolPlan({
      childName: learnerName || 'Learner',
      ageGroup,
      learningPace: pace,
      interests: interestsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      weeklyGoals: planResult.weeklyObjective,
      scheduleSummary: summaryText.slice(0, 1950),
    });
    setPlanSaved(true);
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizLoading(true);
    setQuizChecked(false);
    setQuizAnswers({});
    setQuizSaved(false);
    setChatError(null);
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quizTopic,
          ageGroup,
          level: quizLevel,
          language,
          parentalControl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quiz generation failed.');
      setQuizResult(data);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Quiz generation failed.');
    } finally {
      setQuizLoading(false);
    }
  };

  const quizScore = quizResult
    ? quizResult.questions.reduce(
        (acc, q, idx) => (quizAnswers[idx] === q.correctIndex ? acc + 1 : acc),
        0
      )
    : 0;

  const handleSaveQuizScore = async () => {
    if (!quizResult || !firebaseUser) return;
    await submitAssessment({
      studentName: profile?.displayName || firebaseUser.displayName || 'Learner',
      courseId: 'course_vedic_math_siddhanta',
      title: `AI Quiz: ${quizResult.quizTitle}`,
      score: quizScore,
      maxScore: Math.max(quizResult.questions.length, 1),
      status: 'graded',
      feedback: `Completed in ${language} (${ageGroup})`,
    });
    setQuizSaved(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-14 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border-hairline)] pb-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--accent-secondary)]">
            Acharya AI · Multilingual Personal Tutor
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
            AI Learning Assistant
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
            Ask questions in 10 Indian languages, generate age-calibrated study schedules, or practice with auto-graded quizzes and worksheets.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] self-start">
          {[
            { id: 'chat' as const, label: 'Ask Acharya AI' },
            { id: 'plan' as const, label: 'Study Plan Builder' },
            { id: 'quiz' as const, label: 'Quiz & Worksheets' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                tab === item.id
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Child-Safe Calibration Bar */}
      <div className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
            Age Calibration
          </label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
          >
            {AGE_GROUPS.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
            Indian Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
          >
            {INDIAN_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] mb-1">
            <Shield className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            <span>Parental Safety Control</span>
          </label>
          <select
            value={parentalControl}
            onChange={(e) => setParentalControl(e.target.value as ParentalControlLevel)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
          >
            <option value="strict">Strict Child-Safe (Ages 3–11)</option>
            <option value="moderate">Moderate Guided (Ages 12–14)</option>
            <option value="standard">Standard Scholarly (Ages 15+)</option>
          </select>
        </div>
      </div>

      {chatError && (
        <div className="p-4 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300">
          {chatError}
        </div>
      )}

      {/* Tab 1: Interactive Tutor Chat */}
      {tab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Topic or Subject Focus
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Teaching Style
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'explain' as const, label: 'Explain in Simple Language' },
                    { id: 'story' as const, label: 'Teach via Story & Practical Example' },
                    { id: 'revision' as const, label: 'Create Revision Plan & Self-Check' },
                    { id: 'shastra' as const, label: 'Indian Heritage & Historical Context' },
                    { id: 'business' as const, label: 'Young Entrepreneur Mentor Mode' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer ${
                        mode === m.id
                          ? 'border-[var(--accent-secondary)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
                          : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-hairline)] space-y-1.5">
                <p className="text-xs font-medium text-[var(--text-muted)]">Quick Prompts</p>
                {[
                  'Explain Pythagoras and Sulba Sutra geometry with a courtyard example.',
                  'Tell a Panchatantra-style story about saving and investing money.',
                  'How can a 13-year-old start a zero-waste school stationery project?',
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendChat(q)}
                    className="w-full text-left p-2.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-hairline)] cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex flex-col min-h-[520px]">
            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[540px]">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)]'
                    }`}
                  >
                    {msg.role === 'model' && (
                      <p className="text-[11px] font-semibold text-[var(--accent-secondary)] mb-1 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" /> Acharya AI ({language})
                      </p>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Acharya AI is preparing your explanation...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="p-4 border-t border-[var(--border-hairline)] flex gap-2"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Ask Acharya AI in ${language}...`}
                className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <button
                type="submit"
                disabled={chatLoading || !prompt.trim()}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Study Plan Builder */}
      {tab === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleGeneratePlan}
            className="lg:col-span-4 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4 self-start"
          >
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Customized Study & Homeschool Plan
            </h2>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Learner Name
              </label>
              <input
                type="text"
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Interests & Focus Subjects (comma separated)
              </label>
              <textarea
                rows={2}
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Learning Pace
                </label>
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value as 'Gentle' | 'Balanced' | 'Accelerated')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  <option value="Gentle">Gentle</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Accelerated">Accelerated</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Hours / Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono-num rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={planLoading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {planLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
              <span>{planLoading ? 'Generating Plan...' : 'Generate Holistic Plan'}</span>
            </button>
          </form>

          <div className="lg:col-span-8">
            {planResult ? (
              <div className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                      {planResult.planTitle}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {planResult.weeklyObjective}
                    </p>
                  </div>
                  {firebaseUser && (
                    <button
                      type="button"
                      onClick={handleSavePlanToFirestore}
                      disabled={planSaved}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-secondary)] text-white shrink-0 cursor-pointer"
                    >
                      {planSaved ? 'Saved to My Homeschool' : 'Save to My Homeschool'}
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {planResult.dailyBlocks?.map((block, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] grid grid-cols-1 sm:grid-cols-12 gap-2"
                    >
                      <span className="sm:col-span-3 text-xs font-mono-num font-semibold text-[var(--accent-primary)]">
                        {block.timeSlot}
                      </span>
                      <span className="sm:col-span-3 text-xs font-medium text-[var(--accent-secondary)]">
                        {block.pillar}
                      </span>
                      <span className="sm:col-span-6 text-xs text-[var(--text-primary)]">
                        {block.activity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">
                      Recommended Practical Projects
                    </p>
                    <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                      {planResult.recommendedProjects?.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">
                      Parent & Mentor Note
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {planResult.parentTip}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-center space-y-2">
                <CalendarDays className="w-8 h-8 text-[var(--accent-primary)] mx-auto" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Your customized holistic schedule will appear here
                </p>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Balances academics, Hindu Gurukul heritage, hands-on mini-ventures, and daily sports or yoga.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: AI Quiz & Worksheet Lab */}
      {tab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleGenerateQuiz}
            className="lg:col-span-4 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4 self-start"
          >
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Practice Quiz & Worksheet Lab
            </h2>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Topic
              </label>
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Difficulty Level
              </label>
              <select
                value={quizLevel}
                onChange={(e) => setQuizLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={quizLoading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {quizLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{quizLoading ? 'Building Quiz...' : 'Generate Quiz & Worksheet'}</span>
            </button>
          </form>

          <div className="lg:col-span-8">
            {quizResult ? (
              <div className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
                  <h3 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                    {quizResult.quizTitle}
                  </h3>
                  {quizChecked && (
                    <span className="font-mono-num text-sm font-semibold text-[var(--accent-secondary)]">
                      Score: {quizScore} / {quizResult.questions.length}
                    </span>
                  )}
                </div>

                <div className="space-y-5">
                  {quizResult.questions?.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-3"
                    >
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, oIdx) => {
                          const selected = quizAnswers[qIdx] === oIdx;
                          const isCorrect = q.correctIndex === oIdx;
                          let cls =
                            'border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)]';
                          if (quizChecked) {
                            if (isCorrect) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200';
                            else if (selected) cls = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-200';
                          } else if (selected) {
                            cls = 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--text-primary)]';
                          }
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() =>
                                !quizChecked && setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                              }
                              className={`text-left px-3 py-2 text-xs rounded-lg border cursor-pointer ${cls}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizChecked && (
                        <p className="text-xs text-[var(--text-secondary)] pt-1">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {!quizChecked ? (
                    <button
                      type="button"
                      onClick={() => setQuizChecked(true)}
                      className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Check Answers</span>
                    </button>
                  ) : (
                    firebaseUser && (
                      <button
                        type="button"
                        onClick={handleSaveQuizScore}
                        disabled={quizSaved}
                        className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-secondary)] text-white inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{quizSaved ? 'Score Recorded' : 'Save Score to Progress'}</span>
                      </button>
                    )
                  )}
                </div>

                {quizResult.worksheetActivities?.length > 0 && (
                  <div className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-2">
                    <p className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <BookOpenCheck className="w-4 h-4 text-[var(--accent-secondary)]" />
                      <span>Hands-On Practice Worksheet</span>
                    </p>
                    <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                      {quizResult.worksheetActivities.map((w, idx) => (
                        <li key={idx}>
                          {idx + 1}. {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-center space-y-2">
                <Sparkles className="w-8 h-8 text-[var(--accent-secondary)] mx-auto" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Generate an interactive quiz & worksheet on any subject
                </p>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Every quiz adapts to your age tier and preferred Indian language.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
