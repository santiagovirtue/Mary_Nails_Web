import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calificaciones',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './calificaciones.html',
  styleUrl: './calificaciones.css',
})
export class Calificaciones implements OnInit {
  calificaciones: any[] = [];
  cargando = true;
  busqueda = '';
  filtroPuntuacion = 'Todas';
  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void { this.cargarCalificaciones(); }

  cargarCalificaciones(): void {
    this.http.get<any[]>('/api/calificaciones').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.calificaciones = data || [];
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
    });
  }

  obtenerCalificacionesFiltradas(): any[] {
    const texto = this.busqueda.toLowerCase().trim();
    return this.calificaciones.filter(c => {
      const coincideBusqueda =
        (c.servicio || '').toLowerCase().includes(texto) ||
        (c.comentario || '').toLowerCase().includes(texto) ||
        (c.cliente || '').toLowerCase().includes(texto);
      const coincidePuntuacion = this.filtroPuntuacion === 'Todas' || c.puntuacion === Number(this.filtroPuntuacion);
      return coincideBusqueda && coincidePuntuacion;
    });
  }

  contarTotal(): number { return this.calificaciones.length; }

  obtenerPromedio(): string {
    if (this.calificaciones.length === 0) return '0.0';
    const suma = this.calificaciones.reduce((t, c) => t + (c.puntuacion || 0), 0);
    return (suma / this.calificaciones.length).toFixed(1);
  }

  contarPorPuntuacion(p: number): number {
    return this.calificaciones.filter(c => c.puntuacion === p).length;
  }

  eliminarCalificacion(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar esta calificación?')) return;
    this.http.delete('/api/calificaciones/' + id).subscribe({
      next: () => { this.mostrarMensaje('Calificación eliminada correctamente', 'exito'); this.cargarCalificaciones(); },
      error: () => { this.mostrarMensaje('Error al eliminar la calificación', 'error'); },
    });
  }

  estrellas(n: number): string { return '★'.repeat(n) + '☆'.repeat(5 - n); }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      const d = new Date(fecha);
      return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
    } catch { return fecha; }
  }

  limpiarFiltros(): void { this.busqueda = ''; this.filtroPuntuacion = 'Todas'; }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.zone.run(() => { this.mensaje = ''; this.tipoMensaje = ''; this.cdr.detectChanges(); }); }, 3000);
  }
}
