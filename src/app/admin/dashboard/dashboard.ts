import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  selector: 'app-dashboard',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  reservas: Reserva[] = [];
  calificaciones: Calificacion[] = [];

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarCalificaciones();
  }

  cargarReservas(): void {
    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    this.reservas = reservasGuardadas ? JSON.parse(reservasGuardadas) : [];
  }

  cargarCalificaciones(): void {
    const calificacionesGuardadas = localStorage.getItem('maryNailsCalificaciones');
    this.calificaciones = calificacionesGuardadas
      ? JSON.parse(calificacionesGuardadas)
      : [];
  }

  obtenerFechaHoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  contarCitasHoy(): number {
    const hoy = this.obtenerFechaHoy();
    return this.reservas.filter((reserva) => reserva.fecha === hoy).length;
  }

  contarClientes(): number {
    const telefonosUnicos = new Set(
      this.reservas
        .map((reserva) => reserva.telefono)
        .filter((telefono) => telefono.trim() !== '')
    );

    return telefonosUnicos.size;
  }

  contarServiciosActivos(): number {
    const serviciosUnicos = new Set(
      this.reservas
        .map((reserva) => reserva.servicio)
        .filter((servicio) => servicio.trim() !== '')
    );

    return serviciosUnicos.size;
  }

  contarPagosPendientes(): number {
    return this.reservas.filter((reserva) => reserva.estado === 'Pendiente').length;
  }

  contarCalificaciones(): number {
    return this.calificaciones.length;
  }

  obtenerPromedioCalificaciones(): string {
    if (this.calificaciones.length === 0) {
      return '0.0';
    }

    const suma = this.calificaciones.reduce(
      (total, calificacion) => total + calificacion.puntuacion,
      0
    );

    return (suma / this.calificaciones.length).toFixed(1);
  }

  obtenerProximasCitas(): Reserva[] {
    return [...this.reservas]
      .filter((reserva) => reserva.estado !== 'Cancelada')
      .sort((a, b) => {
        const fechaA = `${a.fecha} ${a.hora}`;
        const fechaB = `${b.fecha} ${b.hora}`;
        return fechaA.localeCompare(fechaB);
      })
      .slice(0, 4);
  }

  obtenerUltimasCalificaciones(): Calificacion[] {
    return [...this.calificaciones]
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
  }
}