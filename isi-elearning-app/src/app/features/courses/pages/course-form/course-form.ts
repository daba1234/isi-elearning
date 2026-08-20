import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../../core/services/course.service';
import { AuthService } from '../../../../core/services/auth.service';

const MAX_PDF_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './course-form.html',
  styleUrl: './course-form.css'
})
export class CourseFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly courseService = inject(CourseService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly today = new Date().toISOString().slice(0, 10);

  readonly form = this.fb.group({
    titre: ['', Validators.required],
    description: [''],
    duree: ['', Validators.required]
  });

  documentFile = signal<File | null>(null);
  videoFile = signal<File | null>(null);
  videoUploadProgress = signal(0);
  uploadingVideo = signal(false);

  loading = signal(false);
  error = signal<string | null>(null);

  onDocumentSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.error.set(null);

    if (!file) {
      this.documentFile.set(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      this.error.set('Le document doit être un fichier PDF.');
      (event.target as HTMLInputElement).value = '';
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      this.error.set('Le PDF dépasse la taille maximale de 20 Mo.');
      (event.target as HTMLInputElement).value = '';
      return;
    }

    this.documentFile.set(file);
  }

  onVideoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.error.set(null);

    if (!file) {
      this.videoFile.set(null);
      return;
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      this.error.set('La vidéo doit être au format MP4 ou MOV.');
      (event.target as HTMLInputElement).value = '';
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      this.error.set('La vidéo dépasse la taille maximale de 500 Mo.');
      (event.target as HTMLInputElement).value = '';
      return;
    }

    this.videoFile.set(file);
    this.simulateVideoUpload();
  }

  private simulateVideoUpload(): void {
    this.uploadingVideo.set(true);
    this.videoUploadProgress.set(0);

    const interval = setInterval(() => {
      const next = this.videoUploadProgress() + 10;
      if (next >= 100) {
        this.videoUploadProgress.set(100);
        this.uploadingVideo.set(false);
        clearInterval(interval);
      } else {
        this.videoUploadProgress.set(next);
      }
    }, 150);
  }

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.documentFile() && !this.videoFile()) {
      this.error.set('Veuillez ajouter au moins un contenu : PDF ou vidéo.');
      return;
    }

    if (this.uploadingVideo()) {
      this.error.set("Veuillez attendre la fin de l'upload de la vidéo.");
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      this.error.set('Vous devez être connecté pour créer un cours.');
      return;
    }

    const document = this.documentFile();
    const video = this.videoFile();

    this.loading.set(true);

    this.courseService.createCourse({
      titre: this.form.value.titre ?? '',
      description: this.form.value.description ?? '',
      categorie: 'Général',
      niveau: 'Debutant',
      duree: this.form.value.duree ?? '',
      enseignantId: user.id,
      image: 'course',
      published: false,
      dateAjout: this.today,
      documentNom: document?.name,
      documentUrl: document ? URL.createObjectURL(document) : undefined,
      videoNom: video?.name,
      videoUrl: video ? URL.createObjectURL(video) : undefined
    }).subscribe({
      next: () => this.router.navigate(['/courses']),
      error: () => {
        this.error.set('Erreur lors de la création du cours.');
        this.loading.set(false);
      }
    });
  }
}
