import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuizService } from '../../services/quiz.service';
import { Course, QuizQuestion } from '../../../../models/models';

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-form.html',
  styleUrl: './quiz-form.css'
})
export class QuizFormComponent {
  @Input() courses: Course[] = [];
  @Output() created = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly quizService = inject(QuizService);

  readonly form = this.fb.group({
    titre: ['', Validators.required],
    courseId: ['', Validators.required],
    duree: ['', Validators.required],
    questions: this.fb.array([this.newQuestion()])
  });

  loading = signal(false);
  error = signal<string | null>(null);

  get questions(): FormArray<FormGroup> {
    return this.form.get('questions') as FormArray<FormGroup>;
  }

  optionsOf(index: number): FormArray {
    return this.questions.at(index).get('options') as FormArray;
  }

  correctIndicesOf(index: number): FormControl<number[]> {
    return this.questions.at(index).get('correctIndices') as FormControl<number[]>;
  }

  private newQuestion(): FormGroup {
    return this.fb.group({
      enonce: ['', Validators.required],
      type: ['unique' as QuizQuestion['type']],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      correctIndices: this.fb.control<number[]>([0]),
      points: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addQuestion(): void {
    this.questions.push(this.newQuestion());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) this.questions.removeAt(index);
  }

  addOption(questionIndex: number): void {
    this.optionsOf(questionIndex).push(this.fb.control('', Validators.required));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.optionsOf(questionIndex);
    if (options.length > 2) options.removeAt(optionIndex);
  }

  onTypeChange(questionIndex: number, type: QuizQuestion['type']): void {
    const question = this.questions.at(questionIndex);
    question.get('type')?.setValue(type);

    if (type === 'vrai_faux') {
      const options = this.optionsOf(questionIndex);
      options.clear();
      options.push(this.fb.control('Vrai', Validators.required));
      options.push(this.fb.control('Faux', Validators.required));
    }

    this.correctIndicesOf(questionIndex).setValue([0]);
  }

  toggleCorrect(questionIndex: number, optionIndex: number): void {
    const control = this.correctIndicesOf(questionIndex);
    const type = this.questions.at(questionIndex).value.type;

    if (type === 'multiple') {
      const current = control.value ?? [];
      control.setValue(
        current.includes(optionIndex) ? current.filter((i) => i !== optionIndex) : [...current, optionIndex]
      );
    } else {
      control.setValue([optionIndex]);
    }
  }

  isCorrect(questionIndex: number, optionIndex: number): boolean {
    return (this.correctIndicesOf(questionIndex).value ?? []).includes(optionIndex);
  }

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const questions: QuizQuestion[] = this.questions.controls.map((q, i) => ({
      id: `q-${Date.now()}-${i}`,
      enonce: q.value.enonce,
      type: q.value.type,
      options: q.value.options,
      bonnesReponses: q.value.correctIndices,
      points: Number(q.value.points)
    }));

    this.loading.set(true);
    this.quizService.addQuiz({
      titre: this.form.value.titre ?? '',
      courseId: this.form.value.courseId ?? '',
      duree: Number(this.form.value.duree),
      questions,
      published: true
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.created.emit();
      },
      error: () => {
        this.error.set('Erreur lors de la création du quiz.');
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}

