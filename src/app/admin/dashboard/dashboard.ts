import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: any = {
    citasHoy: 0, clientes: 0, serviciosActivos: 0, serviciosInactivos: 0,
    pagosPendientes: 0, totalCalificaciones: 0, promedioCalificaciones: 0,
    totalCitas: 0, citasPorEstado: {}
  };
  proximasCitas: any[] = [];
  ultimasCalificaciones: any[] = [];
  cargando = true;
  saludo = '';
  fechaActual = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.actualizarSaludo();
    this.cargarDatos();
  }

  actualizarSaludo(): void {
    const hora = new Date().getHours();
    if (hora < 12) this.saludo = 'Buenos días';
    else if (hora < 19) this.saludo = 'Buenas tardes';
    else this.saludo = 'Buenas noches';
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const hoy = new Date();
    this.fechaActual = dias[hoy.getDay()] + ', ' + hoy.getDate() + ' de ' + meses[hoy.getMonth()] + ' de ' + hoy.getFullYear();
  }

  cargarDatos(): void {
    this.http.get<any>('/api/dashboard/stats').subscribe({
      next: (data) => { this.zone.run(() => { this.stats = data; this.cargando = false; this.cdr.detectChanges(); }); },
      error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
    });
    this.http.get<any[]>('/api/dashboard/proximas-citas').subscribe({
      next: (data) => { this.zone.run(() => { this.proximasCitas = data || []; this.cdr.detectChanges(); }); },
      error: () => {},
    });
    this.http.get<any[]>('/api/dashboard/ultimas-calificaciones').subscribe({
      next: (data) => { this.zone.run(() => { this.ultimasCalificaciones = data || []; this.cdr.detectChanges(); }); },
      error: () => {},
    });
  }

  porcentajeEstado(estado: string): number {
    const total = this.stats.totalCitas || 1;
    return Math.round(((this.stats.citasPorEstado[estado] || 0) / total) * 100);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      const d = new Date(fecha);
      const dia = String(d.getDate()).padStart(2,'0');
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return dia + ' ' + meses[d.getMonth()];
    } catch { return fecha; }
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    return String(hora).substring(0,5);
  }

  capitalizar(texto: string): string {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }
}
