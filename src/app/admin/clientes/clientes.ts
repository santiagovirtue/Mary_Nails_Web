import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-clientes',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  clientes: any[] = [];
  cargando = true;
  busqueda = '';
  clienteExpandido = 0;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void { this.cargarClientes(); }

  cargarClientes(): void {
    this.http.get<any[]>('/api/clientes').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.clientes = data || [];
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
    });
  }

  obtenerClientesFiltrados(): any[] {
    const texto = this.busqueda.toLowerCase().trim();
    if (!texto) return this.clientes;
    return this.clientes.filter(c =>
      (c.nombre || '').toLowerCase().includes(texto) ||
      (c.telefono || '').toLowerCase().includes(texto) ||
      (c.correo || '').toLowerCase().includes(texto) ||
      (c.servicios || []).join(' ').toLowerCase().includes(texto)
    );
  }

  contarClientes(): number { return this.clientes.length; }
  contarCitasTotales(): number { return this.clientes.reduce((sum, c) => sum + (c.totalCitas || 0), 0); }
  contarConPagosPendientes(): number { return this.clientes.filter(c => c.pagosPendientes > 0).length; }

  alternarHistorial(id: number): void {
    this.clienteExpandido = this.clienteExpandido === id ? 0 : id;
  }

  historialVisible(id: number): boolean { return this.clienteExpandido === id; }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    try {
      const d = new Date(fecha);
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
    } catch { return fecha; }
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    const partes = String(hora).split(':');
    const h = Number(partes[0]);
    return (h % 12 || 12).toString().padStart(2,'0') + ':' + partes[1] + ' ' + (h >= 12 ? 'p.m.' : 'a.m.');
  }

  cap(v: string): string {
    if (!v) return '';
    return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
  }

  limpiarBusqueda(): void { this.busqueda = ''; }
}
