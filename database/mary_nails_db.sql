CREATE DATABASE IF NOT EXISTS mary_nails_db;
USE mary_nails_db;

CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  rol ENUM('cliente', 'administrador') NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicios (
  id_servicio INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  duracion_minutos INT NOT NULL,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo'
);

CREATE TABLE disponibilidad (
  id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
  dia VARCHAR(20) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado ENUM('disponible', 'ocupado', 'no disponible') DEFAULT 'disponible',
  observacion TEXT
);

CREATE TABLE citas (
  id_cita INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_servicio INT NOT NULL,
  id_disponibilidad INT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
  observacion TEXT,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
  FOREIGN KEY (id_disponibilidad) REFERENCES disponibilidad(id_disponibilidad)
);

CREATE TABLE pagos (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_cita INT NOT NULL,
  metodo_pago ENUM('efectivo', 'nequi', 'daviplata', 'pago en local') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  estado_pago ENUM('pendiente', 'pagado', 'rechazado') DEFAULT 'pendiente',
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cita) REFERENCES citas(id_cita)
);

CREATE TABLE calificaciones (
  id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_cita INT NOT NULL,
  puntuacion INT CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cita) REFERENCES citas(id_cita)
);

INSERT INTO usuarios (nombre, correo, telefono, password, rol) VALUES
('Administrador Mary Nails', 'admin@marynails.com', '3001234567', 'admin123', 'administrador'),
('Laura Martínez', 'laura@email.com', '3012223344', 'cliente123', 'cliente'),
('Camila Torres', 'camila@email.com', '3023334455', 'cliente123', 'cliente');

INSERT INTO servicios (nombre, descripcion, precio, duracion_minutos) VALUES
('Manicure profesional', 'Limpieza, limado, cuidado de cutícula y esmaltado.', 25000, 45),
('Pedicure', 'Cuidado completo de pies, limpieza e hidratación.', 30000, 60),
('Uñas acrílicas', 'Extensión y diseño de uñas acrílicas.', 60000, 90),
('Diseño personalizado', 'Decoración artística según el gusto del cliente.', 15000, 60);

INSERT INTO disponibilidad (dia, hora_inicio, hora_fin, estado, observacion) VALUES
('Lunes', '09:00:00', '12:00:00', 'disponible', 'Horario de atención normal'),
('Miércoles', '14:00:00', '17:00:00', 'disponible', 'Horario de atención en la tarde'),
('Viernes', '10:00:00', '13:00:00', 'ocupado', 'Horario reservado'),
('Sábado', '08:00:00', '11:00:00', 'disponible', 'Atención de fin de semana');

INSERT INTO citas (id_usuario, id_servicio, id_disponibilidad, fecha, hora, estado, observacion) VALUES
(2, 1, 1, '2026-05-14', '09:00:00', 'confirmada', 'Cliente solicita diseño sencillo'),
(3, 3, 2, '2026-05-14', '10:30:00', 'pendiente', 'Pendiente por confirmar pago');

INSERT INTO pagos (id_cita, metodo_pago, valor, estado_pago) VALUES
(1, 'nequi', 25000, 'pagado'),
(2, 'efectivo', 60000, 'pendiente');

INSERT INTO calificaciones (id_cita, puntuacion, comentario) VALUES
(1, 5, 'Excelente servicio y atención.');