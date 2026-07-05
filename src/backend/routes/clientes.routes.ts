import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const clientesRouter = Router();

clientesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [usuarios]: any = await pool.query("SELECT u.id_usuario, u.nombre, u.correo, u.telefono, u.rol, u.fecha_registro, COUNT(c.id_cita) as total_citas, MAX(c.fecha) as ultima_cita FROM usuarios u LEFT JOIN citas c ON u.id_usuario = c.id_usuario WHERE u.rol = 'cliente' GROUP BY u.id_usuario ORDER BY u.fecha_registro DESC");
    const [citas]: any = await pool.query("SELECT c.id_cita, c.id_usuario, s.nombre as servicio, c.fecha, c.hora, c.estado, p.metodo_pago as metodoPago, p.estado_pago as estadoPago FROM citas c JOIN servicios s ON c.id_servicio = s.id_servicio LEFT JOIN pagos p ON p.id_cita = c.id_cita ORDER BY c.fecha DESC");

    const resultado = usuarios.map((u: any) => {
      const citasCliente = citas.filter((c: any) => c.id_usuario === u.id_usuario);
      const servicios = [...new Set(citasCliente.map((c: any) => c.servicio))];
      return {
        id: u.id_usuario,
        nombre: u.nombre,
        correo: u.correo,
        telefono: u.telefono,
        fecha_registro: u.fecha_registro,
        totalCitas: Number(u.total_citas),
        ultimaCita: u.ultima_cita,
        servicios,
        citasPendientes: citasCliente.filter((c: any) => c.estado === 'pendiente').length,
        citasConfirmadas: citasCliente.filter((c: any) => c.estado === 'confirmada').length,
        citasCompletadas: citasCliente.filter((c: any) => c.estado === 'completada').length,
        citasCanceladas: citasCliente.filter((c: any) => c.estado === 'cancelada').length,
        pagosPendientes: citasCliente.filter((c: any) => c.estadoPago !== 'pagado').length,
        historial: citasCliente,
      };
    });
    res.json(resultado);
  } catch (error: any) { console.error('ERROR GET /api/clientes:', error.message); res.status(500).json({ error: 'Error al obtener clientes' }); }
});
