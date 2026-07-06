import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reportes',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  datos: any = {};
  cargando = true;
  fechaInicio = '';
  fechaFin = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void { this.cargarReporte(); }

  cargarReporte(): void {
    this.cargando = true;
    let url = '/api/reportes?';
    if (this.fechaInicio) url += 'fechaInicio=' + this.fechaInicio + '&';
    if (this.fechaFin) url += 'fechaFin=' + this.fechaFin + '&';
    this.http.get<any>(url).subscribe({
      next: (data) => { this.zone.run(() => { this.datos = data || {}; this.cargando = false; this.cdr.detectChanges(); }); },
      error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
    });
  }

  filtrar(): void { this.cargarReporte(); }

  rangoFechasValido(): boolean {
    if (!this.fechaInicio || !this.fechaFin) return true;
    return this.fechaInicio <= this.fechaFin;
  }

  limpiarFiltros(): void { this.fechaInicio = ''; this.fechaFin = ''; this.cargarReporte(); }

  hayFiltroActivo(): boolean { return this.fechaInicio !== '' || this.fechaFin !== ''; }

  formatearPrecio(valor: number): string {
    return '$' + (valor || 0).toLocaleString('es-CO');
  }

  porcentaje(parte: number, total: number): number {
    if (!total) return 0;
    return Math.round((parte / total) * 100);
  }

  imprimirReporte(): void { window.print(); }
}
