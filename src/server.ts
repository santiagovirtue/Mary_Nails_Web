import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { testConnection } from './backend/db';
import { reservasRouter } from './backend/routes/reservas.routes';
import { serviciosRouter } from './backend/routes/servicios.routes';
import { disponibilidadRouter } from './backend/routes/disponibilidad.routes';
import { authRouter } from './backend/routes/auth.routes';
import { reportesRouter } from './backend/routes/reportes.routes';
import { pagosRouter } from './backend/routes/pagos.routes';
import { clientesRouter } from './backend/routes/clientes.routes';
import { dashboardRouter } from './backend/routes/dashboard.routes';
import { perfilRouter } from './backend/routes/perfil.routes';
import { calificacionesRouter } from './backend/routes/calificaciones.routes';

dotenv.config();

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/reservas', reservasRouter);
app.use('/api/servicios', serviciosRouter);
app.use('/api/disponibilidad', disponibilidadRouter);
app.use('/api/calificaciones', calificacionesRouter);
app.use('/api/perfil', perfilRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/pagos', pagosRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', mensaje: 'MaryNails API funcionando ✅' });
});

app.use(express.static(browserDistFolder, { maxAge: '1y', index: false, redirect: false }));

app.use((req, res, next) => {
  angularApp.handle(req).then((response) =>
    response ? writeResponseToNodeResponse(response, res) : next()
  ).catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, async () => {
    console.log(`🚀 MaryNails server en http://localhost:${port}`);
    await testConnection();
  });
}

export const reqHandler = createNodeRequestHandler(app);
