import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cronograma',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './cronograma.html',
  styleUrl: './cronograma.css',
})
export class Cronograma implements OnInit {
  reservas: any[] = [];
  serviciosActivos: any[] = [];
  horarios: any[] = [];
  busqueda = '';
  filtroEstado = 'Todas';
  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';
  cargando = true;

  mostrarModal = false;
  guardando = false;
  nuevaCita = { nombre: '', telefono: '', servicio: '', fecha: '', hora: '', metodoPago: '', comentarios: '' };
  errorModal = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarServicios();
    this.cargarHorarios();
  }

  cargarReservas(): void {
    this.http.get<any[]>('/api/reservas').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.reservas = (data || []).map(r => ({
            ...r,
            estado: this.cap(r.estado),
            estadoPago: this.cap(r.estadoPago),
          }));
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
    });
  }

  cargarServicios(): void {
    this.http.get<any[]>('/api/servicios/activos').subscribe({
      next: (data) => { this.zone.run(() => { this.serviciosActivos = data || []; this.cdr.detectChanges(); }); },
      error: () => {},
    });
  }

  cargarHorarios(): void {
    this.http.get<any[]>('/api/disponibilidad').subscribe({
      next: (data) => { this.zone.run(() => { this.horarios = data || []; this.cdr.detectChanges(); }); },
      error: () => {},
    });
  }

  cap(v: string): string {
    if (!v) return 'Pendiente';
    return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
  }

  obtenerReservasFiltradas(): any[] {
    const texto = this.busqueda.toLowerCase().trim();
    return this.reservas.filter(r => {
      const coincideBusqueda =
        (r.nombre || '').toLowerCase().includes(texto) ||
        (r.telefono || '').toLowerCase().includes(texto) ||
        (r.servicio || '').toLowerCase().includes(texto) ||
        (r.metodoPago || '').toLowerCase().includes(texto) ||
        (r.estado || '').toLowerCase().includes(texto) ||
        (r.estadoPago || '').toLowerCase().includes(texto);
      const coincideEstado = this.filtroEstado === 'Todas' || r.estado === this.filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }

  contarTotal(): number { return this.reservas.length; }
  contarPendientes(): number { return this.reservas.filter(r => r.estado === 'Pendiente').length; }
  contarConfirmadas(): number { return this.reservas.filter(r => r.estado === 'Confirmada').length; }
  contarCompletadas(): number { return this.reservas.filter(r => r.estado === 'Completada').length; }
  contarCanceladas(): number { return this.reservas.filter(r => r.estado === 'Cancelada').length; }
  contarPagadas(): number { return this.reservas.filter(r => r.estadoPago === 'Pagado').length; }

  cambiarEstado(id: number, nuevoEstado: string, mensajeExito: string): void {
    this.http.patch('/api/reservas/' + id + '/estado', { estado: nuevoEstado.toLowerCase() }).subscribe({
      next: () => { this.mostrarMensaje(mensajeExito, 'exito'); this.cargarReservas(); },
      error: () => { this.mostrarMensaje('Error al actualizar el estado', 'error'); },
    });
  }

  marcarPendiente(id: number): void { this.cambiarEstado(id, 'pendiente', 'Cita revertida a pendiente'); }
  confirmarReserva(id: number): void { this.cambiarEstado(id, 'confirmada', 'Cita confirmada correctamente'); }
  completarReserva(id: number): void { this.cambiarEstado(id, 'completada', 'Cita marcada como completada'); }
  reactivarReserva(id: number): void {
    if (!confirm('¿Reactivar esta cita cancelada? Volverá a estado Pendiente.')) return;
    this.cambiarEstado(id, 'pendiente', 'Cita reactivada correctamente');
  }
  cancelarReserva(id: number): void {
    if (!confirm('¿Seguro que deseas cancelar esta cita?')) return;
    this.cambiarEstado(id, 'cancelada', 'Cita cancelada correctamente');
  }

  togglePago(id: number, estadoActual: string): void {
    const nuevoEstado = estadoActual === 'Pagado' ? 'pendiente' : 'pagado';
    const mensaje = nuevoEstado === 'pagado' ? 'Pago marcado como pagado' : 'Pago revertido a pendiente';
    this.http.patch('/api/reservas/' + id + '/pago', { estadoPago: nuevoEstado }).subscribe({
      next: () => { this.mostrarMensaje(mensaje, 'exito'); this.cargarReservas(); },
      error: () => { this.mostrarMensaje('Error al actualizar el pago', 'error'); },
    });
  }

  eliminarReserva(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar esta cita? Esta acción no se puede deshacer.')) return;
    this.http.delete('/api/reservas/' + id).subscribe({
      next: () => { this.mostrarMensaje('Cita eliminada correctamente', 'exito'); this.cargarReservas(); },
      error: () => { this.mostrarMensaje('Error al eliminar la cita', 'error'); },
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = 'Todas';
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    const partes = String(hora).split(':');
    const num = Number(partes[0]);
    return (num % 12 || 12).toString().padStart(2,'0') + ':' + partes[1] + ' ' + (num >= 12 ? 'p.m.' : 'a.m.');
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      const d = new Date(fecha);
      return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
    } catch { return fecha; }
  }

  abrirModal(): void {
    this.nuevaCita = { nombre: '', telefono: '', servicio: '', fecha: '', hora: '', metodoPago: '', comentarios: '' };
    this.errorModal = '';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.guardando = false;
  }

  crearCita(): void {
    this.errorModal = '';
    const c = this.nuevaCita;
    if (!c.nombre.trim() || !c.telefono.trim() || !c.servicio || !c.fecha || !c.hora || !c.metodoPago) {
      this.errorModal = 'Por favor completa todos los campos obligatorios';
      return;
    }
    if (c.telefono.replace(/\D/g,'').length < 10) {
      this.errorModal = 'El teléfono debe tener mínimo 10 dígitos';
      return;
    }
    this.guardando = true;
    this.http.post('/api/reservas', c).subscribe({
      next: () => {
        this.zone.run(() => {
          this.mostrarMensaje('Cita creada correctamente por el administrador', 'exito');
          this.mostrarModal = false;
          this.guardando = false;
          this.cargarReservas();
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.errorModal = 'Error al crear la cita. Verifica los datos.';
          this.guardando = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.zone.run(() => { this.mensaje = ''; this.tipoMensaje = ''; this.cdr.detectChanges(); }); }, 3000);
  }
}
