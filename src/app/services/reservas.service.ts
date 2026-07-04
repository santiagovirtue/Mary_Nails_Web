import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type EstadoReserva = 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada';
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

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly storageKey = 'maryNailsReservas';
  constructor(private http: HttpClient) {}

  obtenerReservas(): Reserva[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.storageKey);
    const reservas: Reserva[] = data ? JSON.parse(data) : [];
    return reservas.map(r => ({ ...r, estado: r.estado || 'Pendiente', estadoPago: r.estadoPago || 'Pendiente' }));
  }

  guardarReservas(reservas: Reserva[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(reservas));
  }

  agregarReserva(nueva: NuevaReserva): Reserva {
    const reservas = this.obtenerReservas();
    const reserva: Reserva = { id: Date.now(), ...nueva, nombre: nueva.nombre.trim(), telefono: nueva.telefono.trim(), servicio: nueva.servicio.trim(), comentarios: nueva.comentarios.trim(), estado: 'Pendiente', estadoPago: 'Pendiente' };
    reservas.push(reserva);
    this.guardarReservas(reservas);
    this.http.post('/api/reservas', nueva).subscribe({ error: () => {} });
    return reserva;
  }

  actualizarEstadoCita(id: number, estado: EstadoReserva): void {
    const reservas = this.obtenerReservas().map(r => r.id === id ? { ...r, estado } : r);
    this.guardarReservas(reservas);
    this.http.patch(`/api/reservas/${id}/estado`, { estado }).subscribe({ error: () => {} });
  }

  actualizarEstadoPago(id: number, estadoPago: EstadoPago): void {
    const reservas = this.obtenerReservas().map(r => r.id === id ? { ...r, estadoPago } : r);
    this.guardarReservas(reservas);
    this.http.patch(`/api/reservas/${id}/pago`, { estadoPago }).subscribe({ error: () => {} });
  }

  eliminarReserva(id: number): void {
    const reservas = this.obtenerReservas().filter(r => r.id !== id);
    this.guardarReservas(reservas);
    this.http.delete(`/api/reservas/${id}`).subscribe({ error: () => {} });
  }

  existeReserva(fecha: string, hora: string): boolean {
    return this.obtenerReservas().some(r => r.fecha === fecha && r.hora === hora && r.estado !== 'Cancelada');
  }

  obtenerReservasPorTelefono(telefono: string): Reserva[] {
    return this.obtenerReservas().filter(r => r.telefono.trim() === telefono.trim());
  }

  contarPagosPendientes(): number {
    return this.obtenerReservas().filter(r => r.estadoPago !== 'Pagado').length;
  }

  contarClientesUnicos(): number {
    return new Set(this.obtenerReservas().map(r => r.telefono).filter(t => t.trim() !== '')).size;
  }
}
