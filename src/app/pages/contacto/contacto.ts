import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  imports: [NgIf, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {
  nombre = '';
  correo = '';
  telefono = '';
  asunto = '';
  mensaje = '';
  mensajeExito = '';
  mensajeError = '';

  enviarMensaje(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.nombre.trim() || !this.correo.trim() || !this.asunto || !this.mensaje.trim()) {
      this.mensajeError = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    this.mensajeExito = 'Tu mensaje fue enviado correctamente. Te contactaremos pronto.';
    this.nombre = '';
    this.correo = '';
    this.telefono = '';
    this.asunto = '';
    this.mensaje = '';
  }
}
