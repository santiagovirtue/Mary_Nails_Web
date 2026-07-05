import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const disponibilidadRouter = Router();

function normalizarDia(fecha: Date): string {
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  return dias[fecha.getDay()];
}

disponibilidadRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM disponibilidad ORDER BY id_disponibilidad');
    const [citas]: any = await pool.query("SELECT fecha, hora, estado FROM citas WHERE estado != 'cancelada'");

    const diasConCitas = new Set<string>();
    for (const cita of citas) {
      const fecha = new Date(cita.fecha);
      const dia = normalizarDia(fecha);
      const hora = String(cita.hora).substring(0,5);
      diasConCitas.add(dia + '|' + hora);
    }

    const horarios = rows.map((row: any) => {
      const dia = row.dia;
      const horaInicio = row.hora_inicio.substring(0,5);
      const clave = dia + '|' + horaInicio;
      const ocupadoPorCita = diasConCitas.has(clave);
      const estadoFinal = (row.estado === 'ocupado' || ocupadoPorCita) ? 'Ocupado' : 'Disponible';
      return {
        id: row.id_disponibilidad,
        dia: row.dia,
        horaInicio,
        horaFinal: row.hora_fin.substring(0,5),
        estado: estadoFinal,
        observacion: ocupadoPorCita && row.estado === 'disponible' ? 'Reservado por un cliente' : row.observacion,
      };
    });
    res.json(horarios);
  } catch (error: any) { console.error('ERROR GET /api/disponibilidad:', error.message); res.status(500).json({ error: 'Error al obtener horarios' }); }
});

disponibilidadRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { dia, horaInicio, horaFinal, estado, observacion } = req.body;
    const [result]: any = await pool.query('INSERT INTO disponibilidad (dia, hora_inicio, hora_fin, estado, observacion) VALUES (?, ?, ?, ?, ?)', [dia, horaInicio, horaFinal, estado === 'Disponible' ? 'disponible' : 'ocupado', observacion]);
    res.status(201).json({ id: result.insertId });
  } catch (error: any) { console.error('ERROR POST /api/disponibilidad:', error.message); res.status(500).json({ error: 'Error al crear horario' }); }
});

disponibilidadRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dia, horaInicio, horaFinal, estado, observacion } = req.body;
    await pool.query('UPDATE disponibilidad SET dia=?, hora_inicio=?, hora_fin=?, estado=?, observacion=? WHERE id_disponibilidad=?', [dia, horaInicio, horaFinal, estado === 'Disponible' ? 'disponible' : 'ocupado', observacion, id]);
    res.json({ mensaje: 'Horario actualizado' });
  } catch (error: any) { console.error('ERROR PUT /api/disponibilidad:', error.message); res.status(500).json({ error: 'Error al actualizar horario' }); }
});

disponibilidadRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query('SELECT estado FROM disponibilidad WHERE id_disponibilidad = ?', [id]);
    const nuevoEstado = rows[0].estado === 'disponible' ? 'ocupado' : 'disponible';
    await pool.query('UPDATE disponibilidad SET estado = ? WHERE id_disponibilidad = ?', [nuevoEstado, id]);
    res.json({ estado: nuevoEstado === 'disponible' ? 'Disponible' : 'Ocupado' });
  } catch (error: any) { console.error('ERROR PATCH /api/disponibilidad:', error.message); res.status(500).json({ error: 'Error al cambiar estado' }); }
});

disponibilidadRouter.delete('/:id', async (req: Request, res: Response) => {
  try { const { id } = req.params; await pool.query('DELETE FROM disponibilidad WHERE id_disponibilidad = ?', [id]); res.json({ mensaje: 'Horario eliminado' }); }
  catch (error: any) { console.error('ERROR DELETE /api/disponibilidad:', error.message); res.status(500).json({ error: 'Error al eliminar horario' }); }
});
