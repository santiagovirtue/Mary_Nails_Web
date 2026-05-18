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
}

@Component({
  selector: 'app-cronograma',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './cronograma.html',
  styleUrl: './cronograma.css',
})
export class Cronograma implements OnInit {
  reservas: Reserva[] = [];

  filtroEstado = 'Todas';
  busqueda = '';
  mensajeAccion = '';

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    this.reservas = reservasGuardadas ? JSON.parse(reservasGuardadas) : [];
  }

  guardarReservas(): void {
    localStorage.setItem('maryNailsReservas', JSON.stringify(this.reservas));
  }

  contarPorEstado(estado: string): number {
    return this.reservas.filter((reserva) => reserva.estado === estado).length;
  }

  contarTotal(): number {
    return this.reservas.length;
  }

  obtenerReservasFiltradas(): Reserva[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.reservas.filter((reserva) => {
      const coincideEstado =
        this.filtroEstado === 'Todas' || reserva.estado === this.filtroEstado;

      const coincideBusqueda =
        reserva.nombre.toLowerCase().includes(texto) ||
        reserva.servicio.toLowerCase().includes(texto) ||
        reserva.metodoPago.toLowerCase().includes(texto) ||
        reserva.telefono.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'Todas';
    this.busqueda = '';
  }

  confirmarReserva(id: number): void {
    this.actualizarEstado(id, 'Confirmada');
    this.mensajeAccion = 'La reserva fue confirmada correctamente.';
  }

  cancelarReserva(id: number): void {
    this.actualizarEstado(id, 'Cancelada');
    this.mensajeAccion = 'La reserva fue cancelada correctamente.';
  }

  completarReserva(id: number): void {
    this.actualizarEstado(id, 'Completada');
    this.mensajeAccion = 'La reserva fue marcada como completada.';
  }

  eliminarReserva(id: number): void {
    this.reservas = this.reservas.filter((reserva) => reserva.id !== id);
    this.guardarReservas();
    this.mensajeAccion = 'La reserva fue eliminada correctamente.';
  }

  actualizarEstado(id: number, nuevoEstado: string): void {
    this.reservas = this.reservas.map((reserva) =>
      reserva.id === id ? { ...reserva, estado: nuevoEstado } : reserva
    );

    this.guardarReservas();
  }
}