import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { CourseListComponent } from './features/courses/pages/course-liste/course-liste';
import { CourseFormComponent } from './features/courses/pages/course-form/course-form';
import { CourseDetailComponent } from './features/courses/pages/course-detail/course-detail';
import { LoginComponent } from './features/auth/pages/login/login';
import { RegisterComponent } from './features/auth/pages/register/register';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
	{ path: 'courses/create', component: CourseFormComponent, canActivate: [authGuard, roleGuard('enseignant')] },
	{ path: 'courses/:id', component: CourseDetailComponent, canActivate: [authGuard] },
	{ path: 'courses', component: CourseListComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: 'dashboard' }
];
