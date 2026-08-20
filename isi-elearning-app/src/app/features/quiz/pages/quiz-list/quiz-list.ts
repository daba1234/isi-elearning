import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';
import { CourseService } from '../../../../core/services/course.service';
import { AuthService } from '../../../../core/services/auth.service';
import { QuizFormComponent } from '../quiz-form/quiz-form';
import { Course, Quiz, QuizSubmission } from '../../../../models/models';

interface QuizRow {
  quiz: Quiz;
  courseTitre: string;
}

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, QuizFormComponent],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.css'
})
export class QuizListComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly courseService = inject(CourseService);
  private readonly authService = inject(AuthService);

  courses = signal<Course[]>([]);
  rows = signal<QuizRow[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showForm = signal(false);

  expandedQuizId = signal<string | null>(null);
  attempts = signal<QuizSubmission[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.courseService.getCourses(user.id).subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.loadQuizzes(courses);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des cours');
        this.loading.set(false);
      }
    });
  }

  private loadQuizzes(courses: Course[]): void {
    if (courses.length === 0) {
      this.rows.set([]);
      this.loading.set(false);
      return;
    }

    this.quizService.getQuizzes().subscribe({
      next: (allQuizzes) => {
        const courseTitreOf = (courseId: string) => courses.find((c) => c.id === courseId)?.titre ?? '—';
        const courseIds = new Set(courses.map((c) => c.id));
        this.rows.set(
          allQuizzes
            .filter((q) => courseIds.has(q.courseId))
            .map((quiz) => ({ quiz, courseTitre: courseTitreOf(quiz.courseId) }))
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des quiz');
        this.loading.set(false);
      }
    });
  }

  toggleForm(): void {
    this.showForm.set(!this.showForm());
  }

  onCreated(): void {
    this.showForm.set(false);
    this.loadData();
  }

  toggleStats(quizId: string): void {
    if (this.expandedQuizId() === quizId) {
      this.expandedQuizId.set(null);
      this.attempts.set([]);
      return;
    }

    this.expandedQuizId.set(quizId);
    this.quizService.getSubmissions(quizId).subscribe({
      next: (data) => this.attempts.set(data)
    });
  }

  averageScore(): number {
    const values = this.attempts().map((a) => a.score);
    return values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : 0;
  }
}
