import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const serviciosRouter = Router();

serviciosRouter.get('/', async (req: Request, res: Response) => {
  try { const [rows] = await pool.query('SELECT * FROM servicios ORDER BY id_servicio'); res.json(rows); }
  catch (error: any) { console.error('ERROR GET /api/servicios:', error.message); res.status(500).json({ error: 'Error al obtener servicios', detalle: error.message }); }
});

serviciosRouter.get('/activos', async (req: Request, res: Response) => {
  try { const [rows] = await pool.query("SELECT * FROM servicios WHERE estado = 'activo'"); res.json(rows); }
  catch (error: any) { console.error('ERROR GET /api/servicios/activos:', error.message); res.status(500).json({ error: 'Error', detalle: error.message }); }
});

serviciosRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, duracion, precio, estado } = req.body;
    const duracionMin = parseInt(duracion) || 60;
    const precioNum = parseFloat(String(precio).replace(/[^0-9.]/g, '')) || 0;
    const [result]: any = await pool.query('INSERT INTO servicios (nombre, descripcion, precio, duracion_minutos, estado) VALUES (?, ?, ?, ?, ?)', [nombre, descripcion, precioNum, duracionMin, estado === 'Activo' ? 'activo' : 'inactivo']);
    res.status(201).json({ id: result.insertId });
  } catch (error: any) { console.error('ERROR POST /api/servicios:', error.message); res.status(500).json({ error: 'Error al crear servicio', detalle: error.message }); }
});

serviciosRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion, precio, estado } = req.body;
    const duracionMin = parseInt(duracion) || 60;
    const precioNum = parseFloat(String(precio).replace(/[^0-9.]/g, '')) || 0;
    await pool.query('UPDATE servicios SET nombre=?, descripcion=?, precio=?, duracion_minutos=?, estado=? WHERE id_servicio=?', [nombre, descripcion, precioNum, duracionMin, estado === 'Activo' ? 'activo' : 'inactivo', id]);
    res.json({ mensaje: 'Actualizado' });
  } catch (error: any) { console.error('ERROR PUT /api/servicios:', error.message); res.status(500).json({ error: 'Error', detalle: error.message }); }
});

serviciosRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query('SELECT estado FROM servicios WHERE id_servicio = ?', [id]);
    const nuevoEstado = rows[0].estado === 'activo' ? 'inactivo' : 'activo';
    await pool.query('UPDATE servicios SET estado = ? WHERE id_servicio = ?', [nuevoEstado, id]);
    res.json({ estado: nuevoEstado });
  } catch (error: any) { console.error('ERROR PATCH /api/servicios:', error.message); res.status(500).json({ error: 'Error', detalle: error.message }); }
});

serviciosRouter.delete('/:id', async (req: Request, res: Response) => {
  try { const { id } = req.params; await pool.query('DELETE FROM servicios WHERE id_servicio = ?', [id]); res.json({ mensaje: 'Eliminado' }); }
  catch (error: any) { console.error('ERROR DELETE /api/servicios:', error.message); res.status(500).json({ error: 'Error', detalle: error.message }); }
});
