import { Injectable } from '@angular/core';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: string;
  icono: string;
  estado: string;
}

export interface NuevoServicio {
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: string;
  icono: string;
  estado: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private readonly storageKey = 'maryNailsServicios';

  private serviciosBase: Servicio[] = [
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

  obtenerServicios(): Servicio[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const serviciosGuardados = localStorage.getItem(this.storageKey);

    if (serviciosGuardados) {
      return JSON.parse(serviciosGuardados);
    }

    this.guardarServicios(this.serviciosBase);
    return this.serviciosBase;
  }

  obtenerServiciosActivos(): Servicio[] {
    return this.obtenerServicios().filter(
      (servicio) => servicio.estado === 'Activo'
    );
  }

  guardarServicios(servicios: Servicio[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(servicios));
  }

  agregarServicio(nuevoServicio: NuevoServicio): void {
    const servicios = this.obtenerServicios();

    const servicio: Servicio = {
      id: Date.now(),
      nombre: nuevoServicio.nombre.trim(),
      descripcion: nuevoServicio.descripcion.trim(),
      duracion: nuevoServicio.duracion.trim(),
      precio: nuevoServicio.precio.trim(),
      icono: nuevoServicio.icono,
      estado: nuevoServicio.estado,
    };

    servicios.push(servicio);
    this.guardarServicios(servicios);
  }

  actualizarServicio(servicioActualizado: Servicio): void {
    const servicios = this.obtenerServicios().map((servicio) =>
      servicio.id === servicioActualizado.id ? servicioActualizado : servicio
    );

    this.guardarServicios(servicios);
  }

  cambiarEstadoServicio(id: number): void {
    const servicios = this.obtenerServicios().map((servicio) => {
      if (servicio.id === id) {
        return {
          ...servicio,
          estado: servicio.estado === 'Activo' ? 'Inactivo' : 'Activo',
        };
      }

      return servicio;
    });

    this.guardarServicios(servicios);
  }

  eliminarServicio(id: number): void {
    const servicios = this.obtenerServicios().filter(
      (servicio) => servicio.id !== id
    );

    this.guardarServicios(servicios);
  }

  contarServiciosActivos(): number {
    return this.obtenerServicios().filter(
      (servicio) => servicio.estado === 'Activo'
    ).length;
  }

  contarServiciosInactivos(): number {
    return this.obtenerServicios().filter(
      (servicio) => servicio.estado === 'Inactivo'
    ).length;
  }
}