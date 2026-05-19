import { Injectable } from '@angular/core';

export type EstadoReserva =
  | 'Pendiente'
  | 'Confirmada'
  | 'Completada'
  | 'Cancelada';

export type EstadoPago = 'Pendiente' | 'Pagado';

export interface Reserva {
  id: number;
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  metodoPago: string;
  comentarios: string;
  estado: EstadoReserva;
  estadoPago: EstadoPago;
}

export interface NuevaReserva {
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  metodoPago: string;
  comentarios: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private readonly storageKey = 'maryNailsReservas';

  obtenerReservas(): Reserva[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const reservasGuardadas = localStorage.getItem(this.storageKey);
    const reservas: Reserva[] = reservasGuardadas
      ? JSON.parse(reservasGuardadas)
      : [];

    return reservas.map((reserva) => ({
      ...reserva,
      estado: reserva.estado || 'Pendiente',
      estadoPago: reserva.estadoPago || 'Pendiente',
    }));
  }

  guardarReservas(reservas: Reserva[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(reservas));
  }

  agregarReserva(nuevaReserva: NuevaReserva): Reserva {
    const reservas = this.obtenerReservas();

    const reserva: Reserva = {
      id: Date.now(),
      nombre: nuevaReserva.nombre.trim(),
      telefono: nuevaReserva.telefono.trim(),
      servicio: nuevaReserva.servicio.trim(),
      fecha: nuevaReserva.fecha,
      hora: nuevaReserva.hora,
      metodoPago: nuevaReserva.metodoPago,
      comentarios: nuevaReserva.comentarios.trim(),
      estado: 'Pendiente',
      estadoPago: 'Pendiente',
    };

    reservas.push(reserva);
    this.guardarReservas(reservas);

    return reserva;
  }

  actualizarEstadoCita(id: number, estado: EstadoReserva): void {
    const reservas = this.obtenerReservas().map((reserva) =>
      reserva.id === id ? { ...reserva, estado } : reserva
    );

    this.guardarReservas(reservas);
  }

  actualizarEstadoPago(id: number, estadoPago: EstadoPago): void {
    const reservas = this.obtenerReservas().map((reserva) =>
      reserva.id === id ? { ...reserva, estadoPago } : reserva
    );

    this.guardarReservas(reservas);
  }

  eliminarReserva(id: number): void {
    const reservas = this.obtenerReservas().filter(
      (reserva) => reserva.id !== id
    );

    this.guardarReservas(reservas);
  }

  existeReserva(fecha: string, hora: string): boolean {
    return this.obtenerReservas().some(
      (reserva) =>
        reserva.fecha === fecha &&
        reserva.hora === hora &&
        reserva.estado !== 'Cancelada'
    );
  }

  obtenerReservasPorTelefono(telefono: string): Reserva[] {
    return this.obtenerReservas().filter(
      (reserva) => reserva.telefono.trim() === telefono.trim()
    );
  }

  contarPagosPendientes(): number {
    return this.obtenerReservas().filter(
      (reserva) => reserva.estadoPago !== 'Pagado'
    ).length;
  }

  contarClientesUnicos(): number {
    const telefonosUnicos = new Set(
      this.obtenerReservas()
        .map((reserva) => reserva.telefono)
        .filter((telefono) => telefono.trim() !== '')
    );

    return telefonosUnicos.size;
  }
}