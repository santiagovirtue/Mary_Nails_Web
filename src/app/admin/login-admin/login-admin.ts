import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  cargando = false;

  constructor(private router: Router, private http: HttpClient) {}

  iniciarSesion(): void {
    this.mensajeError = '';
    if (!this.usuario || !this.password) {
      this.mensajeError = 'Por favor ingresa usuario y contraseña.';
      return;
    }
    this.cargando = true;
    this.http.post<any>('/api/auth/login', { usuario: this.usuario, password: this.password }).subscribe({
      next: (data) => {
        this.cargando = false;
        if (data.rol !== 'administrador') {
          this.mensajeError = 'Esta cuenta no tiene permisos de administrador.';
          return;
        }
        localStorage.removeItem('maryNailsClienteSesion');
        localStorage.removeItem('maryNailsClienteUsuario');
        localStorage.setItem('maryNailsAdminSesion', 'true');
        localStorage.setItem('maryNailsAdminUsuario', data.correo);
        this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'Usuario o contraseña incorrectos.';
      },
    });
  }
}
