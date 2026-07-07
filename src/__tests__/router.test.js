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

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Vuex store to break the circular dependency that would arise if
// the store module were evaluated (store → router → store).
// The router guard imports the store dynamically (`await import('../store')`),
// which resolves to this same mocked module.
vi.mock('../store', () => ({
  default: {
    state: { token: '', user: '', existe: 0 },
    commit: vi.fn(),
    dispatch: vi.fn(),
  },
}));

// Wrap vue-router's createRouter to capture the global beforeEach guard so
// we can invoke it directly with fake `to` objects (no real navigation, no
// lazy-loaded view components involved).
const captured = vi.hoisted(() => ({ guard: null }));
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createRouter: (opts) => {
      const instance = actual.createRouter(opts);
      const originalBeforeEach = instance.beforeEach.bind(instance);
      instance.beforeEach = (guard) => {
        captured.guard = guard;
        return originalBeforeEach(guard);
      };
      return instance;
    },
  };
});

// Import the router AFTER the mocks are registered.
import router from '../router/index.js';
import store from '../store';

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

// =============================================================================
// Global beforeEach guard (session enforcement)
// =============================================================================

describe('Router — guard global beforeEach', () => {
  /** Reset mocked store state + mocks + localStorage before each test. */
  beforeEach(() => {
    store.state.token = '';
    store.state.user = '';
    store.state.existe = 0;
    store.dispatch.mockReset();
    localStorage.clear();
  });

  /** Build a fake `to` object with the given meta. */
  const to = (meta = {}) => ({ meta });

  /** Unix epoch seconds helpers for token expiry. */
  const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;
  const oneHourAgo = () => Math.floor(Date.now() / 1000) - 3600;

  it('registers a global beforeEach guard', () => {
    expect(captured.guard).toBeTypeOf('function');
  });

  it('allows navigation to routes WITHOUT meta.auth without touching the store', async () => {
    const result = await captured.guard(to({ public: true }));
    expect(result).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('allows navigation when meta is empty (no auth flag)', async () => {
    const result = await captured.guard(to({}));
    expect(result).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('redirects to Login when there is no session and autoLogin fails', async () => {
    store.dispatch.mockResolvedValue(false); // autoLogin falla

    const result = await captured.guard(to({ auth: true }));

    expect(store.dispatch).toHaveBeenCalledWith('autoLogin');
    expect(result).toEqual({ name: 'Login' });
  });

  it('allows navigation when there is no session but autoLogin succeeds', async () => {
    store.dispatch.mockImplementation(async (action) => {
      if (action === 'autoLogin') {
        // Simular restauración de sesión como haría el store real
        store.state.token = 'restored-token';
        store.state.existe = 1;
        store.state.user = { rol: 'administrador', exp: inOneHour() };
        return true;
      }
    });
    localStorage.setItem('refreshToken', 'valid-refresh');

    const result = await captured.guard(to({ auth: true }));

    expect(store.dispatch).toHaveBeenCalledWith('autoLogin');
    expect(result).toBe(true);
  });

  it('passes straight through with an active session (token + existe=1, exp vigente)', async () => {
    store.state.token = 'active-token';
    store.state.existe = 1;
    store.state.user = { rol: 'soporte', exp: inOneHour() };

    const result = await captured.guard(to({ auth: true }));

    expect(result).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('dispatches autoLogin when a token exists but existe !== 1', async () => {
    store.state.token = 'stale-token';
    store.state.existe = 0;
    store.dispatch.mockResolvedValue(false);

    const result = await captured.guard(to({ auth: true }));

    expect(store.dispatch).toHaveBeenCalledWith('autoLogin');
    expect(result).toEqual({ name: 'Login' });
  });

  it('redirects to Login and dispatches sesionExpirada when exp is expired and there is NO refreshToken', async () => {
    store.state.token = 'expired-token';
    store.state.existe = 1;
    store.state.user = { rol: 'soporte', exp: oneHourAgo() };
    // localStorage sin refreshToken (limpiado en beforeEach)

    const result = await captured.guard(to({ auth: true }));

    expect(store.dispatch).toHaveBeenCalledWith('sesionExpirada');
    expect(result).toEqual({ name: 'Login' });
  });

  it('allows navigation when exp is expired but a refreshToken exists (interceptor lo renovará)', async () => {
    store.state.token = 'expired-token';
    store.state.existe = 1;
    store.state.user = { rol: 'soporte', exp: oneHourAgo() };
    localStorage.setItem('refreshToken', 'still-valid');

    const result = await captured.guard(to({ auth: true }));

    expect(result).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalledWith('sesionExpirada');
  });

  it('does not crash when user has no exp claim (user vacío tras autoLogin)', async () => {
    store.state.token = 'token-sin-exp';
    store.state.existe = 1;
    store.state.user = { rol: 'soporte' }; // sin exp

    const result = await captured.guard(to({ auth: true }));

    expect(result).toBe(true);
  });

  it('does not crash when user is null with an active session flag', async () => {
    store.state.token = 'token';
    store.state.existe = 1;
    store.state.user = null;

    const result = await captured.guard(to({ auth: true }));

    expect(result).toBe(true);
  });
});
