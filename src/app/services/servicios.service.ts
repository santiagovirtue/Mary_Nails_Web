import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly storageKey = 'maryNailsServicios';
  private serviciosBase: Servicio[] = [
    { id: 1, nombre: 'Manicure profesional', descripcion: 'Limpieza, cuidado de cutícula, limado y esmaltado.', duracion: '45 min', precio: '$25.000', icono: '💅', estado: 'Activo' },
    { id: 2, nombre: 'Pedicure', descripcion: 'Cuidado completo de pies, limpieza e hidratación.', duracion: '60 min', precio: '$30.000', icono: '✨', estado: 'Activo' },
    { id: 3, nombre: 'Uñas acrílicas', descripcion: 'Extensión y diseño de uñas acrílicas.', duracion: '90 min', precio: '$60.000', icono: '🌸', estado: 'Activo' },
    { id: 4, nombre: 'Diseño personalizado', descripcion: 'Decoración artística según el gusto del cliente.', duracion: 'Variable', precio: 'Desde $15.000', icono: '🎨', estado: 'Activo' },
  ];
  constructor(private http: HttpClient) {}

  obtenerServicios(): Servicio[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.storageKey);
    if (data) return JSON.parse(data);
    this.guardarServicios(this.serviciosBase);
    return this.serviciosBase;
  }

  obtenerServiciosActivos(): Servicio[] {
    return this.obtenerServicios().filter(s => s.estado === 'Activo');
  }

  guardarServicios(servicios: Servicio[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(servicios));
  }

  agregarServicio(nuevo: NuevoServicio): void {
    const servicios = this.obtenerServicios();
    const servicio: Servicio = { id: Date.now(), ...nuevo };
    servicios.push(servicio);
    this.guardarServicios(servicios);
    this.http.post('/api/servicios', nuevo).subscribe({ error: () => {} });
  }

  actualizarServicio(actualizado: Servicio): void {
    const servicios = this.obtenerServicios().map(s => s.id === actualizado.id ? actualizado : s);
    this.guardarServicios(servicios);
    this.http.put(`/api/servicios/${actualizado.id}`, actualizado).subscribe({ error: () => {} });
  }

  cambiarEstadoServicio(id: number): void {
    const servicios = this.obtenerServicios().map(s => s.id === id ? { ...s, estado: s.estado === 'Activo' ? 'Inactivo' : 'Activo' } : s);
    this.guardarServicios(servicios);
    this.http.patch(`/api/servicios/${id}/estado`, {}).subscribe({ error: () => {} });
  }

  eliminarServicio(id: number): void {
    const servicios = this.obtenerServicios().filter(s => s.id !== id);
    this.guardarServicios(servicios);
    this.http.delete(`/api/servicios/${id}`).subscribe({ error: () => {} });
  }

  contarServiciosActivos(): number { return this.obtenerServicios().filter(s => s.estado === 'Activo').length; }
  contarServiciosInactivos(): number { return this.obtenerServicios().filter(s => s.estado === 'Inactivo').length; }
}
