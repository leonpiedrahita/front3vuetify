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
 * Build a minimal fake DOM element that tracks disabled, classList,
 * inline style and attributes (aria-disabled).
 */
function makeEl() {
  const classes = new Set();
  const attributes = {};
  return {
    disabled: false,
    style: {},
    setAttribute: (name, value) => { attributes[name] = value; },
    getAttribute: (name) => (name in attributes ? attributes[name] : null),
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
 * @param {object}   [modifiers]  — Directive modifiers (e.g. { hide: true }).
 *                                  Omitted by default to also exercise the
 *                                  `binding.modifiers === undefined` path.
 */
function makeBinding(userRole, allowedRoles, modifiers) {
  return {
    value: allowedRoles,
    modifiers,
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

// =============================================================================
// Edge cases — accessibility attributes and pointer events
// =============================================================================

describe('v-permission directive — atributos de deshabilitado', () => {
  let el;

  beforeEach(() => {
    el = makeEl();
  });

  it('sets aria-disabled="true" and pointerEvents "none" when role is NOT allowed', () => {
    const binding = makeBinding('comercial', ['administrador']);

    permissionDirective.mounted(el, binding);

    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.style.pointerEvents).toBe('none');
  });

  it('does NOT set aria-disabled nor pointerEvents when role IS allowed', () => {
    const binding = makeBinding('administrador', ['administrador']);

    permissionDirective.mounted(el, binding);

    expect(el.getAttribute('aria-disabled')).toBeNull();
    expect(el.style.pointerEvents).toBeUndefined();
  });
});

// =============================================================================
// Edge cases — .hide modifier
// =============================================================================

describe('v-permission directive — modificador .hide', () => {
  let el;

  beforeEach(() => {
    el = makeEl();
  });

  it('hides the element (display: none) when role is NOT allowed', () => {
    const binding = makeBinding('comercial', ['administrador'], { hide: true });

    permissionDirective.mounted(el, binding);

    expect(el.style.display).toBe('none');
    // Hide mode should NOT also disable the element
    expect(el.disabled).toBe(false);
    expect(el.classList.contains('disabled')).toBe(false);
  });

  it('does NOT hide the element when role IS allowed', () => {
    const binding = makeBinding('administrador', ['administrador'], { hide: true });

    permissionDirective.mounted(el, binding);

    expect(el.style.display).toBeUndefined();
    expect(el.disabled).toBe(false);
  });

  it('falls back to disabling when modifiers is undefined (default {})', () => {
    // makeBinding without third argument leaves binding.modifiers undefined
    const binding = makeBinding('comercial', ['administrador']);

    expect(() => permissionDirective.mounted(el, binding)).not.toThrow();
    expect(el.disabled).toBe(true);
    expect(el.classList.contains('disabled')).toBe(true);
  });
});

// =============================================================================
// Edge cases — user / store nulos o malformados
// =============================================================================

describe('v-permission directive — store o usuario ausentes', () => {
  let el;

  beforeEach(() => {
    el = makeEl();
  });

  it('does not throw and disables the element when user is null', () => {
    const binding = {
      value: ['administrador'],
      instance: { $store: { state: { user: null } } },
    };

    expect(() => permissionDirective.mounted(el, binding)).not.toThrow();
    expect(el.disabled).toBe(true);
    expect(el.classList.contains('disabled')).toBe(true);
  });

  it('does not throw and disables the element when user is undefined', () => {
    const binding = {
      value: ['administrador'],
      instance: { $store: { state: {} } },
    };

    expect(() => permissionDirective.mounted(el, binding)).not.toThrow();
    expect(el.disabled).toBe(true);
  });

  it('does not throw and disables the element when $store is missing', () => {
    const binding = { value: ['administrador'], instance: {} };

    expect(() => permissionDirective.mounted(el, binding)).not.toThrow();
    expect(el.disabled).toBe(true);
  });

  it('does not throw and disables the element when instance is null', () => {
    const binding = { value: ['administrador'], instance: null };

    expect(() => permissionDirective.mounted(el, binding)).not.toThrow();
    expect(el.disabled).toBe(true);
  });
});

// =============================================================================
// Edge cases — binding.value no-array
// =============================================================================

describe('v-permission directive — binding.value no es un array', () => {
  let el;

  beforeEach(() => {
    el = makeEl();
  });

  it('treats an undefined value as an empty list and disables the element', () => {
    const binding = makeBinding('administrador', undefined);

    expect(() => permissionDirective.mounted(el, binding)).not.toThrow();
    expect(el.disabled).toBe(true);
    expect(el.classList.contains('disabled')).toBe(true);
  });

  it('treats a string value as an empty list and disables the element', () => {
    // v-permission="'administrador'" (string en vez de array) no debe autorizar
    const binding = makeBinding('administrador', 'administrador');

    expect(() => permissionDirective.mounted(el, binding)).not.toThrow();
    expect(el.disabled).toBe(true);
  });

  it('treats a null value as an empty list and disables the element', () => {
    const binding = makeBinding('administrador', null);

    expect(() => permissionDirective.mounted(el, binding)).not.toThrow();
    expect(el.disabled).toBe(true);
  });
});

// =============================================================================
// Edge cases — hook updated
// =============================================================================

describe('v-permission directive — hook updated', () => {
  let el;

  beforeEach(() => {
    el = makeEl();
  });

  it('exposes an updated hook identical in behavior to mounted', () => {
    expect(typeof permissionDirective.updated).toBe('function');
    expect(permissionDirective.updated).toBe(permissionDirective.mounted);
  });

  it('re-applies restrictions on updated when role is NOT allowed', () => {
    const binding = makeBinding('comercial', ['administrador']);

    permissionDirective.updated(el, binding);

    expect(el.disabled).toBe(true);
    expect(el.classList.contains('disabled')).toBe(true);
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.style.pointerEvents).toBe('none');
  });

  it('re-applies .hide on updated when role is NOT allowed', () => {
    const binding = makeBinding('comercial', ['administrador'], { hide: true });

    permissionDirective.updated(el, binding);

    expect(el.style.display).toBe('none');
  });

  it('leaves the element untouched on updated when role IS allowed', () => {
    const binding = makeBinding('administrador', ['administrador']);

    permissionDirective.updated(el, binding);

    expect(el.disabled).toBe(false);
    expect(el.classList.contains('disabled')).toBe(false);
  });
});
