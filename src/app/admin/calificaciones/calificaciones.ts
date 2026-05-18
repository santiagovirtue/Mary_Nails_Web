import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Calificacion {
  id: number;
  idCita?: number;
  cliente?: string;
  servicio: string;
  fechaCita?: string;
  horaCita?: string;
  puntuacion: number;
  comentario: string;
  fecha: string;
}

@Component({
  selector: 'app-calificaciones',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './calificaciones.html',
  styleUrl: './calificaciones.css',
})
export class Calificaciones implements OnInit {
  calificaciones: Calificacion[] = [];

  busqueda = '';
  filtroPuntuacion = 'Todas';

  ngOnInit(): void {
    this.cargarCalificaciones();
  }

  cargarCalificaciones(): void {
    const calificacionesGuardadas = localStorage.getItem('maryNailsCalificaciones');

    this.calificaciones = calificacionesGuardadas
      ? JSON.parse(calificacionesGuardadas)
      : [];
  }

  obtenerCalificacionesFiltradas(): Calificacion[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.calificaciones.filter((calificacion) => {
      const cliente = calificacion.cliente || 'Cliente no registrado';
      const servicio = calificacion.servicio || '';
      const comentario = calificacion.comentario || '';

      const coincideBusqueda =
        cliente.toLowerCase().includes(texto) ||
        servicio.toLowerCase().includes(texto) ||
        comentario.toLowerCase().includes(texto);

      const coincidePuntuacion =
        this.filtroPuntuacion === 'Todas' ||
        calificacion.puntuacion === Number(this.filtroPuntuacion);

      return coincideBusqueda && coincidePuntuacion;
    });
  }

  obtenerPromedio(): string {
    if (this.calificaciones.length === 0) {
      return '0.0';
    }

    const suma = this.calificaciones.reduce(
      (total, calificacion) => total + calificacion.puntuacion,
      0
    );

    return (suma / this.calificaciones.length).toFixed(1);
  }

  contarCalificaciones(): number {
    return this.calificaciones.length;
  }

  contarPorPuntuacion(puntuacion: number): number {
    return this.calificaciones.filter(
      (calificacion) => calificacion.puntuacion === puntuacion
    ).length;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroPuntuacion = 'Todas';
  }

  eliminarCalificacion(id: number): void {
    this.calificaciones = this.calificaciones.filter(
      (calificacion) => calificacion.id !== id
    );

    localStorage.setItem(
      'maryNailsCalificaciones',
      JSON.stringify(this.calificaciones)
    );
  }
}