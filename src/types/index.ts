export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  accessType: "FREE" | "PAID" | "CODE_REQUIRED";
  price: number | null;
  published: boolean;
  teacherName: string;
  teacherId: number;
  sections: Section[];
  createdAt: string;
}

export interface Section {
  id: number;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  lessonType: "VIDEO" | "PDF" | "TEXT" | "QUIZ";
  contentUrl: string;
  textContent: string;
  durationMinutes: number;
  orderIndex: number;
  freePreview: boolean;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScore: number;
  questionCount: number;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  courseId: number;
}

export interface Enrollment {
  id: number;
  courseId: number;
  courseTitle: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  accessMethod: string;
  enrolledAt: string;
}

export interface Certificate {
  id: number;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  teacherName: string;
  issuedAt: string;
}

export interface Submission {
  id: number;
  quizId: number;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  completedAt: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  userId: number;
}
