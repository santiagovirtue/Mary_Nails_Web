import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-servicios',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios implements OnInit {
  servicios: any[] = [];
  cargando = true;
  private iconos = ['💅', '✨', '🌸', '🎨', '💖', '🦋', '🌺', '💎'];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.http.get<any[]>('/api/servicios/activos').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.servicios = data || [];
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.servicios = [];
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  obtenerIcono(index: number): string {
    return this.iconos[index % this.iconos.length];
  }

  formatearDuracion(servicio: any): string {
    const min = servicio.duracion_minutos || servicio.duracion;
    if (!min) return 'Variable';
    if (typeof min === 'string') return min;
    return min + ' min';
  }

  formatearPrecio(servicio: any): string {
    const precio = servicio.precio;
    if (!precio) return 'Consultar';
    if (typeof precio === 'string' && precio.includes('$')) return precio;
    const num = Number(precio);
    if (isNaN(num)) return String(precio);
    return '$' + num.toLocaleString('es-CO');
  }
}
