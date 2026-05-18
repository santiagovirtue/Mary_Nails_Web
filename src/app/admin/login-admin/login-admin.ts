import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-admin',
  imports: [FormsModule, NgIf],
  templateUrl: './login-admin.html',
  styleUrl: './login-admin.css',
})
export class LoginAdmin {
  usuario = '';
  password = '';
  mensajeError = '';

  constructor(private router: Router) {}

  iniciarSesion(): void {
    if (!this.usuario || !this.password) {
      this.mensajeError = 'Por favor ingresa usuario y contraseña.';
      return;
    }

    if (
      this.usuario === 'admin@marynails.com' &&
      this.password === '12345'
    ) {
      localStorage.setItem('maryNailsAdminSesion', 'true');
      localStorage.setItem('maryNailsAdminUsuario', this.usuario);

      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.mensajeError = 'Usuario o contraseña incorrectos.';
  }
}