import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { CourseListComponent } from './features/courses/pages/course-liste/course-liste';
import { CourseFormComponent } from './features/courses/pages/course-form/course-form';
import { CourseDetailComponent } from './features/courses/pages/course-detail/course-detail';
import { CourseReportComponent } from './features/courses/pages/course-report/course-report';
import { MyCoursesComponent } from './features/courses/pages/my-courses/my-courses';
import { QuizTakeComponent } from './features/quiz/pages/quiz-take/quiz-take';
import { GradesComponent } from './features/dashboard/pages/grades/grades';
import { LoginComponent } from './features/auth/pages/login/login';
import { RegisterComponent } from './features/auth/pages/register/register';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard';
import { TeacherDashboardComponent } from './features/dashboard/pages/teacher-dashboard/teacher-dashboard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
	{ path: 'teacher/dashboard', component: TeacherDashboardComponent, canActivate: [authGuard, roleGuard('enseignant')] },
	{ path: 'mes-cours', component: MyCoursesComponent, canActivate: [authGuard, roleGuard('etudiant')] },
	{ path: 'mes-notes', component: GradesComponent, canActivate: [authGuard, roleGuard('etudiant')] },
	{ path: 'quiz/:id', component: QuizTakeComponent, canActivate: [authGuard, roleGuard('etudiant')] },
	{ path: 'courses/create', component: CourseFormComponent, canActivate: [authGuard, roleGuard('enseignant')] },
	{ path: 'courses/:id/rapport', component: CourseReportComponent, canActivate: [authGuard, roleGuard('enseignant')] },
	{ path: 'courses/:id', component: CourseDetailComponent, canActivate: [authGuard] },
	{ path: 'courses', component: CourseListComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: 'dashboard' }
];
