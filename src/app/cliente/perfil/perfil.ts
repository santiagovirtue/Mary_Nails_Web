import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  correoSesion = '';
  perfil: any = { nombre: '', correo: '', telefono: '', direccion: '', preferencias: '', foto_perfil: '', fecha_registro: '' };
  perfilOriginal: any = {};
  cargando = true;
  guardando = false;
  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      this.cargando = false;
      return;
    }
    this.correoSesion = localStorage.getItem('maryNailsClienteUsuario') || '';
    if (this.correoSesion) { this.cargarPerfil(); } else { this.cargando = false; }
  }

  cargarPerfil(): void {
    this.http.get<any>('/api/perfil?correo=' + encodeURIComponent(this.correoSesion)).subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.perfil = {
            nombre: data.nombre || '', correo: data.correo || '', telefono: data.telefono || '',
            direccion: data.direccion || '', preferencias: data.preferencias || '',
            foto_perfil: data.foto_perfil || '', fecha_registro: data.fecha_registro || '',
          };
          this.perfilOriginal = Object.assign({}, this.perfil);
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.cargando = false;
          this.mostrarMensaje('No se pudo cargar el perfil', 'error');
          this.cdr.detectChanges();
        });
      },
    });
  }

  guardarCambios(): void {
    this.guardando = true;
    this.http.put('/api/perfil', {
      correo: this.perfil.correo, nombre: this.perfil.nombre, telefono: this.perfil.telefono,
      direccion: this.perfil.direccion, preferencias: this.perfil.preferencias, foto_perfil: this.perfil.foto_perfil,
    }).subscribe({
      next: () => { this.zone.run(() => { this.perfilOriginal = Object.assign({}, this.perfil); this.guardando = false; this.mostrarMensaje('Cambios guardados correctamente', 'exito'); this.cdr.detectChanges(); }); },
      error: () => { this.zone.run(() => { this.guardando = false; this.mostrarMensaje('Error al guardar los cambios', 'error'); this.cdr.detectChanges(); }); },
    });
  }

  cancelarCambios(): void {
    this.perfil = Object.assign({}, this.perfilOriginal);
    this.mostrarMensaje('Cambios descartados', 'exito');
  }

  cambiarFoto(event: any): void {
    const archivo = event.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => { this.zone.run(() => { this.perfil.foto_perfil = lector.result as string; this.cdr.detectChanges(); }); };
    lector.readAsDataURL(archivo);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const d = new Date(fecha);
    return meses[d.getMonth()] + ' ' + d.getFullYear();
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.zone.run(() => { this.mensaje = ''; this.tipoMensaje = ''; this.cdr.detectChanges(); }); }, 3000);
  }
}
