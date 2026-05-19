import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Calificacion,
  CalificacionesService,
} from '../../services/calificaciones.service';

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
  mensaje = '';

  constructor(private calificacionesService: CalificacionesService) {}

  ngOnInit(): void {
    this.cargarCalificaciones();
  }

  cargarCalificaciones(): void {
    this.calificaciones = this.calificacionesService.obtenerCalificaciones();
  }

  obtenerCalificacionesFiltradas(): Calificacion[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.calificaciones.filter((calificacion) => {
      const coincideBusqueda =
        calificacion.servicio.toLowerCase().includes(texto) ||
        calificacion.comentario.toLowerCase().includes(texto) ||
        (calificacion.cliente || '').toLowerCase().includes(texto);

      const coincidePuntuacion =
        this.filtroPuntuacion === 'Todas' ||
        calificacion.puntuacion === Number(this.filtroPuntuacion);

      return coincideBusqueda && coincidePuntuacion;
    });
  }

  contarTotal(): number {
    return this.calificaciones.length;
  }
  
  contarCalificaciones(): number {
  return this.calificaciones.length;
}
  obtenerPromedio(): string {
    return this.calificacionesService.obtenerPromedio();
  }

  contarCincoEstrellas(): number {
    return this.calificaciones.filter(
      (calificacion) => calificacion.puntuacion === 5
    ).length;
  }
   contarPorPuntuacion(puntuacion: number): number {
  return this.calificaciones.filter(
    (calificacion) => calificacion.puntuacion === puntuacion
  ).length;
   }

  eliminarCalificacion(id: number): void {
    const confirmar = confirm(
      '¿Seguro que deseas eliminar esta calificación? Esta acción no se puede deshacer.'
    );

    if (!confirmar) {
      return;
    }

    this.calificacionesService.eliminarCalificacion(id);
    this.cargarCalificaciones();
    this.mensaje = 'Calificación eliminada correctamente.';
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroPuntuacion = 'Todas';
  }
}