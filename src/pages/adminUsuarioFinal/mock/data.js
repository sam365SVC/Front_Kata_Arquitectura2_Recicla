export const TIPOS_DISPOSITIVO = [
  { _id: "tdv001", nombre: "Laptop",      icono: "laptop"     },
  { _id: "tdv002", nombre: "Smartphone",  icono: "smartphone" },
  { _id: "tdv003", nombre: "Tablet",      icono: "tablet"     },
  { _id: "tdv004", nombre: "Desktop PC",  icono: "desktop"    },
  { _id: "tdv005", nombre: "Smartwatch",  icono: "watch"      },
];


export const ESTADOS_SOLICITUD = {
  creada: {
    label:       "Creada",
    descripcion: "Tu solicitud fue registrada.",
    detalle:     "Estamos revisando tu información inicial.",
    variant:     "neutral",
    paso:        1,
  },
  preliminar_generada: {
    label:       "Oferta preliminar",
    descripcion: "¡Tienes una oferta inicial!",
    detalle:     "Revisa el monto estimado y acepta o rechaza para continuar.",
    variant:     "info",
    paso:        2,
  },
  preliminar_aceptada: {
    label:       "Oferta aceptada",
    descripcion: "Aceptaste la oferta preliminar.",
    detalle:     "Coordinaremos la inspección física del equipo.",
    variant:     "pending",
    paso:        3,
  },
  pendiente_inspeccion: {
    label:       "Pend. inspección",
    descripcion: "Esperando agendar la revisión física.",
    detalle:     "Un técnico se comunicará contigo para la inspección.",
    variant:     "pending",
    paso:        3,
  },
  en_inspeccion: {
    label:       "En inspección",
    descripcion: "Tu equipo está siendo revisado.",
    detalle:     "Nuestros técnicos están evaluando el estado real del dispositivo.",
    variant:     "active",
    paso:        4,
  },
  ajustada: {
    label:       "Oferta ajustada",
    descripcion: "La oferta fue actualizada.",
    detalle:     "Revisa el nuevo monto y decide si aceptas.",
    variant:     "warning",
    paso:        4,
  },
  aprobada: {
    label:       "Aprobada",
    descripcion: "¡Tu cotización fue aprobada!",
    detalle:     "Pronto recibirás instrucciones de pago.",
    variant:     "success",
    paso:        5,
  },
  rechazada: {
    label:       "No viable",
    descripcion: "No pudimos hacer una oferta.",
    detalle:     "El equipo no cumple criterios actuales de valoración.",
    variant:     "danger",
    paso:        5,
  },
  pagada: {
    label:       "Pagada",
    descripcion: "¡El pago fue realizado!",
    detalle:     "Transferimos el dinero a tu cuenta.",
    variant:     "success",
    paso:        6,
  },
  finalizada: {
    label:       "Finalizada",
    descripcion: "Proceso completado.",
    detalle:     "Gracias por confiar en nosotros.",
    variant:     "done",
    paso:        6,
  },
};

export const ESTADOS_COTIZACION = {
  preliminar_generada: {
    label:   "Oferta pendiente",
    variant: "info",
    detalle: "Tienes una oferta lista para revisar y decidir.",
  },
  preliminar_aceptada: {
    label:   "Aceptada",
    variant: "success",
    detalle: "Aceptaste la oferta preliminar.",
  },
  en_inspeccion: {
    label:   "En inspección",
    variant: "active",
    detalle: "Equipo en revisión técnica.",
  },
  final_generada: {
    label:   "Oferta final",
    variant: "warning",
    detalle: "Oferta final disponible para aceptar.",
  },
  final_aceptada: {
    label:   "Final aceptada",
    variant: "success",
    detalle: "Aceptaste la oferta final.",
  },
  rechazada: {
    label:   "Rechazada",
    variant: "danger",
    detalle: "La cotización fue rechazada.",
  },
};

export const CONDICIONES = {
  excelente: { label: "Excelente", color: "#1A7A56" },
  bueno:     { label: "Bueno",     color: "#79864B" },
  regular:   { label: "Regular",   color: "#C45E00" },
  malo:      { label: "Malo",      color: "#B82020" },
};

export const MOCK_COTIZACIONES = {
  "SOL-2024-0001": {
    _id:                    "cot001",
    tenantId:               1,
    solicitudCotizacionId:  "SOL-2024-0001",
    tipoDispositivoId:      "tdv001",
    montoInicial:           4500,
    montoFinal:             null,
    moneda:                 "BOB",
    reglasAplicadas: [
      { regla: "base_laptop",    valor: 5000, descripcion: "Valor base para laptops" },
      { regla: "antiguedad_2",   valor: -300, descripcion: "Descuento por 2 años de uso" },
      { regla: "cond_bueno",     valor:  100, descripcion: "Sin penalización — buen estado" },
      { regla: "marca_premium",  valor: -300, descripcion: "Ajuste por modelo específico" },
    ],
    motivoAjuste:              "",
    clienteAceptoPreliminar:   false,
    fechaAceptacionPreliminar: null,
    clienteAceptoFinal:        false,
    fechaAceptacionFinal:      null,
    estado:                    "preliminar_generada",
    historial:                 [],
    createdAt:                 new Date("2024-11-08T10:00:00"),
    updatedAt:                 new Date("2024-11-09T14:30:00"),
  },
  "SOL-2024-0004": {
    _id:                    "cot004",
    tenantId:               1,
    solicitudCotizacionId:  "SOL-2024-0004",
    tipoDispositivoId:      "tdv002",
    montoInicial:           980,
    montoFinal:             null,
    moneda:                 "BOB",
    reglasAplicadas: [
      { regla: "base_smartphone", valor: 1200, descripcion: "Valor base para smartphones" },
      { regla: "antiguedad_2",    valor: -150, descripcion: "Descuento por 2 años de uso" },
      { regla: "cond_bueno",      valor: -70,  descripcion: "Ajuste leve por condición" },
    ],
    motivoAjuste:              "",
    clienteAceptoPreliminar:   false,
    fechaAceptacionPreliminar: null,
    clienteAceptoFinal:        false,
    fechaAceptacionFinal:      null,
    estado:                    "preliminar_generada",
    historial:                 [],
    createdAt:                 new Date("2024-11-13T18:00:00"),
    updatedAt:                 new Date("2024-11-13T20:00:00"),
  },
};

export const MOCK_SOLICITUDES = [
  {
    _id:              "SOL-2024-0001",
    tenantId:         1,
    tipoDispositivoId: TIPOS_DISPOSITIVO[0],
    cliente: {
      nombre:   "María García López",
      email:    "maria.garcia@email.com",
      telefono: "+591 70123456",
    },
    canal: "web",
    datosEquipo: {
      marca:             "Apple",
      modelo:            "MacBook Pro 14\"",
      antiguedad:        2,
      condicionDeclarada: "bueno",
      descripcion:       "Funciona perfectamente, batería al 89%. Incluye cargador original.",
      fotos:             [],
    },
    montoInicial:              null,
    moneda:                    "BOB",
    reglasAplicadas:           [],
    clienteAceptoPreliminar:   false,
    fechaAceptacionPreliminar: null,
    estado:                    "preliminar_generada",
    historial:                 [],
    createdAt:                 new Date("2024-11-08T10:00:00"),
    updatedAt:                 new Date("2024-11-09T14:30:00"),
    cotizacion:                MOCK_COTIZACIONES["SOL-2024-0001"],
  },
  {
    _id:              "SOL-2024-0002",
    tenantId:         1,
    tipoDispositivoId: TIPOS_DISPOSITIVO[1],
    cliente: {
      nombre:   "María García López",
      email:    "maria.garcia@email.com",
      telefono: "+591 70123456",
    },
    canal: "app",
    datosEquipo: {
      marca:             "Samsung",
      modelo:            "Galaxy S23 Ultra",
      antiguedad:        1,
      condicionDeclarada: "excelente",
      descripcion:       "Como nuevo, sin rayones. Caja original incluida.",
      fotos:             [],
    },
    montoInicial:              3200,
    moneda:                    "BOB",
    reglasAplicadas:           [
      { codigo: "R001", descripcion: "Ajuste por antigüedad", ajusteMonto: -100 },
      { codigo: "R003", descripcion: "Premium condición excelente", ajusteMonto: 400 },
    ],
    clienteAceptoPreliminar:   true,
    fechaAceptacionPreliminar: new Date("2024-11-12T11:00:00"),
    estado:                    "aprobada",
    historial:                 [],
    createdAt:                 new Date("2024-11-11T16:20:00"),
    updatedAt:                 new Date("2024-11-13T08:00:00"),
    cotizacion:                null,
  },
  {
    _id:              "SOL-2024-0003",
    tenantId:         1,
    tipoDispositivoId: TIPOS_DISPOSITIVO[0],
    cliente: {
      nombre:   "María García López",
      email:    "maria.garcia@email.com",
      telefono: "+591 70123456",
    },
    canal: "web",
    datosEquipo: {
      marca:             "Lenovo",
      modelo:            "ThinkPad X1 Carbon",
      antiguedad:        4,
      condicionDeclarada: "regular",
      descripcion:       "Pantalla con pequeña marca, funciona bien.",
      fotos:             [],
    },
    montoInicial:              null,
    moneda:                    "BOB",
    reglasAplicadas:           [],
    clienteAceptoPreliminar:   false,
    fechaAceptacionPreliminar: null,
    estado:                    "creada",
    historial:                 [],
    createdAt:                 new Date("2024-11-14T09:45:00"),
    updatedAt:                 new Date("2024-11-14T09:45:00"),
    cotizacion:                null,
  },
  {
    _id:              "SOL-2024-0004",
    tenantId:         1,
    tipoDispositivoId: TIPOS_DISPOSITIVO[1],
    cliente: {
      nombre:   "María García López",
      email:    "maria.garcia@email.com",
      telefono: "+591 70123456",
    },
    canal: "web",
    datosEquipo: {
      marca:             "Xiaomi",
      modelo:            "Redmi Note 12 Pro",
      antiguedad:        2,
      condicionDeclarada: "bueno",
      descripcion:       "Buen estado general. Batería nueva hace 3 meses.",
      fotos:             [],
    },
    montoInicial:              null,
    moneda:                    "BOB",
    reglasAplicadas:           [],
    clienteAceptoPreliminar:   false,
    fechaAceptacionPreliminar: null,
    estado:                    "preliminar_generada",
    historial:                 [],
    createdAt:                 new Date("2024-11-13T14:00:00"),
    updatedAt:                 new Date("2024-11-13T18:30:00"),
    cotizacion:                MOCK_COTIZACIONES["SOL-2024-0004"],
  },
  {
    _id:              "SOL-2024-0005",
    tenantId:         1,
    tipoDispositivoId: TIPOS_DISPOSITIVO[3],
    cliente: {
      nombre:   "María García López",
      email:    "maria.garcia@email.com",
      telefono: "+591 70123456",
    },
    canal: "web",
    datosEquipo: {
      marca:             "HP",
      modelo:            "Pavilion Gaming 15",
      antiguedad:        3,
      condicionDeclarada: "malo",
      descripcion:       "Pantalla rota, funciona con monitor externo.",
      fotos:             [],
    },
    montoInicial:              700,
    moneda:                    "BOB",
    reglasAplicadas:           [
      { codigo: "R001", descripcion: "Ajuste por antigüedad", ajusteMonto: -400 },
      { codigo: "R004", descripcion: "Penalización por daño físico", ajusteMonto: -600 },
    ],
    clienteAceptoPreliminar:   false,
    fechaAceptacionPreliminar: null,
    estado:                    "rechazada",
    historial:                 [],
    createdAt:                 new Date("2024-11-05T11:00:00"),
    updatedAt:                 new Date("2024-11-07T16:00:00"),
    cotizacion:                null,
  },
];

export const CLIENTE_ACTUAL = {
  nombre:   "María García López",
  email:    "maria.garcia@email.com",
  telefono: "+591 70123456",
};

export const MONTO_BASE = {
  tdv001: 5000,
  tdv002: 2500,
  tdv003: 1800,
  tdv004: 3000,
  tdv005: 1200,
};

export const AJUSTE_CONDICION = {
  excelente:  400,
  bueno:       80,
  regular:   -350,
  malo:      -800,
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// API simulada 
export const solicitudesApi = {
  getAll: async () => {
    await delay(550);
    return { ok: true, data: [...MOCK_SOLICITUDES] };
  },

  create: async (payload) => {
    await delay(1100);
    const nueva = {
      ...payload,
      _id:                      `SOL-2024-${String(MOCK_SOLICITUDES.length + 1).padStart(4, "0")}`,
      estado:                   "creada",
      montoInicial:             null,
      reglasAplicadas:          [],
      clienteAceptoPreliminar:  false,
      fechaAceptacionPreliminar: null,
      historial:                [],
      cotizacion:               null,
      createdAt:                new Date(),
      updatedAt:                new Date(),
    };
    MOCK_SOLICITUDES.unshift(nueva);
    return { ok: true, data: nueva };
  },
};

export const cotizacionesApi = {
  aceptar: async (solicitudId) => {
    await delay(700);
    const sol = MOCK_SOLICITUDES.find((s) => s._id === solicitudId);
    if (sol && sol.cotizacion) {
      sol.cotizacion.clienteAceptoPreliminar   = true;
      sol.cotizacion.fechaAceptacionPreliminar = new Date();
      sol.cotizacion.estado                    = "preliminar_aceptada";
      sol.estado                               = "preliminar_aceptada";
      sol.updatedAt                            = new Date();
    }
    return { ok: true };
  },

  rechazar: async (solicitudId) => {
    await delay(700);
    const sol = MOCK_SOLICITUDES.find((s) => s._id === solicitudId);
    if (sol && sol.cotizacion) {
      sol.cotizacion.estado = "rechazada";
      sol.estado            = "rechazada";
      sol.updatedAt         = new Date();
    }
    return { ok: true };
  },
};