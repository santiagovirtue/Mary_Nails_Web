import { Router, Request, Response } from 'express';
import { pool } from '../db';
export const reportesRouter = Router();

reportesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    let filtroFecha = '';
    const params: any[] = [];
    if (fechaInicio) { filtroFecha += ' AND c.fecha >= ?'; params.push(fechaInicio); }
    if (fechaFin) { filtroFecha += ' AND c.fecha <= ?'; params.push(fechaFin); }

    const [citas]: any = await pool.query(`SELECT c.id_cita, u.nombre, u.telefono, s.nombre as servicio, c.fecha, c.hora, c.estado, p.metodo_pago as metodoPago, p.estado_pago as estadoPago, p.valor FROM citas c JOIN usuarios u ON c.id_usuario=u.id_usuario JOIN servicios s ON c.id_servicio=s.id_servicio LEFT JOIN pagos p ON p.id_cita=c.id_cita WHERE 1=1${filtroFecha} ORDER BY c.fecha DESC`, params);

    let filtroFechaCal = '';
    const paramsCal: any[] = [];
    if (fechaInicio) { filtroFechaCal += ' AND cal.fecha >= ?'; paramsCal.push(fechaInicio); }
    if (fechaFin) { filtroFechaCal += ' AND cal.fecha <= ?'; paramsCal.push(fechaFin); }
    const [calificaciones]: any = await pool.query(`SELECT cal.puntuacion FROM calificaciones cal WHERE 1=1${filtroFechaCal}`, paramsCal);

    const [servActivos]: any = await pool.query("SELECT COUNT(*) as total FROM servicios WHERE estado='activo'");
    const [servInactivos]: any = await pool.query("SELECT COUNT(*) as total FROM servicios WHERE estado='inactivo'");

    const totalReservas = citas.length;
    const clientesUnicos = new Set(citas.map((c: any) => c.telefono).filter((t: any) => t)).size;
    const pendientes = citas.filter((c: any) => c.estado === 'pendiente').length;
    const confirmadas = citas.filter((c: any) => c.estado === 'confirmada').length;
    const completadas = citas.filter((c: any) => c.estado === 'completada').length;
    const canceladas = citas.filter((c: any) => c.estado === 'cancelada').length;
    const pagosPendientes = citas.filter((c: any) => c.estadoPago !== 'pagado').length;
    const pagosRealizados = citas.filter((c: any) => c.estadoPago === 'pagado').length;
    const totalFacturado = citas.reduce((s: number, c: any) => s + Number(c.valor || 0), 0);
    const totalCobrado = citas.filter((c: any) => c.estadoPago === 'pagado').reduce((s: number, c: any) => s + Number(c.valor || 0), 0);

    const contServicios: Record<string, number> = {};
    citas.forEach((c: any) => { contServicios[c.servicio] = (contServicios[c.servicio] || 0) + 1; });
    const serviciosMasReservados = Object.entries(contServicios).map(([servicio, total]) => ({ servicio, total })).sort((a, b) => b.total - a.total).slice(0, 5);

    const contMetodos: Record<string, number> = {};
    citas.forEach((c: any) => { if (c.metodoPago) contMetodos[c.metodoPago] = (contMetodos[c.metodoPago] || 0) + 1; });
    const metodosPago = Object.entries(contMetodos).map(([metodo, total]) => ({ metodo, total }));

    const totalCal = calificaciones.length;
    const promedioCal = totalCal > 0 ? (calificaciones.reduce((s: number, c: any) => s + c.puntuacion, 0) / totalCal).toFixed(1) : '0.0';

    res.json({
      totalReservas, clientesUnicos, pendientes, confirmadas, completadas, canceladas,
      pagosPendientes, pagosRealizados, totalFacturado, totalCobrado,
      serviciosActivos: servActivos[0].total, serviciosInactivos: servInactivos[0].total,
      totalCalificaciones: totalCal, promedioCalificaciones: promedioCal,
      serviciosMasReservados, metodosPago,
    });
  } catch (error: any) { console.error('ERROR GET /api/reportes:', error.message); res.status(500).json({ error: 'Error al generar reporte' }); }
});
