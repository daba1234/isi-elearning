import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CourseService } from '../../../../core/services/course.service';
import { Course, Enrollment } from '../../../../models/models';

@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './dashboard.html', styleUrl: './dashboard.css' })
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly courseService = inject(CourseService);
  readonly courses = signal<Course[]>([]);
  readonly enrollments = signal<Enrollment[]>([]);
  readonly loading = signal(true);
  readonly completedCount = signal(0);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.courseService.getCourses().subscribe({ next: courses => this.courses.set(courses), error: () => undefined });
    this.courseService.getEnrollments(user.id).subscribe({ next: data => { this.enrollments.set(data); this.completedCount.set(data.filter(item => item.progress === 100).length); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  courseFor(enrollment: Enrollment): Course | undefined { return this.courses().find(course => course.id === enrollment.courseId); }
  averageProgress(): number { const values = this.enrollments().map(item => item.progress); return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0; }
}
