import { Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root',
})
export class DisponibilidadService {
  private readonly storageKey = 'maryNailsDisponibilidad';

  private horariosBase: Horario[] = [
    {
      id: 1,
      dia: 'Lunes',
      horaInicio: '09:00',
      horaFinal: '12:00',
      estado: 'Disponible',
      observacion: 'Horario disponible para reservas.',
    },
    {
      id: 2,
      dia: 'Miércoles',
      horaInicio: '14:00',
      horaFinal: '17:00',
      estado: 'Disponible',
      observacion: 'Horario disponible para reservas.',
    },
    {
      id: 3,
      dia: 'Viernes',
      horaInicio: '10:00',
      horaFinal: '13:00',
      estado: 'Ocupado',
      observacion: 'Horario reservado.',
    },
    {
      id: 4,
      dia: 'Sábado',
      horaInicio: '08:00',
      horaFinal: '11:00',
      estado: 'Disponible',
      observacion: 'Horario disponible para reservas.',
    },
  ];

  obtenerHorarios(): Horario[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const horariosGuardados = localStorage.getItem(this.storageKey);

    if (horariosGuardados) {
      return JSON.parse(horariosGuardados);
    }

    this.guardarHorarios(this.horariosBase);
    return this.horariosBase;
  }

  guardarHorarios(horarios: Horario[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(horarios));
  }

  agregarHorario(nuevoHorario: NuevoHorario): void {
    const horarios = this.obtenerHorarios();

    const horario: Horario = {
      id: Date.now(),
      dia: nuevoHorario.dia,
      horaInicio: nuevoHorario.horaInicio,
      horaFinal: nuevoHorario.horaFinal,
      estado: nuevoHorario.estado,
      observacion: nuevoHorario.observacion.trim(),
    };

    horarios.push(horario);
    this.guardarHorarios(horarios);
  }

  actualizarHorario(horarioActualizado: Horario): void {
    const horarios = this.obtenerHorarios().map((horario) =>
      horario.id === horarioActualizado.id ? horarioActualizado : horario
    );

    this.guardarHorarios(horarios);
  }

  cambiarEstadoHorario(id: number): void {
    const horarios = this.obtenerHorarios().map((horario) => {
      if (horario.id === id) {
        return {
          ...horario,
          estado: horario.estado === 'Disponible' ? 'Ocupado' : 'Disponible',
        };
      }

      return horario;
    });

    this.guardarHorarios(horarios);
  }

  eliminarHorario(id: number): void {
    const horarios = this.obtenerHorarios().filter(
      (horario) => horario.id !== id
    );

    this.guardarHorarios(horarios);
  }

  contarDisponibles(): number {
    return this.obtenerHorarios().filter(
      (horario) => horario.estado === 'Disponible'
    ).length;
  }

  contarOcupados(): number {
    return this.obtenerHorarios().filter(
      (horario) => horario.estado === 'Ocupado'
    ).length;
  }
}