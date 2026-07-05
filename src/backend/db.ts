import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });
export const pool = mysql.createPool({
  host: process.env['DB_HOST'],
  port: Number(process.env['DB_PORT']),
  user: process.env['DB_USER'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_NAME'],
  waitForConnections: true,
  connectionLimit: 10,
});
export async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL Railway exitosa - DB:', process.env['DB_NAME']);
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando:', error);
  }
}
