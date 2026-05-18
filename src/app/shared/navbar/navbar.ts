import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(private router: Router) {}

  private obtenerSesion(clave: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem(clave);
  }

  get clienteLogueado(): boolean {
    return this.obtenerSesion('maryNailsClienteSesion') === 'true';
  }

  get adminLogueado(): boolean {
    return this.obtenerSesion('maryNailsAdminSesion') === 'true';
  }

  get sinSesion(): boolean {
    return !this.clienteLogueado && !this.adminLogueado;
  }

  get haySesionActiva(): boolean {
    return this.clienteLogueado || this.adminLogueado;
  }

  cerrarSesion(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('maryNailsClienteSesion');
      localStorage.removeItem('maryNailsClienteUsuario');
      localStorage.removeItem('maryNailsAdminSesion');
      localStorage.removeItem('maryNailsAdminUsuario');
    }

    this.router.navigate(['/']);
  }
}