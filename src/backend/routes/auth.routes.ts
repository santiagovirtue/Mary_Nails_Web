import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuario, password } = req.body;
    const [rows]: any = await pool.query(
      "SELECT id_usuario, nombre, correo, telefono, rol FROM usuarios WHERE (correo = ? OR telefono = ?) AND password = ?",
      [usuario, usuario, password]
    );
    if (rows.length === 0) { res.status(401).json({ error: 'Credenciales incorrectas' }); return; }
    res.json(rows[0]);
  } catch (error: any) { console.error('ERROR POST /api/auth/login:', error.message); res.status(500).json({ error: 'Error en el servidor' }); }
});

authRouter.post('/registro', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, correo, telefono, password } = req.body;
    const [existe]: any = await pool.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
    if (existe.length > 0) { res.status(400).json({ error: 'Ya existe una cuenta con ese correo' }); return; }
    const [result]: any = await pool.query(
      "INSERT INTO usuarios (nombre, correo, telefono, password, rol) VALUES (?, ?, ?, ?, 'cliente')",
      [nombre, correo, telefono, password]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Cuenta creada exitosamente' });
  } catch (error: any) { console.error('ERROR POST /api/auth/registro:', error.message); res.status(500).json({ error: 'Error al crear la cuenta' }); }
});
