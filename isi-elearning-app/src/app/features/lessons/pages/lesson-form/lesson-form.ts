import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../../../core/services/course.service';
import { Lesson } from '../../../../models/models';

const MAX_FILE_SIZE = 200 * 1024 * 1024;

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lesson-form.html',
  styleUrl: './lesson-form.css'
})
export class LessonFormComponent {
  @Input({ required: true }) courseId!: string;
  @Input() nextOrdre = 1;
  @Output() created = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly courseService = inject(CourseService);

  readonly form = this.fb.group({
    titre: ['', Validators.required],
    description: [''],
    format: ['texte' as Lesson['format'], Validators.required],
    lienExterne: [''],
    duree: ['', Validators.required]
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
      this.error.set('Le fichier dépasse la taille maximale de 200 Mo.');
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
    const lienExterne = this.form.value.lienExterne?.trim();

    if (!file && !lienExterne && this.form.value.format !== 'texte') {
      this.error.set('Ajoutez un fichier ou un lien pour ce format.');
      return;
    }

    this.loading.set(true);
    this.courseService.addLesson({
      courseId: this.courseId,
      titre: this.form.value.titre ?? '',
      description: this.form.value.description ?? '',
      contenu: this.form.value.description ?? '',
      format: this.form.value.format ?? 'texte',
      url: file ? URL.createObjectURL(file) : (lienExterne || undefined),
      ordre: this.nextOrdre,
      duree: Number(this.form.value.duree)
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.created.emit();
      },
      error: () => {
        this.error.set('Erreur lors de la création de la leçon.');
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
