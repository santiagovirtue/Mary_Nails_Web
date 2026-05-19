import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Reserva, ReservasService } from '../../services/reservas.service';

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

  constructor(private reservasService: ReservasService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservas = this.reservasService.obtenerReservas();
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
        reserva.estadoPago.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'Todas';
    this.busqueda = '';
  }

  cancelarCita(id: number): void {
    const confirmar = confirm(
      '¿Seguro que deseas cancelar esta cita? Esta acción cambiará el estado de la reserva a Cancelada.'
    );

    if (!confirmar) {
      return;
    }

    this.reservasService.actualizarEstadoCita(id, 'Cancelada');
    this.cargarReservas();
  }
}