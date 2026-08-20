import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = signal(false);
  error = signal<string | null>(null);

  onLogin(): void {
    if (!this.form.valid) return;

    this.loading.set(true);
    this.error.set(null);
    
    const { email, password } = this.form.value;
    this.authService.login(email ?? '', password ?? '').then((user) => {
      this.router.navigate([user.role === 'enseignant' ? '/teacher/dashboard' : '/dashboard']);
    }).catch(() => {
      this.error.set('Email ou mot de passe incorrect');
      this.loading.set(false);
    });
  }

  get emailError(): string {
    const control = this.form.get('email');
    if (control?.hasError('required')) return 'Email requis';
    if (control?.hasError('email')) return 'Email invalide';
    return '';
  }

  get passwordError(): string {
    const control = this.form.get('password');
    if (control?.hasError('required')) return 'Mot de passe requis';
    if (control?.hasError('minlength')) return 'Minimum 6 caractères';
    return '';
  }
}