import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const perfilRouter = Router();

perfilRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo } = req.query;
    console.log('GET /api/perfil correo:', correo);
    const [rows]: any = await pool.query(
      'SELECT id_usuario, nombre, correo, telefono, direccion, preferencias, foto_perfil, fecha_registro FROM usuarios WHERE correo = ?',
      [correo]
    );
    console.log('Filas encontradas:', rows.length);
    if (rows.length === 0) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
    res.json(rows[0]);
  } catch (error: any) {
    console.error('ERROR en GET /api/perfil:', error.message, error);
    res.status(500).json({ error: 'Error al obtener perfil', detalle: error.message });
  }
});

perfilRouter.put('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, nombre, telefono, direccion, preferencias, foto_perfil } = req.body;
    await pool.query(
      'UPDATE usuarios SET nombre=?, telefono=?, direccion=?, preferencias=?, foto_perfil=? WHERE correo=?',
      [nombre, telefono, direccion, preferencias, foto_perfil, correo]
    );
    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error: any) {
    console.error('ERROR en PUT /api/perfil:', error.message);
    res.status(500).json({ error: 'Error al actualizar perfil', detalle: error.message });
  }
});
