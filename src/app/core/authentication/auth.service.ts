import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of, delay } from 'rxjs';
import { AppStore } from '../state/app.store';
import { StorageService } from '../services/storage.service';
import { STORAGE_KEYS } from '../constants/app.constants';
import { API_ENDPOINTS } from '../constants/api.constants';
import { LoginRequest, LoginResponse, AuthUser } from '../models/user.model';
import { ROLE_PERMISSIONS } from '../permissions/role-permissions';
import { MOCK_USERS } from '../../shared/data/mock-auth.data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly store = inject(AppStore);
  private readonly storage = inject(StorageService);

  login(req: LoginRequest): Observable<LoginResponse> {
    // Mock login — replace with: return this.http.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, req)
    const mockUser = MOCK_USERS.find(u => u.email === req.email);
    if (!mockUser) throw new Error('Invalid credentials');

    const response: LoginResponse = {
      user: { ...mockUser, accessToken: 'mock-token', refreshToken: 'mock-refresh', expiresAt: Date.now() + 86400000 },
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      expiresIn: 86400,
    };

    return of(response).pipe(
      delay(800),
      tap(res => this.handleLoginSuccess(res))
    );
  }

  logout(): void {
    this.storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    this.storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    this.storage.remove(STORAGE_KEYS.USER);
    this.store.logout();
    this.router.navigate(['/auth/login']);
  }

  restoreSession(): boolean {
    const token = this.storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    const user = this.storage.get<AuthUser>(STORAGE_KEYS.USER);
    if (token && user) {
      this.store.setUser(user);
      return true;
    }
    return false;
  }

  isAuthenticated(): boolean {
    return this.store.isAuthenticated();
  }

  get currentUser(): AuthUser | null {
    return this.store.user();
  }

  private handleLoginSuccess(res: LoginResponse): void {
    const user: AuthUser = {
      ...res.user,
      permissions: ROLE_PERMISSIONS[res.user.role],
    };
    this.storage.set(STORAGE_KEYS.AUTH_TOKEN, res.accessToken);
    this.storage.set(STORAGE_KEYS.REFRESH_TOKEN, res.refreshToken);
    this.storage.set(STORAGE_KEYS.USER, user);
    this.store.setUser(user);
  }
}
