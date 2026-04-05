/**
 * Tests for src/directives/permissions.js
 *
 * The directive's `mounted` hook receives:
 *   el      — the DOM element being bound
 *   binding — { value: string[], instance: { $store: { state: { user: { rol } } } } }
 *
 * When the user's role is NOT in binding.value:
 *   - el.disabled is set to true
 *   - the class "disabled" is added to el.classList
 *
 * When the user's role IS in binding.value the element is left untouched.
 *
 * No Vue mounting needed — the directive is just a plain object with a
 * `mounted` function, so we call it directly with plain JS objects.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import permissionDirective from '../directives/permissions.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a minimal fake DOM element that only tracks disabled and classList.
 */
function makeEl() {
  const classes = new Set();
  return {
    disabled: false,
    classList: {
      add: (cls) => classes.add(cls),
      remove: (cls) => classes.delete(cls),
      contains: (cls) => classes.has(cls),
      // Expose the underlying Set so tests can inspect it easily.
      _classes: classes,
    },
  };
}

/**
 * Build a minimal binding object that mimics what Vue passes to directives.
 * @param {string}   userRole     — The current user's role from the store.
 * @param {string[]} allowedRoles — The value passed to v-permission="[...]".
 */
function makeBinding(userRole, allowedRoles) {
  return {
    value: allowedRoles,
    instance: {
      $store: {
        state: {
          user: { rol: userRole },
        },
      },
    },
  };
}

// =============================================================================
// Tests
// =============================================================================

describe('v-permission directive', () => {
  let el;

  beforeEach(() => {
    el = makeEl();
  });

  it('does NOT disable the element when the user role IS in the allowed list', () => {
    const binding = makeBinding('administrador', ['administrador', 'soporte']);

    permissionDirective.mounted(el, binding);

    expect(el.disabled).toBe(false);
    expect(el.classList.contains('disabled')).toBe(false);
  });

  it('disables the element and adds class "disabled" when role is NOT in the allowed list', () => {
    const binding = makeBinding('comercial', ['administrador', 'soporte']);

    permissionDirective.mounted(el, binding);

    expect(el.disabled).toBe(true);
    expect(el.classList.contains('disabled')).toBe(true);
  });

  it('stays enabled when the user has one of multiple allowed roles', () => {
    const binding = makeBinding('calidad', ['cotizaciones', 'calidad', 'bodega']);

    permissionDirective.mounted(el, binding);

    expect(el.disabled).toBe(false);
    expect(el.classList.contains('disabled')).toBe(false);
  });

  it('disables the element when the allowed roles array is empty', () => {
    // An empty array means no role is permitted — everyone should be blocked.
    const binding = makeBinding('administrador', []);

    permissionDirective.mounted(el, binding);

    expect(el.disabled).toBe(true);
    expect(el.classList.contains('disabled')).toBe(true);
  });

  it('is case-sensitive — a mis-cased role does not grant access', () => {
    // 'Administrador' (capital A) is not the same as 'administrador'
    const binding = makeBinding('Administrador', ['administrador']);

    permissionDirective.mounted(el, binding);

    expect(el.disabled).toBe(true);
  });

  it('does not modify el.disabled when the role matches (original false stays false)', () => {
    const binding = makeBinding('bodega', ['bodega']);

    permissionDirective.mounted(el, binding);

    expect(el.disabled).toBe(false);
  });
});
