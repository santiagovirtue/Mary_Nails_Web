import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const calificacionesRouter = Router();

calificacionesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`SELECT cal.id_calificacion as id, cal.id_cita as idCita, u.nombre as cliente, s.nombre as servicio, c.fecha as fechaCita, c.hora as horaCita, cal.puntuacion, cal.comentario, DATE(cal.fecha) as fecha FROM calificaciones cal JOIN citas c ON cal.id_cita=c.id_cita JOIN usuarios u ON c.id_usuario=u.id_usuario JOIN servicios s ON c.id_servicio=s.id_servicio ORDER BY cal.fecha DESC`);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Error al obtener calificaciones' }); }
});

calificacionesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { idCita, puntuacion, comentario } = req.body;
    const [result]: any = await pool.query('INSERT INTO calificaciones (id_cita, puntuacion, comentario) VALUES (?, ?, ?)', [idCita, puntuacion, comentario]);
    res.status(201).json({ id: result.insertId });
  } catch (error) { res.status(500).json({ error: 'Error al guardar calificación' }); }
});

calificacionesRouter.delete('/:id', async (req: Request, res: Response) => {
  try { const { id } = req.params; await pool.query('DELETE FROM calificaciones WHERE id_calificacion = ?', [id]); res.json({ mensaje: 'Calificación eliminada' }); }
  catch (error) { res.status(500).json({ error: 'Error al eliminar calificación' }); }
});
