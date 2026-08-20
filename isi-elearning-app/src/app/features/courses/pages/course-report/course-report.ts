import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CourseService } from '../../../../core/services/course.service';
import { AssignmentService } from '../../../assignments/services/assignment.service';
import { QuizService } from '../../../quiz/services/quiz.service';
import { Course, EnrolledStudent } from '../../../../models/models';

@Component({
  selector: 'app-course-report',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-report.html',
  styleUrl: './course-report.css'
})
export class CourseReportComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly quizService = inject(QuizService);

  course = signal<Course | null>(null);
  students = signal<EnrolledStudent[]>([]);
  loading = signal(true);

  completionRate = signal(0);
  averageAssignmentGrade = signal<number | null>(null);
  quizSuccessRate = signal<number | null>(null);

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) {
      this.loading.set(false);
      return;
    }

    this.courseService.getCourse(courseId).subscribe({
      next: (course) => {
        this.course.set(course);
        this.loadStats(courseId);
      }
    });
  }

  private loadStats(courseId: string): void {
    this.courseService.getEnrolledStudents(courseId).subscribe({
      next: (students) => {
        this.students.set(students);
        this.completionRate.set(
          students.length ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) : 0
        );
      }
    });

    this.assignmentService.getAssignments(courseId).subscribe({
      next: (assignments) => {
        if (assignments.length === 0) {
          this.loading.set(false);
          return;
        }
        let remaining = assignments.length;
        const grades: number[] = [];
        assignments.forEach((assignment) => {
          this.assignmentService.getSubmissions(assignment.id).subscribe({
            next: (subs) => {
              subs.forEach((s) => { if (s.grade !== undefined) grades.push(s.grade); });
              remaining -= 1;
              if (remaining === 0) {
                this.averageAssignmentGrade.set(
                  grades.length ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10 : null
                );
                this.loading.set(false);
              }
            }
          });
        });
      }
    });

    this.quizService.getQuizzes(courseId).subscribe({
      next: (quizzes) => {
        if (quizzes.length === 0) return;
        let remaining = quizzes.length;
        const scores: number[] = [];
        quizzes.forEach((quiz) => {
          this.quizService.getSubmissions(quiz.id).subscribe({
            next: (subs) => {
              subs.forEach((s) => scores.push(s.score));
              remaining -= 1;
              if (remaining === 0) {
                this.quizSuccessRate.set(
                  scores.length ? Math.round((scores.filter((s) => s >= 50).length / scores.length) * 100) : null
                );
              }
            }
          });
        });
      }
    });
  }
}
