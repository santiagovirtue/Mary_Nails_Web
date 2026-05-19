import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Reserva, ReservasService } from '../../services/reservas.service';
import {
  Calificacion,
  CalificacionesService,
} from '../../services/calificaciones.service';
import { Servicio, ServiciosService } from '../../services/servicios.service';

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

  obtenerFechaHoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  contarCitasHoy(): number {
    const hoy = this.obtenerFechaHoy();

    return this.reservas.filter((reserva) => reserva.fecha === hoy).length;
  }

  contarClientes(): number {
    return this.reservasService.contarClientesUnicos();
  }

  contarServiciosActivos(): number {
    return this.serviciosService.contarServiciosActivos();
  }

  contarServiciosInactivos(): number {
    return this.serviciosService.contarServiciosInactivos();
  }

  contarPagosPendientes(): number {
    return this.reservasService.contarPagosPendientes();
  }

  contarCalificaciones(): number {
    return this.calificacionesService.contarCalificaciones();
  }

  obtenerPromedioCalificaciones(): string {
    return this.calificacionesService.obtenerPromedio();
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
    return this.calificacionesService.obtenerUltimasCalificaciones(4);
  }
}