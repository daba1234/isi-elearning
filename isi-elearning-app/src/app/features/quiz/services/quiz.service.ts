import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Quiz, QuizSubmission } from '../../../models/models';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly api = inject(ApiService);

  getQuizzes(courseId?: string) {
    return this.api.get<Quiz>(courseId ? `/quizzes?courseId=${courseId}` : '/quizzes');
  }

  getQuiz(id: string) {
    return this.api.getOne<Quiz>(`/quizzes/${id}`);
  }

  addQuiz(quiz: Omit<Quiz, 'id'>) {
    return this.api.post<Quiz>('/quizzes', quiz);
  }

  updateQuiz(quiz: Quiz) {
    return this.api.put<Quiz>(`/quizzes/${quiz.id}`, quiz);
  }

  deleteQuiz(id: string) {
    return this.api.delete(`/quizzes/${id}`);
  }

  getSubmissions(quizId: string) {
    return this.api.get<QuizSubmission>(`/quizSubmissions?quizId=${quizId}`);
  }
}
