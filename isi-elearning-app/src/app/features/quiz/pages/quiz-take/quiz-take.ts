import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Quiz, QuizQuestion } from '../../../../models/models';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-take.html',
  styleUrl: './quiz-take.css'
})
export class QuizTakeComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly quizService = inject(QuizService);
  private readonly authService = inject(AuthService);

  quiz = signal<Quiz | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  answers = signal<Record<string, number[]>>({});
  submitted = signal(false);
  score = signal(0);

  secondsLeft = signal(0);
  private timerHandle?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (!quizId) {
      this.error.set('Quiz introuvable');
      this.loading.set(false);
      return;
    }

    this.quizService.getQuiz(quizId).subscribe({
      next: (quiz) => {
        this.quiz.set(quiz);
        this.secondsLeft.set(quiz.duree * 60);
        this.loading.set(false);
        this.startTimer();
      },
      error: () => {
        this.error.set('Erreur lors du chargement du quiz');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerHandle) clearInterval(this.timerHandle);
  }

  private startTimer(): void {
    this.timerHandle = setInterval(() => {
      const next = this.secondsLeft() - 1;
      if (next <= 0) {
        this.secondsLeft.set(0);
        clearInterval(this.timerHandle);
        if (!this.submitted()) this.submit();
      } else {
        this.secondsLeft.set(next);
      }
    }, 1000);
  }

  get minutes(): number {
    return Math.floor(this.secondsLeft() / 60);
  }

  get seconds(): number {
    return this.secondsLeft() % 60;
  }

  isSelected(question: QuizQuestion, optionIndex: number): boolean {
    return (this.answers()[question.id] ?? []).includes(optionIndex);
  }

  toggleAnswer(question: QuizQuestion, optionIndex: number): void {
    if (this.submitted()) return;

    const isMultiple = question.type === 'multiple';
    this.answers.update((current) => {
      const existing = current[question.id] ?? [];
      let next: number[];

      if (isMultiple) {
        next = existing.includes(optionIndex)
          ? existing.filter((i) => i !== optionIndex)
          : [...existing, optionIndex];
      } else {
        next = [optionIndex];
      }

      return { ...current, [question.id]: next };
    });
  }

  private correctIndices(question: QuizQuestion): number[] {
    return question.bonnesReponses ?? (question.bonneReponseIndex !== undefined ? [question.bonneReponseIndex] : []);
  }

  isCorrectOption(question: QuizQuestion, optionIndex: number): boolean {
    return this.correctIndices(question).includes(optionIndex);
  }

  submit(): void {
    const quiz = this.quiz();
    const user = this.authService.currentUser();
    if (!quiz || !user || this.submitted()) return;

    if (this.timerHandle) clearInterval(this.timerHandle);

    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((question) => {
      const points = question.points ?? 1;
      totalPoints += points;

      const correct = this.correctIndices(question).slice().sort();
      const given = (this.answers()[question.id] ?? []).slice().sort();
      const isCorrect = correct.length === given.length && correct.every((v, i) => v === given[i]);
      if (isCorrect) earnedPoints += points;
    });

    const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    this.score.set(finalScore);
    this.submitted.set(true);

    this.quizService.submitAttempt({
      quizId: quiz.id,
      userId: user.id,
      score: finalScore,
      submittedAt: new Date().toISOString()
    }).subscribe();
  }
}
