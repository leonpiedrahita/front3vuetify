/**
 * Tests para obtenerFechaVencimiento() y calcularFechaVencimiento()
 * Replicadas de ListarEquiposComponent.vue sin importar el componente
 * para evitar dependencias de Vuetify/JSDOM incompatibles.
 *
 * Casos cubiertos:
 *  - Comportamiento normal por periodicidad (Anual / Semestral / Trimestral)
 *  - Años bisiestos (Feb 29 → mes siguiente que no tiene ese día)
 *  - Desbordamiento de mes (meses de 28/30/31 días)
 *  - Equipos sin reporte previo (fechaDePreventivo nulo/vacío)
 *  - Ciclos de mantenimiento superiores a 12 meses (no soportados)
 *  - Periodicidad desconocida o referencia ausente
 */
import { describe, it, expect } from 'vitest';

// ─── Funciones replicadas de ListarEquiposComponent.vue ───────────────────────

function obtenerFechaVencimiento(item) {
  const fechaInicial = new Date(item.fechaDePreventivo);
  const fechaLimite = new Date(fechaInicial);
  switch (item.referencia?.periodicidadmantenimiento) {
    case 'Anual':
      fechaLimite.setMonth(fechaLimite.getMonth() + 12);
      break;
    case 'Semestral':
      fechaLimite.setMonth(fechaLimite.getMonth() + 6);
      break;
    case 'Trimestral':
      fechaLimite.setMonth(fechaLimite.getMonth() + 3);
      break;
  }
  return fechaLimite;
}

function calcularFechaVencimiento(item) {
  const periodicidad = item.referencia?.periodicidadmantenimiento;
  if (periodicidad === 'Libre de mantenimiento' || !item.fechaDePreventivo) return null;
  const fecha = obtenerFechaVencimiento(item);
  return fecha.toLocaleDateString('es-CO');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Crea una fecha local (mes con índice 1-based para legibilidad). */
function d(year, month, day) {
  return new Date(year, month - 1, day);
}

/** Extrae [año, mes 1-based, día] de una fecha local para comparaciones timezone-safe. */
function ymd(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
}

/** Construye el item mínimo que esperan las funciones. */
function item(fecha, periodicidad) {
  return {
    fechaDePreventivo: fecha,
    referencia: periodicidad !== undefined ? { periodicidadmantenimiento: periodicidad } : null,
  };
}

// =============================================================================
// obtenerFechaVencimiento — Periodicidad Anual (12 meses)
// =============================================================================
describe('obtenerFechaVencimiento — Anual (12 meses)', () => {
  it('mes y día sin conflicto: 15 Mar 2024 → 15 Mar 2025', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 3, 15), 'Anual'));
    expect(ymd(r)).toEqual([2025, 3, 15]);
  });

  it('primer día del año: 1 Ene 2024 → 1 Ene 2025', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 1, 1), 'Anual'));
    expect(ymd(r)).toEqual([2025, 1, 1]);
  });

  it('último día del año: 31 Dic 2024 → 31 Dic 2025', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 12, 31), 'Anual'));
    expect(ymd(r)).toEqual([2025, 12, 31]);
  });

  it('año bisiesto → año no bisiesto: 29 Feb 2024 → desborda a 1 Mar 2025', () => {
    // Feb 2025 tiene solo 28 días → el día 29 desborda a Mar 1
    const r = obtenerFechaVencimiento(item(d(2024, 2, 29), 'Anual'));
    expect(ymd(r)).toEqual([2025, 3, 1]);
  });

  it('año no bisiesto → año bisiesto: 28 Feb 2023 → 28 Feb 2024 (no desborda)', () => {
    // 2024 es bisiesto; Feb 28 existe en ambos años
    const r = obtenerFechaVencimiento(item(d(2023, 2, 28), 'Anual'));
    expect(ymd(r)).toEqual([2024, 2, 28]);
  });

  it('cruce de año: 30 Jun 2024 → 30 Jun 2025', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 6, 30), 'Anual'));
    expect(ymd(r)).toEqual([2025, 6, 30]);
  });
});

// =============================================================================
// obtenerFechaVencimiento — Periodicidad Semestral (6 meses)
// =============================================================================
describe('obtenerFechaVencimiento — Semestral (6 meses)', () => {
  it('mes con suficientes días: 15 Ene 2024 → 15 Jul 2024', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 1, 15), 'Semestral'));
    expect(ymd(r)).toEqual([2024, 7, 15]);
  });

  it('cruce de año: 15 Oct 2024 → 15 Abr 2025', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 10, 15), 'Semestral'));
    expect(ymd(r)).toEqual([2025, 4, 15]);
  });

  it('31 Mar → mes destino Sep tiene 30 días → desborda a 1 Oct 2024', () => {
    // setMonth(2+6=8) → Sep; día 31 no existe en Sep → Oct 1
    const r = obtenerFechaVencimiento(item(d(2024, 3, 31), 'Semestral'));
    expect(ymd(r)).toEqual([2024, 10, 1]);
  });

  it('31 Ago → mes destino Feb 2025 tiene 28 días → desborda a 3 Mar 2025', () => {
    // setMonth(7+6=13) → Feb 2025; día 31 - 28 días = día 3 de Mar
    const r = obtenerFechaVencimiento(item(d(2024, 8, 31), 'Semestral'));
    expect(ymd(r)).toEqual([2025, 3, 3]);
  });

  it('año bisiesto Feb 29 + 6 meses → 29 Ago 2024 (Ago tiene 31 días, sin desborde)', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 2, 29), 'Semestral'));
    expect(ymd(r)).toEqual([2024, 8, 29]);
  });

  it('30 Nov → mes destino May tiene 31 días → 30 May 2025 (sin desborde)', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 11, 30), 'Semestral'));
    expect(ymd(r)).toEqual([2025, 5, 30]);
  });
});

// =============================================================================
// obtenerFechaVencimiento — Periodicidad Trimestral (3 meses)
// =============================================================================
describe('obtenerFechaVencimiento — Trimestral (3 meses)', () => {
  it('mes con suficientes días: 15 Ene 2024 → 15 Abr 2024', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 1, 15), 'Trimestral'));
    expect(ymd(r)).toEqual([2024, 4, 15]);
  });

  it('31 Mar → mes destino Jun tiene 30 días → desborda a 1 Jul 2024', () => {
    // setMonth(2+3=5) → Jun; día 31 - 30 = día 1 de Jul
    const r = obtenerFechaVencimiento(item(d(2024, 3, 31), 'Trimestral'));
    expect(ymd(r)).toEqual([2024, 7, 1]);
  });

  it('31 Ene → mes destino Abr tiene 30 días → desborda a 1 May 2024', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 1, 31), 'Trimestral'));
    expect(ymd(r)).toEqual([2024, 5, 1]);
  });

  it('31 Oct → mes destino Ene tiene 31 días → 31 Ene 2025 (sin desborde)', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 10, 31), 'Trimestral'));
    expect(ymd(r)).toEqual([2025, 1, 31]);
  });

  it('30 Nov → mes destino Feb 2025 tiene 28 días → desborda a 2 Mar 2025', () => {
    // setMonth(10+3=13) → Feb 2025; día 30 - 28 = día 2 de Mar
    const r = obtenerFechaVencimiento(item(d(2024, 11, 30), 'Trimestral'));
    expect(ymd(r)).toEqual([2025, 3, 2]);
  });

  it('30 Sep → mes destino Dic tiene 31 días → 30 Dic 2024 (sin desborde)', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 9, 30), 'Trimestral'));
    expect(ymd(r)).toEqual([2024, 12, 30]);
  });

  it('cruce de año: 15 Oct 2024 → 15 Ene 2025', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 10, 15), 'Trimestral'));
    expect(ymd(r)).toEqual([2025, 1, 15]);
  });
});

// =============================================================================
// calcularFechaVencimiento — Equipos sin reporte previo
// =============================================================================
describe('calcularFechaVencimiento — sin fechaDePreventivo', () => {
  it('retorna null si fechaDePreventivo es null', () => {
    expect(calcularFechaVencimiento(item(null, 'Anual'))).toBeNull();
  });

  it('retorna null si fechaDePreventivo es undefined', () => {
    expect(calcularFechaVencimiento(item(undefined, 'Anual'))).toBeNull();
  });

  it('retorna null si fechaDePreventivo es string vacío', () => {
    expect(calcularFechaVencimiento(item('', 'Anual'))).toBeNull();
  });

  it('retorna null si fechaDePreventivo es 0 (falsy)', () => {
    expect(calcularFechaVencimiento(item(0, 'Anual'))).toBeNull();
  });

  it('retorna null para "Libre de mantenimiento" aunque haya fecha registrada', () => {
    expect(calcularFechaVencimiento(item(d(2024, 1, 15), 'Libre de mantenimiento'))).toBeNull();
  });
});

// =============================================================================
// obtenerFechaVencimiento — Ciclos superiores a 12 meses (no soportados)
// =============================================================================
describe('obtenerFechaVencimiento — periodicidad > 12 meses (no implementada)', () => {
  it('"Bienal" no tiene case: devuelve la misma fecha que el último preventivo', () => {
    const fecha = d(2024, 3, 15);
    const r = obtenerFechaVencimiento(item(fecha, 'Bienal'));
    expect(ymd(r)).toEqual([2024, 3, 15]);
  });

  it('"Cada 2 años" no tiene case: devuelve la misma fecha que el último preventivo', () => {
    const fecha = d(2024, 6, 1);
    const r = obtenerFechaVencimiento(item(fecha, 'Cada 2 años'));
    expect(ymd(r)).toEqual([2024, 6, 1]);
  });

  it('"Libre de mantenimiento" en obtenerFechaVencimiento: devuelve la fecha original sin sumar meses', () => {
    // calcularFechaVencimiento intercepta este caso antes de llegar aquí;
    // pero si se llama directamente, el switch no tiene ese case → devuelve fechaInicial
    const fecha = d(2024, 5, 20);
    const r = obtenerFechaVencimiento(item(fecha, 'Libre de mantenimiento'));
    expect(ymd(r)).toEqual([2024, 5, 20]);
  });
});

// =============================================================================
// obtenerFechaVencimiento — Referencia nula o periodicidad ausente
// =============================================================================
describe('obtenerFechaVencimiento — referencia/periodicidad ausente', () => {
  it('referencia null: devuelve la misma fecha que el último preventivo', () => {
    const r = obtenerFechaVencimiento({ fechaDePreventivo: d(2024, 4, 10), referencia: null });
    expect(ymd(r)).toEqual([2024, 4, 10]);
  });

  it('referencia undefined: devuelve la misma fecha que el último preventivo', () => {
    const r = obtenerFechaVencimiento({ fechaDePreventivo: d(2024, 4, 10), referencia: undefined });
    expect(ymd(r)).toEqual([2024, 4, 10]);
  });

  it('referencia sin campo periodicidadmantenimiento: devuelve la misma fecha', () => {
    const r = obtenerFechaVencimiento({ fechaDePreventivo: d(2024, 4, 10), referencia: {} });
    expect(ymd(r)).toEqual([2024, 4, 10]);
  });

  it('devuelve un objeto Date (no null ni string)', () => {
    const r = obtenerFechaVencimiento(item(d(2024, 1, 1), 'Anual'));
    expect(r).toBeInstanceOf(Date);
  });

  it('no muta la fecha original del item', () => {
    const original = d(2024, 3, 15);
    const snap = original.getTime();
    obtenerFechaVencimiento(item(original, 'Anual'));
    expect(original.getTime()).toBe(snap);
  });
});
