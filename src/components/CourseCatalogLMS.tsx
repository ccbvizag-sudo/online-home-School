import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Play,
  Search,
  Video,
  X,
} from 'lucide-react';
import { useGurukul } from '../context/GurukulContext';
import { AGE_GROUPS } from '../data/seedCatalog';
import { AgeGroup, Course, CourseLevel, Lesson } from '../types/gurukul';

interface CourseCatalogLMSProps {
  selectedCategoryId: string;
  onChangeCategory: (id: string) => void;
  selectedAgeGroup: AgeGroup | 'All';
  onChangeAgeGroup: (age: AgeGroup | 'All') => void;
  activeCourse: Course | null;
  onSelectCourse: (course: Course | null) => void;
  onAskAIAboutTopic: (topic: string) => void;
}

export const CourseCatalogLMS: React.FC<CourseCatalogLMSProps> = ({
  selectedCategoryId,
  onChangeCategory,
  selectedAgeGroup,
  onChangeAgeGroup,
  activeCourse,
  onSelectCourse,
  onAskAIAboutTopic,
}) => {
  const {
    categories,
    courses,
    liveClasses,
    enrollments,
    firebaseUser,
    profile,
    signInWithGoogle,
    enrollInCourse,
    toggleLessonComplete,
    fetchLessonsForCourse,
    submitAssessment,
  } = useGurukul();

  const [tab, setTab] = useState<'courses' | 'index' | 'live'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'All'>('All');

  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [examNote, setExamNote] = useState('');
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (!activeCourse) {
      setCourseLessons([]);
      setActiveLesson(null);
      setExamSubmitted(false);
      setShowCertificate(false);
      return;
    }
    let mounted = true;
    setLessonsLoading(true);
    fetchLessonsForCourse(activeCourse.id)
      .then((list) => {
        if (!mounted) return;
        setCourseLessons(list);
        setActiveLesson(list[0] ?? null);
      })
      .finally(() => {
        if (mounted) setLessonsLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourse?.id]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((c) => {
      if (selectedCategoryId !== 'all' && c.categoryId !== selectedCategoryId) return false;
      if (selectedAgeGroup !== 'All' && c.ageGroup !== selectedAgeGroup) return false;
      if (levelFilter !== 'All' && c.level !== levelFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q)
      );
    });
  }, [courses, selectedCategoryId, selectedAgeGroup, levelFilter, searchQuery]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.filter(
          (s) => s.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.subcategories.length > 0 || cat.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  const activeEnrollment = activeCourse
    ? enrollments.find((e) => e.courseId === activeCourse.id)
    : undefined;

  const handleSubmitCourseReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse || !firebaseUser) return;
    await submitAssessment({
      studentName: profile?.displayName || firebaseUser.displayName || 'Learner',
      courseId: activeCourse.id,
      title: `${activeCourse.title} — Mastery Assessment`,
      score: 92,
      maxScore: 100,
      status: 'submitted',
      feedback: examNote.trim() || 'Completed course mastery reflection.',
    });
    setExamNote('');
    setExamSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-14 space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border-hairline)] pb-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--accent-secondary)]">
            Learning Management System & Curriculum
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
            Courses, Subject Index & Live Classes
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
            Browse beginner, intermediate, and advanced courses across all 10 domains and 6 age tiers, or explore all 170+ subjects in the comprehensive index.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] self-start">
          {[
            { id: 'courses' as const, label: 'Course Catalogue' },
            { id: 'index' as const, label: 'Subject Index (A–J)' },
            { id: 'live' as const, label: 'Live & Recorded' },
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

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, courses, Sanskrit, robotics, entrepreneurship..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>

        {tab === 'courses' && (
          <>
            <div className="md:col-span-3">
              <select
                value={selectedCategoryId}
                onChange={(e) => onChangeCategory(e.target.value)}
                aria-label="Filter by category"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              >
                <option value="all">All 10 Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}. {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedAgeGroup}
                onChange={(e) => onChangeAgeGroup(e.target.value as AgeGroup | 'All')}
                aria-label="Filter by age group"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              >
                <option value="All">All Age Groups</option>
                {AGE_GROUPS.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as CourseLevel | 'All')}
                aria-label="Filter by difficulty level"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Tab 1: Course Catalogue */}
      {tab === 'courses' && (
        <>
          {filteredCourses.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-3">
              <p className="text-base font-semibold text-[var(--text-primary)]">
                No courses match these filters yet
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Reset filters or ask Acharya AI to teach this topic immediately.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onChangeCategory('all');
                    onChangeAgeGroup('All');
                    setLevelFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] cursor-pointer"
                >
                  Reset Filters
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onAskAIAboutTopic(searchQuery)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white cursor-pointer"
                  >
                    Learn “{searchQuery}” with AI
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const enrolled = enrollments.find((e) => e.courseId === course.id);
                return (
                  <div
                    key={course.id}
                    className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-2.5">
                      <p className="text-xs text-[var(--text-muted)]">
                        {course.categoryName} · {course.ageGroup} · {course.level}
                      </p>
                      <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
                        {course.title}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-[var(--border-hairline)]">
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>{course.instructorName}</span>
                        <span className="font-mono-num">
                          {course.durationLabel} · +{course.pointsReward} pts
                        </span>
                      </div>

                      {enrolled && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-[var(--accent-secondary)]">
                            <span>Enrolled Progress</span>
                            <span className="font-mono-num">{enrolled.progressPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent-secondary)] transition-all"
                              style={{ width: `${enrolled.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectCourse(course)}
                          className="flex-1 py-2 px-3.5 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] cursor-pointer"
                        >
                          {enrolled ? 'Continue Learning' : 'Inspect & Start'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Comprehensive Subject Index (A-J) */}
      {tab === 'index' && (
        <div className="space-y-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
                <div>
                  <p className="text-xs font-mono-num text-[var(--accent-secondary)] font-semibold">
                    Category {cat.code}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{cat.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onChangeCategory(cat.id);
                    setTab('courses');
                  }}
                  className="text-xs font-semibold text-[var(--accent-primary)] hover:underline whitespace-nowrap cursor-pointer"
                >
                  Filter Courses →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {cat.subcategories.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => onAskAIAboutTopic(topic)}
                    className="text-left px-3 py-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--accent-secondary)] text-xs font-medium text-[var(--text-primary)] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{topic}</span>
                    <span className="text-[11px] text-[var(--accent-primary)] shrink-0">Study</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Live & Recorded Classes */}
      {tab === 'live' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {liveClasses.map((lc) => (
            <div
              key={lc.id}
              className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--accent-secondary)]">
                  {lc.status === 'live'
                    ? 'Live Session Active'
                    : lc.status === 'scheduled'
                      ? 'Upcoming Live Class'
                      : 'Recorded Session'}{' '}
                  · {lc.ageGroup}
                </p>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{lc.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {lc.subject} · Led by {lc.instructorName}
                </p>
              </div>
              <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between gap-3">
                <span className="text-xs font-mono-num text-[var(--text-muted)] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {lc.scheduledLabel} · {lc.durationMinutes} min
                </span>
                <button
                  type="button"
                  onClick={() => onAskAIAboutTopic(`${lc.title} (${lc.subject})`)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{lc.status === 'recorded' ? 'Review Notes' : 'Prepare with AI'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Course & Lesson Player Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-[var(--border-hairline)] flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  {activeCourse.categoryName} · {activeCourse.ageGroup} · {activeCourse.level}
                </p>
                <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)] mt-1">
                  {activeCourse.title}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Instructor: {activeCourse.instructorName} · {activeCourse.format} ·{' '}
                  {activeCourse.durationLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectCourse(null)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)] cursor-pointer"
                aria-label="Close course player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Enrollment & Progress Header */}
              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {activeEnrollment ? (
                  <>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
                        <span>
                          Course Progress ({activeEnrollment.completedLessonIds.length} /{' '}
                          {Math.max(courseLessons.length, activeCourse.lessonCount)} lessons)
                        </span>
                        <span className="font-mono-num">{activeEnrollment.progressPercent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden border border-[var(--border-hairline)]">
                        <div
                          className="h-full bg-[var(--accent-secondary)] transition-all"
                          style={{ width: `${activeEnrollment.progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Attendance logged: {activeEnrollment.attendanceCount} sessions ·{' '}
                        {activeEnrollment.teacherFeedback}
                      </p>
                    </div>
                    {activeEnrollment.certificateIssued && (
                      <button
                        type="button"
                        onClick={() => setShowCertificate((v) => !v)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent-secondary)] text-white inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>{showCertificate ? 'Hide Certificate' : 'View Certificate'}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Enroll to track lessons, attendance & earn +{activeCourse.pointsReward} points
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Progress and completion certificates are saved securely to your Gurukul account.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => (firebaseUser ? enrollInCourse(activeCourse) : signInWithGoogle())}
                      className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {firebaseUser ? 'Enroll in Course' : 'Sign In to Enroll'}
                    </button>
                  </>
                )}
              </div>

              {/* Verifiable Certificate Preview */}
              {showCertificate && activeEnrollment?.certificateIssued && (
                <div className="p-8 rounded-xl border-2 border-[var(--accent-gold)] bg-[var(--bg-canvas)] text-center space-y-3">
                  <p className="text-xs font-semibold tracking-widest text-[var(--accent-secondary)]">
                    BHARAT GURUKUL 360 · CERTIFICATE OF MASTERY
                  </p>
                  <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                    {profile?.displayName || firebaseUser?.displayName || 'Gurukul Scholar'}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
                    Has successfully completed all lessons, practical worksheets, and attendance milestones for{' '}
                    <strong className="text-[var(--text-primary)]">{activeCourse.title}</strong> ({activeCourse.level}).
                  </p>
                  <p className="text-xs font-mono-num text-[var(--text-muted)] pt-2">
                    Mentor: {activeCourse.instructorName} · Credential ID: {activeEnrollment.id}
                  </p>
                </div>
              )}

              {/* Lesson Split Player */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Course Curriculum
                  </h3>
                  {lessonsLoading ? (
                    <p className="text-xs text-[var(--text-muted)]">Loading lessons...</p>
                  ) : courseLessons.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)]">
                      Lessons can be added from the Admin Panel under Courses.
                    </p>
                  ) : (
                    courseLessons.map((lesson) => {
                      const done = activeEnrollment?.completedLessonIds.includes(lesson.id);
                      const isCurrent = activeLesson?.id === lesson.id;
                      return (
                        <div
                          key={lesson.id}
                          className={`p-3 rounded-lg border transition-colors flex items-start justify-between gap-2 ${
                            isCurrent
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)]'
                              : 'border-[var(--border-hairline)]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveLesson(lesson)}
                            className="text-left flex-1 min-w-0 cursor-pointer"
                          >
                            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                              {lesson.title}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                              {lesson.type} · {lesson.durationMinutes} min
                            </p>
                          </button>
                          {activeEnrollment && (
                            <button
                              type="button"
                              onClick={() =>
                                toggleLessonComplete(
                                  activeEnrollment,
                                  lesson.id,
                                  courseLessons.length,
                                  activeCourse.pointsReward
                                )
                              }
                              title={done ? 'Mark incomplete' : 'Mark lesson complete'}
                              className="p-1 text-[var(--accent-secondary)] cursor-pointer shrink-0"
                            >
                              {done ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <Circle className="w-5 h-5 text-[var(--text-muted)]" />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="lg:col-span-7 space-y-5">
                  {activeLesson ? (
                    <div className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[var(--accent-secondary)]">
                          {activeLesson.type.toUpperCase()} MODULE · {activeLesson.durationMinutes} MIN
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCourse(null);
                            onAskAIAboutTopic(`${activeCourse.title}: ${activeLesson.title}`);
                          }}
                          className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                        >
                          Discuss with Acharya AI →
                        </button>
                      </div>
                      <h4 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                        {activeLesson.title}
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {activeLesson.summary}
                      </p>

                      <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-2">
                        <p className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
                          Practical Worksheet & Activity
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {activeLesson.worksheetPrompt}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {activeLesson.resourceUrl && (
                          <a
                            href={activeLesson.resourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)] inline-flex items-center gap-1.5 hover:border-[var(--accent-primary)]"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Open Study Material / PDF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {activeEnrollment && (
                          <button
                            type="button"
                            onClick={() =>
                              toggleLessonComplete(
                                activeEnrollment,
                                activeLesson.id,
                                courseLessons.length,
                                activeCourse.pointsReward
                              )
                            }
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>
                              {activeEnrollment.completedLessonIds.includes(activeLesson.id)
                                ? 'Lesson Completed'
                                : 'Complete Lesson (+25 pts)'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)]">
                      {activeCourse.description}
                    </div>
                  )}

                  {/* Assessment Reflection Submission */}
                  {firebaseUser && (
                    <form
                      onSubmit={handleSubmitCourseReflection}
                      className="p-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-3"
                    >
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        Submit Course Assignment / Reflection
                      </p>
                      <textarea
                        rows={2}
                        value={examNote}
                        onChange={(e) => setExamNote(e.target.value)}
                        placeholder="Summarize what you practiced or built in this module..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                      />
                      <div className="flex items-center justify-between">
                        {examSubmitted ? (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Submitted to your teacher assessment log.
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">
                            Saved to Firestore assessments
                          </span>
                        )}
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-secondary)] text-white cursor-pointer"
                        >
                          Submit Assessment
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
