import { Injectable, inject } from '@angular/core';
import { Course, EnrolledStudent, Enrollment, Lesson, Quiz, Assignment } from '../../models/models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly api = inject(ApiService);

  getCourses(teacherId?: string) {
    return this.api.get<Course>(teacherId ? `/courses?enseignantId=${teacherId}` : '/courses');
  }

  getCourse(courseId: string) {
    return this.api.getOne<Course>(`/courses/${courseId}`);
  }

  getEnrollment(userId: string, courseId: string) {
    return this.api.get<Enrollment>(`/enrollments?userId=${userId}&courseId=${courseId}`);
  }

  getEnrolledStudents(courseId: string) {
    return this.api.get<EnrolledStudent>(`/enrollments?courseId=${courseId}&_expand=user`);
  }

  getLessons(courseId: string) {
    return this.api.get<Lesson>(`/lessons?courseId=${courseId}&_sort=ordre&_order=asc`);
  }

  getEnrollments(userId: string) {
    return this.api.get<Enrollment>(`/enrollments?userId=${userId}`);
  }

  getQuizzes(courseId?: string) {
    return this.api.get<Quiz>(courseId ? `/quizzes?courseId=${courseId}` : '/quizzes');
  }

  getAssignments(courseId?: string) {
    return this.api.get<Assignment>(courseId ? `/assignments?courseId=${courseId}` : '/assignments');
  }

  createCourse(course: Omit<Course, 'id'>) {
    return this.api.post<Course>('/courses', course);
  }

  updateCourse(course: Course) {
    return this.api.put<Course>(`/courses/${course.id}`, course);
  }

  deleteCourse(courseId: string) {
    return this.api.delete(`/courses/${courseId}`);
  }

  enroll(userId: string, courseId: string) {
    return this.api.post<Enrollment>('/enrollments', {
      userId,
      courseId,
      progress: 0,
      status: 'en cours'
    });
  }

  addLesson(lesson: Omit<Lesson, 'id'>) {
    return this.api.post<Lesson>('/lessons', lesson);
  }

  addQuiz(quiz: Omit<Quiz, 'id'>) {
    return this.api.post<Quiz>('/quizzes', quiz);
  }

  addAssignment(assignment: Omit<Assignment, 'id'>) {
    return this.api.post<Assignment>('/assignments', assignment);
  }
}
