export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'teacher'
  | 'parent'
  | 'student'
  | 'homeschool_family'
  | 'sports_coach'
  | 'entrepreneur_mentor'
  | 'content_creator';

export type AgeGroup =
  | 'Early Childhood (3-5)'
  | 'Foundation (6-8)'
  | 'Preparatory (9-11)'
  | 'Middle School (12-14)'
  | 'Secondary (15-18)'
  | 'Young Entrepreneurs (18+)';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseFormat = 'Video' | 'Live' | 'Hybrid' | 'Workshop';
export type LessonType = 'video' | 'reading' | 'activity' | 'quiz' | 'live';
export type ParentalControlLevel = 'strict' | 'moderate' | 'standard';

export type ThemeMode = 'light' | 'dark' | 'parchment';
export type AccentPalette = 'navy-saffron' | 'indigo-gold' | 'teal-ochre' | 'forest-sandalwood';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  ageGroup: AgeGroup;
  points: number;
  streakDays: number;
  badges: string[];
  preferredLanguage: string;
  parentalControlLevel: ParentalControlLevel;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LearningCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  subcategories: string[];
  order: number;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Course {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  subject: string;
  ageGroup: AgeGroup;
  level: CourseLevel;
  instructorName: string;
  description: string;
  durationLabel: string;
  format: CourseFormat;
  lessonCount: number;
  pointsReward: number;
  featured: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  order: number;
  type: LessonType;
  durationMinutes: number;
  summary: string;
  resourceUrl: string;
  worksheetPrompt: string;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MentorProfile {
  id: string;
  name: string;
  title: string;
  category: string;
  specialty: string;
  bio: string;
  experienceYears: number;
  featured: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  progressPercent: number;
  completedLessonIds: string[];
  attendanceCount: number;
  certificateIssued: boolean;
  teacherFeedback: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface HomeschoolPlan {
  id: string;
  ownerId: string;
  childName: string;
  ageGroup: AgeGroup;
  learningPace: 'Gentle' | 'Balanced' | 'Accelerated';
  interests: string[];
  weeklyGoals: string;
  scheduleSummary: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BusinessVenture {
  id: string;
  ownerId: string;
  founderName: string;
  ventureName: string;
  category: string;
  tagline: string;
  problemSolved: string;
  budgetInr: number;
  revenueInr: number;
  stage: 'Idea' | 'Prototype' | 'Marketplace' | 'Pitch';
  isPublic: boolean;
  mentorFeedback: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SportsLog {
  id: string;
  ownerId: string;
  athleteName: string;
  sport: string;
  metricLabel: string;
  metricValue: string;
  durationMinutes: number;
  coachNote: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LiveClass {
  id: string;
  title: string;
  subject: string;
  instructorName: string;
  ageGroup: AgeGroup;
  scheduledLabel: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'recorded';
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  category: string;
  ageGroup: AgeGroup;
  resourceType: 'Book' | 'Story' | 'Worksheet' | 'Shastra' | 'Project';
  summary: string;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AssessmentSubmission {
  id: string;
  userId: string;
  studentName: string;
  courseId: string;
  title: string;
  score: number;
  maxScore: number;
  status: 'submitted' | 'graded';
  feedback: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type AppSection =
  | 'home'
  | 'catalog'
  | 'ai-guru'
  | 'hubs'
  | 'portals'
  | 'admin';

export type UniqueHubId =
  | 'my-gurukul'
  | 'my-homeschool'
  | 'my-business-lab'
  | 'my-sports-academy'
  | 'my-sanskrit-shastra'
  | 'my-skill-academy'
  | 'my-innovation-lab'
  | 'my-career-path'
  | 'my-life-academy'
  | 'bharat-library';
