import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../models/models';

@Component({ selector: 'app-register', standalone: true, imports: [CommonModule, ReactiveFormsModule, RouterModule], templateUrl: './register.html', styleUrl: './register.css' })
export class RegisterComponent {
  private readonly fb = inject(FormBuilder); private readonly api = inject(AuthService); private readonly router = inject(Router);
  readonly form = this.fb.group({ prenom: ['', Validators.required], nom: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(6)]], role: ['etudiant', Validators.required] });
  loading = false; error = '';
  submit(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.loading = true; this.error = ''; const values = this.form.getRawValue(); this.api.register({ prenom: values.prenom ?? '', nom: values.nom ?? '', email: values.email ?? '', password: values.password ?? '', role: (values.role ?? 'etudiant') as UserRole }).then(() => this.router.navigate(['/login'])).catch((error: Error) => { this.error = error.message; this.loading = false; }); }
}
