import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/app.constants';
import { AppStore } from '../state/app.store';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly store = inject(AppStore);
  private readonly platformId = inject(PLATFORM_ID);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = this.storage.get<'light' | 'dark'>(STORAGE_KEYS.THEME);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved ?? (systemDark ? 'dark' : 'light');
    this.store.setTheme(theme);
    this.save(theme);
  }

  toggle(): void {
    this.store.toggleTheme();
    this.save(this.store.theme());
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.store.setTheme(theme);
    this.save(theme);
  }

  private save(theme: 'light' | 'dark'): void {
    this.storage.set(STORAGE_KEYS.THEME, theme);
  }
}
