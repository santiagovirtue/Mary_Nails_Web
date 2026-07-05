import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-servicios-admin',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './servicios-admin.html',
  styleUrl: './servicios-admin.css',
})
export class ServiciosAdmin implements OnInit {
  servicios: any[] = [];
  cargando = true;
  guardando = false;
  servicio = { id: 0, nombre: '', descripcion: '', duracion: 0, precio: 0, estado: 'Activo' };
  editando = false;
  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';
  mensajeError = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void { this.cargarServicios(); }

  cargarServicios(): void {
    this.http.get<any[]>('/api/servicios').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.servicios = (data || []).map(s => ({
            ...s,
            estado: s.estado === 'activo' ? 'Activo' : 'Inactivo',
            precioFormateado: '$' + Number(s.precio).toLocaleString('es-CO'),
          }));
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
    });
  }

  contarServiciosActivos(): number { return this.servicios.filter(s => s.estado === 'Activo').length; }
  contarServiciosInactivos(): number { return this.servicios.filter(s => s.estado === 'Inactivo').length; }

  camposValidos(): boolean {
    return this.servicio.nombre.trim() !== ''
      && this.servicio.descripcion.trim() !== ''
      && this.servicio.duracion > 0
      && this.servicio.precio > 0
      && this.servicio.estado.trim() !== '';
  }

  guardarServicio(): void {
    this.mensajeError = '';
    if (!this.camposValidos()) {
      this.mensajeError = 'Completa todos los campos correctamente antes de guardar.';
      return;
    }
    this.guardando = true;
    const payload = {
      nombre: this.servicio.nombre.trim(),
      descripcion: this.servicio.descripcion.trim(),
      duracion: this.servicio.duracion,
      precio: this.servicio.precio,
      estado: this.servicio.estado,
    };
    if (this.editando && this.servicio.id) {
      this.http.put('/api/servicios/' + this.servicio.id, payload).subscribe({
        next: () => { this.zone.run(() => { this.mostrarMensaje('Servicio actualizado correctamente', 'exito'); this.limpiarFormulario(); this.cargarServicios(); this.guardando = false; this.cdr.detectChanges(); }); },
        error: () => { this.zone.run(() => { this.mensajeError = 'Error al actualizar el servicio'; this.guardando = false; this.cdr.detectChanges(); }); },
      });
    } else {
      this.http.post('/api/servicios', payload).subscribe({
        next: () => { this.zone.run(() => { this.mostrarMensaje('Servicio agregado correctamente', 'exito'); this.limpiarFormulario(); this.cargarServicios(); this.guardando = false; this.cdr.detectChanges(); }); },
        error: () => { this.zone.run(() => { this.mensajeError = 'Error al agregar el servicio'; this.guardando = false; this.cdr.detectChanges(); }); },
      });
    }
  }

  editarServicio(s: any): void {
    this.servicio = {
      id: s.id_servicio || s.id,
      nombre: s.nombre,
      descripcion: s.descripcion,
      duracion: Number(s.duracion_minutos || s.duracion || 0),
      precio: Number(s.precio || 0),
      estado: s.estado,
    };
    this.editando = true;
    this.mensajeError = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void { this.limpiarFormulario(); }

  cambiarEstado(id: number): void {
    this.http.patch('/api/servicios/' + id + '/estado', {}).subscribe({
      next: () => { this.mostrarMensaje('Estado actualizado correctamente', 'exito'); this.cargarServicios(); },
      error: () => { this.mostrarMensaje('Error al cambiar el estado', 'error'); },
    });
  }

  eliminarServicio(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    this.http.delete('/api/servicios/' + id).subscribe({
      next: () => { this.mostrarMensaje('Servicio eliminado correctamente', 'exito'); this.cargarServicios(); if (this.servicio.id === id) this.limpiarFormulario(); },
      error: () => { this.mostrarMensaje('Error al eliminar el servicio', 'error'); },
    });
  }

  limpiarFormulario(): void {
    this.servicio = { id: 0, nombre: '', descripcion: '', duracion: 0, precio: 0, estado: 'Activo' };
    this.editando = false;
    this.mensajeError = '';
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.zone.run(() => { this.mensaje = ''; this.tipoMensaje = ''; this.cdr.detectChanges(); }); }, 3000);
  }
}
