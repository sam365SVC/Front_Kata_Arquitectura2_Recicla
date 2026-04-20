// Mock de planes — provisional para desarrollo.
// Estructura refleja exactamente la tabla `Plan` del modelo de base de datos.
// Al integrar el backend, reemplazar la importación en planesPagos.js
// con una llamada a: GET /api/planes  (o el endpoint que defina el equipo).

export const planesData = [
  {
    id_plan: 1,
    nombre: "Gratuito",
    precio_mes: 0,
    max_dispositivos: 1,
    max_reglas: 5,
    max_inspectores: 1,
    max_cotizaciones_mes: 10,
    meses_historial: 1,
    tipo_reportes: "Básico",
    puede_exportar: false,
    creado_en: "2024-01-01T00:00:00Z",
    actualizado_en: "2024-01-01T00:00:00Z",
    // Campos extra para UI (no están en BD, se pueden derivar o venir del backend)
    descripcion: "Empieza sin costo, sin tarjeta",
    destacado: false,
    etiqueta: null,
    caracteristicas_extra: [
      "Acceso al panel principal",
      "Soporte por correo",
      "Sin vencimiento",
    ],
  },
  {
    id_plan: 2,
    nombre: "Profesional",
    precio_mes: 29,
    max_dispositivos: 10,
    max_reglas: 100,
    max_inspectores: 5,
    max_cotizaciones_mes: 500,
    meses_historial: 12,
    tipo_reportes: "Avanzado con gráficas",
    puede_exportar: true,
    creado_en: "2024-01-01T00:00:00Z",
    actualizado_en: "2024-06-01T00:00:00Z",
    descripcion: "Todo lo que necesitas para escalar",
    destacado: true,
    etiqueta: "Más popular",
    caracteristicas_extra: [
      "Todo lo del plan Gratuito",
      "Exportación a PDF y Excel",
      "Soporte prioritario 24/7",
      "Historial de 12 meses",
    ],
  },
];

// ---------------------------------------------------------------------------
// Simulación de fetch — imita la firma que tendrá el endpoint real.
// Cuando el backend esté listo, reemplazar por:
//   const res = await fetch('/api/planes');
//   return res.json();
// ---------------------------------------------------------------------------
export async function fetchPlanes() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(planesData), 400); // simula latencia de red
  });
}
