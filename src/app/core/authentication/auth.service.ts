import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, map, catchError, of } from 'rxjs';
import { AppStore } from '../state/app.store';
import { StorageService } from '../services/storage.service';
import { STORAGE_KEYS } from '../constants/app.constants';
import { API_ENDPOINTS } from '../constants/api.constants';
import { LoginRequest, LoginResponse, AuthUser, User } from '../models/user.model';
import { ROLE_PERMISSIONS } from '../permissions/role-permissions';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly store = inject(AppStore);
  private readonly storage = inject(StorageService);

  login(req: LoginRequest): Observable<void> {
    return this.http.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, req).pipe(
      tap(res => this.storeTokens(res)),
      switchMap(loginRes => {
        const token = this.extractToken(loginRes);
        return this.http.get<User>(API_ENDPOINTS.AUTH.ME, {
          headers: { Authorization: `Bearer ${token}` },
        }).pipe(
          tap(profile => this.hydrateUser(loginRes, profile)),
          catchError(() => {
            if (loginRes.user) {
              this.hydrateUser(loginRes, loginRes.user as User);
            }
            return of(null);
          })
        );
      }),
      map(() => void 0)
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

  private extractToken(res: LoginResponse): string {
    return res.accessToken ?? res.token ?? '';
  }

  private storeTokens(res: LoginResponse): void {
    const token = this.extractToken(res);
    this.storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    if (res.refreshToken) {
      this.storage.set(STORAGE_KEYS.REFRESH_TOKEN, res.refreshToken);
    }
  }

  private hydrateUser(loginRes: LoginResponse, profile: User): void {
    const token = this.extractToken(loginRes);
    const user: AuthUser = {
      ...profile,
      accessToken: token,
      refreshToken: loginRes.refreshToken ?? '',
      expiresAt: Date.now() + (loginRes.expiresIn ?? 86400) * 1000,
      permissions: ROLE_PERMISSIONS[profile.role],
    };
    this.storage.set(STORAGE_KEYS.USER, user);
    this.store.setUser(user);
  }
}
