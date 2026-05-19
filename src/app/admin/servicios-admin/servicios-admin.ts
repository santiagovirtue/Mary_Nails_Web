import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Servicio,
  ServiciosService,
} from '../../services/servicios.service';

@Component({
  selector: 'app-servicios-admin',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './servicios-admin.html',
  styleUrl: './servicios-admin.css',
})
export class ServiciosAdmin implements OnInit {
  servicios: Servicio[] = [];

  servicio = {
    id: 0,
    nombre: '',
    descripcion: '',
    duracion: '',
    precio: '',
    icono: '💅',
    estado: 'Activo',
  };

  editando = false;
  servicioEditandoId: number | null = null;

  mensaje = '';
  mensajeError = '';

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.servicios = this.serviciosService.obtenerServicios();
  }

  contarServicios(): number {
    return this.servicios.length;
  }

  contarServiciosActivos(): number {
    return this.servicios.filter(
      (servicio) => servicio.estado === 'Activo'
    ).length;
  }

  contarServiciosInactivos(): number {
    return this.servicios.filter(
      (servicio) => servicio.estado === 'Inactivo'
    ).length;
  }

  guardarServicio(): void {
    this.mensaje = '';
    this.mensajeError = '';

    if (!this.camposValidos()) {
      this.mensajeError =
        'Completa todos los campos antes de guardar el servicio.';
      return;
    }

    if (this.editando) {
      this.serviciosService.actualizarServicio({
        id: this.servicio.id,
        nombre: this.servicio.nombre.trim(),
        descripcion: this.servicio.descripcion.trim(),
        duracion: this.servicio.duracion.trim(),
        precio: this.servicio.precio.trim(),
        icono: this.servicio.icono,
        estado: this.servicio.estado,
      });

      this.mensaje = 'Servicio actualizado correctamente.';
    } else {
      this.serviciosService.agregarServicio({
        nombre: this.servicio.nombre,
        descripcion: this.servicio.descripcion,
        duracion: this.servicio.duracion,
        precio: this.servicio.precio,
        icono: this.servicio.icono,
        estado: this.servicio.estado,
      });

      this.mensaje = 'Servicio agregado correctamente.';
    }

    this.cargarServicios();
    this.limpiarFormulario();
  }

  editarServicio(servicio: Servicio): void {
    this.servicio = { ...servicio };
    this.editando = true;
    this.servicioEditandoId = servicio.id;
    this.mensaje = 'Editando servicio seleccionado.';
    this.mensajeError = '';
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
    this.mensaje = '';
    this.mensajeError = '';
  }

  cambiarEstadoServicio(id: number): void {
    this.serviciosService.cambiarEstadoServicio(id);
    this.cargarServicios();
    this.mensaje = 'Estado del servicio actualizado correctamente.';
    this.mensajeError = '';
  }

  cambiarEstado(id: number): void {
    this.cambiarEstadoServicio(id);
  }

  eliminarServicio(id: number): void {
    const confirmar = confirm(
      '¿Seguro que deseas eliminar este servicio? Esta acción no se puede deshacer.'
    );

    if (!confirmar) {
      return;
    }

    this.serviciosService.eliminarServicio(id);
    this.cargarServicios();
    this.mensaje = 'Servicio eliminado correctamente.';
    this.mensajeError = '';

    if (this.servicio.id === id) {
      this.limpiarFormulario();
    }
  }

  limpiarFormulario(): void {
    this.servicio = {
      id: 0,
      nombre: '',
      descripcion: '',
      duracion: '',
      precio: '',
      icono: '💅',
      estado: 'Activo',
    };

    this.editando = false;
    this.servicioEditandoId = null;
  }

  camposValidos(): boolean {
    return (
      this.servicio.nombre.trim() !== '' &&
      this.servicio.descripcion.trim() !== '' &&
      this.servicio.duracion.trim() !== '' &&
      this.servicio.precio.trim() !== '' &&
      this.servicio.icono.trim() !== '' &&
      this.servicio.estado.trim() !== ''
    );
  }
}