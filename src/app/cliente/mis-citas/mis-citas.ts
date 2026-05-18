import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-mis-citas',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css',
})
export class MisCitas implements OnInit {
  reservas: Reserva[] = [];
  filtroEstado = 'Todas';
  busqueda = '';

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    const reservas: Reserva[] = reservasGuardadas
      ? JSON.parse(reservasGuardadas)
      : [];

    this.reservas = reservas.map((reserva) => ({
      ...reserva,
      estadoPago: reserva.estadoPago || 'Pendiente',
    }));
  }

  contarActivas(): number {
    return this.reservas.filter(
      (reserva) =>
        reserva.estado === 'Pendiente' || reserva.estado === 'Confirmada'
    ).length;
  }

  contarCompletadas(): number {
    return this.reservas.filter(
      (reserva) => reserva.estado === 'Completada'
    ).length;
  }

  contarPendientes(): number {
    return this.reservas.filter(
      (reserva) => reserva.estado === 'Pendiente'
    ).length;
  }

  contarPagadas(): number {
    return this.reservas.filter(
      (reserva) => reserva.estadoPago === 'Pagado'
    ).length;
  }

  obtenerReservasFiltradas(): Reserva[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.reservas.filter((reserva) => {
      const coincideEstado =
        this.filtroEstado === 'Todas' || reserva.estado === this.filtroEstado;

      const coincideBusqueda =
        reserva.servicio.toLowerCase().includes(texto) ||
        reserva.fecha.toLowerCase().includes(texto) ||
        reserva.hora.toLowerCase().includes(texto) ||
        reserva.metodoPago.toLowerCase().includes(texto) ||
        (reserva.estadoPago || 'Pendiente').toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'Todas';
    this.busqueda = '';
  }
}