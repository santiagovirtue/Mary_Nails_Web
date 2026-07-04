import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const disponibilidadRouter = Router();

disponibilidadRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM disponibilidad ORDER BY id_disponibilidad');
    const horarios = rows.map((row: any) => ({ id: row.id_disponibilidad, dia: row.dia, horaInicio: row.hora_inicio.substring(0,5), horaFinal: row.hora_fin.substring(0,5), estado: row.estado === 'disponible' ? 'Disponible' : 'Ocupado', observacion: row.observacion }));
    res.json(horarios);
  } catch (error) { res.status(500).json({ error: 'Error al obtener horarios' }); }
});

disponibilidadRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { dia, horaInicio, horaFinal, estado, observacion } = req.body;
    const [result]: any = await pool.query('INSERT INTO disponibilidad (dia, hora_inicio, hora_fin, estado, observacion) VALUES (?, ?, ?, ?, ?)', [dia, horaInicio, horaFinal, estado === 'Disponible' ? 'disponible' : 'ocupado', observacion]);
    res.status(201).json({ id: result.insertId });
  } catch (error) { res.status(500).json({ error: 'Error al crear horario' }); }
});

disponibilidadRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dia, horaInicio, horaFinal, estado, observacion } = req.body;
    await pool.query('UPDATE disponibilidad SET dia=?, hora_inicio=?, hora_fin=?, estado=?, observacion=? WHERE id_disponibilidad=?', [dia, horaInicio, horaFinal, estado === 'Disponible' ? 'disponible' : 'ocupado', observacion, id]);
    res.json({ mensaje: 'Horario actualizado' });
  } catch (error) { res.status(500).json({ error: 'Error al actualizar horario' }); }
});

disponibilidadRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query('SELECT estado FROM disponibilidad WHERE id_disponibilidad = ?', [id]);
    const nuevoEstado = rows[0].estado === 'disponible' ? 'ocupado' : 'disponible';
    await pool.query('UPDATE disponibilidad SET estado = ? WHERE id_disponibilidad = ?', [nuevoEstado, id]);
    res.json({ estado: nuevoEstado === 'disponible' ? 'Disponible' : 'Ocupado' });
  } catch (error) { res.status(500).json({ error: 'Error al cambiar estado' }); }
});

disponibilidadRouter.delete('/:id', async (req: Request, res: Response) => {
  try { const { id } = req.params; await pool.query('DELETE FROM disponibilidad WHERE id_disponibilidad = ?', [id]); res.json({ mensaje: 'Horario eliminado' }); }
  catch (error) { res.status(500).json({ error: 'Error al eliminar horario' }); }
});
