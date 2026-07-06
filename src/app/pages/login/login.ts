import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  usuario = '';
  password = '';
  mensajeError = '';
  mensajeExito = '';
  cargando = false;

  modoRegistro = false;
  regNombre = '';
  regCorreo = '';
  regTelefono = '';
  regPassword = '';

  constructor(private router: Router, private http: HttpClient) {}

  iniciarSesion(): void {
    this.mensajeError = '';
    if (!this.usuario || !this.password) {
      this.mensajeError = 'Por favor ingresa correo o teléfono y contraseña.';
      return;
    }
    this.cargando = true;
    this.http.post<any>('/api/auth/login', { usuario: this.usuario, password: this.password }).subscribe({
      next: (data) => {
        this.cargando = false;
        if (data.rol === 'administrador') {
          localStorage.setItem('maryNailsAdminSesion', 'true');
          localStorage.setItem('maryNailsAdminUsuario', data.correo);
          localStorage.removeItem('maryNailsClienteSesion');
          localStorage.removeItem('maryNailsClienteUsuario');
          this.router.navigate(['/admin/dashboard']);
        } else {
          localStorage.setItem('maryNailsClienteSesion', 'true');
          localStorage.setItem('maryNailsClienteUsuario', data.correo);
          localStorage.removeItem('maryNailsAdminSesion');
          localStorage.removeItem('maryNailsAdminUsuario');
          this.router.navigate(['/cliente/mis-citas']);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.error || 'Credenciales incorrectas. Verifica tus datos.';
      },
    });
  }

  crearCuenta(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    if (!this.regNombre || !this.regCorreo || !this.regTelefono || !this.regPassword) {
      this.mensajeError = 'Completa todos los campos para crear tu cuenta.';
      return;
    }
    this.cargando = true;
    this.http.post<any>('/api/auth/registro', {
      nombre: this.regNombre, correo: this.regCorreo,
      telefono: this.regTelefono, password: this.regPassword,
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.mensajeExito = 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.';
        this.modoRegistro = false;
        this.usuario = this.regCorreo;
        this.regNombre = ''; this.regCorreo = ''; this.regTelefono = ''; this.regPassword = '';
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.error || 'Error al crear la cuenta.';
      },
    });
  }

  toggleModo(): void {
    this.modoRegistro = !this.modoRegistro;
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
