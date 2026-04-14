export const usuariosEmpresaMock = [
  {
    id: "USR-1001",
    nombre: "Carlos Mendoza",
    email: "admin@recicla.com",
    telefono: "+591 70123456",
    cargo: "Administrador general",
    rol: "Administrador",
    area: "Administración",
    estado: "Activo",
    password: "Admin123*",
    createdAt: "2026-04-07T10:00:00.000Z",
  },
  {
    id: "USR-1002",
    nombre: "Ana López",
    email: "ana.lopez@recicla.com",
    telefono: "+591 72001122",
    cargo: "Supervisora de recepción",
    rol: "Supervisor",
    area: "Recepción",
    estado: "Activo",
    password: "Supervisor123*",
    createdAt: "2026-04-06T09:20:00.000Z",
  },
  {
    id: "USR-1003",
    nombre: "Jorge Vargas",
    email: "jorge.vargas@recicla.com",
    telefono: "+591 74567890",
    cargo: "Inspector técnico",
    rol: "Inspector",
    area: "Inspección técnica",
    estado: "Activo",
    password: "Inspector123*",
    createdAt: "2026-04-05T15:40:00.000Z",
  },
  {
    id: "USR-1004",
    nombre: "María Nina",
    email: "maria.nina@recicla.com",
    telefono: "+591 73445566",
    cargo: "Operadora de recepción",
    rol: "Operador",
    area: "Operaciones",
    estado: "Inactivo",
    password: "Operador123*",
    createdAt: "2026-04-03T11:15:00.000Z",
  },
];

export const tiposDispositivoMock = [
  {
    id: 1,
    nombre: "Celulares",
    descripcion:
      "Dispositivos móviles que podrán ser evaluados para recepción y cotización inicial.",
    activo: true,
    condiciones: ["Bueno", "Regular", "Defectuoso"],
  },
  {
    id: 2,
    nombre: "Laptops",
    descripcion:
      "Equipos portátiles con revisión de estado físico, batería, pantalla y funcionamiento general.",
    activo: true,
    condiciones: ["Operativo", "Con detalles", "No operativo"],
  },
  {
    id: 3,
    nombre: "Tablets",
    descripcion:
      "Tablets de distintas marcas que podrán ser habilitadas o deshabilitadas según la empresa.",
    activo: false,
    condiciones: ["Buen estado", "Pantalla dañada", "Sin encender"],
  },
];