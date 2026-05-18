import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
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
  selector: 'app-servicios',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios implements OnInit {
  servicios: Servicio[] = [];

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    const serviciosGuardados = localStorage.getItem('maryNailsServicios');

    if (serviciosGuardados) {
      const servicios: Servicio[] = JSON.parse(serviciosGuardados);
      this.servicios = servicios.filter((servicio) => servicio.estado === 'Activo');
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
  }
}