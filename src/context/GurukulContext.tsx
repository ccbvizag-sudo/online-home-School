import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  AccentPalette,
  AgeGroup,
  AssessmentSubmission,
  BusinessVenture,
  Course,
  Enrollment,
  HomeschoolPlan,
  LearningCategory,
  Lesson,
  LibraryResource,
  LiveClass,
  MentorProfile,
  ParentalControlLevel,
  SportsLog,
  ThemeMode,
  UserProfile,
  UserRole,
} from '../types/gurukul';
import {
  INITIAL_CATEGORIES,
  INITIAL_COURSES,
  INITIAL_LESSONS,
  INITIAL_LIBRARY_RESOURCES,
  INITIAL_LIVE_CLASSES,
  INITIAL_MENTORS,
} from '../data/seedCatalog';

const ADMIN_EMAIL = 'ccbvizag@gmail.com';

interface GurukulContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  isAdmin: boolean;
  activeRoleView: UserRole;
  setActiveRoleView: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;

  // Theme & Color
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accentPalette: AccentPalette;
  setAccentPalette: (palette: AccentPalette) => void;

  // Data Collections
  categories: LearningCategory[];
  courses: Course[];
  mentors: MentorProfile[];
  liveClasses: LiveClass[];
  libraryResources: LibraryResource[];
  enrollments: Enrollment[];
  homeschoolPlans: HomeschoolPlan[];
  ventures: BusinessVenture[];
  sportsLogs: SportsLog[];
  assessments: AssessmentSubmission[];
  allUsers: UserProfile[];
  catalogSeeded: boolean;
  seedingBusy: boolean;
  seedInitialCatalog: () => Promise<void>;

  // User Actions
  updateMyProfile: (updates: Partial<Pick<UserProfile, 'displayName' | 'ageGroup' | 'preferredLanguage' | 'parentalControlLevel' | 'role'>>) => Promise<void>;
  enrollInCourse: (course: Course) => Promise<void>;
  toggleLessonComplete: (enrollment: Enrollment, lessonId: string, totalLessons: number, courseReward: number) => Promise<void>;
  fetchLessonsForCourse: (courseId: string) => Promise<Lesson[]>;
  saveHomeschoolPlan: (plan: Omit<HomeschoolPlan, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteHomeschoolPlan: (planId: string) => Promise<void>;
  saveBusinessVenture: (venture: Omit<BusinessVenture, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateVentureStage: (ventureId: string, stage: BusinessVenture['stage'], revenueInr: number) => Promise<void>;
  saveSportsLog: (log: Omit<SportsLog, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  submitAssessment: (sub: Omit<AssessmentSubmission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Admin Actions
  upsertCategory: (cat: Omit<LearningCategory, 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  upsertCourse: (course: Omit<Course, 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  upsertLesson: (lesson: Omit<Lesson, 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  upsertMentor: (mentor: Omit<MentorProfile, 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  upsertLiveClass: (liveClass: Omit<LiveClass, 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  upsertLibraryResource: (res: Omit<LibraryResource, 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUserRoleByAdmin: (targetUid: string, role: UserRole) => Promise<void>;
}

const GurukulContext = createContext<GurukulContextValue | null>(null);

function makeSlugId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

export const GurukulProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdminDoc, setIsAdminDoc] = useState(false);
  const [activeRoleView, setActiveRoleView] = useState<UserRole>('student');

  // Theme & Palette persisted in localStorage
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('bg360_theme') as ThemeMode | null;
    return saved === 'dark' || saved === 'parchment' ? saved : 'light';
  });
  const [accentPalette, setAccentPaletteState] = useState<AccentPalette>(() => {
    const saved = localStorage.getItem('bg360_accent') as AccentPalette | null;
    return saved === 'indigo-gold' || saved === 'teal-ochre' || saved === 'forest-sandalwood'
      ? saved
      : 'navy-saffron';
  });

  // Catalog state (defaults to seed data until Firestore returns docs)
  const [firestoreCategories, setFirestoreCategories] = useState<LearningCategory[]>([]);
  const [firestoreCourses, setFirestoreCourses] = useState<Course[]>([]);
  const [firestoreMentors, setFirestoreMentors] = useState<MentorProfile[]>([]);
  const [firestoreLiveClasses, setFirestoreLiveClasses] = useState<LiveClass[]>([]);
  const [firestoreLibrary, setFirestoreLibrary] = useState<LibraryResource[]>([]);
  const [seedingBusy, setSeedingBusy] = useState(false);

  // User-scoped state
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [homeschoolPlans, setHomeschoolPlans] = useState<HomeschoolPlan[]>([]);
  const [ventures, setVentures] = useState<BusinessVenture[]>([]);
  const [sportsLogs, setSportsLogs] = useState<SportsLog[]>([]);
  const [assessments, setAssessments] = useState<AssessmentSubmission[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Apply theme & accent attributes on root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-parchment');
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'parchment') {
      root.classList.add('theme-parchment');
    }
    root.setAttribute('data-accent', accentPalette);
    localStorage.setItem('bg360_theme', themeMode);
    localStorage.setItem('bg360_accent', accentPalette);
  }, [themeMode, accentPalette]);

  const setThemeMode = (mode: ThemeMode) => setThemeModeState(mode);
  const setAccentPalette = (palette: AccentPalette) => setAccentPaletteState(palette);

  const isBootstrapAdmin = Boolean(
    firebaseUser?.email === ADMIN_EMAIL && firebaseUser?.emailVerified
  );
  const isAdmin = isBootstrapAdmin || isAdminDoc || profile?.role === 'super_admin';

  // Auth listener & profile hydration
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setIsAdminDoc(false);
        setAuthReady(true);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        setIsAdminDoc(adminSnap.exists());

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          setProfile(data);
          setActiveRoleView(data.role);
        } else {
          const defaultRole: UserRole =
            user.email === ADMIN_EMAIL && user.emailVerified ? 'super_admin' : 'student';
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: (user.displayName || 'Gurukul Learner').slice(0, 100),
            email: (user.email || '').slice(0, 200),
            role: defaultRole,
            ageGroup: 'Middle School (12-14)',
            points: 120,
            streakDays: 3,
            badges: ['First Step Scholar', 'Morning Pranayama'],
            preferredLanguage: 'English',
            parentalControlLevel: 'strict',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
          setActiveRoleView(defaultRole);
        }
      } catch (error) {
        console.error('Profile hydration error:', error);
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // Public catalog listeners
  useEffect(() => {
    const unsubCats = onSnapshot(
      query(collection(db, 'categories'), orderBy('order', 'asc')),
      (snap) => {
        setFirestoreCategories(snap.docs.map((d) => d.data() as LearningCategory));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    );

    const unsubCourses = onSnapshot(
      collection(db, 'courses'),
      (snap) => {
        setFirestoreCourses(snap.docs.map((d) => d.data() as Course));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'courses');
      }
    );

    const unsubMentors = onSnapshot(
      collection(db, 'mentors'),
      (snap) => {
        setFirestoreMentors(snap.docs.map((d) => d.data() as MentorProfile));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'mentors');
      }
    );

    const unsubLive = onSnapshot(
      collection(db, 'liveClasses'),
      (snap) => {
        setFirestoreLiveClasses(snap.docs.map((d) => d.data() as LiveClass));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'liveClasses');
      }
    );

    const unsubLib = onSnapshot(
      collection(db, 'libraryResources'),
      (snap) => {
        setFirestoreLibrary(snap.docs.map((d) => d.data() as LibraryResource));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'libraryResources');
      }
    );

    return () => {
      unsubCats();
      unsubCourses();
      unsubMentors();
      unsubLive();
      unsubLib();
    };
  }, []);

  // User-scoped listeners (only attached once authReady && firebaseUser)
  useEffect(() => {
    if (!authReady || !firebaseUser) {
      setEnrollments([]);
      setHomeschoolPlans([]);
      setVentures([]);
      setSportsLogs([]);
      setAssessments([]);
      setAllUsers([]);
      return;
    }

    const uid = firebaseUser.uid;
    const isBoot = firebaseUser.email === ADMIN_EMAIL && firebaseUser.emailVerified;

    const enrollQuery = isBoot
      ? collection(db, 'enrollments')
      : query(collection(db, 'enrollments'), where('userId', '==', uid));
    const unsubEnroll = onSnapshot(
      enrollQuery,
      (snap) => setEnrollments(snap.docs.map((d) => d.data() as Enrollment)),
      (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments')
    );

    const planQuery = isBoot
      ? collection(db, 'homeschoolPlans')
      : query(collection(db, 'homeschoolPlans'), where('ownerId', '==', uid));
    const unsubPlans = onSnapshot(
      planQuery,
      (snap) => setHomeschoolPlans(snap.docs.map((d) => d.data() as HomeschoolPlan)),
      (err) => handleFirestoreError(err, OperationType.LIST, 'homeschoolPlans')
    );

    const ventureQuery = isBoot
      ? collection(db, 'ventures')
      : query(collection(db, 'ventures'), where('isPublic', '==', true));
    const unsubVentures = onSnapshot(
      ventureQuery,
      (snap) => setVentures(snap.docs.map((d) => d.data() as BusinessVenture)),
      (err) => handleFirestoreError(err, OperationType.LIST, 'ventures')
    );

    const sportsQuery = isBoot
      ? collection(db, 'sportsLogs')
      : query(collection(db, 'sportsLogs'), where('ownerId', '==', uid));
    const unsubSports = onSnapshot(
      sportsQuery,
      (snap) => setSportsLogs(snap.docs.map((d) => d.data() as SportsLog)),
      (err) => handleFirestoreError(err, OperationType.LIST, 'sportsLogs')
    );

    const assessQuery = isBoot
      ? collection(db, 'assessments')
      : query(collection(db, 'assessments'), where('userId', '==', uid));
    const unsubAssess = onSnapshot(
      assessQuery,
      (snap) => setAssessments(snap.docs.map((d) => d.data() as AssessmentSubmission)),
      (err) => handleFirestoreError(err, OperationType.LIST, 'assessments')
    );

    let unsubUsers = () => {};
    if (isBoot) {
      unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snap) => setAllUsers(snap.docs.map((d) => d.data() as UserProfile)),
        (err) => handleFirestoreError(err, OperationType.LIST, 'users')
      );
    }

    return () => {
      unsubEnroll();
      unsubPlans();
      unsubVentures();
      unsubSports();
      unsubAssess();
      unsubUsers();
    };
  }, [authReady, firebaseUser]);

  const seedInitialCatalog = async () => {
    if (!firebaseUser || !isAdmin) return;
    setSeedingBusy(true);
    try {
      const uid = firebaseUser.uid;
      const batch = writeBatch(db);

      for (const cat of INITIAL_CATEGORIES) {
        batch.set(doc(db, 'categories', cat.id), {
          ...cat,
          createdBy: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      for (const course of INITIAL_COURSES) {
        batch.set(doc(db, 'courses', course.id), {
          ...course,
          createdBy: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      for (const mentor of INITIAL_MENTORS) {
        batch.set(doc(db, 'mentors', mentor.id), {
          ...mentor,
          createdBy: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      for (const lc of INITIAL_LIVE_CLASSES) {
        batch.set(doc(db, 'liveClasses', lc.id), {
          ...lc,
          createdBy: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      for (const lib of INITIAL_LIBRARY_RESOURCES) {
        batch.set(doc(db, 'libraryResources', lib.id), {
          ...lib,
          createdBy: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();

      // Lessons subcollections (must commit after parent courses exist for security rule exists() check)
      const lessonBatch = writeBatch(db);
      for (const lesson of INITIAL_LESSONS) {
        lessonBatch.set(doc(db, 'courses', lesson.courseId, 'lessons', lesson.id), {
          ...lesson,
          createdBy: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await lessonBatch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seedInitialCatalog');
    } finally {
      setSeedingBusy(false);
    }
  };

  // Auto-seed catalog once when Admin signs in and Firestore categories is empty
  useEffect(() => {
    if (authReady && isAdmin && firestoreCategories.length === 0 && !seedingBusy) {
      const hasAttempted = sessionStorage.getItem('bg360_seeded');
      if (!hasAttempted) {
        sessionStorage.setItem('bg360_seeded', '1');
        seedInitialCatalog().catch(console.error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isAdmin, firestoreCategories.length]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Sign in failed.';
      setAuthError(msg);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateMyProfile = async (
    updates: Partial<
      Pick<
        UserProfile,
        'displayName' | 'ageGroup' | 'preferredLanguage' | 'parentalControlLevel' | 'role'
      >
    >
  ) => {
    if (!firebaseUser || !profile) return;
    const safeRole =
      !isAdmin && (updates.role === 'super_admin' || updates.role === 'school_admin')
        ? profile.role
        : updates.role ?? profile.role;

    const path = `users/${firebaseUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        displayName: (updates.displayName ?? profile.displayName).slice(0, 100),
        ageGroup: updates.ageGroup ?? profile.ageGroup,
        preferredLanguage: (updates.preferredLanguage ?? profile.preferredLanguage).slice(0, 32),
        parentalControlLevel: updates.parentalControlLevel ?? profile.parentalControlLevel,
        role: safeRole,
        updatedAt: serverTimestamp(),
      });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
              role: safeRole,
            }
          : prev
      );
      setActiveRoleView(safeRole);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const enrollInCourse = async (course: Course) => {
    if (!firebaseUser) {
      await signInWithGoogle();
      return;
    }
    const existingEnroll = enrollments.find((e) => e.courseId === course.id && e.userId === firebaseUser.uid);
    if (existingEnroll) return;
    const id = makeSlugId('enr');
    const path = `enrollments/${id}`;
    try {
      await setDoc(doc(db, 'enrollments', id), {
        id,
        userId: firebaseUser.uid,
        courseId: course.id,
        courseTitle: course.title.slice(0, 160),
        progressPercent: 0,
        completedLessonIds: [],
        attendanceCount: 1,
        certificateIssued: false,
        teacherFeedback: 'Enrolled — welcome to your Bharat Gurukul 360 learning path.',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const toggleLessonComplete = async (
    enrollment: Enrollment,
    lessonId: string,
    totalLessons: number,
    courseReward: number
  ) => {
    if (!firebaseUser || !profile) return;
    const alreadyDone = enrollment.completedLessonIds.includes(lessonId);
    const updatedLessons = alreadyDone
      ? enrollment.completedLessonIds.filter((id) => id !== lessonId)
      : [...enrollment.completedLessonIds, lessonId].slice(0, 100);
    const denom = Math.max(totalLessons, 1);
    const progressPercent = Math.min(100, Math.round((updatedLessons.length / denom) * 100));
    const certificateIssued = progressPercent === 100;

    const path = `enrollments/${enrollment.id}`;
    try {
      await updateDoc(doc(db, 'enrollments', enrollment.id), {
        completedLessonIds: updatedLessons,
        progressPercent,
        attendanceCount: enrollment.attendanceCount + (alreadyDone ? 0 : 1),
        certificateIssued,
        updatedAt: serverTimestamp(),
      });

      if (!alreadyDone) {
        const delta = certificateIssued ? courseReward : 25;
        const nextPoints = profile.points + delta;
        const nextBadges =
          certificateIssued && !profile.badges.includes(`${enrollment.courseTitle.slice(0, 24)} Graduate`)
            ? [...profile.badges, `${enrollment.courseTitle.slice(0, 24)} Graduate`].slice(0, 20)
            : profile.badges;
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          points: nextPoints,
          badges: nextBadges,
          updatedAt: serverTimestamp(),
        });
        setProfile((prev) => (prev ? { ...prev, points: nextPoints, badges: nextBadges } : prev));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const fetchLessonsForCourse = async (courseId: string): Promise<Lesson[]> => {
    const path = `courses/${courseId}/lessons`;
    try {
      const snap = await getDocs(query(collection(db, 'courses', courseId, 'lessons'), orderBy('order', 'asc')));
      const docs = snap.docs.map((d) => d.data() as Lesson);
      if (docs.length > 0) return docs;
      return INITIAL_LESSONS.filter((l) => l.courseId === courseId);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  };

  const saveHomeschoolPlan = async (
    plan: Omit<HomeschoolPlan, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const id = makeSlugId('hs');
    const path = `homeschoolPlans/${id}`;
    try {
      await setDoc(doc(db, 'homeschoolPlans', id), {
        id,
        ownerId: firebaseUser.uid,
        childName: plan.childName.slice(0, 100),
        ageGroup: plan.ageGroup,
        learningPace: plan.learningPace,
        interests: plan.interests.slice(0, 15),
        weeklyGoals: plan.weeklyGoals.slice(0, 1000),
        scheduleSummary: plan.scheduleSummary.slice(0, 2000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteHomeschoolPlan = async (planId: string) => {
    const path = `homeschoolPlans/${planId}`;
    try {
      await deleteDoc(doc(db, 'homeschoolPlans', planId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveBusinessVenture = async (
    venture: Omit<BusinessVenture, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const id = makeSlugId('biz');
    const path = `ventures/${id}`;
    try {
      await setDoc(doc(db, 'ventures', id), {
        id,
        ownerId: firebaseUser.uid,
        founderName: venture.founderName.slice(0, 100),
        ventureName: venture.ventureName.slice(0, 120),
        category: venture.category.slice(0, 80),
        tagline: venture.tagline.slice(0, 200),
        problemSolved: venture.problemSolved.slice(0, 1000),
        budgetInr: Math.max(0, Math.round(venture.budgetInr)),
        revenueInr: Math.max(0, Math.round(venture.revenueInr)),
        stage: venture.stage,
        isPublic: true,
        mentorFeedback: venture.mentorFeedback.slice(0, 800),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateVentureStage = async (
    ventureId: string,
    stage: BusinessVenture['stage'],
    revenueInr: number
  ) => {
    const path = `ventures/${ventureId}`;
    try {
      await updateDoc(doc(db, 'ventures', ventureId), {
        stage,
        revenueInr: Math.max(0, Math.round(revenueInr)),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const saveSportsLog = async (
    log: Omit<SportsLog, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const id = makeSlugId('sprt');
    const path = `sportsLogs/${id}`;
    try {
      await setDoc(doc(db, 'sportsLogs', id), {
        id,
        ownerId: firebaseUser.uid,
        athleteName: log.athleteName.slice(0, 100),
        sport: log.sport.slice(0, 60),
        metricLabel: log.metricLabel.slice(0, 80),
        metricValue: log.metricValue.slice(0, 60),
        durationMinutes: Math.max(1, Math.min(600, Math.round(log.durationMinutes))),
        coachNote: log.coachNote.slice(0, 600),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const submitAssessment = async (
    sub: Omit<AssessmentSubmission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const id = makeSlugId('asmt');
    const path = `assessments/${id}`;
    try {
      await setDoc(doc(db, 'assessments', id), {
        id,
        userId: firebaseUser.uid,
        studentName: sub.studentName.slice(0, 100),
        courseId: sub.courseId,
        title: sub.title.slice(0, 160),
        score: Math.max(0, Math.round(sub.score)),
        maxScore: Math.max(1, Math.round(sub.maxScore)),
        status: sub.status,
        feedback: sub.feedback.slice(0, 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  // --- Admin Panel CRUD ---
  const upsertCategory = async (
    cat: Omit<LearningCategory, 'createdBy' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const path = `categories/${cat.id}`;
    try {
      const existingSnap = await getDoc(doc(db, 'categories', cat.id));
      if (existingSnap.exists()) {
        await updateDoc(doc(db, 'categories', cat.id), {
          code: cat.code.slice(0, 10),
          name: cat.name.slice(0, 120),
          description: cat.description.slice(0, 600),
          subcategories: cat.subcategories.slice(0, 50),
          order: cat.order,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'categories', cat.id), {
          ...cat,
          code: cat.code.slice(0, 10),
          name: cat.name.slice(0, 120),
          description: cat.description.slice(0, 600),
          subcategories: cat.subcategories.slice(0, 50),
          createdBy: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const path = `categories/${categoryId}`;
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const upsertCourse = async (
    course: Omit<Course, 'createdBy' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const path = `courses/${course.id}`;
    try {
      const existingSnap = await getDoc(doc(db, 'courses', course.id));
      if (existingSnap.exists()) {
        await updateDoc(doc(db, 'courses', course.id), {
          title: course.title.slice(0, 160),
          categoryId: course.categoryId,
          categoryName: course.categoryName.slice(0, 120),
          subject: course.subject.slice(0, 120),
          ageGroup: course.ageGroup,
          level: course.level,
          instructorName: course.instructorName.slice(0, 100),
          description: course.description.slice(0, 1500),
          durationLabel: course.durationLabel.slice(0, 40),
          format: course.format,
          lessonCount: course.lessonCount,
          pointsReward: course.pointsReward,
          featured: course.featured,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'courses', course.id), {
          ...course,
          title: course.title.slice(0, 160),
          description: course.description.slice(0, 1500),
          createdBy: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteCourse = async (courseId: string) => {
    const path = `courses/${courseId}`;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const upsertLesson = async (
    lesson: Omit<Lesson, 'createdBy' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const path = `courses/${lesson.courseId}/lessons/${lesson.id}`;
    try {
      await setDoc(doc(db, 'courses', lesson.courseId, 'lessons', lesson.id), {
        ...lesson,
        title: lesson.title.slice(0, 160),
        summary: lesson.summary.slice(0, 2000),
        resourceUrl: lesson.resourceUrl.slice(0, 500),
        worksheetPrompt: lesson.worksheetPrompt.slice(0, 1000),
        createdBy: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const upsertMentor = async (
    mentor: Omit<MentorProfile, 'createdBy' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const path = `mentors/${mentor.id}`;
    try {
      await setDoc(doc(db, 'mentors', mentor.id), {
        ...mentor,
        name: mentor.name.slice(0, 100),
        title: mentor.title.slice(0, 120),
        bio: mentor.bio.slice(0, 1000),
        createdBy: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const upsertLiveClass = async (
    liveClass: Omit<LiveClass, 'createdBy' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const path = `liveClasses/${liveClass.id}`;
    try {
      await setDoc(doc(db, 'liveClasses', liveClass.id), {
        ...liveClass,
        title: liveClass.title.slice(0, 160),
        createdBy: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const upsertLibraryResource = async (
    res: Omit<LibraryResource, 'createdBy' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) return;
    const path = `libraryResources/${res.id}`;
    try {
      await setDoc(doc(db, 'libraryResources', res.id), {
        ...res,
        title: res.title.slice(0, 160),
        summary: res.summary.slice(0, 1200),
        createdBy: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateUserRoleByAdmin = async (targetUid: string, role: UserRole) => {
    const path = `users/${targetUid}`;
    try {
      await updateDoc(doc(db, 'users', targetUid), {
        role,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const categories = useMemo(
    () => (firestoreCategories.length > 0 ? firestoreCategories : INITIAL_CATEGORIES),
    [firestoreCategories]
  );
  const courses = useMemo(
    () => (firestoreCourses.length > 0 ? firestoreCourses : INITIAL_COURSES),
    [firestoreCourses]
  );
  const mentors = useMemo(
    () => (firestoreMentors.length > 0 ? firestoreMentors : INITIAL_MENTORS),
    [firestoreMentors]
  );
  const liveClasses = useMemo(
    () => (firestoreLiveClasses.length > 0 ? firestoreLiveClasses : INITIAL_LIVE_CLASSES),
    [firestoreLiveClasses]
  );
  const libraryResources = useMemo(
    () => (firestoreLibrary.length > 0 ? firestoreLibrary : INITIAL_LIBRARY_RESOURCES),
    [firestoreLibrary]
  );

  return (
    <GurukulContext.Provider
      value={{
        firebaseUser,
        profile,
        authReady,
        isAdmin,
        activeRoleView,
        setActiveRoleView,
        signInWithGoogle,
        logout,
        authError,
        themeMode,
        setThemeMode,
        accentPalette,
        setAccentPalette,
        categories,
        courses,
        mentors,
        liveClasses,
        libraryResources,
        enrollments,
        homeschoolPlans,
        ventures,
        sportsLogs,
        assessments,
        allUsers,
        catalogSeeded: firestoreCategories.length > 0,
        seedingBusy,
        seedInitialCatalog,
        updateMyProfile,
        enrollInCourse,
        toggleLessonComplete,
        fetchLessonsForCourse,
        saveHomeschoolPlan,
        deleteHomeschoolPlan,
        saveBusinessVenture,
        updateVentureStage,
        saveSportsLog,
        submitAssessment,
        upsertCategory,
        deleteCategory,
        upsertCourse,
        deleteCourse,
        upsertLesson,
        upsertMentor,
        upsertLiveClass,
        upsertLibraryResource,
        updateUserRoleByAdmin,
      }}
    >
      {children}
    </GurukulContext.Provider>
  );
};

export function useGurukul() {
  const ctx = useContext(GurukulContext);
  if (!ctx) throw new Error('useGurukul must be used inside GurukulProvider');
  return ctx;
}
