import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AppStore } from '../state/app.store';
import { Permission } from '../enums/permissions.enum';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(AppStore);
  const router = inject(Router);
  const required: Permission[] = route.data['permissions'] ?? [];

  if (!required.length) return true;

  const userPerms = store.permissions();
  const hasAll = required.every(p => userPerms.includes(p));

  if (hasAll) return true;

  router.navigate(['/403']);
  return false;
};
