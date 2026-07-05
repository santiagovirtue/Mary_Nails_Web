import { Routes } from '@angular/router';

import { clienteGuard } from './guards/cliente.guard';
import { adminGuard } from './guards/admin.guard';

import { Home } from './pages/home/home';
import { Servicios } from './pages/servicios/servicios';
import { Galeria } from './pages/galeria/galeria';
import { Reservas } from './pages/reservas/reservas';
import { Login } from './pages/login/login';

import { MisCitas } from './cliente/mis-citas/mis-citas';
import { CalificarServicio } from './client/calificar-servicio/calificar-servicio';

import { LoginAdmin } from './admin/login-admin/login-admin';
import { Dashboard } from './admin/dashboard/dashboard';
import { Cronograma } from './admin/cronograma/cronograma';
import { Disponibilidad } from './admin/disponibilidad/disponibilidad';
import { Calificaciones } from './admin/calificaciones/calificaciones';
import { ServiciosAdmin } from './admin/servicios-admin/servicios-admin';
import { Pagos } from './admin/pagos/pagos';
import { Clientes } from './admin/clientes/clientes';
import { Reportes } from './admin/reportes/reportes';
import { Contacto } from './pages/contacto/contacto';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },

  {
    path: 'servicios',
    component: Servicios,
  },

  {
    path: 'galeria',
    component: Galeria,
  },

  {
    path: 'reservas',
    component: Reservas,
  },

  {
    path: 'login',
    component: Login,
  },

  {
    path: 'cliente/mis-citas',
    component: MisCitas,
    canActivate: [clienteGuard],
  },

  {
    path: 'cliente/calificar-servicio',
    component: CalificarServicio,
    canActivate: [clienteGuard],
  },

  {
    path: 'admin/login',
    component: LoginAdmin,
  },

  {
    path: 'admin/dashboard',
    component: Dashboard,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/cronograma',
    component: Cronograma,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/disponibilidad',
    component: Disponibilidad,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/servicios',
    component: ServiciosAdmin,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/clientes',
    component: Clientes,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/pagos',
    component: Pagos,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/calificaciones',
    component: Calificaciones,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/reportes',
    component: Reportes,
    canActivate: [adminGuard],
  },
  
  {
  path: 'contacto',
  component: Contacto,
  },

  {
    path: '**',
    redirectTo: '',
  },
];