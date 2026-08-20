import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Assignment, AssignmentSubmission } from '../../../models/models';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly api = inject(ApiService);

  getAssignments(courseId?: string) {
    return this.api.get<Assignment>(courseId ? `/assignments?courseId=${courseId}` : '/assignments');
  }

  getAssignment(id: string) {
    return this.api.getOne<Assignment>(`/assignments/${id}`);
  }

  addAssignment(assignment: Omit<Assignment, 'id'>) {
    return this.api.post<Assignment>('/assignments', assignment);
  }

  updateAssignment(assignment: Assignment) {
    return this.api.put<Assignment>(`/assignments/${assignment.id}`, assignment);
  }

  deleteAssignment(id: string) {
    return this.api.delete(`/assignments/${id}`);
  }

  getSubmissions(assignmentId: string) {
    return this.api.get<AssignmentSubmission & { user: { nom: string; prenom: string } }>(
      `/assignmentSubmissions?assignmentId=${assignmentId}&_expand=user`
    );
  }

  getSubmissionForUser(assignmentId: string, userId: string) {
    return this.api.get<AssignmentSubmission>(`/assignmentSubmissions?assignmentId=${assignmentId}&userId=${userId}`);
  }

  getSubmissionsForUser(userId: string) {
    return this.api.get<AssignmentSubmission & { assignment: Assignment }>(
      `/assignmentSubmissions?userId=${userId}&_expand=assignment`
    );
  }

  submitAssignment(submission: Omit<AssignmentSubmission, 'id'>) {
    return this.api.post<AssignmentSubmission>('/assignmentSubmissions', submission);
  }

  gradeSubmission(id: string, grade: number, feedback?: string) {
    return this.api.patch<AssignmentSubmission>(`/assignmentSubmissions/${id}`, { grade, feedback });
  }
}
