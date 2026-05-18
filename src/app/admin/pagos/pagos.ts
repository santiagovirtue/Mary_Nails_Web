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
  selector: 'app-pagos',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  reservas: Reserva[] = [];

  filtroPago = 'Todos';
  busqueda = '';
  mensaje = '';

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    const reservas: Reserva[] = reservasGuardadas ? JSON.parse(reservasGuardadas) : [];

    this.reservas = reservas.map((reserva) => ({
      ...reserva,
      estadoPago: reserva.estadoPago || 'Pendiente',
    }));

    this.guardarReservas();
  }

  guardarReservas(): void {
    localStorage.setItem('maryNailsReservas', JSON.stringify(this.reservas));
  }

  obtenerPagosFiltrados(): Reserva[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.reservas.filter((reserva) => {
      const coincideBusqueda =
        reserva.nombre.toLowerCase().includes(texto) ||
        reserva.telefono.toLowerCase().includes(texto) ||
        reserva.servicio.toLowerCase().includes(texto) ||
        reserva.metodoPago.toLowerCase().includes(texto);

      const coincidePago =
        this.filtroPago === 'Todos' || reserva.estadoPago === this.filtroPago;

      return coincideBusqueda && coincidePago;
    });
  }

  contarTotal(): number {
    return this.reservas.length;
  }

  contarPagados(): number {
    return this.reservas.filter((reserva) => reserva.estadoPago === 'Pagado').length;
  }

  contarPendientes(): number {
    return this.reservas.filter((reserva) => reserva.estadoPago !== 'Pagado').length;
  }

  marcarComoPagado(id: number): void {
    this.reservas = this.reservas.map((reserva) =>
      reserva.id === id ? { ...reserva, estadoPago: 'Pagado' } : reserva
    );

    this.guardarReservas();
    this.mensaje = 'Pago marcado como pagado correctamente.';
  }

  marcarComoPendiente(id: number): void {
    this.reservas = this.reservas.map((reserva) =>
      reserva.id === id ? { ...reserva, estadoPago: 'Pendiente' } : reserva
    );

    this.guardarReservas();
    this.mensaje = 'Pago marcado como pendiente correctamente.';
  }

  limpiarFiltros(): void {
    this.filtroPago = 'Todos';
    this.busqueda = '';
  }
}