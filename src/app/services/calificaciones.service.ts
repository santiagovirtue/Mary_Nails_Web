import { Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root',
})
export class CalificacionesService {
  private readonly storageKey = 'maryNailsCalificaciones';

  obtenerCalificaciones(): Calificacion[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const calificacionesGuardadas = localStorage.getItem(this.storageKey);

    return calificacionesGuardadas ? JSON.parse(calificacionesGuardadas) : [];
  }

  guardarCalificaciones(calificaciones: Calificacion[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(calificaciones));
  }

  agregarCalificacion(nuevaCalificacion: NuevaCalificacion): Calificacion {
    const calificaciones = this.obtenerCalificaciones();

    const calificacion: Calificacion = {
      id: Date.now(),
      idCita: nuevaCalificacion.idCita,
      cliente: nuevaCalificacion.cliente,
      servicio: nuevaCalificacion.servicio,
      fechaCita: nuevaCalificacion.fechaCita,
      horaCita: nuevaCalificacion.horaCita,
      puntuacion: nuevaCalificacion.puntuacion,
      comentario: nuevaCalificacion.comentario.trim(),
      fecha: new Date().toISOString().slice(0, 10),
    };

    calificaciones.push(calificacion);
    this.guardarCalificaciones(calificaciones);

    return calificacion;
  }

  eliminarCalificacion(id: number): void {
    const calificaciones = this.obtenerCalificaciones().filter(
      (calificacion) => calificacion.id !== id
    );

    this.guardarCalificaciones(calificaciones);
  }

  yaExisteCalificacionParaCita(idCita: number): boolean {
    return this.obtenerCalificaciones().some(
      (calificacion) => calificacion.idCita === idCita
    );
  }

  contarCalificaciones(): number {
    return this.obtenerCalificaciones().length;
  }

  obtenerPromedio(): string {
    const calificaciones = this.obtenerCalificaciones();

    if (calificaciones.length === 0) {
      return '0.0';
    }

    const suma = calificaciones.reduce(
      (total, calificacion) => total + calificacion.puntuacion,
      0
    );

    return (suma / calificaciones.length).toFixed(1);
  }

  obtenerUltimasCalificaciones(cantidad: number): Calificacion[] {
    return [...this.obtenerCalificaciones()]
      .sort((a, b) => b.id - a.id)
      .slice(0, cantidad);
  }
}
