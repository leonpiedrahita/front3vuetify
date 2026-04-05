/**
 * Tests for src/router/index.js
 *
 * Strategy:
 * - The store is mocked to avoid circular dependency (store imports router,
 *   router does not import store — but the store module would be pulled in
 *   transitively through the route components or other imports).
 * - Route components are lazy-loaded (dynamic imports); we do NOT need to
 *   resolve them to inspect route metadata, so no special stub is needed.
 * - We work directly with the raw `routes` array exported by the router module
 *   by inspecting `router.options.routes` after importing the router instance.
 */

import { describe, it, expect, vi } from 'vitest';

// Mock the Vuex store to break the circular dependency that would arise if
// the store module were evaluated (store → router → store).
vi.mock('../store', () => ({
  default: {
    state: { token: '', user: '', existe: 0 },
    commit: vi.fn(),
    dispatch: vi.fn(),
  },
}));

// Import the router AFTER the mock is registered.
import router from '../router/index.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Flatten the nested `routes` tree into a single array so we can look up
 * routes by name regardless of nesting depth.
 */
function flattenRoutes(routes, result = []) {
  for (const route of routes) {
    result.push(route);
    if (route.children?.length) {
      flattenRoutes(route.children, result);
    }
  }
  return result;
}

function findRoute(name) {
  return flattenRoutes(router.options.routes).find((r) => r.name === name);
}

// =============================================================================
// Top-level routes
// =============================================================================

describe('Router — top-level routes', () => {
  it('/login has meta.public: true', () => {
    const route = findRoute('Login');
    expect(route).toBeDefined();
    expect(route.meta?.public).toBe(true);
  });

  it('/segura has meta.auth: true', () => {
    const route = findRoute('Segura');
    expect(route).toBeDefined();
    expect(route.meta?.auth).toBe(true);
  });

  it('/imprimirreporte has meta.public: true', () => {
    const route = findRoute('ImprimirReporte');
    expect(route).toBeDefined();
    expect(route.meta?.public).toBe(true);
  });

  it('catch-all /:pathMatch(.*) redirects to ListarEquipos', () => {
    const routes = flattenRoutes(router.options.routes);
    const catchAll = routes.find((r) => r.path === '/:pathMatch(.*)*');
    expect(catchAll).toBeDefined();
    expect(catchAll.redirect).toEqual({ name: 'ListarEquipos' });
  });
});

// =============================================================================
// Child routes with meta.auth: true  (require authentication)
// =============================================================================

describe('Router — authenticated child routes', () => {
  it('/listarequipos has meta.auth: true', () => {
    const route = findRoute('ListarEquipos');
    expect(route).toBeDefined();
    expect(route.meta?.auth).toBe(true);
  });

  it('/listarclientes has meta.auth: true', () => {
    const route = findRoute('ListarClientes');
    expect(route).toBeDefined();
    expect(route.meta?.auth).toBe(true);
  });

  it('/formulariogenerarorden has meta.auth: true', () => {
    const route = findRoute('FormularioGenerarOrden');
    expect(route).toBeDefined();
    expect(route.meta?.auth).toBe(true);
  });

  it('/adminusuarios has meta.auth: true', () => {
    const route = findRoute('AdministracionUsuarios');
    expect(route).toBeDefined();
    expect(route.meta?.auth).toBe(true);
  });
});

// =============================================================================
// Child routes with meta.public: true  (accessible without login)
// =============================================================================

describe('Router — public child routes inside /segura', () => {
  it('/detallesequipo has meta.public: true', () => {
    const route = findRoute('DetallesEquipo');
    expect(route).toBeDefined();
    expect(route.meta?.public).toBe(true);
  });

  it('/listarordenes has meta.public: true', () => {
    const route = findRoute('ListarOrdenes');
    expect(route).toBeDefined();
    expect(route.meta?.public).toBe(true);
  });

  it('/listarrefequipos has meta.public: true', () => {
    const route = findRoute('ListarRefEquipos');
    expect(route).toBeDefined();
    expect(route.meta?.public).toBe(true);
  });

  it('/pasos has meta.public: true', () => {
    const route = findRoute('Pasos');
    expect(route).toBeDefined();
    expect(route.meta?.public).toBe(true);
  });
});
