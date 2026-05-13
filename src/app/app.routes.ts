import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Servicios } from './pages/servicios/servicios';
import { Galeria } from './pages/galeria/galeria';
import { Reservas } from './pages/reservas/reservas';
import { Login } from './pages/login/login';

import { LoginAdmin } from './admin/login-admin/login-admin';
import { Dashboard } from './admin/dashboard/dashboard';
import { Cronograma } from './admin/cronograma/cronograma';
import { Disponibilidad } from './admin/disponibilidad/disponibilidad';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'servicios', component: Servicios },
  { path: 'galeria', component: Galeria },
  { path: 'reservas', component: Reservas },
  { path: 'login', component: Login },

  { path: 'admin/login', component: LoginAdmin },
  { path: 'admin/dashboard', component: Dashboard },
  { path: 'admin/cronograma', component: Cronograma },
  { path: 'admin/disponibilidad', component: Disponibilidad },

  { path: '**', redirectTo: '' }
];
