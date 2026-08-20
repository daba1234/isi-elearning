import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../../models/models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storageKey = 'isi-user';
  readonly currentUser = signal<User | null>(this.readUser());
  readonly isAuthenticated = signal(Boolean(this.currentUser()));

  async login(email: string, password: string): Promise<User> {
    let users: User[];
    try {
      users = await firstValueFrom(this.api.get<User>('/users'));
    } catch {
      throw new Error('JSON Server est indisponible. Lancez npm run api.');
    }
    const user = users.find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password);
    if (!user) throw new Error('Identifiants invalides');
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    return user;
  }

  async register(data: Omit<User, 'id' | 'avatar'>): Promise<User> {
    let users: User[];
    try {
      users = await firstValueFrom(this.api.get<User>('/users'));
      if (users.some((user) => user.email.toLowerCase() === data.email.trim().toLowerCase())) {
        throw new Error('Cette adresse email est deja utilisee.');
      }
      return await firstValueFrom(this.api.post<User>('/users', {
        ...data,
        email: data.email.trim().toLowerCase(),
        avatar: `${data.prenom[0] ?? ''}${data.nom[0] ?? ''}`.toUpperCase()
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('deja utilisee')) throw error;
      throw new Error('JSON Server est indisponible. Lancez npm run api.');
    }
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private readUser(): User | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) as User : null;
    } catch {
      return null;
    }
  }
}
