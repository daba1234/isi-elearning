import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../../core/services/course.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Course, Enrollment } from '../../../../models/models';

interface EnrolledCourseRow {
  course: Course;
  enrollment: Enrollment;
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-courses.html',
  styleUrl: './my-courses.css'
})
export class MyCoursesComponent implements OnInit {
  private readonly courseService = inject(CourseService);
  private readonly authService = inject(AuthService);

  rows = signal<EnrolledCourseRow[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.courseService.getEnrollments(user.id).subscribe({
      next: (enrollments) => {
        if (enrollments.length === 0) {
          this.rows.set([]);
          this.loading.set(false);
          return;
        }
        this.courseService.getCourses().subscribe({
          next: (courses) => {
            this.rows.set(
              enrollments
                .map((enrollment) => {
                  const course = courses.find((c) => c.id === enrollment.courseId);
                  return course ? { course, enrollment } : null;
                })
                .filter((row): row is EnrolledCourseRow => row !== null)
            );
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Erreur lors du chargement des cours');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Erreur lors du chargement des inscriptions');
        this.loading.set(false);
      }
    });
  }
}
