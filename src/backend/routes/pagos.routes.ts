import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const pagosRouter = Router();

pagosRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`SELECT p.id_pago, c.id_cita as id, u.nombre, u.telefono, s.nombre as servicio, c.fecha, c.hora, p.metodo_pago as metodoPago, p.valor, c.estado, p.estado_pago as estadoPago FROM pagos p JOIN citas c ON p.id_cita = c.id_cita JOIN usuarios u ON c.id_usuario = u.id_usuario JOIN servicios s ON c.id_servicio = s.id_servicio ORDER BY c.fecha DESC`);
    res.json(rows);
  } catch (error: any) { console.error('ERROR GET /api/pagos:', error.message); res.status(500).json({ error: 'Error al obtener pagos' }); }
});
