import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Reserva, ReservasService } from '../../services/reservas.service';

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

  constructor(private reservasService: ReservasService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservas = this.reservasService.obtenerReservas();
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
    this.reservasService.actualizarEstadoPago(id, 'Pagado');
    this.cargarReservas();
    this.mensaje = 'Pago marcado como pagado correctamente.';
  }

  marcarComoPendiente(id: number): void {
    this.reservasService.actualizarEstadoPago(id, 'Pendiente');
    this.cargarReservas();
    this.mensaje = 'Pago marcado como pendiente correctamente.';
  }

  limpiarFiltros(): void {
    this.filtroPago = 'Todos';
    this.busqueda = '';
  }
}