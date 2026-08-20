import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseListComponent } from '../../../courses/pages/course-liste/course-liste';
import { AssignmentListComponent } from '../../../assignments/pages/assignment-list/assignment-list';
import { QuizListComponent } from '../../../quiz/pages/quiz-list/quiz-list';

type TeacherTab = 'cours' | 'devoirs' | 'quiz';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, CourseListComponent, AssignmentListComponent, QuizListComponent],
  templateUrl: './teacher-dashboard.html',
  styleUrl: './teacher-dashboard.css'
})
export class TeacherDashboardComponent {
  activeTab = signal<TeacherTab>('cours');

  selectTab(tab: TeacherTab): void {
    this.activeTab.set(tab);
  }
}
