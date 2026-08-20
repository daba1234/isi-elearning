import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignmentService } from '../../services/assignment.service';
import { Course } from '../../../../models/models';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

@Component({
  selector: 'app-assignment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assignment-form.html',
  styleUrl: './assignment-form.css'
})
export class AssignmentFormComponent {
  @Input() courses: Course[] = [];
  @Output() created = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly assignmentService = inject(AssignmentService);

  readonly form = this.fb.group({
    titre: ['', Validators.required],
    courseId: ['', Validators.required],
    consigne: ['', Validators.required],
    dateLimite: ['', Validators.required]
  });

  file = signal<File | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.error.set(null);

    if (!file) {
      this.file.set(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      this.error.set('Le fichier joint dépasse la taille maximale de 20 Mo.');
      (event.target as HTMLInputElement).value = '';
      return;
    }

    this.file.set(file);
  }

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const file = this.file();
    this.loading.set(true);

    this.assignmentService.addAssignment({
      titre: this.form.value.titre ?? '',
      courseId: this.form.value.courseId ?? '',
      consigne: this.form.value.consigne ?? '',
      dateLimite: this.form.value.dateLimite ?? '',
      status: 'En cours',
      fichierNom: file?.name,
      fichierUrl: file ? URL.createObjectURL(file) : undefined
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.created.emit();
      },
      error: () => {
        this.error.set('Erreur lors de la création du devoir.');
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
