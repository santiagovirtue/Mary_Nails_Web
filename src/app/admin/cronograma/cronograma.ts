import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Reserva, ReservasService } from '../../services/reservas.service';

@Component({
  selector: 'app-cronograma',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './cronograma.html',
  styleUrl: './cronograma.css',
})
export class Cronograma implements OnInit {
  reservas: Reserva[] = [];

  busqueda = '';
  filtroEstado = 'Todas';
  mensaje = '';

  constructor(private reservasService: ReservasService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservas = this.reservasService.obtenerReservas();
  }

  obtenerReservasFiltradas(): Reserva[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.reservas.filter((reserva) => {
      const coincideBusqueda =
        reserva.nombre.toLowerCase().includes(texto) ||
        reserva.telefono.toLowerCase().includes(texto) ||
        reserva.servicio.toLowerCase().includes(texto) ||
        reserva.metodoPago.toLowerCase().includes(texto) ||
        reserva.estado.toLowerCase().includes(texto) ||
        reserva.estadoPago.toLowerCase().includes(texto);

      const coincideEstado =
        this.filtroEstado === 'Todas' || reserva.estado === this.filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }

  contarTotal(): number {
    return this.reservas.length;
  }

  contarPendientes(): number {
    return this.reservas.filter((reserva) => reserva.estado === 'Pendiente').length;
  }

  contarConfirmadas(): number {
    return this.reservas.filter((reserva) => reserva.estado === 'Confirmada').length;
  }

  contarCompletadas(): number {
    return this.reservas.filter((reserva) => reserva.estado === 'Completada').length;
  }

  contarCanceladas(): number {
    return this.reservas.filter((reserva) => reserva.estado === 'Cancelada').length;
  }

  contarPagadas(): number {
    return this.reservas.filter((reserva) => reserva.estadoPago === 'Pagado').length;
  }

  confirmarReserva(id: number): void {
    this.reservasService.actualizarEstadoCita(id, 'Confirmada');
    this.cargarReservas();
    this.mensaje = 'La reserva fue confirmada correctamente.';
  }

  completarReserva(id: number): void {
    this.reservasService.actualizarEstadoCita(id, 'Completada');
    this.cargarReservas();
    this.mensaje = 'La reserva fue marcada como completada.';
  }

  cancelarReserva(id: number): void {
    const confirmar = confirm(
      '¿Seguro que deseas cancelar esta reserva? El estado cambiará a Cancelada.'
    );

    if (!confirmar) {
      return;
    }

    this.reservasService.actualizarEstadoCita(id, 'Cancelada');
    this.cargarReservas();
    this.mensaje = 'La reserva fue cancelada correctamente.';
  }

  eliminarReserva(id: number): void {
    const confirmar = confirm(
      '¿Seguro que deseas eliminar esta reserva? Esta acción no se puede deshacer.'
    );

    if (!confirmar) {
      return;
    }

    this.reservasService.eliminarReserva(id);
    this.cargarReservas();
    this.mensaje = 'La reserva fue eliminada correctamente.';
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = 'Todas';
  }
}