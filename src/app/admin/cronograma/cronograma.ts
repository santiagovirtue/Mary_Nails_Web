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
  selector: 'app-cronograma',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './cronograma.html',
  styleUrl: './cronograma.css',
})
export class Cronograma implements OnInit {
  reservas: Reserva[] = [];

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    this.reservas = reservasGuardadas ? JSON.parse(reservasGuardadas) : [];
  }

  guardarReservas(): void {
    localStorage.setItem('maryNailsReservas', JSON.stringify(this.reservas));
  }

  contarPorEstado(estado: string): number {
    return this.reservas.filter(reserva => reserva.estado === estado).length;
  }

  confirmarReserva(id: number): void {
    this.reservas = this.reservas.map(reserva =>
      reserva.id === id ? { ...reserva, estado: 'Confirmada' } : reserva
    );

    this.guardarReservas();
  }

  cancelarReserva(id: number): void {
    this.reservas = this.reservas.map(reserva =>
      reserva.id === id ? { ...reserva, estado: 'Cancelada' } : reserva
    );

    this.guardarReservas();
  }

  completarReserva(id: number): void {
    this.reservas = this.reservas.map(reserva =>
      reserva.id === id ? { ...reserva, estado: 'Completada' } : reserva
    );

    this.guardarReservas();
  }

  eliminarReserva(id: number): void {
    this.reservas = this.reservas.filter(reserva => reserva.id !== id);
    this.guardarReservas();
  }
}