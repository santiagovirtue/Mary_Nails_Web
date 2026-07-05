import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mis-citas',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css',
})
export class MisCitas implements OnInit {
  correoSesion = '';
  reservas: any[] = [];
  filtroEstado = 'Todas';
  busqueda = '';
  cargando = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') { this.cargando = false; return; }
    this.correoSesion = localStorage.getItem('maryNailsClienteUsuario') || '';
    if (this.correoSesion) { this.cargarReservas(); } else { this.cargando = false; }
  }

  cargarReservas(): void {
    this.http.get<any[]>('/api/reservas/cliente?correo=' + encodeURIComponent(this.correoSesion)).subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.reservas = (data || []).map(r => ({
            ...r,
            estado: this.normalizarEstado(r.estado),
            estadoPago: this.normalizarEstado(r.estadoPago),
          }));
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.reservas = [];
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  normalizarEstado(valor: string): string {
    if (!valor) return 'Pendiente';
    return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
  }

  contarActivas(): number {
    return this.reservas.filter(r => r.estado === 'Pendiente' || r.estado === 'Confirmada').length;
  }
  contarCompletadas(): number { return this.reservas.filter(r => r.estado === 'Completada').length; }
  contarPendientes(): number { return this.reservas.filter(r => r.estado === 'Pendiente').length; }
  contarPagadas(): number { return this.reservas.filter(r => r.estadoPago === 'Pagado').length; }

  obtenerReservasFiltradas(): any[] {
    const texto = this.busqueda.toLowerCase().trim();
    return this.reservas.filter(r => {
      const coincideEstado = this.filtroEstado === 'Todas' || r.estado === this.filtroEstado;
      const coincideBusqueda =
        (r.servicio || '').toLowerCase().includes(texto) ||
        (r.fecha || '').toLowerCase().includes(texto) ||
        (r.hora || '').toLowerCase().includes(texto) ||
        (r.metodoPago || '').toLowerCase().includes(texto) ||
        (r.estadoPago || '').toLowerCase().includes(texto);
      return coincideEstado && coincideBusqueda;
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'Todas';
    this.busqueda = '';
  }

  cancelarCita(id: number): void {
    const confirmar = confirm('¿Seguro que deseas cancelar esta cita?');
    if (!confirmar) return;
    this.http.patch('/api/reservas/' + id + '/estado', { estado: 'cancelada' }).subscribe({
      next: () => { this.zone.run(() => { this.cargarReservas(); }); },
      error: () => { alert('Error al cancelar la cita'); },
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      const d = new Date(fecha);
      const dia = String(d.getDate()).padStart(2, '0');
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return dia + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
    } catch { return fecha; }
  }

  obtenerDiaSemana(fecha: string): string {
    if (!fecha) return '';
    try {
      const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
      return dias[new Date(fecha).getDay()];
    } catch { return ''; }
  }
}
