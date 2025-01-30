import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = true;

  constructor() {}

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    const themeClass = this.isDarkTheme ? 'dark-theme' : 'light-theme';
    document.documentElement.className = themeClass;
  }

  getIsDarkTheme(): boolean {
    return this.isDarkTheme;
  }
}