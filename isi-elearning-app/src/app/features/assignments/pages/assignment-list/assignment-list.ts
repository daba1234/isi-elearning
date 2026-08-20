import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignmentService } from '../../services/assignment.service';
import { CourseService } from '../../../../core/services/course.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AssignmentFormComponent } from '../assignment-form/assignment-form';
import { Assignment, AssignmentSubmission, Course } from '../../../../models/models';

interface AssignmentRow {
  assignment: Assignment;
  courseTitre: string;
  effectif: number;
  rendus: number;
}

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, AssignmentFormComponent],
  templateUrl: './assignment-list.html',
  styleUrl: './assignment-list.css'
})
export class AssignmentListComponent implements OnInit {
  private readonly assignmentService = inject(AssignmentService);
  private readonly courseService = inject(CourseService);
  private readonly authService = inject(AuthService);

  courses = signal<Course[]>([]);
  rows = signal<AssignmentRow[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showForm = signal(false);

  expandedAssignmentId = signal<string | null>(null);
  submissions = signal<(AssignmentSubmission & { user: { nom: string; prenom: string } })[]>([]);

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
        this.loadAssignments(courses);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des cours');
        this.loading.set(false);
      }
    });
  }

  private loadAssignments(courses: Course[]): void {
    if (courses.length === 0) {
      this.rows.set([]);
      this.loading.set(false);
      return;
    }

    this.assignmentService.getAssignments().subscribe({
      next: (allAssignments) => {
        const courseIds = new Set(courses.map((c) => c.id));
        const relevant = allAssignments.filter((a) => courseIds.has(a.courseId));
        this.buildRows(relevant, courses);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des devoirs');
        this.loading.set(false);
      }
    });
  }

  private buildRows(assignments: Assignment[], courses: Course[]): void {
    if (assignments.length === 0) {
      this.rows.set([]);
      this.loading.set(false);
      return;
    }

    const courseTitreOf = (courseId: string) => courses.find((c) => c.id === courseId)?.titre ?? '—';
    let remaining = assignments.length;
    const rows: AssignmentRow[] = [];

    assignments.forEach((assignment) => {
      this.courseService.getEnrolledStudents(assignment.courseId).subscribe({
        next: (students) => {
          this.assignmentService.getSubmissions(assignment.id).subscribe({
            next: (subs) => {
              rows.push({
                assignment,
                courseTitre: courseTitreOf(assignment.courseId),
                effectif: students.length,
                rendus: subs.length
              });
              remaining -= 1;
              if (remaining === 0) {
                this.rows.set(rows);
                this.loading.set(false);
              }
            }
          });
        }
      });
    });
  }

  toggleForm(): void {
    this.showForm.set(!this.showForm());
  }

  onCreated(): void {
    this.showForm.set(false);
    this.loadData();
  }

  toggleDetails(assignmentId: string): void {
    if (this.expandedAssignmentId() === assignmentId) {
      this.expandedAssignmentId.set(null);
      this.submissions.set([]);
      return;
    }

    this.expandedAssignmentId.set(assignmentId);
    this.assignmentService.getSubmissions(assignmentId).subscribe({
      next: (subs) => this.submissions.set(subs)
    });
  }

  grade(submissionId: string, value: string): void {
    const grade = Number(value);
    if (Number.isNaN(grade)) return;

    const submission = this.submissions().find((s) => s.id === submissionId);
    this.assignmentService.gradeSubmission(submissionId, grade, submission?.feedback).subscribe({
      next: () => {
        this.submissions.update((subs) =>
          subs.map((s) => (s.id === submissionId ? { ...s, grade } : s))
        );
      }
    });
  }

  saveFeedback(submissionId: string, feedback: string): void {
    const submission = this.submissions().find((s) => s.id === submissionId);
    this.assignmentService.gradeSubmission(submissionId, submission?.grade ?? 0, feedback).subscribe({
      next: () => {
        this.submissions.update((subs) =>
          subs.map((s) => (s.id === submissionId ? { ...s, feedback } : s))
        );
      }
    });
  }

  togglePublish(row: AssignmentRow): void {
    const updated: Assignment = { ...row.assignment, published: !(row.assignment.published ?? true) };
    this.assignmentService.updateAssignment(updated).subscribe({
      next: () => {
        this.rows.update((rows) =>
          rows.map((r) => (r.assignment.id === row.assignment.id ? { ...r, assignment: updated } : r))
        );
      }
    });
  }
}
