import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AssignmentService } from '../../services/assignment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Assignment, AssignmentSubmission } from '../../../../models/models';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

type SubmissionStatus = 'a-rendre' | 'en-retard' | 'soumis' | 'note';

@Component({
  selector: 'app-assignment-submit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assignment-submit.html',
  styleUrl: './assignment-submit.css'
})
export class AssignmentSubmitComponent implements OnInit {
  @Input({ required: true }) assignment!: Assignment;

  private readonly fb = inject(FormBuilder);
  private readonly assignmentService = inject(AssignmentService);
  private readonly authService = inject(AuthService);

  readonly form = this.fb.group({ textResponse: [''] });

  file = signal<File | null>(null);
  submission = signal<AssignmentSubmission | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  checking = signal(true);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.assignmentService.getSubmissionForUser(this.assignment.id, user.id).subscribe({
      next: (subs) => {
        this.submission.set(subs[0] ?? null);
        this.checking.set(false);
      },
      error: () => this.checking.set(false)
    });
  }

  get status(): SubmissionStatus {
    const submission = this.submission();
    if (submission) return submission.grade !== undefined ? 'note' : 'soumis';
    return new Date() > new Date(this.assignment.dateLimite) ? 'en-retard' : 'a-rendre';
  }

  get statusLabel(): string {
    switch (this.status) {
      case 'note': return `Noté : ${this.submission()?.grade}/20`;
      case 'soumis': return 'Soumis';
      case 'en-retard': return 'En retard';
      default: return 'À rendre';
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.error.set(null);

    if (!file) {
      this.file.set(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      this.error.set('Le fichier dépasse la taille maximale de 20 Mo.');
      (event.target as HTMLInputElement).value = '';
      return;
    }

    this.file.set(file);
  }

  submit(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const textResponse = this.form.value.textResponse?.trim() ?? '';
    const file = this.file();

    if (!textResponse && !file) {
      this.error.set('Ajoutez un fichier ou une réponse texte.');
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    this.assignmentService.submitAssignment({
      assignmentId: this.assignment.id,
      userId: user.id,
      fileName: file?.name,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      textResponse: textResponse || undefined,
      submittedAt: new Date().toISOString().slice(0, 10)
    }).subscribe({
      next: (created) => {
        this.submission.set(created);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors de la remise du devoir.');
        this.loading.set(false);
      }
    });
  }
}
