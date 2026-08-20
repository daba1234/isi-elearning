export type UserRole = 'enseignant' | 'etudiant';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
}

export interface Course {
  id: string;
  titre: string;
  description: string;
  categorie: string;
  niveau: string;
  duree: string;
  enseignantId: string;
  image: string;
  published: boolean;
  dateAjout: string;
  documentNom?: string;
  documentUrl?: string;
  videoNom?: string;
  videoUrl?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  titre: string;
  description: string;
  contenu: string;
  format?: 'video' | 'pdf' | 'texte';
  url?: string;
  ordre: number;
  duree: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  status: string;
}

export interface EnrolledStudent extends Enrollment {
  user: User;
}

export interface Quiz {
  id: string;
  courseId: string;
  titre: string;
  questions: number;
  duree: number;
  published: boolean;
}

export interface Assignment {
  id: string;
  courseId: string;
  titre: string;
  description: string;
  dateLimite: string;
  status: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  submittedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  fileName: string;
  submittedAt: string;
  grade?: number;
}
