import { describe, it, expect } from 'vitest';
import { traducirEtiqueta, MAPA_ETIQUETAS, ROLES_ETIQUETAS_ALTERNATIVAS } from '../utils/etiquetas';

describe('traducirEtiqueta', () => {
  it('traduce "Soporte aplicaciones" a "Soporte ingeniería" cuando está activo', () => {
    expect(traducirEtiqueta('Soporte aplicaciones', true)).toBe('Soporte ingeniería');
  });

  it('traduce "Bodega Prado" a "Bodega Cliente" cuando está activo', () => {
    expect(traducirEtiqueta('Bodega Prado', true)).toBe('Bodega Cliente');
  });

  it('devuelve el texto original si la traducción está desactivada', () => {
    expect(traducirEtiqueta('Soporte aplicaciones', false)).toBe('Soporte aplicaciones');
    expect(traducirEtiqueta('Bodega Prado', false)).toBe('Bodega Prado');
  });

  it('devuelve el texto sin cambios si no tiene equivalente en el mapa', () => {
    expect(traducirEtiqueta('Cuarentena', true)).toBe('Cuarentena');
    expect(traducirEtiqueta('Cliente', true)).toBe('Cliente');
  });

  it('maneja null/undefined sin lanzar error', () => {
    expect(traducirEtiqueta(null, true)).toBe(null);
    expect(traducirEtiqueta(undefined, true)).toBe(undefined);
  });

  it('no traduce cuando activo es falso aunque el texto exista en el mapa', () => {
    for (const original of Object.keys(MAPA_ETIQUETAS)) {
      expect(traducirEtiqueta(original, false)).toBe(original);
    }
  });

  it('los roles con vista simplificada son calidad y Dir. Comercial', () => {
    expect(ROLES_ETIQUETAS_ALTERNATIVAS).toEqual(['calidad', 'Dir. Comercial']);
  });
});
