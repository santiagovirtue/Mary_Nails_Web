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
  estadoPago?: string;
}

interface Calificacion {
  id: number;
  idCita?: number;
  cliente?: string;
  servicio: string;
  fechaCita?: string;
  horaCita?: string;
  puntuacion: number;
  comentario: string;
  fecha: string;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: string;
  icono: string;
  estado: string;
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
  servicios: Servicio[] = [];

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarCalificaciones();
    this.cargarServicios();
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

  cargarServicios(): void {
    const serviciosGuardados = localStorage.getItem('maryNailsServicios');

    if (serviciosGuardados) {
      this.servicios = JSON.parse(serviciosGuardados);
      return;
    }

    this.servicios = [
      {
        id: 1,
        nombre: 'Manicure profesional',
        descripcion:
          'Limpieza, cuidado de cutícula, limado y esmaltado para mantener tus manos impecables.',
        duracion: '45 min',
        precio: '$25.000',
        icono: '💅',
        estado: 'Activo',
      },
      {
        id: 2,
        nombre: 'Pedicure',
        descripcion:
          'Cuidado completo de pies, limpieza, hidratación y esmaltado con acabado profesional.',
        duracion: '60 min',
        precio: '$30.000',
        icono: '✨',
        estado: 'Activo',
      },
      {
        id: 3,
        nombre: 'Uñas acrílicas',
        descripcion:
          'Extensión y diseño de uñas acrílicas con diferentes estilos, formas y colores.',
        duracion: '90 min',
        precio: '$60.000',
        icono: '🌸',
        estado: 'Activo',
      },
      {
        id: 4,
        nombre: 'Diseño personalizado',
        descripcion:
          'Decoración artística según el gusto del cliente: colores, detalles, brillos y tendencias.',
        duracion: 'Variable',
        precio: 'Desde $15.000',
        icono: '🎨',
        estado: 'Activo',
      },
    ];

    localStorage.setItem('maryNailsServicios', JSON.stringify(this.servicios));
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
    return this.servicios.filter((servicio) => servicio.estado === 'Activo').length;
  }

  contarServiciosInactivos(): number {
    return this.servicios.filter((servicio) => servicio.estado === 'Inactivo').length;
  }

   contarPagosPendientes(): number {
  return this.reservas.filter((reserva) => reserva.estadoPago !== 'Pagado').length;
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