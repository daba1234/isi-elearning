import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../../core/services/course.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Course } from '../../../../models/models';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-liste.html',
  styleUrls: ['./course-liste.css']
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);
  private authService = inject(AuthService);

  courses = signal<Course[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  readonly auth = this.authService;

  ngOnInit(): void {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);
    
    const user = this.authService.currentUser();
    
    this.courseService.getCourses(user?.role === 'enseignant' ? user.id : undefined).subscribe({
        next: (data: Course[]) => {
          this.courses.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du chargement des cours');
          this.loading.set(false);
        }
      });
  }

  togglePublish(course: Course, event: Event): void {
    event.stopPropagation();
    const updated: Course = { ...course, published: !course.published };
    this.courseService.updateCourse(updated).subscribe({
      next: () => {
        this.courses.update((courses) => courses.map((c) => (c.id === course.id ? updated : c)));
      }
    });
  }
}