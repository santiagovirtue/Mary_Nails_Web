import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const dashboardRouter = Router();

dashboardRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const [citasHoy]: any = await pool.query("SELECT COUNT(*) as total FROM citas WHERE DATE(fecha) = CURDATE()");
    const [clientes]: any = await pool.query("SELECT COUNT(*) as total FROM usuarios WHERE rol = 'cliente'");
    const [servActivos]: any = await pool.query("SELECT COUNT(*) as total FROM servicios WHERE estado = 'activo'");
    const [servInactivos]: any = await pool.query("SELECT COUNT(*) as total FROM servicios WHERE estado = 'inactivo'");
    const [pagosPend]: any = await pool.query("SELECT COUNT(*) as total FROM pagos WHERE estado_pago = 'pendiente'");
    const [totalCal]: any = await pool.query("SELECT COUNT(*) as total, ROUND(AVG(puntuacion),1) as promedio FROM calificaciones");
    const [citasPorEstado]: any = await pool.query("SELECT estado, COUNT(*) as total FROM citas GROUP BY estado");
    const [totalCitas]: any = await pool.query("SELECT COUNT(*) as total FROM citas");

    res.json({
      citasHoy: citasHoy[0].total,
      clientes: clientes[0].total,
      serviciosActivos: servActivos[0].total,
      serviciosInactivos: servInactivos[0].total,
      pagosPendientes: pagosPend[0].total,
      totalCalificaciones: totalCal[0].total,
      promedioCalificaciones: totalCal[0].promedio || 0,
      totalCitas: totalCitas[0].total,
      citasPorEstado: citasPorEstado.reduce((acc: any, row: any) => { acc[row.estado] = row.total; return acc; }, {}),
    });
  } catch (error: any) { console.error('ERROR GET /api/dashboard/stats:', error.message); res.status(500).json({ error: 'Error al obtener estadísticas' }); }
});

dashboardRouter.get('/proximas-citas', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`SELECT c.id_cita as id, u.nombre, s.nombre as servicio, c.fecha, c.hora, c.estado FROM citas c JOIN usuarios u ON c.id_usuario=u.id_usuario JOIN servicios s ON c.id_servicio=s.id_servicio WHERE c.estado != 'cancelada' AND c.fecha >= CURDATE() ORDER BY c.fecha ASC, c.hora ASC LIMIT 5`);
    res.json(rows);
  } catch (error: any) { console.error('ERROR GET /api/dashboard/proximas-citas:', error.message); res.status(500).json({ error: 'Error' }); }
});

dashboardRouter.get('/ultimas-calificaciones', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`SELECT cal.id_calificacion as id, s.nombre as servicio, cal.comentario, cal.puntuacion, DATE_FORMAT(cal.fecha, '%Y-%m-%d') as fecha, u.nombre as cliente FROM calificaciones cal JOIN citas c ON cal.id_cita=c.id_cita JOIN servicios s ON c.id_servicio=s.id_servicio JOIN usuarios u ON c.id_usuario=u.id_usuario ORDER BY cal.fecha DESC LIMIT 5`);
    res.json(rows);
  } catch (error: any) { console.error('ERROR GET /api/dashboard/ultimas-calificaciones:', error.message); res.status(500).json({ error: 'Error' }); }
});
