import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pagos',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  pagos: any[] = [];
  cargando = true;
  filtroPago = 'Todos';
  busqueda = '';
  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void { this.cargarPagos(); }

  cargarPagos(): void {
    this.http.get<any[]>('/api/pagos').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.pagos = (data || []).map(p => ({
            ...p,
            estado: this.cap(p.estado),
            estadoPago: this.cap(p.estadoPago),
            valorFormateado: '$' + Number(p.valor || 0).toLocaleString('es-CO'),
          }));
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
    });
  }

  cap(v: string): string {
    if (!v) return 'Pendiente';
    return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
  }

  obtenerPagosFiltrados(): any[] {
    const texto = this.busqueda.toLowerCase().trim();
    return this.pagos.filter(p => {
      const coincideBusqueda =
        (p.nombre || '').toLowerCase().includes(texto) ||
        (p.telefono || '').toLowerCase().includes(texto) ||
        (p.servicio || '').toLowerCase().includes(texto) ||
        (p.metodoPago || '').toLowerCase().includes(texto);
      const coincidePago = this.filtroPago === 'Todos' || p.estadoPago === this.filtroPago;
      return coincideBusqueda && coincidePago;
    });
  }

  contarTotal(): number { return this.pagos.length; }
  contarPagados(): number { return this.pagos.filter(p => p.estadoPago === 'Pagado').length; }
  contarPendientes(): number { return this.pagos.filter(p => p.estadoPago !== 'Pagado').length; }
  sumarTotal(): string { return '$' + this.pagos.reduce((sum, p) => sum + Number(p.valor || 0), 0).toLocaleString('es-CO'); }
  sumarPagado(): string { return '$' + this.pagos.filter(p => p.estadoPago === 'Pagado').reduce((sum, p) => sum + Number(p.valor || 0), 0).toLocaleString('es-CO'); }

  togglePago(id: number, estadoActual: string): void {
    const nuevoEstado = estadoActual === 'Pagado' ? 'pendiente' : 'pagado';
    const mensaje = nuevoEstado === 'pagado' ? 'Pago marcado como pagado' : 'Pago revertido a pendiente';
    this.http.patch('/api/reservas/' + id + '/pago', { estadoPago: nuevoEstado }).subscribe({
      next: () => { this.mostrarMensaje(mensaje, 'exito'); this.cargarPagos(); },
      error: () => { this.mostrarMensaje('Error al actualizar el pago', 'error'); },
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      const d = new Date(fecha);
      return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
    } catch { return fecha; }
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    const partes = String(hora).split(':');
    const h = Number(partes[0]);
    return (h % 12 || 12).toString().padStart(2,'0') + ':' + partes[1] + ' ' + (h >= 12 ? 'p.m.' : 'a.m.');
  }

  limpiarFiltros(): void { this.filtroPago = 'Todos'; this.busqueda = ''; }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.zone.run(() => { this.mensaje = ''; this.tipoMensaje = ''; this.cdr.detectChanges(); }); }, 3000);
  }
}
