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

    this.guardarReservas();
  }

  guardarReservas(): void {
    localStorage.setItem('maryNailsReservas', JSON.stringify(this.reservas));
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
        (reserva.estadoPago || 'Pendiente').toLowerCase().includes(texto);

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
    this.reservas = this.reservas.map((reserva) =>
      reserva.id === id ? { ...reserva, estado: 'Confirmada' } : reserva
    );

    this.guardarReservas();
    this.mensaje = 'La reserva fue confirmada correctamente.';
  }

  completarReserva(id: number): void {
    this.reservas = this.reservas.map((reserva) =>
      reserva.id === id ? { ...reserva, estado: 'Completada' } : reserva
    );

    this.guardarReservas();
    this.mensaje = 'La reserva fue marcada como completada.';
  }

  cancelarReserva(id: number): void {
    this.reservas = this.reservas.map((reserva) =>
      reserva.id === id ? { ...reserva, estado: 'Cancelada' } : reserva
    );

    this.guardarReservas();
    this.mensaje = 'La reserva fue cancelada correctamente.';
  }

  eliminarReserva(id: number): void {
    this.reservas = this.reservas.filter((reserva) => reserva.id !== id);
    this.guardarReservas();
    this.mensaje = 'La reserva fue eliminada correctamente.';
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = 'Todas';
  }
}