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

interface Cliente {
  nombre: string;
  telefono: string;
  totalReservas: number;
  ultimaCita: string;
  servicios: string[];
  citasPendientes: number;
  citasConfirmadas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  pagosPendientes: number;
}

@Component({
  selector: 'app-clientes',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  reservas: Reserva[] = [];
  clientes: Cliente[] = [];

  busqueda = '';

  ngOnInit(): void {
    this.cargarReservas();
    this.generarClientes();
  }

  cargarReservas(): void {
    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    this.reservas = reservasGuardadas ? JSON.parse(reservasGuardadas) : [];
  }

  generarClientes(): void {
    const clientesMap = new Map<string, Reserva[]>();

    this.reservas.forEach((reserva) => {
      const telefono = reserva.telefono.trim();

      if (!clientesMap.has(telefono)) {
        clientesMap.set(telefono, []);
      }

      clientesMap.get(telefono)?.push(reserva);
    });

    this.clientes = Array.from(clientesMap.entries()).map(
      ([telefono, reservasCliente]) => {
        const servicios = Array.from(
          new Set(reservasCliente.map((reserva) => reserva.servicio))
        );

        const reservasOrdenadas = [...reservasCliente].sort((a, b) =>
          b.fecha.localeCompare(a.fecha)
        );

        return {
          nombre: reservasCliente[0].nombre,
          telefono,
          totalReservas: reservasCliente.length,
          ultimaCita: reservasOrdenadas[0]?.fecha || 'Sin fecha',
          servicios,
          citasPendientes: reservasCliente.filter(
            (reserva) => reserva.estado === 'Pendiente'
          ).length,
          citasConfirmadas: reservasCliente.filter(
            (reserva) => reserva.estado === 'Confirmada'
          ).length,
          citasCompletadas: reservasCliente.filter(
            (reserva) => reserva.estado === 'Completada'
          ).length,
          citasCanceladas: reservasCliente.filter(
            (reserva) => reserva.estado === 'Cancelada'
          ).length,
          pagosPendientes: reservasCliente.filter(
            (reserva) => reserva.estadoPago !== 'Pagado'
          ).length,
        };
      }
    );
  }

  obtenerClientesFiltrados(): Cliente[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.clientes.filter((cliente) => {
      const serviciosTexto = cliente.servicios.join(' ').toLowerCase();

      return (
        cliente.nombre.toLowerCase().includes(texto) ||
        cliente.telefono.toLowerCase().includes(texto) ||
        serviciosTexto.includes(texto)
      );
    });
  }

  contarClientes(): number {
    return this.clientes.length;
  }

  contarReservasTotales(): number {
    return this.reservas.length;
  }

  contarClientesConPagosPendientes(): number {
    return this.clientes.filter((cliente) => cliente.pagosPendientes > 0).length;
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
  }
}