import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReservasService } from '../../services/reservas.service';
import { DisponibilidadService, Horario } from '../../services/disponibilidad.service';

@Component({
  selector: 'app-reservas',
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {
  private readonly telefonoWhatsapp = '573132146285';
  horarios: Horario[] = [];
  serviciosActivos: any[] = [];
  reserva = { nombre: '', telefono: '', servicio: '', fecha: '', hora: '', metodoPago: '', comentarios: '' };
  mensajeConfirmacion = '';
  mensajeError = '';
  horarioSeleccionado = '';
  diaHorarioSeleccionado = '';
  mensajeWhatsapp = 'Hola, quiero reservar una cita en Mary Nails.';
  fechaMinima = '';
  guardando = false;
  mostrarModal = false;
  reservaConfirmada: any = null;

  constructor(
    private route: ActivatedRoute,
    private reservasService: ReservasService,
    private disponibilidadService: DisponibilidadService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.fechaMinima = this.obtenerFechaActual();
    this.disponibilidadService.obtenerHorariosAPI().subscribe(hs => { this.zone.run(() => { this.horarios = hs; this.cdr.detectChanges(); }); });
    this.cargarServiciosReales();
    this.route.queryParams.subscribe((params) => {
      if (params['servicio']) this.reserva.servicio = params['servicio'];
    });
  }

  cargarServiciosReales(): void {
    this.http.get<any[]>('/api/servicios/activos').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.serviciosActivos = data || [];
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.serviciosActivos = [];
          this.cdr.detectChanges();
        });
      },
    });
  }

  seleccionarServicio(servicio: any): void {
    this.reserva.servicio = servicio.nombre;
  }

  formatearPrecio(precio: any): string {
    if (!precio) return '';
    const num = Number(precio);
    if (isNaN(num)) return String(precio);
    return '$' + num.toLocaleString('es-CO');
  }

  seleccionarMotivo(event: Event): void {
    const motivo = (event.target as HTMLSelectElement).value;
    const mensajes: Record<string, string> = {
      reserva: 'Hola, quiero reservar una cita en Mary Nails.',
      disponibilidad: 'Hola, quiero consultar disponibilidad de horarios en Mary Nails.',
      cambio: 'Hola, quiero cambiar una cita que tengo reservada en Mary Nails.',
      cancelacion: 'Hola, quiero cancelar una cita en Mary Nails.',
      pago: 'Hola, tengo una duda sobre el método de pago de mi reserva en Mary Nails.',
      servicio: 'Hola, quiero consultar información sobre los servicios de Mary Nails.',
      otro: 'Hola, necesito ayuda con una consulta sobre Mary Nails.',
    };
    this.mensajeWhatsapp = mensajes[motivo] || mensajes['otro'];
  }

  get whatsappUrl(): string {
    return 'https://api.whatsapp.com/send?phone=' + this.telefonoWhatsapp + '&text=' + encodeURIComponent(this.mensajeWhatsapp);
  }

  seleccionarDisponibilidad(horario: Horario): void {
    if (horario.estado !== 'Disponible') {
      this.horarioSeleccionado = 'Este horario está ocupado. Selecciona otro horario disponible.';
      return;
    }
    this.reserva.hora = this.formatearHora(horario.horaInicio) + ' - ' + this.formatearHora(horario.horaFinal);
    this.diaHorarioSeleccionado = horario.dia;
    this.horarioSeleccionado = 'Seleccionaste el horario del día ' + horario.dia + ': ' + this.reserva.hora + '. Ahora elige la fecha correspondiente en el formulario.';
  }

  confirmarSolicitud(): void {
    this.mensajeError = '';
    this.mensajeConfirmacion = '';
    if (!this.camposObligatoriosCompletos()) { this.mensajeError = 'Por favor completa todos los campos obligatorios antes de confirmar la solicitud.'; return; }
    if (!this.telefonoValido()) { this.mensajeError = 'El teléfono debe contener mínimo 10 números.'; return; }
    if (!this.fechaValida()) { this.mensajeError = 'No puedes seleccionar una fecha pasada.'; return; }
    if (!this.fechaCoincideConDiaSeleccionado()) { this.mensajeError = 'La fecha no corresponde al día ' + this.obtenerDiaHorarioSeleccionado() + '.'; return; }
    if (this.reservasService.existeReserva(this.reserva.fecha, this.reserva.hora)) { this.mensajeError = 'Ya existe una reserva para esa fecha y hora.'; return; }
    this.guardando = true;
    const reservaGuardar: any = Object.assign({}, this.reserva);
    if (typeof window !== 'undefined') {
      const correoSesion = localStorage.getItem('maryNailsClienteUsuario') || '';
      if (correoSesion) reservaGuardar.correo = correoSesion;
    }
    this.reservasService.agregarReserva(reservaGuardar);
    this.zone.run(() => {
      this.reservaConfirmada = reservaGuardar;
      this.mostrarModal = true;
      this.guardando = false;
      this.reserva = { nombre: '', telefono: '', servicio: '', fecha: '', hora: '', metodoPago: '', comentarios: '' };
      this.horarioSeleccionado = '';
      this.diaHorarioSeleccionado = '';
      this.cdr.detectChanges();
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.reservaConfirmada = null;
  }

  camposObligatoriosCompletos(): boolean {
    return this.reserva.nombre.trim() !== '' && this.reserva.telefono.trim() !== '' && this.reserva.servicio !== '' && this.reserva.fecha !== '' && this.reserva.hora !== '' && this.reserva.metodoPago !== '';
  }

  telefonoValido(): boolean { return this.reserva.telefono.replace(/\D/g, '').length >= 10; }
  obtenerFechaActual(): string {
    const hoy = new Date();
    return hoy.getFullYear() + '-' + String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0');
  }
  fechaValida(): boolean { return this.reserva.fecha >= this.fechaMinima; }

  obtenerDiaDeFecha(fecha: string): string {
    const partes = fecha.split('-').map(Number);
    return ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][new Date(partes[0], partes[1]-1, partes[2]).getDay()];
  }

  obtenerDiaHorarioSeleccionado(): string {
    if (this.diaHorarioSeleccionado) return this.diaHorarioSeleccionado;
    const h = this.horarios.find(h => (this.formatearHora(h.horaInicio) + ' - ' + this.formatearHora(h.horaFinal)) === this.reserva.hora);
    return h ? h.dia : '';
  }

  fechaCoincideConDiaSeleccionado(): boolean {
    const diaHorario = this.obtenerDiaHorarioSeleccionado();
    if (!diaHorario) return true;
    return this.obtenerDiaDeFecha(this.reserva.fecha) === diaHorario;
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    const partes = hora.split(':');
    const h = Number(partes[0]);
    return (h % 12 || 12).toString().padStart(2,'0') + ':' + partes[1] + ' ' + (h >= 12 ? 'p.m.' : 'a.m.');
  }
}
