import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, map } from 'rxjs';
import { AppStore } from '../state/app.store';
import { StorageService } from '../services/storage.service';
import { STORAGE_KEYS } from '../constants/app.constants';
import { API_ENDPOINTS } from '../constants/api.constants';
import { LoginRequest, LoginResponse, AdminMeResponse, AuthUser } from '../models/user.model';
import { ROLE_PERMISSIONS } from '../permissions/role-permissions';
import { UserRole } from '../enums/roles.enum';
import { EntityStatus } from '../enums/status.enum';
import { Permission } from '../enums/permissions.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly store = inject(AppStore);
  private readonly storage = inject(StorageService);

  login(req: LoginRequest): Observable<void> {
    return this.http.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, req).pipe(
      tap(res => {
        this.storage.set(STORAGE_KEYS.AUTH_TOKEN, res.data.accessToken);
        this.storage.set(STORAGE_KEYS.REFRESH_TOKEN, res.data.refreshToken);
      }),
      switchMap(loginRes =>
        this.http.get<AdminMeResponse>(API_ENDPOINTS.AUTH.ME, {
          headers: { Authorization: `Bearer ${loginRes.data.accessToken}` },
        }).pipe(
          tap(meRes => {
            const profile = meRes.data;
            const role = (profile.role.name as UserRole) ?? UserRole.ANALYST;
            const user: AuthUser = {
              id: profile.id,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
              fullName: profile.fullName,
              phone: profile.phone,
              role,
              status: (profile.status as EntityStatus) ?? EntityStatus.ACTIVE,
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt,
              accessToken: loginRes.data.accessToken,
              refreshToken: loginRes.data.refreshToken,
              expiresAt: Date.now() + loginRes.data.expiresIn * 1000,
              permissions: (profile.role.permissions as Permission[])
                ?? ROLE_PERMISSIONS[role]
                ?? [],
            };
            this.storage.set(STORAGE_KEYS.USER, user);
            this.store.setUser(user);
          })
        )
      ),
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
}
