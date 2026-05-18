import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Reserva {
  id: number;
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  metodoPago: string;
  comentarios: string;
  estado: string;
}

interface Horario {
  id: number;
  dia: string;
  horaInicio: string;
  horaFinal: string;
  estado: string;
  observacion: string;
}

@Component({
  selector: 'app-reservas',
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {
  private readonly telefonoWhatsapp = '573132146285';

  horarios: Horario[] = [];

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
  horarioSeleccionado = '';
  mensajeWhatsapp = 'Hola, quiero reservar una cita en Mary Nails.';

  ngOnInit(): void {
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    const horariosGuardados = localStorage.getItem('maryNailsDisponibilidad');

    if (horariosGuardados) {
      this.horarios = JSON.parse(horariosGuardados);
      return;
    }

    this.horarios = [
      {
        id: 1,
        dia: 'Lunes',
        horaInicio: '09:00',
        horaFinal: '12:00',
        estado: 'Disponible',
        observacion: 'Horario disponible para reservas.',
      },
      {
        id: 2,
        dia: 'Miércoles',
        horaInicio: '14:00',
        horaFinal: '17:00',
        estado: 'Disponible',
        observacion: 'Horario disponible para reservas.',
      },
      {
        id: 3,
        dia: 'Viernes',
        horaInicio: '10:00',
        horaFinal: '13:00',
        estado: 'Ocupado',
        observacion: 'Horario reservado.',
      },
      {
        id: 4,
        dia: 'Sábado',
        horaInicio: '08:00',
        horaFinal: '11:00',
        estado: 'Disponible',
        observacion: 'Horario disponible para reservas.',
      },
    ];
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
    return `https://api.whatsapp.com/send?phone=${this.telefonoWhatsapp}&text=${encodeURIComponent(this.mensajeWhatsapp)}`;
  }

  seleccionarDisponibilidad(horario: Horario): void {
    if (horario.estado !== 'Disponible') {
      this.horarioSeleccionado =
        'Este horario está ocupado. Selecciona otro horario disponible.';
      return;
    }

    this.reserva.hora = `${this.formatearHora(horario.horaInicio)} - ${this.formatearHora(horario.horaFinal)}`;

    this.horarioSeleccionado = `Seleccionaste el horario del día ${horario.dia}: ${this.reserva.hora}. Ahora elige la fecha correspondiente en el formulario.`;
  }

  confirmarSolicitud(): void {
    if (
      !this.reserva.nombre ||
      !this.reserva.telefono ||
      !this.reserva.servicio ||
      !this.reserva.fecha ||
      !this.reserva.hora ||
      !this.reserva.metodoPago
    ) {
      this.mensajeConfirmacion =
        'Por favor completa todos los campos obligatorios antes de confirmar la solicitud.';
      return;
    }

    const nuevaReserva: Reserva = {
      id: Date.now(),
      nombre: this.reserva.nombre,
      telefono: this.reserva.telefono,
      servicio: this.reserva.servicio,
      fecha: this.reserva.fecha,
      hora: this.reserva.hora,
      metodoPago: this.reserva.metodoPago,
      comentarios: this.reserva.comentarios,
      estado: 'Pendiente',
    };

    const reservasGuardadas = localStorage.getItem('maryNailsReservas');
    const reservas: Reserva[] = reservasGuardadas
      ? JSON.parse(reservasGuardadas)
      : [];

    reservas.push(nuevaReserva);

    localStorage.setItem('maryNailsReservas', JSON.stringify(reservas));

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