import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Calificacion {
  id: number;
  idCita?: number;
  cliente?: string;
  servicio: string;
  fechaCita?: string;
  horaCita?: string;
  puntuacion: number;
  comentario: string;
  fecha: string;
}

export interface NuevaCalificacion {
  idCita: number;
  cliente: string;
  servicio: string;
  fechaCita: string;
  horaCita: string;
  puntuacion: number;
  comentario: string;
}

@Injectable({ providedIn: 'root' })
export class CalificacionesService {
  private readonly storageKey = 'maryNailsCalificaciones';
  constructor(private http: HttpClient) {}

  obtenerCalificaciones(): Calificacion[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  guardarCalificaciones(calificaciones: Calificacion[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(calificaciones));
    this.http.post('/api/calificaciones', calificaciones).subscribe({ error: () => {} });
  }

  agregarCalificacion(nueva: NuevaCalificacion): Calificacion {
    const calificaciones = this.obtenerCalificaciones();
    const cal: Calificacion = { id: Date.now(), ...nueva, fecha: new Date().toISOString().slice(0,10) };
    calificaciones.push(cal);
    this.guardarCalificaciones(calificaciones);
    return cal;
  }

  eliminarCalificacion(id: number): void {
    const calificaciones = this.obtenerCalificaciones().filter(c => c.id !== id);
    this.guardarCalificaciones(calificaciones);
    this.http.delete(`/api/calificaciones/${id}`).subscribe({ error: () => {} });
  }

  yaExisteCalificacionParaCita(idCita: number): boolean {
    return this.obtenerCalificaciones().some(c => c.idCita === idCita);
  }

  contarCalificaciones(): number { return this.obtenerCalificaciones().length; }

  obtenerPromedio(): string {
    const cals = this.obtenerCalificaciones();
    if (cals.length === 0) return '0.0';
    const suma = cals.reduce((t, c) => t + c.puntuacion, 0);
    return (suma / cals.length).toFixed(1);
  }

  obtenerUltimasCalificaciones(cantidad: number): Calificacion[] {
    return [...this.obtenerCalificaciones()].sort((a,b) => b.id - a.id).slice(0, cantidad);
  }
}
