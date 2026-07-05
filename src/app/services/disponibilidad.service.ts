import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Horario {
  id: number;
  dia: string;
  horaInicio: string;
  horaFinal: string;
  estado: string;
  observacion: string;
}

export interface NuevoHorario {
  dia: string;
  horaInicio: string;
  horaFinal: string;
  estado: string;
  observacion: string;
}

@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly storageKey = 'maryNailsDisponibilidad';
  private horariosBase: Horario[] = [
    { id: 1, dia: 'Lunes', horaInicio: '09:00', horaFinal: '12:00', estado: 'Disponible', observacion: 'Horario disponible.' },
    { id: 2, dia: 'Miércoles', horaInicio: '14:00', horaFinal: '17:00', estado: 'Disponible', observacion: 'Horario disponible.' },
    { id: 3, dia: 'Viernes', horaInicio: '10:00', horaFinal: '13:00', estado: 'Ocupado', observacion: 'Horario reservado.' },
    { id: 4, dia: 'Sábado', horaInicio: '08:00', horaFinal: '11:00', estado: 'Disponible', observacion: 'Horario disponible.' },
  ];
  constructor(private http: HttpClient) {}

  obtenerHorariosAPI(): Observable<Horario[]> {
    return this.http.get<Horario[]>('/api/disponibilidad').pipe(
      catchError(() => of([]))
    );
  }

  obtenerHorarios(): Horario[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.storageKey);
    if (data) return JSON.parse(data);
    this.guardarHorarios(this.horariosBase);
    return this.horariosBase;
  }

  guardarHorarios(horarios: Horario[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(horarios));
  }

  agregarHorario(nuevo: NuevoHorario): Observable<any> {
    return this.http.post('/api/disponibilidad', nuevo);
  }

  actualizarHorario(actualizado: Horario): Observable<any> {
    return this.http.put('/api/disponibilidad/' + actualizado.id, actualizado);
  }

  cambiarEstadoHorario(id: number): Observable<any> {
    return this.http.patch('/api/disponibilidad/' + id + '/estado', {});
  }

  eliminarHorario(id: number): Observable<any> {
    return this.http.delete('/api/disponibilidad/' + id);
  }

  contarDisponibles(): number { return this.obtenerHorarios().filter(h => h.estado === 'Disponible').length; }
  contarOcupados(): number { return this.obtenerHorarios().filter(h => h.estado === 'Ocupado').length; }
}
