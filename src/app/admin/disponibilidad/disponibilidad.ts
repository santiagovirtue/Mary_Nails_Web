import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-disponibilidad',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './disponibilidad.html',
  styleUrl: './disponibilidad.css',
})
export class Disponibilidad implements OnInit {
  horarios: any[] = [];
  cargando = true;
  guardando = false;

  horario = { id: 0, dia: '', horaInicio: '', horaFinal: '', estado: 'Disponible', observacion: '' };
  editando = false;
  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';
  mensajeError = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void { this.cargarHorarios(); }

  cargarHorarios(): void {
    this.http.get<any[]>('/api/disponibilidad').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.horarios = data || [];
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
    });
  }

  contarDisponibles(): number { return this.horarios.filter(h => h.estado === 'Disponible').length; }
  contarOcupados(): number { return this.horarios.filter(h => h.estado === 'Ocupado').length; }

  agregarHorario(): void {
    this.mensajeError = '';
    if (!this.camposValidos()) { this.mensajeError = 'Completa todos los campos antes de guardar.'; return; }
    if (this.horario.horaInicio >= this.horario.horaFinal) { this.mensajeError = 'La hora inicial debe ser menor que la hora final.'; return; }

    this.guardando = true;

    if (this.editando && this.horario.id) {
      this.http.put('/api/disponibilidad/' + this.horario.id, this.horario).subscribe({
        next: () => {
          this.zone.run(() => {
            this.mostrarMensaje('Horario actualizado correctamente', 'exito');
            this.limpiarFormulario();
            this.cargarHorarios();
            this.guardando = false;
            this.cdr.detectChanges();
          });
        },
        error: () => { this.zone.run(() => { this.mensajeError = 'Error al actualizar el horario'; this.guardando = false; this.cdr.detectChanges(); }); },
      });
    } else {
      this.http.post('/api/disponibilidad', this.horario).subscribe({
        next: () => {
          this.zone.run(() => {
            this.mostrarMensaje('Horario agregado correctamente', 'exito');
            this.limpiarFormulario();
            this.cargarHorarios();
            this.guardando = false;
            this.cdr.detectChanges();
          });
        },
        error: () => { this.zone.run(() => { this.mensajeError = 'Error al agregar el horario'; this.guardando = false; this.cdr.detectChanges(); }); },
      });
    }
  }

  editarHorario(h: any): void {
    this.horario = { id: h.id, dia: h.dia, horaInicio: h.horaInicio, horaFinal: h.horaFinal, estado: h.estado, observacion: h.observacion };
    this.editando = true;
    this.mensajeError = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void { this.limpiarFormulario(); }

  cambiarEstado(id: number): void {
    this.http.patch('/api/disponibilidad/' + id + '/estado', {}).subscribe({
      next: () => { this.mostrarMensaje('Estado actualizado correctamente', 'exito'); this.cargarHorarios(); },
      error: () => { this.mostrarMensaje('Error al cambiar el estado', 'error'); },
    });
  }

  eliminarHorario(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este horario?')) return;
    this.http.delete('/api/disponibilidad/' + id).subscribe({
      next: () => { this.mostrarMensaje('Horario eliminado correctamente', 'exito'); this.cargarHorarios(); if (this.horario.id === id) this.limpiarFormulario(); },
      error: () => { this.mostrarMensaje('Error al eliminar el horario', 'error'); },
    });
  }

  limpiarFormulario(): void {
    this.horario = { id: 0, dia: '', horaInicio: '', horaFinal: '', estado: 'Disponible', observacion: '' };
    this.editando = false;
    this.mensajeError = '';
  }

  camposValidos(): boolean {
    return this.horario.dia.trim() !== '' && this.horario.horaInicio.trim() !== '' && this.horario.horaFinal.trim() !== '' && this.horario.estado.trim() !== '' && this.horario.observacion.trim() !== '';
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    const partes = hora.split(':');
    const h = Number(partes[0]);
    return (h % 12 || 12).toString().padStart(2,'0') + ':' + partes[1] + ' ' + (h >= 12 ? 'p.m.' : 'a.m.');
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.zone.run(() => { this.mensaje = ''; this.tipoMensaje = ''; this.cdr.detectChanges(); }); }, 3000);
  }
}
