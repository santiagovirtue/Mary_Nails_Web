import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ReservasService } from '../../services/reservas.service';
import { ServiciosService, Servicio } from '../../services/servicios.service';
import {
  DisponibilidadService,
  Horario,
} from '../../services/disponibilidad.service';

@Component({
  selector: 'app-reservas',
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {
  private readonly telefonoWhatsapp = '573132146285';

  horarios: Horario[] = [];
  serviciosActivos: Servicio[] = [];

  reserva = {
    nombre: '',
    telefono: '',
    servicio: '',
    fecha: '',
    hora: '',
    metodoPago: '',
    comentarios: '',
  };

  mensajeConfirmacion = '';
  mensajeError = '';
  horarioSeleccionado = '';
  diaHorarioSeleccionado = '';
  mensajeWhatsapp = 'Hola, quiero reservar una cita en Mary Nails.';
  fechaMinima = '';

  constructor(
    private route: ActivatedRoute,
    private reservasService: ReservasService,
    private serviciosService: ServiciosService,
    private disponibilidadService: DisponibilidadService
  ) {}

  ngOnInit(): void {
    this.fechaMinima = this.obtenerFechaActual();
    this.cargarHorarios();
    this.cargarServicios();

    this.route.queryParams.subscribe((params) => {
      const servicioSeleccionado = params['servicio'];

      if (servicioSeleccionado) {
        this.reserva.servicio = servicioSeleccionado;
      }
    });
  }

  cargarHorarios(): void {
    this.horarios = this.disponibilidadService.obtenerHorarios();
  }

  cargarServicios(): void {
    this.serviciosActivos = this.serviciosService.obtenerServiciosActivos();
  }

  seleccionarMotivo(event: Event): void {
    const motivo = (event.target as HTMLSelectElement).value;

    const mensajes: Record<string, string> = {
      reserva: 'Hola, quiero reservar una cita en Mary Nails.',
      disponibilidad:
        'Hola, quiero consultar disponibilidad de horarios en Mary Nails.',
      cambio: 'Hola, quiero cambiar una cita que tengo reservada en Mary Nails.',
      cancelacion: 'Hola, quiero cancelar una cita en Mary Nails.',
      pago: 'Hola, tengo una duda sobre el método de pago de mi reserva en Mary Nails.',
      servicio:
        'Hola, quiero consultar información sobre los servicios de Mary Nails.',
      otro: 'Hola, necesito ayuda con una consulta sobre Mary Nails.',
    };

    this.mensajeWhatsapp = mensajes[motivo] || mensajes['otro'];
  }

  get whatsappUrl(): string {
    return `https://api.whatsapp.com/send?phone=${
      this.telefonoWhatsapp
    }&text=${encodeURIComponent(this.mensajeWhatsapp)}`;
  }

  seleccionarDisponibilidad(horario: Horario): void {
    if (horario.estado !== 'Disponible') {
      this.horarioSeleccionado =
        'Este horario está ocupado. Selecciona otro horario disponible.';
      return;
    }

    this.reserva.hora = `${this.formatearHora(
      horario.horaInicio
    )} - ${this.formatearHora(horario.horaFinal)}`;

    this.diaHorarioSeleccionado = horario.dia;

    this.horarioSeleccionado = `Seleccionaste el horario del día ${horario.dia}: ${this.reserva.hora}. Ahora elige la fecha correspondiente en el formulario.`;
  }

  confirmarSolicitud(): void {
    this.mensajeError = '';
    this.mensajeConfirmacion = '';

    if (!this.camposObligatoriosCompletos()) {
      this.mensajeError =
        'Por favor completa todos los campos obligatorios antes de confirmar la solicitud.';
      return;
    }

    if (!this.telefonoValido()) {
      this.mensajeError =
        'El teléfono debe contener mínimo 10 números. Verifica el dato ingresado.';
      return;
    }

    if (!this.fechaValida()) {
      this.mensajeError =
        'No puedes seleccionar una fecha pasada. Elige una fecha actual o futura.';
      return;
    }

    if (!this.fechaCoincideConDiaSeleccionado()) {
      const diaCorrecto = this.obtenerDiaHorarioSeleccionado();

      this.mensajeError = `La fecha seleccionada no corresponde al día ${diaCorrecto}. Elige una fecha que coincida con el horario disponible.`;
      return;
    }

    if (this.reservaDuplicada()) {
      this.mensajeError =
        'Ya existe una reserva registrada para esa fecha y hora. Selecciona otro horario disponible.';
      return;
    }

    this.reservasService.agregarReserva({
      nombre: this.reserva.nombre,
      telefono: this.reserva.telefono,
      servicio: this.reserva.servicio,
      fecha: this.reserva.fecha,
      hora: this.reserva.hora,
      metodoPago: this.reserva.metodoPago,
      comentarios: this.reserva.comentarios,
    });

    this.mensajeConfirmacion = `Solicitud registrada correctamente. Tu cita quedó pendiente de confirmación para el día ${this.reserva.fecha} a las ${this.reserva.hora}.`;

    this.reserva = {
      nombre: '',
      telefono: '',
      servicio: '',
      fecha: '',
      hora: '',
      metodoPago: '',
      comentarios: '',
    };

    this.horarioSeleccionado = '';
    this.diaHorarioSeleccionado = '';
  }

  reservaDuplicada(): boolean {
    return this.reservasService.existeReserva(
      this.reserva.fecha,
      this.reserva.hora
    );
  }

  camposObligatoriosCompletos(): boolean {
    return (
      this.reserva.nombre.trim() !== '' &&
      this.reserva.telefono.trim() !== '' &&
      this.reserva.servicio !== '' &&
      this.reserva.fecha !== '' &&
      this.reserva.hora !== '' &&
      this.reserva.metodoPago !== ''
    );
  }

  telefonoValido(): boolean {
    const soloNumeros = this.reserva.telefono.replace(/\D/g, '');
    return soloNumeros.length >= 10;
  }

  obtenerFechaActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  fechaValida(): boolean {
    return this.reserva.fecha >= this.fechaMinima;
  }

  obtenerDiaDeFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaLocal = new Date(year, month - 1, day);

    const dias = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];

    return dias[fechaLocal.getDay()];
  }

  obtenerDiaHorarioSeleccionado(): string {
    if (this.diaHorarioSeleccionado) {
      return this.diaHorarioSeleccionado;
    }

    const horarioEncontrado = this.horarios.find((horario) => {
      const horaFormateada = `${this.formatearHora(
        horario.horaInicio
      )} - ${this.formatearHora(horario.horaFinal)}`;

      return horaFormateada === this.reserva.hora;
    });

    return horarioEncontrado ? horarioEncontrado.dia : '';
  }

  fechaCoincideConDiaSeleccionado(): boolean {
    const diaHorario = this.obtenerDiaHorarioSeleccionado();

    if (!diaHorario) {
      return true;
    }

    const diaFecha = this.obtenerDiaDeFecha(this.reserva.fecha);

    return diaFecha === diaHorario;
  }

  formatearHora(hora: string): string {
    if (!hora) {
      return '';
    }

    const [horas, minutos] = hora.split(':');
    const horasNumero = Number(horas);
    const periodo = horasNumero >= 12 ? 'p.m.' : 'a.m.';
    const horaFormato12 = horasNumero % 12 || 12;

    return `${horaFormato12.toString().padStart(2, '0')}:${minutos} ${periodo}`;
  }
}