import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Briefcase,
  Compass,
  Flame,
  GraduationCap,
  HeartHandshake,
  Medal,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { useGurukul } from '../context/GurukulContext';
import { AGE_GROUPS, SAMPLE_STUDENT_ACHIEVEMENTS } from '../data/seedCatalog';
import { AgeGroup, AppSection, Course, UniqueHubId } from '../types/gurukul';

interface HomeShowcaseProps {
  onNavigate: (section: AppSection) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectAgeGroup: (ageGroup: AgeGroup) => void;
  onOpenCourse: (course: Course) => void;
  onOpenHub: (hubId: UniqueHubId) => void;
}

const IMAGE_PATHS = {
  hero: '/src/assets/images/hero_gurukul_campus_1795710929617.jpg',
  gurukul: '/src/assets/images/cat_gurukul_heritage_1795710930108.jpg',
  business: '/src/assets/images/cat_entrepreneurship_lab_1795710929921.jpg',
  sports: '/src/assets/images/cat_sports_academy_1795710930232.jpg',
  innovation: '/src/assets/images/cat_innovation_ai_1795710930675.jpg',
};

const ResilientImage: React.FC<{
  src: string;
  alt: string;
  fallbackTitle: string;
  className?: string;
}> = ({ src, alt, fallbackTitle, className = '' }) => {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[var(--accent-soft)] to-[var(--accent-warm-soft)] border border-[var(--border-hairline)] ${className}`}
      >
        <BookOpen className="w-8 h-8 text-[var(--accent-primary)] mb-2" />
        <span className="font-display text-sm font-semibold text-[var(--text-primary)]">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export const HomeShowcase: React.FC<HomeShowcaseProps> = ({
  onNavigate,
  onSelectCategory,
  onSelectAgeGroup,
  onOpenCourse,
  onOpenHub,
}) => {
  const { categories, courses, mentors, firebaseUser, signInWithGoogle } = useGurukul();
  const featuredCourses = courses.filter((c) => c.featured).slice(0, 6);

  return (
    <div className="pb-20 md:pb-12">
      {/* 1. Hero Section — Welcome to Bharat Gurukul 360 */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <p className="text-xs font-semibold tracking-wide text-[var(--accent-secondary)]">
                  Learn. Live. Lead. Build Bharat.
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)] leading-[1.12] [text-wrap:balance]">
                  Education for life, grounded in Indian wisdom and future skills.
                </h1>
                <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
                  Bharat Gurukul 360 unites modern academics, authentic Hindu Gurukul heritage, flexible homeschooling, youth entrepreneurship, and athletic discipline in one structured platform.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('catalog')}
                    className="px-6 py-3 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <span>Explore Courses & Curriculum</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('ai-guru')}
                    className="px-5 py-3 rounded-lg text-sm font-semibold border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Ask Acharya AI
                  </button>
                </div>
              </div>

              {/* Age-Wise Entry Bar */}
              <div className="pt-6 border-t border-[var(--border-hairline)]">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2.5">
                  Select an age-wise learning pathway
                </p>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => {
                        onSelectAgeGroup(age);
                        onNavigate('catalog');
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-secondary)] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[320px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-[var(--border-hairline)]">
                <ResilientImage
                  src={IMAGE_PATHS.hero}
                  alt="Modern Indian Gurukul architectural campus with sunlit colonnade and science studio"
                  fallbackTitle="Bharat Gurukul 360 Campus"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-Column Full-Width Metric Strip */}
          <div className="mt-12 pt-8 border-t border-[var(--border-hairline)] grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
                10 Domains
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                170+ structured academic, cultural & practical subjects
              </p>
            </div>
            <div>
              <p className="font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
                6 Age Tiers
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Early childhood (3–5) through young entrepreneurs (18+)
              </p>
            </div>
            <div>
              <p className="font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
                9 Role Portals
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Dedicated workspaces for students, parents, teachers & admins
              </p>
            </div>
            <div>
              <p className="font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
                10 Languages
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Child-safe AI learning assistant across Indian languages
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Explore Learning Categories (A–J) */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-[var(--border-hairline)]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)] [text-wrap:balance]">
              Explore 10 Learning Categories
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Every category spans beginner, intermediate, and advanced mastery and is dynamically manageable through the Admin Panel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="text-sm font-semibold text-[var(--accent-primary)] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Open Full Subject Index →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigate('catalog');
              }}
              className="text-left p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] hover:border-[var(--accent-secondary)] transition-colors flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-2">
                <p className="text-xs font-mono-num text-[var(--accent-secondary)] font-medium">
                  Category {cat.code} · {cat.subcategories.length} topics
                </p>
                <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  {cat.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {cat.subcategories.slice(0, 3).join(' · ')}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 3 & 4. Academic Learning + Hindu Gurukul Learning */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-[var(--border-hairline)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Academic Learning Pillar */}
          <div className="lg:col-span-5 p-7 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-medium text-[var(--accent-primary)]">
                01. Academic Learning
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
                Rigorous STEM, Languages & Critical Inquiry
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                From foundational numeracy and Telugu, Hindi, Sanskrit, and English fluency to Physics, Chemistry, Financial Mathematics, Coding, and Robotics.
              </p>
              <ul className="space-y-2.5 text-sm text-[var(--text-primary)] pt-2">
                <li className="pb-2 border-b border-[var(--border-hairline)]">
                  Mathematics, Physics, Chemistry & Biology with concept visualizations
                </li>
                <li className="pb-2 border-b border-[var(--border-hairline)]">
                  Computer Science, Artificial Intelligence & Robotics Engineering
                </li>
                <li>
                  Logical Reasoning, Financial Mathematics & Critical Thinking
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('cat_academic');
                onNavigate('catalog');
              }}
              className="self-start px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] cursor-pointer"
            >
              Browse Academic Subjects
            </button>
          </div>

          {/* Hindu Gurukul Learning Pillar */}
          <div className="lg:col-span-7 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] overflow-hidden grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-5 min-h-[240px]">
              <ResilientImage
                src={IMAGE_PATHS.gurukul}
                alt="Sanskrit texts, astronomy diagrams, and brass diya on teakwood study desk"
                fallbackTitle="Hindu Gurukul Heritage"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-7 p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-medium text-[var(--accent-secondary)]">
                  02. Hindu Gurukul Education
                </p>
                <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                  Indian Knowledge Systems, Texts & Dharma
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Age-appropriate, authentic exploration of Vedas, Upanishads, Bhagavad Gita, Ramayana, Mahabharata, Sanskrit, Ayurveda, Sulba Sutra mathematics, and Indian Astronomy—taught respectfully with historical context and inquiry.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onOpenHub('my-sanskrit-shastra');
                    onNavigate('hubs');
                  }}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent-secondary)] text-white hover:opacity-95 cursor-pointer"
                >
                  Open My Sanskrit & Shastra
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('cat_gurukul');
                    onNavigate('catalog');
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-secondary)] cursor-pointer"
                >
                  22 Gurukul Topics
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5, 6 & 7. Homeschooling, Entrepreneurship Academy & Sports Academy */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-[var(--border-hairline)] space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 5. Homeschooling */}
          <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-primary)]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-[var(--text-muted)]">
                03. Homeschooling Program
              </p>
              <h3 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                Parent-Led Custom Curricula & Portfolios
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Tailor daily schedules, learning pace, weekly assignments, and AI-assisted study plans to your child’s curiosity and rhythm, backed by mentor reviews.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenHub('my-homeschool');
                onNavigate('hubs');
              }}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg border border-[var(--border-hairline)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Open My Homeschool Planner
            </button>
          </div>

          {/* 6. Entrepreneurship Academy */}
          <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] overflow-hidden flex flex-col justify-between">
            <div className="h-44 overflow-hidden border-b border-[var(--border-hairline)]">
              <ResilientImage
                src={IMAGE_PATHS.business}
                alt="Young entrepreneur prototyping woodcraft and brand packaging"
                fallbackTitle="My Business Lab"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--accent-secondary)]">
                  04. Entrepreneurship Academy
                </p>
                <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  Launch a Mini-Venture & School Marketplace
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Students solve real community problems, manage INR budgets, build brands, and pitch products at youth startup challenges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenHub('my-business-lab');
                  onNavigate('hubs');
                }}
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors cursor-pointer"
              >
                Enter My Business Lab
              </button>
            </div>
          </div>

          {/* 7. Sports Academy */}
          <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] overflow-hidden flex flex-col justify-between">
            <div className="h-44 overflow-hidden border-b border-[var(--border-hairline)]">
              <ResilientImage
                src={IMAGE_PATHS.sports}
                alt="Sunrise outdoor yoga, athletics, and archery training ground"
                fallbackTitle="My Sports Academy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--accent-primary)]">
                  05. Sports & Physical Development
                </p>
                <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  Cricket, Archery, Kabaddi, Yoga & Nutrition
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Track daily physical training, pranayama consistency, coach feedback, and tournament readiness across 20 disciplines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenHub('my-sports-academy');
                  onNavigate('hubs');
                }}
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg border border-[var(--border-hairline)] hover:border-[var(--accent-secondary)] text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Open My Sports Academy
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. AI Learning Assistant & Innovation Lab */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-[var(--border-hairline)]">
        <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-[var(--accent-secondary)]">
                06. Acharya AI Personal Learning Assistant
              </p>
              <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)] [text-wrap:balance]">
                Bite-sized clarity, stories, quizzes & study plans in 10 Indian languages.
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Designed with strict age-group calibration and parental safety controls. Learners can ask questions in simple language, learn physics through Panchatantra-style stories, or generate instant revision worksheets.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-hairline)]">
                  <Bot className="w-4 h-4 text-[var(--accent-primary)] mb-1.5" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Child-Safe Tutor</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Parental control tiers</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-hairline)]">
                  <Compass className="w-4 h-4 text-[var(--accent-secondary)] mb-1.5" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Study Plan Builder</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Save straight to Firestore</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-hairline)]">
                  <Sparkles className="w-4 h-4 text-[var(--accent-gold)] mb-1.5" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Quiz & Worksheet Lab</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Auto-graded practice</p>
                </div>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onNavigate('ai-guru')}
                className="px-6 py-3 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Acharya AI Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 min-h-[280px]">
            <ResilientImage
              src={IMAGE_PATHS.innovation}
              alt="Student robotics rover, geometric polyhedra, and engineering blueprint"
              fallbackTitle="AI & Robotics Innovation Lab"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 9. Popular Courses */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-[var(--border-hairline)]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
              Popular Courses
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Interactive video lessons, live mentor sessions, worksheets, and verifiable completion certificates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="text-sm font-semibold text-[var(--accent-primary)] hover:underline whitespace-nowrap cursor-pointer"
          >
            View All {courses.length} Courses →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <div
              key={course.id}
              className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex flex-col justify-between space-y-5"
            >
              <div className="space-y-2.5">
                <p className="text-xs text-[var(--text-muted)]">
                  {course.categoryName} · {course.level} · {course.format}
                </p>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
                  {course.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>
              <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--text-muted)] truncate">
                  {course.instructorName} · {course.durationLabel}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenCourse(course)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Open Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Featured Teachers and Mentors */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-[var(--border-hairline)]">
        <div className="space-y-1.5 mb-8">
          <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
            Featured Teachers & Mentors
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Scholars, scientists, startup builders, and national coaches guiding learners personally.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {mentors.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3"
            >
              <div className="w-11 h-11 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-primary)] font-display font-semibold flex items-center justify-center text-base">
                {m.name
                  .split(' ')
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{m.name}</h3>
                <p className="text-xs text-[var(--accent-secondary)] mt-0.5">{m.title}</p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {m.bio}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-mono-num">
                {m.experienceYears} yrs experience · {m.category}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Student Achievements */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-[var(--border-hairline)]">
        <div className="space-y-1.5 mb-8">
          <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
            Student Achievements & Real Outcomes
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Recognizing sustained effort, creativity, enterprise, and character beyond examination marks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SAMPLE_STUDENT_ACHIEVEMENTS.map((item) => (
            <div
              key={item.student}
              className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)]">
                  {item.domain} · {item.ageGroup}
                </p>
                <p className="font-mono-num text-xl font-semibold text-[var(--accent-secondary)]">
                  {item.metric}
                </p>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  {item.achievement}
                </p>
              </div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] pt-2 border-t border-[var(--border-hairline)]">
                {item.student}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 12. Join Bharat Gurukul 360 + Quiet Footer */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--accent-primary)] text-white p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-medium text-amber-200">
              Education for Life. Values for Generations. Skills for the Future.
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight [text-wrap:balance]">
              Join Bharat Gurukul 360 today.
            </h2>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed">
              Sign in with Google to save course enrollments, homeschool schedules, student ventures, athletic logs, and verified certificates across devices.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {firebaseUser ? (
              <button
                type="button"
                onClick={() => onNavigate('portals')}
                className="px-6 py-3 rounded-lg text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Open My Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="px-6 py-3 rounded-lg text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Sign In & Begin Learning
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('hubs')}
              className="px-5 py-3 rounded-lg text-sm font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Explore All 10 Hubs
            </button>
          </div>
        </div>

        <footer className="mt-14 pt-8 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="space-y-1">
            <p className="font-display text-sm font-semibold text-[var(--text-primary)]">
              Bharat Gurukul 360
            </p>
            <p>Learn. Live. Lead. Build Bharat. · Holistic Online School & Homeschooling Ecosystem</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-[var(--text-primary)] cursor-pointer">
              Subject Index
            </button>
            <button type="button" onClick={() => onNavigate('ai-guru')} className="hover:text-[var(--text-primary)] cursor-pointer">
              Acharya AI
            </button>
            <button type="button" onClick={() => onNavigate('portals')} className="hover:text-[var(--text-primary)] cursor-pointer">
              Role Portals
            </button>
            <button type="button" onClick={() => onNavigate('admin')} className="hover:text-[var(--text-primary)] cursor-pointer">
              Admin Panel
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};
