import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Horario {
  id: number;
  dia: string;
  horaInicio: string;
  horaFinal: string;
  estado: string;
  observacion: string;
}

@Component({
  selector: 'app-disponibilidad',
  imports: [FormsModule, NgFor, NgIf, RouterLink],
  templateUrl: './disponibilidad.html',
  styleUrl: './disponibilidad.css',
})
export class Disponibilidad implements OnInit {
  horarios: Horario[] = [];

  horario = {
    dia: '',
    horaInicio: '',
    horaFinal: '',
    estado: 'Disponible',
    observacion: '',
  };

  mensaje = '';

  ngOnInit(): void {
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    const horariosGuardados = localStorage.getItem('maryNailsDisponibilidad');

    if (horariosGuardados) {
      this.horarios = JSON.parse(horariosGuardados);
      return;
    }

    this.horarios = [
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

    this.guardarHorarios();
  }

  guardarHorarios(): void {
    localStorage.setItem('maryNailsDisponibilidad', JSON.stringify(this.horarios));
  }

  agregarHorario(): void {
    if (!this.horario.dia || !this.horario.horaInicio || !this.horario.horaFinal) {
      this.mensaje = 'Completa el día, la hora inicial y la hora final.';
      return;
    }

    const nuevoHorario: Horario = {
      id: Date.now(),
      dia: this.horario.dia,
      horaInicio: this.horario.horaInicio,
      horaFinal: this.horario.horaFinal,
      estado: this.horario.estado,
      observacion: this.horario.observacion || 'Sin observación.',
    };

    this.horarios.push(nuevoHorario);
    this.guardarHorarios();

    this.mensaje = 'Horario agregado correctamente. Ya puede verse en reservas.';

    this.horario = {
      dia: '',
      horaInicio: '',
      horaFinal: '',
      estado: 'Disponible',
      observacion: '',
    };
  }

  cambiarEstado(id: number): void {
    this.horarios = this.horarios.map((horario) => {
      if (horario.id === id) {
        return {
          ...horario,
          estado: horario.estado === 'Disponible' ? 'Ocupado' : 'Disponible',
        };
      }

      return horario;
    });

    this.guardarHorarios();
  }

  eliminarHorario(id: number): void {
    this.horarios = this.horarios.filter((horario) => horario.id !== id);
    this.guardarHorarios();
  }

  formatearHora(hora: string): string {
    if (!hora) {
      return '';
    }

    const [horas, minutos] = hora.split(':');
    const horasNumero = Number(horas);
    const periodo = horasNumero >= 12 ? 'p.m.' : 'a.m.';
    const horaFormato12 = horasNumero % 12 || 12;

    return `${horaFormato12.toString().padStart(2, '0')}:${minutos} ${periodo}`;
  }
}