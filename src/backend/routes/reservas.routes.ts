import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const reservasRouter = Router();

reservasRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`SELECT c.id_cita as id, u.nombre, u.telefono, s.nombre as servicio, c.fecha, c.hora, p.metodo_pago as metodoPago, c.observacion as comentarios, c.estado, p.estado_pago as estadoPago FROM citas c JOIN usuarios u ON c.id_usuario=u.id_usuario JOIN servicios s ON c.id_servicio=s.id_servicio LEFT JOIN pagos p ON p.id_cita=c.id_cita ORDER BY c.fecha DESC`);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Error al obtener reservas' }); }
});

reservasRouter.post('/', async (req: Request, res: Response) => {
  const { nombre, telefono, servicio, fecha, hora, metodoPago, comentarios } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let [usuarios]: any = await connection.query('SELECT id_usuario FROM usuarios WHERE telefono = ?', [telefono]);
    let id_usuario: number;
    if (usuarios.length === 0) {
      const [result]: any = await connection.query('INSERT INTO usuarios (nombre, telefono, correo, password, rol) VALUES (?, ?, ?, ?, ?)', [nombre, telefono, `${telefono}@marynails.com`, 'sin_password', 'cliente']);
      id_usuario = result.insertId;
    } else { id_usuario = usuarios[0].id_usuario; }
    const [servicios]: any = await connection.query('SELECT id_servicio, precio FROM servicios WHERE nombre = ?', [servicio]);
    if (servicios.length === 0) { await connection.rollback(); res.status(400).json({ error: 'Servicio no encontrado' }); return; }
    const { id_servicio, precio } = servicios[0];
    const [citaResult]: any = await connection.query('INSERT INTO citas (id_usuario, id_servicio, fecha, hora, estado, observacion) VALUES (?, ?, ?, ?, ?, ?)', [id_usuario, id_servicio, fecha, hora, 'pendiente', comentarios]);
    await connection.query('INSERT INTO pagos (id_cita, metodo_pago, valor, estado_pago) VALUES (?, ?, ?, ?)', [citaResult.insertId, metodoPago, precio, 'pendiente']);
    await connection.commit();
    res.status(201).json({ id: citaResult.insertId, mensaje: 'Reserva creada exitosamente' });
  } catch (error) { await connection.rollback(); res.status(500).json({ error: 'Error al crear reserva' }); }
  finally { connection.release(); }
});

reservasRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try { const { id } = req.params; const { estado } = req.body; await pool.query('UPDATE citas SET estado = ? WHERE id_cita = ?', [estado, id]); res.json({ mensaje: 'Estado actualizado' }); }
  catch (error) { res.status(500).json({ error: 'Error al actualizar estado' }); }
});

reservasRouter.patch('/:id/pago', async (req: Request, res: Response) => {
  try { const { id } = req.params; const { estadoPago } = req.body; await pool.query('UPDATE pagos SET estado_pago = ? WHERE id_cita = ?', [estadoPago, id]); res.json({ mensaje: 'Pago actualizado' }); }
  catch (error) { res.status(500).json({ error: 'Error al actualizar pago' }); }
});

reservasRouter.delete('/:id', async (req: Request, res: Response) => {
  try { const { id } = req.params; await pool.query('DELETE FROM pagos WHERE id_cita = ?', [id]); await pool.query('DELETE FROM calificaciones WHERE id_cita = ?', [id]); await pool.query('DELETE FROM citas WHERE id_cita = ?', [id]); res.json({ mensaje: 'Reserva eliminada' }); }
  catch (error) { res.status(500).json({ error: 'Error al eliminar reserva' }); }
});
