import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CourseService } from '../../../../core/services/course.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Assignment, Course, Enrollment, EnrolledStudent, Lesson, Quiz } from '../../../../models/models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css'
})
export class CourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly authService = inject(AuthService);
  readonly auth = this.authService;

  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  quizzes = signal<Quiz[]>([]);
  assignments = signal<Assignment[]>([]);
  enrollment = signal<Enrollment | null>(null);
  students = signal<EnrolledStudent[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);
  enrolling = signal(false);

  get isTeacher(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'enseignant' && user.id === this.course()?.enseignantId;
  }

  get canSeeContent(): boolean {
    return this.isTeacher || Boolean(this.enrollment());
  }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) {
      this.error.set('Cours introuvable');
      this.loading.set(false);
      return;
    }
    this.loadCourse(courseId);
  }

  private loadCourse(courseId: string): void {
    this.courseService.getCourse(courseId).subscribe({
      next: (course) => {
        this.course.set(course);
        this.loadRelatedData(courseId);
      },
      error: () => {
        this.error.set('Erreur lors du chargement du cours');
        this.loading.set(false);
      }
    });
  }

  private loadRelatedData(courseId: string): void {
    this.courseService.getLessons(courseId).subscribe({ next: (data) => this.lessons.set(data) });
    this.courseService.getQuizzes(courseId).subscribe({ next: (data) => this.quizzes.set(data) });
    this.courseService.getAssignments(courseId).subscribe({ next: (data) => this.assignments.set(data) });

    const user = this.authService.currentUser();
    if (user?.role === 'etudiant') {
      this.courseService.getEnrollment(user.id, courseId).subscribe({
        next: (data) => {
          this.enrollment.set(data[0] ?? null);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {Students(courseId);
      this.loading.set(false);
    }
  }

  private loadStudents(courseId: string): void {
    this.courseService.getEnrolledStudents(courseId).subscribe({ next: (data) => this.students.set(data) }); this.loading.set(false);
    }
  }

  enroll(): void {
    const user = this.authService.currentUser();
    const course = this.course();
    if (!user || !course) return;

    this.enrolling.set(true);
    this.courseService.enroll(user.id, course.id).subscribe({
      next: (created) => {
        this.enrollment.set(created);
        this.enrolling.set(false);
      },
      error: () => {
        this.error.set("Erreur lors de l'inscription au cours");
        this.enrolling.set(false);
      }
    });
  }

  exportStudentsCsv(): void {
    const rows = this.students();
    if (rows.length === 0) return;

    const header = 'Nom;Prenom;Email';
    const lines = rows.map((row) => `${row.user.nom};${row.user.prenom};${row.user.email}`);
    const csvContent = [header, ...lines].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `etudiants-${this.course()?.titre ?? 'cours'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
