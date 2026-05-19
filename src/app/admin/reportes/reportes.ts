import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Reserva, ReservasService } from '../../services/reservas.service';
import {
  Calificacion,
  CalificacionesService,
} from '../../services/calificaciones.service';
import { Servicio, ServiciosService } from '../../services/servicios.service';

@Component({
  selector: 'app-reportes',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  reservas: Reserva[] = [];
  calificaciones: Calificacion[] = [];
  servicios: Servicio[] = [];

  fechaInicio = '';
  fechaFin = '';

  constructor(
    private reservasService: ReservasService,
    private calificacionesService: CalificacionesService,
    private serviciosService: ServiciosService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.reservas = this.reservasService.obtenerReservas();
    this.calificaciones = this.calificacionesService.obtenerCalificaciones();
    this.servicios = this.serviciosService.obtenerServicios();
  }

  rangoFechasValido(): boolean {
    if (!this.fechaInicio || !this.fechaFin) {
      return true;
    }

    return this.fechaInicio <= this.fechaFin;
  }

  obtenerReservasFiltradas(): Reserva[] {
    if (!this.rangoFechasValido()) {
      return [];
    }

    return this.reservas.filter((reserva) => {
      const cumpleInicio =
        !this.fechaInicio || reserva.fecha >= this.fechaInicio;

      const cumpleFin = !this.fechaFin || reserva.fecha <= this.fechaFin;

      return cumpleInicio && cumpleFin;
    });
  }

  obtenerCalificacionesFiltradas(): Calificacion[] {
    if (!this.rangoFechasValido()) {
      return [];
    }

    return this.calificaciones.filter((calificacion) => {
      const fechaCalificacion = calificacion.fecha;

      const cumpleInicio =
        !this.fechaInicio || fechaCalificacion >= this.fechaInicio;

      const cumpleFin =
        !this.fechaFin || fechaCalificacion <= this.fechaFin;

      return cumpleInicio && cumpleFin;
    });
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
  }

  hayFiltroActivo(): boolean {
    return this.fechaInicio !== '' || this.fechaFin !== '';
  }

  contarReservas(): number {
    return this.obtenerReservasFiltradas().length;
  }

  contarPorEstado(estado: string): number {
    return this.obtenerReservasFiltradas().filter(
      (reserva) => reserva.estado === estado
    ).length;
  }

  contarPagosPendientes(): number {
    return this.obtenerReservasFiltradas().filter(
      (reserva) => reserva.estadoPago !== 'Pagado'
    ).length;
  }

  contarPagosRealizados(): number {
    return this.obtenerReservasFiltradas().filter(
      (reserva) => reserva.estadoPago === 'Pagado'
    ).length;
  }

  contarClientes(): number {
    const telefonosUnicos = new Set(
      this.obtenerReservasFiltradas()
        .map((reserva) => reserva.telefono)
        .filter((telefono) => telefono.trim() !== '')
    );

    return telefonosUnicos.size;
  }

  contarServiciosActivos(): number {
    return this.serviciosService.contarServiciosActivos();
  }

  contarServiciosInactivos(): number {
    return this.serviciosService.contarServiciosInactivos();
  }

  contarCalificaciones(): number {
    return this.obtenerCalificacionesFiltradas().length;
  }

  obtenerPromedioCalificaciones(): string {
    const calificacionesFiltradas = this.obtenerCalificacionesFiltradas();

    if (calificacionesFiltradas.length === 0) {
      return '0.0';
    }

    const suma = calificacionesFiltradas.reduce(
      (total, calificacion) => total + calificacion.puntuacion,
      0
    );

    return (suma / calificacionesFiltradas.length).toFixed(1);
  }

  obtenerServiciosMasReservados(): { servicio: string; total: number }[] {
    const contador = new Map<string, number>();

    this.obtenerReservasFiltradas().forEach((reserva) => {
      contador.set(
        reserva.servicio,
        (contador.get(reserva.servicio) || 0) + 1
      );
    });

    return Array.from(contador.entries())
      .map(([servicio, total]) => ({ servicio, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  obtenerMetodosPago(): { metodo: string; total: number }[] {
    const contador = new Map<string, number>();

    this.obtenerReservasFiltradas().forEach((reserva) => {
      contador.set(
        reserva.metodoPago,
        (contador.get(reserva.metodoPago) || 0) + 1
      );
    });

    return Array.from(contador.entries()).map(([metodo, total]) => ({
      metodo,
      total,
    }));
  }

  imprimirReporte(): void {
    window.print();
  }
}