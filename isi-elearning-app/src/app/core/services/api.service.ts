import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { from, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly client: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' }
  });

  get<T>(resource: string) {
    return from(this.client.get<T[]>(resource)).pipe(map(response => response.data));
  }

  getOne<T>(resource: string) {
    return from(this.client.get<T>(resource)).pipe(map(response => response.data));
  }

  post<T>(resource: string, body: unknown) {
    return from(this.client.post<T>(resource, body)).pipe(map(response => response.data));
  }

  put<T>(resource: string, body: unknown) {
    return from(this.client.put<T>(resource, body)).pipe(map(response => response.data));
  }

  patch<T>(resource: string, body: unknown) {
    return from(this.client.patch<T>(resource, body)).pipe(map(response => response.data));
  }

  delete(resource: string) {
    return from(this.client.delete(resource));
  }
}
