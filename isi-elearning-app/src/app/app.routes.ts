import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { CourseListComponent } from './features/courses/pages/course-liste/course-liste';
import { CourseFormComponent } from './features/courses/pages/course-form/course-form';
import { LoginComponent } from './features/auth/pages/login/login';
import { RegisterComponent } from './features/auth/pages/register/register';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
	{ path: 'courses/create', component: CourseFormComponent, canActivate: [authGuard] },
	{ path: 'courses', component: CourseListComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: 'dashboard' }
];
