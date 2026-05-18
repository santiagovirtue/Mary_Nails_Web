import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  iniciarSesion(): void {
    if (!this.usuario || !this.password) {
      this.mensajeError = 'Por favor ingresa correo o teléfono y contraseña.';
      return;
    }

    if (
      this.usuario === 'cliente@marynails.com' &&
      this.password === '12345'
    ) {
      localStorage.removeItem('maryNailsAdminSesion');
localStorage.removeItem('maryNailsAdminUsuario');

localStorage.setItem('maryNailsClienteSesion', 'true');
localStorage.setItem('maryNailsClienteUsuario', this.usuario);

      this.router.navigate(['/cliente/mis-citas']);
      return;
    }

    this.mensajeError = 'Credenciales incorrectas. Verifica tus datos.';
  }

  crearCuenta(): void {
    this.mensajeError =
      'La creación de cuenta estará disponible cuando se conecte el backend.';
  }
}