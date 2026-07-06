import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calificar-servicio',
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './calificar-servicio.html',
  styleUrl: './calificar-servicio.css',
})
export class CalificarServicio implements OnInit {
  estrellas = [1, 2, 3, 4, 5];
  citasCompletadas: any[] = [];
  cargando = true;
  guardando = false;

  calificacion = { idCita: 0, puntuacion: 0, comentario: '' };
  mensajeExito = '';
  mensajeError = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    if (typeof window === 'undefined') { this.cargando = false; return; }
    const correo = localStorage.getItem('maryNailsClienteUsuario') || '';
    if (!correo) { this.cargando = false; return; }

    this.http.get<any[]>('/api/reservas/cliente?correo=' + encodeURIComponent(correo)).subscribe({
      next: (citas) => {
        this.http.get<any[]>('/api/calificaciones').subscribe({
          next: (cals) => {
            this.zone.run(() => {
              const idsCalificados = new Set((cals || []).map(c => c.idCita));
              this.citasCompletadas = (citas || []).filter(c =>
                (c.estado === 'completada' || c.estado === 'Completada') && !idsCalificados.has(c.id)
              );
              this.cargando = false;
              this.cdr.detectChanges();
            });
          },
          error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
        });
      },
      error: () => { this.zone.run(() => { this.cargando = false; this.cdr.detectChanges(); }); },
    });
  }

  obtenerCitaSeleccionada(): any {
    return this.citasCompletadas.find(c => c.id === Number(this.calificacion.idCita));
  }

  seleccionarPuntuacion(valor: number): void {
    this.calificacion.puntuacion = valor;
    this.mensajeError = '';
  }

  obtenerTextoPuntuacion(): string {
    const textos: Record<number, string> = { 1: 'Muy malo', 2: 'Regular', 3: 'Bueno', 4: 'Muy bueno', 5: 'Excelente' };
    return textos[this.calificacion.puntuacion] || 'Selecciona una puntuación';
  }

  enviarCalificacion(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
    const cita = this.obtenerCitaSeleccionada();
    if (!cita) { this.mensajeError = 'Selecciona una cita completada para calificar.'; return; }
    if (this.calificacion.puntuacion === 0) { this.mensajeError = 'Selecciona una puntuación de 1 a 5 estrellas.'; return; }
    if (!this.calificacion.comentario.trim()) { this.mensajeError = 'Escribe un comentario sobre el servicio recibido.'; return; }

    this.guardando = true;
    this.http.post('/api/calificaciones', {
      idCita: cita.id,
      puntuacion: this.calificacion.puntuacion,
      comentario: this.calificacion.comentario.trim(),
    }).subscribe({
      next: () => {
        this.zone.run(() => {
          this.mensajeExito = 'Calificación enviada correctamente. ¡Gracias por tu opinión!';
          this.calificacion = { idCita: 0, puntuacion: 0, comentario: '' };
          this.guardando = false;
          this.cargarCitas();
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.mensajeError = 'Error al enviar la calificación. Intenta de nuevo.';
          this.guardando = false;
          this.cdr.detectChanges();
        });
      },
    });
  }
}
