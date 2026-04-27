/**
 * Tests para CalendarioPreventivos.vue — lógica pura
 * Sin importar el .vue para evitar que vite-plugin-vuetify inyecte CSS
 * incompatibles con el entorno jsdom.
 */
import { describe, it, expect } from 'vitest';

// ─── Funciones replicadas del componente ─────────────────────────────────────
function calcularDatos(eq) {
  const fechaInicial = new Date(eq.fechaDePreventivo);
  const fechaLimite = new Date(fechaInicial);
  switch (eq.referencia?.periodicidadmantenimiento) {
    case 'Anual':      fechaLimite.setMonth(fechaLimite.getMonth() + 12); break;
    case 'Semestral':  fechaLimite.setMonth(fechaLimite.getMonth() + 6);  break;
    case 'Trimestral': fechaLimite.setMonth(fechaLimite.getMonth() + 3);  break;
  }
  const hoy = new Date();
  const diasRestantes = Math.floor((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
  let color, icon;
  if (diasRestantes > 30)      { color = '#4CAF50'; icon = 'mdi-check-circle'; }
  else if (diasRestantes >= 0) { color = '#FF7043'; icon = 'mdi-alert-circle'; }
  else                         { color = '#F44336'; icon = 'mdi-close-circle'; }
  return {
    ...eq,
    fechaVencimientoDate: fechaLimite,
    fechaVencimiento: fechaLimite.toLocaleDateString('es-CO'),
    diasRestantes,
    color,
    icon,
  };
}

function filtrarCliente(itemTitle, queryText) {
  return itemTitle.toLowerCase().includes(queryText.toLowerCase());
}

function formatearFecha(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleDateString('es-CO');
}

function equiposFiltrados(equipos, clienteFiltro) {
  if (!clienteFiltro) return equipos;
  const q = clienteFiltro.toLowerCase();
  return equipos.filter(eq => eq.cliente?.nombre?.toLowerCase().includes(q));
}

const hoy = new Date();

// =============================================================================
// calcularDatos
// =============================================================================
describe('calcularDatos', () => {
  it('clasifica como verde (>30 días) equipo con preventivo anual reciente', () => {
    const fecha = new Date(hoy);
    fecha.setMonth(fecha.getMonth() - 1); // hace 1 mes → vence en 11 meses
    const r = calcularDatos({ fechaDePreventivo: fecha.toISOString(), referencia: { periodicidadmantenimiento: 'Anual' } });
    expect(r.diasRestantes).toBeGreaterThan(30);
    expect(r.color).toBe('#4CAF50');
    expect(r.icon).toBe('mdi-check-circle');
  });

  it('clasifica como naranja (0-30 días) cuando faltan menos de 30 días', () => {
    const fecha = new Date(hoy);
    fecha.setFullYear(fecha.getFullYear() - 1); // hace exactamente 1 año
    fecha.setDate(fecha.getDate() + 20);        // avanza 20 días → vence en ~20 días
    const r = calcularDatos({ fechaDePreventivo: fecha.toISOString(), referencia: { periodicidadmantenimiento: 'Anual' } });
    expect(r.diasRestantes).toBeGreaterThanOrEqual(0);
    expect(r.diasRestantes).toBeLessThanOrEqual(30);
    expect(r.color).toBe('#FF7043');
    expect(r.icon).toBe('mdi-alert-circle');
  });

  it('clasifica como rojo (vencido) cuando ya pasó la fecha límite', () => {
    const fecha = new Date(hoy);
    fecha.setFullYear(fecha.getFullYear() - 2);
    const r = calcularDatos({ fechaDePreventivo: fecha.toISOString(), referencia: { periodicidadmantenimiento: 'Anual' } });
    expect(r.diasRestantes).toBeLessThan(0);
    expect(r.color).toBe('#F44336');
    expect(r.icon).toBe('mdi-close-circle');
  });

  it('calcula correctamente periodicidad Semestral (6 meses)', () => {
    const fecha = new Date(hoy);
    fecha.setMonth(fecha.getMonth() - 3); // hace 3 meses → vence en 3 meses
    const r = calcularDatos({ fechaDePreventivo: fecha.toISOString(), referencia: { periodicidadmantenimiento: 'Semestral' } });
    expect(r.diasRestantes).toBeGreaterThan(30);
    expect(r.color).toBe('#4CAF50');
  });

  it('calcula correctamente periodicidad Trimestral (3 meses)', () => {
    const fecha = new Date(hoy);
    fecha.setMonth(fecha.getMonth() - 3);
    fecha.setDate(fecha.getDate() + 3); // vence en ~3 días
    const r = calcularDatos({ fechaDePreventivo: fecha.toISOString(), referencia: { periodicidadmantenimiento: 'Trimestral' } });
    expect(r.diasRestantes).toBeGreaterThanOrEqual(0);
    expect(r.diasRestantes).toBeLessThanOrEqual(10);
    expect(r.color).toBe('#FF7043');
  });

  it('incluye fechaVencimiento como string legible', () => {
    const r = calcularDatos({ fechaDePreventivo: new Date().toISOString(), referencia: { periodicidadmantenimiento: 'Anual' } });
    expect(typeof r.fechaVencimiento).toBe('string');
    expect(r.fechaVencimiento.length).toBeGreaterThan(0);
  });

  it('preserva los campos originales del equipo', () => {
    const eq = { id: 99, nombre: 'Ventilador', serie: 'XYZ', fechaDePreventivo: new Date().toISOString(), referencia: { periodicidadmantenimiento: 'Anual' } };
    const r = calcularDatos(eq);
    expect(r.id).toBe(99);
    expect(r.nombre).toBe('Ventilador');
    expect(r.serie).toBe('XYZ');
  });
});

// =============================================================================
// filtrarCliente
// =============================================================================
describe('filtrarCliente', () => {
  it('coincide si el texto está al inicio del nombre', () => {
    expect(filtrarCliente('Hospital Central', 'Hos')).toBe(true);
  });

  it('coincide si el texto está en el medio del nombre', () => {
    expect(filtrarCliente('Hospital Central', 'pital')).toBe(true);
  });

  it('coincide si el texto está al final del nombre', () => {
    expect(filtrarCliente('Hospital Central', 'Central')).toBe(true);
  });

  it('es insensible a mayúsculas/minúsculas', () => {
    expect(filtrarCliente('Hospital Central', 'CENTRAL')).toBe(true);
    expect(filtrarCliente('Hospital Central', 'hospital')).toBe(true);
  });

  it('retorna false si el texto no coincide', () => {
    expect(filtrarCliente('Hospital Central', 'Clínica')).toBe(false);
  });

  it('retorna true con query vacía (muestra todos)', () => {
    expect(filtrarCliente('Hospital Central', '')).toBe(true);
  });
});

// =============================================================================
// equiposFiltrados
// =============================================================================
describe('equiposFiltrados', () => {
  const equipos = [
    { id: 1, cliente: { nombre: 'Hospital Central' } },
    { id: 2, cliente: { nombre: 'Clínica del Norte' } },
    { id: 3, cliente: { nombre: 'Hospital Universitario' } },
    { id: 4, cliente: null },
  ];

  it('retorna todos si no hay filtro (null)', () => {
    expect(equiposFiltrados(equipos, null)).toHaveLength(4);
  });

  it('retorna todos si el filtro es string vacío', () => {
    expect(equiposFiltrados(equipos, '')).toHaveLength(4);
  });

  it('filtra por coincidencia parcial en el nombre del cliente', () => {
    const r = equiposFiltrados(equipos, 'Hospital');
    expect(r).toHaveLength(2);
    expect(r.map(e => e.id)).toEqual(expect.arrayContaining([1, 3]));
  });

  it('filtra con texto en el medio del nombre', () => {
    const r = equiposFiltrados(equipos, 'del Norte');
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe(2);
  });

  it('la búsqueda es insensible a mayúsculas', () => {
    expect(equiposFiltrados(equipos, 'HOSPITAL')).toHaveLength(2);
  });

  it('retorna vacío si ningún cliente coincide', () => {
    expect(equiposFiltrados(equipos, 'Inexistente')).toHaveLength(0);
  });

  it('excluye equipos sin cliente (cliente: null) cuando hay filtro activo', () => {
    const r = equiposFiltrados(equipos, 'Hospital');
    expect(r.some(e => e.cliente === null)).toBe(false);
  });
});

// =============================================================================
// formatearFecha
// =============================================================================
describe('formatearFecha', () => {
  it('retorna "—" si el valor es null', () => {
    expect(formatearFecha(null)).toBe('—');
  });

  it('retorna "—" si el valor es undefined', () => {
    expect(formatearFecha(undefined)).toBe('—');
  });

  it('retorna una fecha formateada para una fecha ISO válida', () => {
    const r = formatearFecha('2024-06-15T00:00:00Z');
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });
});
