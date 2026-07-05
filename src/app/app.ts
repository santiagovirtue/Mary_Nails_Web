import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { Navbar } from './shared/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(private router: Router) {}

  get adminLogueado(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('maryNailsAdminSesion') === 'true';
  }

  cerrarSesionAdmin(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('maryNailsAdminSesion');
      localStorage.removeItem('maryNailsAdminUsuario');
    }
    this.router.navigate(['/']);
  }
}
