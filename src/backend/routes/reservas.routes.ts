import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const reservasRouter = Router();

function convertirHora(horaTexto: string): string {
  if (!horaTexto) return '00:00:00';
  const primeraPartePura = horaTexto.split('-')[0].trim();
  const match = primeraPartePura.match(/(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)?/i);
  if (!match) return '00:00:00';
  let horas = parseInt(match[1], 10);
  const minutos = match[2];
  const meridiano = (match[3] || '').toLowerCase().replace(/\./g, '');
  if (meridiano === 'pm' && horas < 12) horas += 12;
  if (meridiano === 'am' && horas === 12) horas = 0;
  return String(horas).padStart(2,'0') + ':' + minutos + ':00';
}

reservasRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`SELECT c.id_cita as id, u.nombre, u.telefono, s.nombre as servicio, c.fecha, c.hora, p.metodo_pago as metodoPago, c.observacion as comentarios, c.estado, p.estado_pago as estadoPago FROM citas c JOIN usuarios u ON c.id_usuario=u.id_usuario JOIN servicios s ON c.id_servicio=s.id_servicio LEFT JOIN pagos p ON p.id_cita=c.id_cita ORDER BY c.fecha DESC`);
    res.json(rows);
  } catch (error: any) { console.error('ERROR GET /api/reservas:', error.message); res.status(500).json({ error: 'Error al obtener reservas' }); }
});

reservasRouter.get('/cliente', async (req: Request, res: Response) => {
  try {
    const { correo } = req.query;
    const [rows] = await pool.query(`SELECT c.id_cita as id, u.nombre, u.telefono, s.nombre as servicio, c.fecha, c.hora, p.metodo_pago as metodoPago, c.observacion as comentarios, c.estado, p.estado_pago as estadoPago FROM citas c JOIN usuarios u ON c.id_usuario=u.id_usuario JOIN servicios s ON c.id_servicio=s.id_servicio LEFT JOIN pagos p ON p.id_cita=c.id_cita WHERE u.correo = ? ORDER BY c.fecha DESC`, [correo]);
    res.json(rows);
  } catch (error: any) { console.error('ERROR GET /api/reservas/cliente:', error.message); res.status(500).json({ error: 'Error al obtener citas' }); }
});

reservasRouter.post('/', async (req: Request, res: Response) => {
  const { nombre, telefono, servicio, fecha, hora, metodoPago, comentarios } = req.body;
  const horaFormato = convertirHora(hora);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let [usuarios]: any = await connection.query('SELECT id_usuario FROM usuarios WHERE telefono = ?', [telefono]);
    let id_usuario: number;
    if (usuarios.length === 0) {
      const [result]: any = await connection.query('INSERT INTO usuarios (nombre, telefono, correo, password, rol) VALUES (?, ?, ?, ?, ?)', [nombre, telefono, telefono + '@marynails.com', 'sin_password', 'cliente']);
      id_usuario = result.insertId;
    } else { id_usuario = usuarios[0].id_usuario; }
    const [servicios]: any = await connection.query('SELECT id_servicio, precio FROM servicios WHERE nombre = ?', [servicio]);
    if (servicios.length === 0) { await connection.rollback(); res.status(400).json({ error: 'Servicio no encontrado' }); return; }
    const { id_servicio, precio } = servicios[0];
    const [citaResult]: any = await connection.query('INSERT INTO citas (id_usuario, id_servicio, fecha, hora, estado, observacion) VALUES (?, ?, ?, ?, ?, ?)', [id_usuario, id_servicio, fecha, horaFormato, 'pendiente', comentarios]);
    await connection.query('INSERT INTO pagos (id_cita, metodo_pago, valor, estado_pago) VALUES (?, ?, ?, ?)', [citaResult.insertId, metodoPago, precio, 'pendiente']);
    await connection.commit();
    res.status(201).json({ id: citaResult.insertId, mensaje: 'Reserva creada exitosamente' });
  } catch (error: any) { await connection.rollback(); console.error('ERROR POST /api/reservas:', error.message); res.status(500).json({ error: 'Error al crear reserva', detalle: error.message }); }
  finally { connection.release(); }
});

reservasRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try { const { id } = req.params; const { estado } = req.body; await pool.query('UPDATE citas SET estado = ? WHERE id_cita = ?', [estado, id]); res.json({ mensaje: 'Estado actualizado' }); }
  catch (error: any) { console.error('ERROR PATCH /api/reservas/estado:', error.message); res.status(500).json({ error: 'Error' }); }
});

reservasRouter.patch('/:id/pago', async (req: Request, res: Response) => {
  try { const { id } = req.params; const { estadoPago } = req.body; await pool.query('UPDATE pagos SET estado_pago = ? WHERE id_cita = ?', [estadoPago, id]); res.json({ mensaje: 'Pago actualizado' }); }
  catch (error: any) { console.error('ERROR PATCH /api/reservas/pago:', error.message); res.status(500).json({ error: 'Error' }); }
});

reservasRouter.delete('/:id', async (req: Request, res: Response) => {
  try { const { id } = req.params; await pool.query('DELETE FROM pagos WHERE id_cita = ?', [id]); await pool.query('DELETE FROM citas WHERE id_cita = ?', [id]); res.json({ mensaje: 'Eliminada' }); }
  catch (error: any) { console.error('ERROR DELETE /api/reservas:', error.message); res.status(500).json({ error: 'Error' }); }
});
