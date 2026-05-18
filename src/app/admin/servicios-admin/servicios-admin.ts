import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: string;
  icono: string;
  estado: string;
}

@Component({
  selector: 'app-servicios-admin',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './servicios-admin.html',
  styleUrl: './servicios-admin.css',
})
export class ServiciosAdmin implements OnInit {
  servicios: Servicio[] = [];

  servicio = {
    nombre: '',
    descripcion: '',
    duracion: '',
    precio: '',
    icono: '💅',
    estado: 'Activo',
  };

  servicioEditandoId: number | null = null;
  mensaje = '';

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    const serviciosGuardados = localStorage.getItem('maryNailsServicios');

    if (serviciosGuardados) {
      this.servicios = JSON.parse(serviciosGuardados);
      return;
    }

    this.servicios = [
      {
        id: 1,
        nombre: 'Manicure profesional',
        descripcion:
          'Limpieza, cuidado de cutícula, limado y esmaltado para mantener tus manos impecables.',
        duracion: '45 min',
        precio: '$25.000',
        icono: '💅',
        estado: 'Activo',
      },
      {
        id: 2,
        nombre: 'Pedicure',
        descripcion:
          'Cuidado completo de pies, limpieza, hidratación y esmaltado con acabado profesional.',
        duracion: '60 min',
        precio: '$30.000',
        icono: '✨',
        estado: 'Activo',
      },
      {
        id: 3,
        nombre: 'Uñas acrílicas',
        descripcion:
          'Extensión y diseño de uñas acrílicas con diferentes estilos, formas y colores.',
        duracion: '90 min',
        precio: '$60.000',
        icono: '🌸',
        estado: 'Activo',
      },
      {
        id: 4,
        nombre: 'Diseño personalizado',
        descripcion:
          'Decoración artística según el gusto del cliente: colores, detalles, brillos y tendencias.',
        duracion: 'Variable',
        precio: 'Desde $15.000',
        icono: '🎨',
        estado: 'Activo',
      },
    ];

    this.guardarServicios();
  }

  guardarServicios(): void {
    localStorage.setItem('maryNailsServicios', JSON.stringify(this.servicios));
  }

  guardarServicio(): void {
    this.mensaje = '';

    if (
      !this.servicio.nombre.trim() ||
      !this.servicio.descripcion.trim() ||
      !this.servicio.duracion.trim() ||
      !this.servicio.precio.trim()
    ) {
      this.mensaje = 'Completa todos los campos del servicio.';
      return;
    }

    if (this.servicioEditandoId) {
      this.servicios = this.servicios.map((item) =>
        item.id === this.servicioEditandoId
          ? {
              ...item,
              nombre: this.servicio.nombre.trim(),
              descripcion: this.servicio.descripcion.trim(),
              duracion: this.servicio.duracion.trim(),
              precio: this.servicio.precio.trim(),
              icono: this.servicio.icono,
              estado: this.servicio.estado,
            }
          : item
      );

      this.mensaje = 'Servicio actualizado correctamente.';
    } else {
      const nuevoServicio: Servicio = {
        id: Date.now(),
        nombre: this.servicio.nombre.trim(),
        descripcion: this.servicio.descripcion.trim(),
        duracion: this.servicio.duracion.trim(),
        precio: this.servicio.precio.trim(),
        icono: this.servicio.icono,
        estado: this.servicio.estado,
      };

      this.servicios.push(nuevoServicio);
      this.mensaje = 'Servicio agregado correctamente.';
    }

    this.guardarServicios();
    this.limpiarFormulario();
  }

  editarServicio(servicio: Servicio): void {
    this.servicioEditandoId = servicio.id;

    this.servicio = {
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion: servicio.duracion,
      precio: servicio.precio,
      icono: servicio.icono,
      estado: servicio.estado,
    };

    this.mensaje = 'Editando servicio seleccionado.';
  }

  cambiarEstado(id: number): void {
    this.servicios = this.servicios.map((servicio) =>
      servicio.id === id
        ? {
            ...servicio,
            estado: servicio.estado === 'Activo' ? 'Inactivo' : 'Activo',
          }
        : servicio
    );

    this.guardarServicios();
  }

  eliminarServicio(id: number): void {
  const confirmar = confirm(
    '¿Seguro que deseas eliminar este servicio? Esta acción no se puede deshacer.'
  );

  if (!confirmar) {
    return;
  }

  this.servicios = this.servicios.filter((servicio) => servicio.id !== id);
  this.guardarServicios();
  this.mensaje = 'Servicio eliminado correctamente.';
}

  limpiarFormulario(): void {
    this.servicio = {
      nombre: '',
      descripcion: '',
      duracion: '',
      precio: '',
      icono: '💅',
      estado: 'Activo',
    };

    this.servicioEditandoId = null;
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
    this.mensaje = 'Edición cancelada.';
  }

  contarServiciosActivos(): number {
    return this.servicios.filter((servicio) => servicio.estado === 'Activo')
      .length;
  }

  contarServiciosInactivos(): number {
    return this.servicios.filter((servicio) => servicio.estado === 'Inactivo')
      .length;
  }
}