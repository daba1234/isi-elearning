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

  gradeSubmission(id: string, grade: number) {
    return this.api.patch<AssignmentSubmission>(`/assignmentSubmissions/${id}`, { grade });
  }
}
