import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignmentService } from '../../../assignments/services/assignment.service';
import { QuizService } from '../../../quiz/services/quiz.service';
import { CourseService } from '../../../../core/services/course.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Assignment, AssignmentSubmission, Course, Enrollment, Quiz, QuizSubmission } from '../../../../models/models';

interface CourseGrades {
  course: Course;
  enrollment: Enrollment;
  assignmentGrades: (AssignmentSubmission & { assignment: Assignment })[];
  quizScores: (QuizSubmission & { quiz: Quiz })[];
}

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grades.html',
  styleUrl: './grades.css'
})
export class GradesComponent implements OnInit {
  private readonly assignmentService = inject(AssignmentService);
  private readonly quizService = inject(QuizService);
  private readonly courseService = inject(CourseService);
  private readonly authService = inject(AuthService);

  rows = signal<CourseGrades[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.courseService.getEnrollments(user.id).subscribe({
      next: (enrollments) => {
        if (enrollments.length === 0) {
          this.loading.set(false);
          return;
        }

        this.courseService.getCourses().subscribe({
          next: (courses) => {
            this.assignmentService.getSubmissionsForUser(user.id).subscribe({
              next: (assignmentSubs) => {
                this.quizService.getSubmissionsForUser(user.id).subscribe({
                  next: (quizSubs) => {
                    this.rows.set(
                      enrollments
                        .map((enrollment) => {
                          const course = courses.find((c) => c.id === enrollment.courseId);
                          if (!course) return null;
                          return {
                            course,
                            enrollment,
                            assignmentGrades: assignmentSubs.filter((s) => s.assignment?.courseId === course.id),
                            quizScores: quizSubs.filter((s) => s.quiz?.courseId === course.id)
                          };
                        })
                        .filter((row): row is CourseGrades => row !== null)
                    );
                    this.loading.set(false);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  downloadCertificate(row: CourseGrades): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Attestation</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 4rem;">
        <h1>Attestation de réussite</h1>
        <p>ISI E-Learning certifie que</p>
        <h2>${user.prenom} ${user.nom}</h2>
        <p>a terminé avec succès le cours</p>
        <h3>${row.course.titre}</h3>
        <p>Délivrée le ${new Date().toLocaleDateString('fr-FR')}</p>
      </body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attestation-${row.course.titre}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
