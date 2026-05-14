import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Reserva {
  id: number;
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  metodoPago: string;
  comentarios: string;
  estado: string;
}

@Component({
  selector: 'app-mis-citas',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css',
})
export class MisCitas implements OnInit {
  reservas: Reserva[] = [];

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    this.reservas = reservasGuardadas ? JSON.parse(reservasGuardadas) : [];
  }

  contarActivas(): number {
    return this.reservas.filter(
      reserva => reserva.estado === 'Pendiente' || reserva.estado === 'Confirmada'
    ).length;
  }

  contarCompletadas(): number {
    return this.reservas.filter(reserva => reserva.estado === 'Completada').length;
  }

  contarPendientes(): number {
    return this.reservas.filter(reserva => reserva.estado === 'Pendiente').length;
  }
}