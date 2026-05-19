import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {Horario,DisponibilidadService,} from '../../services/disponibilidad.service';

@Component({
  selector: 'app-disponibilidad',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './disponibilidad.html',
  styleUrl: './disponibilidad.css',
})
export class Disponibilidad implements OnInit {
  horarios: Horario[] = [];

  horario = {
    id: 0,
    dia: '',
    horaInicio: '',
    horaFinal: '',
    estado: 'Disponible',
    observacion: '',
  };

  editando = false;
  horarioEditandoId: number | null = null;

  mensaje = '';
  mensajeError = '';

  constructor(private disponibilidadService: DisponibilidadService) {}

  ngOnInit(): void {
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    this.horarios = this.disponibilidadService.obtenerHorarios();
  }

  contarHorarios(): number {
    return this.horarios.length;
  }

  contarDisponibles(): number {
    return this.horarios.filter(
      (horario) => horario.estado === 'Disponible'
    ).length;
  }

  contarOcupados(): number {
    return this.horarios.filter(
      (horario) => horario.estado === 'Ocupado'
    ).length;
  }

  guardarHorario(): void {
    this.mensaje = '';
    this.mensajeError = '';

    if (!this.camposValidos()) {
      this.mensajeError =
        'Completa todos los campos antes de guardar el horario.';
      return;
    }

    if (this.horario.horaInicio >= this.horario.horaFinal) {
      this.mensajeError =
        'La hora inicial debe ser menor que la hora final.';
      return;
    }

    if (this.editando) {
      this.disponibilidadService.actualizarHorario({
        id: this.horario.id,
        dia: this.horario.dia,
        horaInicio: this.horario.horaInicio,
        horaFinal: this.horario.horaFinal,
        estado: this.horario.estado,
        observacion: this.horario.observacion.trim(),
      });

      this.mensaje = 'Horario actualizado correctamente.';
    } else {
      this.disponibilidadService.agregarHorario({
        dia: this.horario.dia,
        horaInicio: this.horario.horaInicio,
        horaFinal: this.horario.horaFinal,
        estado: this.horario.estado,
        observacion: this.horario.observacion,
      });

      this.mensaje = 'Horario agregado correctamente.';
    }

    this.cargarHorarios();
    this.limpiarFormulario();
  }

   agregarHorario(): void {
  this.guardarHorario();
}

  editarHorario(horario: Horario): void {
    this.horario = { ...horario };
    this.editando = true;
    this.horarioEditandoId = horario.id;
    this.mensaje = 'Editando horario seleccionado.';
    this.mensajeError = '';
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
    this.mensaje = '';
    this.mensajeError = '';
  }

  cambiarEstado(id: number): void {
    this.disponibilidadService.cambiarEstadoHorario(id);
    this.cargarHorarios();
    this.mensaje = 'Estado del horario actualizado correctamente.';
    this.mensajeError = '';
  }

  cambiarEstadoHorario(id: number): void {
    this.cambiarEstado(id);
  }

  eliminarHorario(id: number): void {
    const confirmar = confirm(
      '¿Seguro que deseas eliminar este horario? Esta acción no se puede deshacer.'
    );

    if (!confirmar) {
      return;
    }

    this.disponibilidadService.eliminarHorario(id);
    this.cargarHorarios();
    this.mensaje = 'Horario eliminado correctamente.';
    this.mensajeError = '';

    if (this.horario.id === id) {
      this.limpiarFormulario();
    }
  }

  limpiarFormulario(): void {
    this.horario = {
      id: 0,
      dia: '',
      horaInicio: '',
      horaFinal: '',
      estado: 'Disponible',
      observacion: '',
    };

    this.editando = false;
    this.horarioEditandoId = null;
  }

  camposValidos(): boolean {
    return (
      this.horario.dia.trim() !== '' &&
      this.horario.horaInicio.trim() !== '' &&
      this.horario.horaFinal.trim() !== '' &&
      this.horario.estado.trim() !== '' &&
      this.horario.observacion.trim() !== ''
    );
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