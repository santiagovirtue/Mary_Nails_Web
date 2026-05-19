import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Servicio, ServiciosService } from '../../services/servicios.service';

@Component({
  selector: 'app-servicios',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios implements OnInit {
  servicios: Servicio[] = [];

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.servicios = this.serviciosService.obtenerServiciosActivos();
  }
}