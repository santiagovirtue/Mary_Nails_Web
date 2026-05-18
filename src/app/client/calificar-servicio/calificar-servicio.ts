import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Reserva {
  id: number;
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  metodoPago: string;
  comentarios: string;
  estado: string;
}

interface Calificacion {
  id: number;
  servicio: string;
  puntuacion: number;
  comentario: string;
  fecha: string;
}

@Component({
  selector: 'app-calificar-servicio',
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './calificar-servicio.html',
  styleUrl: './calificar-servicio.css',
})
export class CalificarServicio implements OnInit {
  estrellas = [1, 2, 3, 4, 5];

  serviciosBase = [
    'Manicure profesional',
    'Pedicure',
    'Uñas acrílicas',
    'Diseño personalizado',
  ];

  reservasCompletadas: Reserva[] = [];

  calificacion = {
    servicio: '',
    puntuacion: 0,
    comentario: '',
  };

  mensajeExito = '';
  mensajeError = '';

  ngOnInit(): void {
    this.cargarReservasCompletadas();
  }

  cargarReservasCompletadas(): void {
    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    const reservas: Reserva[] = reservasGuardadas ? JSON.parse(reservasGuardadas) : [];

    this.reservasCompletadas = reservas.filter(
      (reserva) => reserva.estado === 'Completada'
    );
  }

  obtenerServiciosDisponibles(): string[] {
    const serviciosCompletados = this.reservasCompletadas.map(
      (reserva) => reserva.servicio
    );

    return Array.from(new Set([...serviciosCompletados, ...this.serviciosBase]));
  }

  seleccionarPuntuacion(valor: number): void {
    this.calificacion.puntuacion = valor;
    this.mensajeError = '';
  }

  obtenerTextoPuntuacion(): string {
    const textos: Record<number, string> = {
      1: 'Muy malo',
      2: 'Regular',
      3: 'Bueno',
      4: 'Muy bueno',
      5: 'Excelente',
    };

    return textos[this.calificacion.puntuacion] || 'Selecciona una puntuación';
  }

  enviarCalificacion(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.calificacion.servicio) {
      this.mensajeError = 'Selecciona el servicio que deseas calificar.';
      return;
    }

    if (this.calificacion.puntuacion === 0) {
      this.mensajeError = 'Selecciona una puntuación de 1 a 5 estrellas.';
      return;
    }

    if (!this.calificacion.comentario.trim()) {
      this.mensajeError = 'Escribe un comentario sobre el servicio recibido.';
      return;
    }

    const nuevaCalificacion: Calificacion = {
      id: Date.now(),
      servicio: this.calificacion.servicio,
      puntuacion: this.calificacion.puntuacion,
      comentario: this.calificacion.comentario,
      fecha: new Date().toISOString().slice(0, 10),
    };

    const calificacionesGuardadas = localStorage.getItem('maryNailsCalificaciones');
    const calificaciones: Calificacion[] = calificacionesGuardadas
      ? JSON.parse(calificacionesGuardadas)
      : [];

    calificaciones.push(nuevaCalificacion);

    localStorage.setItem(
      'maryNailsCalificaciones',
      JSON.stringify(calificaciones)
    );

    this.mensajeExito =
      'Calificación enviada correctamente. Gracias por compartir tu experiencia.';

    this.calificacion = {
      servicio: '',
      puntuacion: 0,
      comentario: '',
    };
  }
}