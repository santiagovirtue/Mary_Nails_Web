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
  idCita: number;
  cliente: string;
  servicio: string;
  fechaCita: string;
  horaCita: string;
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

  reservasCompletadas: Reserva[] = [];
  calificaciones: Calificacion[] = [];

  calificacion = {
    idCita: 0,
    puntuacion: 0,
    comentario: '',
  };

  mensajeExito = '';
  mensajeError = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    const calificacionesGuardadas = localStorage.getItem('maryNailsCalificaciones');

    const reservas: Reserva[] = reservasGuardadas
      ? JSON.parse(reservasGuardadas)
      : [];

    this.calificaciones = calificacionesGuardadas
      ? JSON.parse(calificacionesGuardadas)
      : [];

    this.reservasCompletadas = reservas.filter(
      (reserva) =>
        reserva.estado === 'Completada' && !this.yaFueCalificada(reserva.id)
    );
  }

  yaFueCalificada(idCita: number): boolean {
    return this.calificaciones.some(
      (calificacion) => calificacion.idCita === idCita
    );
  }

  obtenerReservaSeleccionada(): Reserva | undefined {
    return this.reservasCompletadas.find(
      (reserva) => reserva.id === Number(this.calificacion.idCita)
    );
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

    const reservaSeleccionada = this.obtenerReservaSeleccionada();

    if (!reservaSeleccionada) {
      this.mensajeError = 'Selecciona una cita completada para calificar.';
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
      idCita: reservaSeleccionada.id,
      cliente: reservaSeleccionada.nombre,
      servicio: reservaSeleccionada.servicio,
      fechaCita: reservaSeleccionada.fecha,
      horaCita: reservaSeleccionada.hora,
      puntuacion: this.calificacion.puntuacion,
      comentario: this.calificacion.comentario,
      fecha: new Date().toISOString().slice(0, 10),
    };

    this.calificaciones.push(nuevaCalificacion);

    localStorage.setItem(
      'maryNailsCalificaciones',
      JSON.stringify(this.calificaciones)
    );

    this.mensajeExito =
      'Calificación enviada correctamente. Gracias por compartir tu experiencia.';

    this.calificacion = {
      idCita: 0,
      puntuacion: 0,
      comentario: '',
    };

    this.cargarDatos();
  }
}