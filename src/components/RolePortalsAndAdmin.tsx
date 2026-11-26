import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { useGurukul } from '../context/GurukulContext';
import { AGE_GROUPS, USER_ROLE_LABELS } from '../data/seedCatalog';
import {
  AgeGroup,
  AppSection,
  CourseFormat,
  CourseLevel,
  LessonType,
  ParentalControlLevel,
  UniqueHubId,
  UserRole,
} from '../types/gurukul';

interface RolePortalsProps {
  onNavigate: (sec: AppSection) => void;
  onOpenHub: (hub: UniqueHubId) => void;
}

export const RolePortalsView: React.FC<RolePortalsProps> = ({ onNavigate, onOpenHub }) => {
  const {
    firebaseUser,
    profile,
    isAdmin,
    activeRoleView,
    setActiveRoleView,
    signInWithGoogle,
    updateMyProfile,
    courses,
    enrollments,
    homeschoolPlans,
    ventures,
    sportsLogs,
    liveClasses,
    assessments,
    categories,
  } = useGurukul();

  const roles = Object.keys(USER_ROLE_LABELS) as UserRole[];
  const [savingPref, setSavingPref] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-14 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border-hairline)] pb-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--accent-secondary)]">
            Role-Based Access & Dedicated Workspaces
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
            9 Ecosystem Dashboards
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
            Switch between specialized views for students, parents, homeschooling families, teachers, coaches, venture mentors, creators, and administrators.
          </p>
        </div>

        {!firebaseUser ? (
          <button
            type="button"
            onClick={signInWithGoogle}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white self-start cursor-pointer"
          >
            Sign In to Sync Your Role
          </button>
        ) : (
          <div className="text-xs text-[var(--text-secondary)]">
            Signed in as <strong className="text-[var(--text-primary)]">{profile?.displayName}</strong> ({USER_ROLE_LABELS[profile?.role || 'student'].label})
          </div>
        )}
      </div>

      {/* 9 Role Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {roles.map((r) => {
          const active = activeRoleView === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setActiveRoleView(r)}
              className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                active
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--accent-secondary)]'
              }`}
            >
              <p className="text-xs font-semibold truncate">{USER_ROLE_LABELS[r].label}</p>
              <p className={`text-[11px] mt-0.5 line-clamp-1 ${active ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                {USER_ROLE_LABELS[r].scope}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Role Dashboard Canvas */}
      <div className="p-7 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-hairline)]">
          <div>
            <p className="text-xs text-[var(--accent-secondary)] font-semibold">
              Active Portal · {USER_ROLE_LABELS[activeRoleView].label}
            </p>
            <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)] mt-1">
              {USER_ROLE_LABELS[activeRoleView].scope}
            </h2>
          </div>

          {firebaseUser &&
            profile &&
            profile.role !== activeRoleView &&
            (isAdmin || (activeRoleView !== 'super_admin' && activeRoleView !== 'school_admin')) && (
              <button
                type="button"
                disabled={savingPref}
                onClick={async () => {
                  setSavingPref(true);
                  try {
                    await updateMyProfile({ role: activeRoleView });
                  } finally {
                    setSavingPref(false);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] cursor-pointer"
              >
                {savingPref ? 'Saving...' : `Set ${USER_ROLE_LABELS[activeRoleView].label} as My Default Role`}
              </button>
            )}
        </div>

        {/* Metrics Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
            <p className="text-xs text-[var(--text-muted)]">Learning Categories</p>
            <p className="font-mono-num text-2xl font-semibold text-[var(--text-primary)] mt-1">
              {categories.length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
            <p className="text-xs text-[var(--text-muted)]">Catalog Courses</p>
            <p className="font-mono-num text-2xl font-semibold text-[var(--text-primary)] mt-1">
              {courses.length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
            <p className="text-xs text-[var(--text-muted)]">Active Enrollments</p>
            <p className="font-mono-num text-2xl font-semibold text-[var(--accent-secondary)] mt-1">
              {enrollments.length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
            <p className="text-xs text-[var(--text-muted)]">Live & Recorded Classes</p>
            <p className="font-mono-num text-2xl font-semibold text-[var(--text-primary)] mt-1">
              {liveClasses.length}
            </p>
          </div>
        </div>

        {/* Role-Specific Actionable Workflows */}
        {(activeRoleView === 'super_admin' || activeRoleView === 'school_admin') && (
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Curriculum Governance, Categories, Users & Live Classes
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Add unlimited categories, subjects, courses, lessons, teachers, and monitor system-wide progress in the Admin Control Panel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white shrink-0 cursor-pointer"
            >
              Open Admin Control Panel
            </button>
          </div>
        )}

        {activeRoleView === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => {
                onOpenHub('my-gurukul');
                onNavigate('hubs');
              }}
              className="text-left p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] cursor-pointer"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">My Gurukul Progress</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {profile?.points ?? 120} points · {profile?.streakDays ?? 3}-day streak · {assessments.length} assessments
              </p>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="text-left p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] cursor-pointer"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">Resume LMS Courses</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Continue video lessons, worksheets, and earn completion certificates.
              </p>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ai-guru')}
              className="text-left p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] cursor-pointer"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">Study with Acharya AI</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Ask doubts, request stories, and generate instant revision quizzes.
              </p>
            </button>
          </div>
        )}

        {(activeRoleView === 'parent' || activeRoleView === 'homeschool_family') && (
          <div className="space-y-4">
            {profile && (
              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Parental AI Safety & Content Filter
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Controls the language complexity and age appropriateness of Acharya AI responses.
                  </p>
                </div>
                <select
                  value={profile.parentalControlLevel}
                  onChange={(e) =>
                    updateMyProfile({ parentalControlLevel: e.target.value as ParentalControlLevel })
                  }
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                >
                  <option value="strict">Strict Child-Safe</option>
                  <option value="moderate">Moderate Guided</option>
                  <option value="standard">Standard Scholarly</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Saved Homeschool Schedules ({homeschoolPlans.length})
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Customize pacing, daily schedules, and weekly objectives for each child.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onOpenHub('my-homeschool');
                    onNavigate('hubs');
                  }}
                  className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  Manage Homeschool Plans →
                </button>
              </div>
              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Assessment & Mastery Records ({assessments.length})
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Review recent quiz scores, attendance milestones, and teacher feedback.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  Inspect Course Progress →
                </button>
              </div>
            </div>
          </div>
        )}

        {(activeRoleView === 'teacher' || activeRoleView === 'content_creator') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-2">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Course & Lesson Authoring
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Create structured courses, upload lesson resources, and publish worksheets across all 6 age groups.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Open Curriculum Editor →
              </button>
            </div>
            <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-2">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Live Class Calendar ({liveClasses.length} sessions)
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Review upcoming live classes and recorded sessions for your cohorts.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                View Live Schedule →
              </button>
            </div>
          </div>
        )}

        {activeRoleView === 'sports_coach' && (
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Sports & Fitness Tracking ({sportsLogs.length} logged sessions)
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Track archery, cricket, athletics, yoga, and nutrition consistency across student cohorts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenHub('my-sports-academy');
                onNavigate('hubs');
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              Open Sports Academy
            </button>
          </div>
        )}

        {activeRoleView === 'entrepreneur_mentor' && (
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Youth Venture Portfolio ({ventures.length} active student businesses)
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Review student unit economics, prototypes, and school marketplace readiness.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenHub('my-business-lab');
                onNavigate('hubs');
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              Review Ventures in Business Lab
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminControlPanel: React.FC = () => {
  const {
    firebaseUser,
    isAdmin,
    signInWithGoogle,
    categories,
    courses,
    mentors,
    liveClasses,
    libraryResources,
    allUsers,
    catalogSeeded,
    seedingBusy,
    seedInitialCatalog,
    upsertCategory,
    deleteCategory,
    upsertCourse,
    deleteCourse,
    upsertLesson,
    upsertMentor,
    upsertLiveClass,
    upsertLibraryResource,
    updateUserRoleByAdmin,
  } = useGurukul();

  const [tab, setTab] = useState<'categories' | 'courses' | 'mentors' | 'live' | 'library' | 'users'>('categories');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Category Form
  const [catCode, setCatCode] = useState('K');
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSubs, setCatSubs] = useState('');
  const [selectedCatToEdit, setSelectedCatToEdit] = useState<string>('');
  const [newSubTopic, setNewSubTopic] = useState('');

  // Course Form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCatId, setCourseCatId] = useState(categories[0]?.id || 'cat_academic');
  const [courseSubject, setCourseSubject] = useState('');
  const [courseAge, setCourseAge] = useState<AgeGroup>('Middle School (12-14)');
  const [courseLevel, setCourseLevel] = useState<CourseLevel>('Beginner');
  const [courseInstructor, setCourseInstructor] = useState('Acharya Raghavendra Sharma');
  const [courseFormat, setCourseFormat] = useState<CourseFormat>('Hybrid');
  const [courseDuration, setCourseDuration] = useState('6 Weeks');
  const [courseDesc, setCourseDesc] = useState('');

  // Lesson Form
  const [lessonCourseId, setLessonCourseId] = useState(courses[0]?.id || '');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('video');
  const [lessonDuration, setLessonDuration] = useState(30);
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonUrl, setLessonUrl] = useState('https://archive.org/');
  const [lessonWorksheet, setLessonWorksheet] = useState('');

  // Mentor Form
  const [mentorName, setMentorName] = useState('');
  const [mentorTitle, setMentorTitle] = useState('');
  const [mentorCat, setMentorCat] = useState('Academic Education');
  const [mentorSpec, setMentorSpec] = useState('');
  const [mentorBio, setMentorBio] = useState('');
  const [mentorYears, setMentorYears] = useState(8);

  // Live Class Form
  const [liveTitle, setLiveTitle] = useState('');
  const [liveSubject, setLiveSubject] = useState('');
  const [liveInstructor, setLiveInstructor] = useState('Vidushi Meenakshi Iyer');
  const [liveAge, setLiveAge] = useState<AgeGroup>('Preparatory (9-11)');
  const [liveWhen, setLiveWhen] = useState('Fri · 05:00 PM IST');
  const [liveStatus, setLiveStatus] = useState<'scheduled' | 'live' | 'recorded'>('scheduled');

  // Library Form
  const [libTitle, setLibTitle] = useState('');
  const [libAuthor, setLibAuthor] = useState('');
  const [libCat, setLibCat] = useState('Hindu Gurukul Education');
  const [libType, setLibType] = useState<'Book' | 'Story' | 'Worksheet' | 'Shastra' | 'Project'>('Book');
  const [libSummary, setLibSummary] = useState('');

  const flash = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  if (!firebaseUser) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
        <ShieldCheck className="w-10 h-10 text-[var(--accent-secondary)] mx-auto" />
        <h1 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
          Admin & Curriculum Governance Panel
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Sign in with your administrator Google account to add categories, subjects, courses, lessons, mentors, and manage user roles in real time.
        </p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="px-6 py-3 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white cursor-pointer"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
        <ShieldCheck className="w-10 h-10 text-[var(--accent-secondary)] mx-auto" />
        <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
          Administrator Permission Required
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Your signed-in account ({firebaseUser.email}) does not currently hold Super Admin privileges. Catalog writes are protected by Firestore security rules.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-14 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[var(--accent-secondary)]">
            Super Admin Governance · Live Firestore Sync
          </p>
          <h1 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
            Admin Control Panel
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage unlimited categories, subjects, courses, lessons, mentors, live classes, library items, and user roles without editing application code.
          </p>
        </div>

        <button
          type="button"
          disabled={seedingBusy}
          onClick={async () => {
            await seedInitialCatalog();
            flash('Initial catalog synced to Firestore.');
          }}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] inline-flex items-center gap-2 self-start cursor-pointer"
        >
          <Database className="w-4 h-4 text-[var(--accent-secondary)]" />
          <span>{seedingBusy ? 'Syncing...' : catalogSeeded ? 'Re-Sync Default Seed Data' : 'Initialize Catalog in Firestore'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-lg border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'categories' as const, label: `Categories & Subjects (${categories.length})` },
          { id: 'courses' as const, label: `Courses & Lessons (${courses.length})` },
          { id: 'mentors' as const, label: `Teachers & Mentors (${mentors.length})` },
          { id: 'live' as const, label: `Live Classes (${liveClasses.length})` },
          { id: 'library' as const, label: `Knowledge Library (${libraryResources.length})` },
          { id: 'users' as const, label: `Users & Reports (${allUsers.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
              tab === t.id
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-hairline)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. Categories & Subcategories */}
      {tab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!catName.trim()) return;
              const id = `cat_${Date.now()}`;
              await upsertCategory({
                id,
                code: catCode.trim() || 'NEW',
                name: catName.trim(),
                description: catDesc.trim() || 'Custom learning category added via Admin Panel.',
                subcategories: catSubs
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                order: categories.length + 1,
              });
              setCatName('');
              setCatDesc('');
              setCatSubs('');
              flash('New learning category added.');
            }}
            className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4 self-start"
          >
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Add New Learning Category
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <input
                type="text"
                value={catCode}
                onChange={(e) => setCatCode(e.target.value)}
                placeholder="Code"
                className="col-span-1 px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Category Name"
                className="col-span-3 px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
            <textarea
              rows={2}
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Category description..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <textarea
              rows={2}
              value={catSubs}
              onChange={(e) => setCatSubs(e.target.value)}
              placeholder="Subcategories / subjects (comma separated)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              Create Category
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono-num text-[var(--accent-secondary)]">
                      Category {cat.code} · {cat.subcategories.length} subjects
                    </p>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{cat.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCatToEdit(selectedCatToEdit === cat.id ? '' : cat.id)}
                      className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                    >
                      + Add Topic
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                      aria-label="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {cat.subcategories.join(' · ')}
                </p>

                {selectedCatToEdit === cat.id && (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newSubTopic}
                      onChange={(e) => setNewSubTopic(e.target.value)}
                      placeholder="New learning topic..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newSubTopic.trim()) return;
                        await upsertCategory({
                          ...cat,
                          subcategories: [...cat.subcategories, newSubTopic.trim()],
                        });
                        setNewSubTopic('');
                        setSelectedCatToEdit('');
                        flash(`Added topic to ${cat.name}.`);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-secondary)] text-white cursor-pointer"
                    >
                      Save Topic
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Courses & Lessons */}
      {tab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!courseTitle.trim()) return;
                const catObj = categories.find((c) => c.id === courseCatId) || categories[0];
                const id = `course_${Date.now()}`;
                await upsertCourse({
                  id,
                  title: courseTitle.trim(),
                  categoryId: catObj.id,
                  categoryName: catObj.name,
                  subject: courseSubject.trim() || catObj.subcategories[0] || 'Core Subject',
                  ageGroup: courseAge,
                  level: courseLevel,
                  instructorName: courseInstructor.trim() || 'Gurukul Acharya',
                  description: courseDesc.trim() || 'Structured course with video, reading, and worksheet modules.',
                  durationLabel: courseDuration,
                  format: courseFormat,
                  lessonCount: 1,
                  pointsReward: 150,
                  featured: true,
                });
                setLessonCourseId(id);
                setCourseTitle('');
                setCourseDesc('');
                flash('Course created in Firestore.');
              }}
              className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3"
            >
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                Create Course
              </h2>
              <input
                type="text"
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Course Title"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <select
                  value={courseCatId}
                  onChange={(e) => setCourseCatId(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={courseSubject}
                  onChange={(e) => setCourseSubject(e.target.value)}
                  placeholder="Subject"
                  className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={courseAge}
                  onChange={(e) => setCourseAge(e.target.value as AgeGroup)}
                  className="px-2 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  {AGE_GROUPS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <select
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value as CourseLevel)}
                  className="px-2 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select
                  value={courseFormat}
                  onChange={(e) => setCourseFormat(e.target.value as CourseFormat)}
                  className="px-2 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Video">Video</option>
                  <option value="Live">Live</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={courseInstructor}
                  onChange={(e) => setCourseInstructor(e.target.value)}
                  placeholder="Instructor Name"
                  className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
                <input
                  type="text"
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  placeholder="Duration (e.g. 6 Weeks)"
                  className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
              </div>
              <textarea
                rows={2}
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                placeholder="Course description..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white cursor-pointer"
              >
                Publish Course
              </button>
            </form>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const targetCourse = lessonCourseId || courses[0]?.id;
                if (!targetCourse || !lessonTitle.trim()) return;
                await upsertLesson({
                  id: `lesson_${Date.now()}`,
                  courseId: targetCourse,
                  title: lessonTitle.trim(),
                  order: 1,
                  type: lessonType,
                  durationMinutes: Number(lessonDuration) || 25,
                  summary: lessonSummary.trim() || 'Interactive lesson module.',
                  resourceUrl: lessonUrl.trim(),
                  worksheetPrompt: lessonWorksheet.trim() || 'Complete the reflection activity.',
                });
                setLessonTitle('');
                setLessonSummary('');
                setLessonWorksheet('');
                flash('Lesson added to course.');
              }}
              className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3"
            >
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                Add Lesson / Video / PDF Resource
              </h2>
              <select
                value={lessonCourseId || courses[0]?.id || ''}
                onChange={(e) => setLessonCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Lesson Title"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value as LessonType)}
                  className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  <option value="video">Video Lesson</option>
                  <option value="reading">PDF / Reading</option>
                  <option value="activity">Practical Activity</option>
                  <option value="quiz">Quiz</option>
                  <option value="live">Live Session</option>
                </select>
                <input
                  type="number"
                  min={5}
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(Number(e.target.value))}
                  placeholder="Minutes"
                  className="px-3 py-2 text-xs font-mono-num rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
              </div>
              <input
                type="url"
                value={lessonUrl}
                onChange={(e) => setLessonUrl(e.target.value)}
                placeholder="PDF / Document / Video URL"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <textarea
                rows={2}
                value={lessonSummary}
                onChange={(e) => setLessonSummary(e.target.value)}
                placeholder="Lesson summary..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                value={lessonWorksheet}
                onChange={(e) => setLessonWorksheet(e.target.value)}
                placeholder="Worksheet prompt..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg text-xs font-semibold bg-[var(--accent-secondary)] text-white cursor-pointer"
              >
                Add Lesson to Course
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {c.categoryName} · {c.ageGroup} · {c.level}
                  </p>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{c.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {c.instructorName} · {c.format} · {c.durationLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCourse(c.id)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                  aria-label="Delete course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Mentors */}
      {tab === 'mentors' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!mentorName.trim()) return;
              await upsertMentor({
                id: `mentor_${Date.now()}`,
                name: mentorName.trim(),
                title: mentorTitle.trim() || 'Gurukul Mentor',
                category: mentorCat,
                specialty: mentorSpec.trim() || 'Holistic Learning',
                bio: mentorBio.trim() || 'Dedicated educator on Bharat Gurukul 360.',
                experienceYears: Number(mentorYears) || 5,
                featured: true,
              });
              setMentorName('');
              setMentorTitle('');
              setMentorSpec('');
              setMentorBio('');
              flash('Teacher/Mentor profile published.');
            }}
            className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3 self-start"
          >
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              Add Teacher or Mentor
            </h2>
            <input
              type="text"
              required
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <input
              type="text"
              value={mentorTitle}
              onChange={(e) => setMentorTitle(e.target.value)}
              placeholder="Title (e.g., Robotics Lead)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={mentorCat}
                onChange={(e) => setMentorCat(e.target.value)}
                placeholder="Category"
                className="px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
              <input
                type="number"
                min={1}
                value={mentorYears}
                onChange={(e) => setMentorYears(Number(e.target.value))}
                placeholder="Years Exp"
                className="px-3 py-2 text-xs font-mono-num rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
            <input
              type="text"
              value={mentorSpec}
              onChange={(e) => setMentorSpec(e.target.value)}
              placeholder="Specialty"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <textarea
              rows={2}
              value={mentorBio}
              onChange={(e) => setMentorBio(e.target.value)}
              placeholder="Short bio..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              Add Mentor
            </button>
          </form>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mentors.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-1.5"
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{m.name}</p>
                <p className="text-xs text-[var(--accent-secondary)]">{m.title}</p>
                <p className="text-xs text-[var(--text-secondary)]">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Live Classes */}
      {tab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!liveTitle.trim()) return;
              await upsertLiveClass({
                id: `live_${Date.now()}`,
                title: liveTitle.trim(),
                subject: liveSubject.trim() || 'Holistic Session',
                instructorName: liveInstructor,
                ageGroup: liveAge,
                scheduledLabel: liveWhen,
                durationMinutes: 45,
                status: liveStatus,
              });
              setLiveTitle('');
              setLiveSubject('');
              flash('Live class scheduled.');
            }}
            className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3 self-start"
          >
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              Schedule Live / Recorded Class
            </h2>
            <input
              type="text"
              required
              value={liveTitle}
              onChange={(e) => setLiveTitle(e.target.value)}
              placeholder="Class Title"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <input
              type="text"
              value={liveSubject}
              onChange={(e) => setLiveSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <input
              type="text"
              value={liveInstructor}
              onChange={(e) => setLiveInstructor(e.target.value)}
              placeholder="Instructor"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={liveAge}
                onChange={(e) => setLiveAge(e.target.value as AgeGroup)}
                className="px-2 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              >
                {AGE_GROUPS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                value={liveStatus}
                onChange={(e) => setLiveStatus(e.target.value as 'scheduled' | 'live' | 'recorded')}
                className="px-2 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live Now</option>
                <option value="recorded">Recorded</option>
              </select>
            </div>
            <input
              type="text"
              value={liveWhen}
              onChange={(e) => setLiveWhen(e.target.value)}
              placeholder="Time label (e.g., Sat · 10:00 AM IST)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              Save Live Class
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {liveClasses.map((lc) => (
              <div
                key={lc.id}
                className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-[var(--accent-secondary)]">
                    {lc.status} · {lc.scheduledLabel}
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{lc.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {lc.instructorName} · {lc.ageGroup}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Knowledge Library */}
      {tab === 'library' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!libTitle.trim()) return;
              await upsertLibraryResource({
                id: `lib_${Date.now()}`,
                title: libTitle.trim(),
                author: libAuthor.trim() || 'Bharat Gurukul Editorial',
                category: libCat,
                ageGroup: 'Preparatory (9-11)',
                resourceType: libType,
                summary: libSummary.trim() || 'Curated digital resource.',
              });
              setLibTitle('');
              setLibSummary('');
              flash('Resource added to Bharat Knowledge Library.');
            }}
            className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3 self-start"
          >
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              Add Book, Story or Worksheet
            </h2>
            <input
              type="text"
              required
              value={libTitle}
              onChange={(e) => setLibTitle(e.target.value)}
              placeholder="Resource Title"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <input
              type="text"
              value={libAuthor}
              onChange={(e) => setLibAuthor(e.target.value)}
              placeholder="Author / Source"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={libType}
                onChange={(e) =>
                  setLibType(e.target.value as 'Book' | 'Story' | 'Worksheet' | 'Shastra' | 'Project')
                }
                className="px-2 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              >
                <option value="Book">Book</option>
                <option value="Story">Story</option>
                <option value="Worksheet">Worksheet</option>
                <option value="Shastra">Shastra</option>
                <option value="Project">Project</option>
              </select>
              <input
                type="text"
                value={libCat}
                onChange={(e) => setLibCat(e.target.value)}
                placeholder="Category"
                className="px-2 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
            <textarea
              rows={2}
              value={libSummary}
              onChange={(e) => setLibSummary(e.target.value)}
              placeholder="Summary..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white cursor-pointer"
            >
              Publish to Library
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {libraryResources.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)]"
              >
                <p className="text-xs text-[var(--accent-secondary)]">
                  {r.resourceType} · {r.category}
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{r.title}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{r.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Users & Reports */}
      {tab === 'users' && (
        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="p-5 border-b border-[var(--border-hairline)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--accent-primary)]" />
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                Registered Users & Role Assignment
              </h2>
            </div>
            <span className="font-mono-num text-xs text-[var(--text-muted)]">
              {allUsers.length} accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-surface)] border-b border-[var(--border-hairline)] text-[var(--text-muted)]">
                <tr>
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Age Group</th>
                  <th className="py-3 px-4 font-medium text-right">Points</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {allUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-[var(--bg-surface)]">
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {u.displayName}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{u.email}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{u.ageGroup}</td>
                    <td className="py-3 px-4 font-mono-num text-right text-[var(--accent-secondary)]">
                      {u.points}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          await updateUserRoleByAdmin(u.uid, e.target.value as UserRole);
                          flash(`Updated ${u.displayName}'s role.`);
                        }}
                        className="px-2 py-1 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                      >
                        {(Object.keys(USER_ROLE_LABELS) as UserRole[]).map((roleKey) => (
                          <option key={roleKey} value={roleKey}>
                            {USER_ROLE_LABELS[roleKey].label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
