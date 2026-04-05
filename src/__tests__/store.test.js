/**
 * Tests for src/store/index.js
 *
 * Strategy:
 * - jwt-decode is mocked to avoid real token parsing.
 * - fetch is stubbed globally on each test so we control HTTP responses.
 * - The router is mocked to prevent navigation side-effects.
 * - VITE_API_URL is stubbed via vi.stubEnv so the store's module-level
 *   `const apiUrl = import.meta.env.VITE_API_URL` resolves to a known value.
 * - Because the store is a singleton (createStore runs at module load time),
 *   we reset relevant state manually between tests rather than re-importing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Environment stub (must happen before the store module is imported) ────────
vi.stubEnv('VITE_API_URL', 'http://localhost:5000/');

// ── Mock jwt-decode ────────────────────────────────────────────────────────────
vi.mock('jwt-decode', () => ({
  default: vi.fn(() => ({ rol: 'administrador', nombre: 'Test User' })),
}));

// ── Mock the router to prevent navigation ────────────────────────────────────
vi.mock('../router', () => ({
  default: { push: vi.fn() },
}));

// ── Import store AFTER mocks are in place ────────────────────────────────────
import store from '../store/index.js';
import router from '../router';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Reset the parts of state that tests mutate between runs. */
function resetState() {
  store.commit('setToken', '');
  store.commit('setUsuario', '');
  store.commit('setExistetoken', 0);
  store.commit('setUbicacion', { ubicacion: '', icono: '', color: '' });
  store.commit('setIdentificacion', '');
  store.commit('setOrdenesEquipo', {});
  store.commit('setReferenciaEquipo', { referenciaequipo: {}, nuevareferencia: 0 });
  localStorage.clear();
  vi.clearAllMocks();
}

// =============================================================================
// MUTATIONS
// =============================================================================

describe('Store mutations', () => {
  beforeEach(resetState);

  it('setToken — updates state.token', () => {
    store.commit('setToken', 'my-access-token');
    expect(store.state.token).toBe('my-access-token');
  });

  it('setUsuario — updates state.user', () => {
    const user = { rol: 'soporte', nombre: 'Jane' };
    store.commit('setUsuario', user);
    expect(store.state.user).toEqual(user);
  });

  it('setExistetoken — updates state.existe', () => {
    store.commit('setExistetoken', 1);
    expect(store.state.existe).toBe(1);

    store.commit('setExistetoken', 0);
    expect(store.state.existe).toBe(0);
  });

  it('setUbicacion — updates ubicacion, icono and color', () => {
    store.commit('setUbicacion', {
      ubicacion: 'Bodega A',
      icono: 'mdi-warehouse',
      color: 'blue',
    });
    expect(store.state.ubicacion).toBe('Bodega A');
    expect(store.state.icono).toBe('mdi-warehouse');
    expect(store.state.color).toBe('blue');
  });

  it('setIdentificacion — updates state.identificacion', () => {
    store.commit('setIdentificacion', 'ABC-123');
    expect(store.state.identificacion).toBe('ABC-123');
  });

  it('setOrdenesEquipo — updates state.ingreso', () => {
    const ingreso = { id: 1, descripcion: 'Mantenimiento' };
    store.commit('setOrdenesEquipo', ingreso);
    expect(store.state.ingreso).toEqual(ingreso);
  });

  it('setReferenciaEquipo — updates referenciaequipo and nuevareferencia', () => {
    const ref = { modelo: 'XR-500' };
    store.commit('setReferenciaEquipo', { referenciaequipo: ref, nuevareferencia: 1 });
    expect(store.state.referenciaequipo).toEqual(ref);
    expect(store.state.nuevareferencia).toBe(1);
  });
});

// =============================================================================
// ACTION: guardarToken
// =============================================================================

describe('Action: guardarToken', () => {
  beforeEach(resetState);

  it('commits setToken with the accessToken', async () => {
    await store.dispatch('guardarToken', {
      accessToken: 'token-abc',
      refreshToken: 'refresh-xyz',
    });
    expect(store.state.token).toBe('token-abc');
  });

  it('commits setUsuario with the decoded JWT payload', async () => {
    await store.dispatch('guardarToken', {
      accessToken: 'token-abc',
      refreshToken: 'refresh-xyz',
    });
    // jwt-decode is mocked to return { rol: 'administrador', nombre: 'Test User' }
    expect(store.state.user).toEqual({ rol: 'administrador', nombre: 'Test User' });
  });

  it('commits setExistetoken(1)', async () => {
    await store.dispatch('guardarToken', {
      accessToken: 'token-abc',
      refreshToken: 'refresh-xyz',
    });
    expect(store.state.existe).toBe(1);
  });

  it('saves the refreshToken to localStorage', async () => {
    await store.dispatch('guardarToken', {
      accessToken: 'token-abc',
      refreshToken: 'refresh-xyz',
    });
    expect(localStorage.getItem('refreshToken')).toBe('refresh-xyz');
  });
});

// =============================================================================
// ACTION: autoLogin
// =============================================================================

describe('Action: autoLogin', () => {
  beforeEach(resetState);
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true immediately when a token is already in state', async () => {
    store.commit('setToken', 'existing-token');
    store.commit('setExistetoken', 1);

    const result = await store.dispatch('autoLogin');
    expect(result).toBe(true);
  });

  it('returns false when there is no refreshToken in localStorage', async () => {
    // No token in state, no refreshToken → should bail out early
    const result = await store.dispatch('autoLogin');
    expect(result).toBe(false);
    expect(store.state.existe).toBe(0);
  });

  it('commits new token data and returns true on a successful refresh', async () => {
    localStorage.setItem('refreshToken', 'valid-refresh');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'new-access-token' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await store.dispatch('autoLogin');

    expect(result).toBe(true);
    expect(store.state.token).toBe('new-access-token');
    expect(store.state.user).toEqual({ rol: 'administrador', nombre: 'Test User' });
    expect(store.state.existe).toBe(1);
  });

  it('removes refreshToken and returns false when server responds with 4xx', async () => {
    localStorage.setItem('refreshToken', 'expired-refresh');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await store.dispatch('autoLogin');

    expect(result).toBe(false);
    expect(store.state.existe).toBe(0);
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('removes refreshToken and returns false when fetch throws a network error', async () => {
    localStorage.setItem('refreshToken', 'some-refresh');

    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const result = await store.dispatch('autoLogin');

    expect(result).toBe(false);
    expect(store.state.existe).toBe(0);
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});

// =============================================================================
// ACTION: salir
// =============================================================================

describe('Action: salir', () => {
  beforeEach(resetState);
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls fetch to the logout endpoint when a refreshToken exists', async () => {
    localStorage.setItem('refreshToken', 'logout-refresh');

    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await store.dispatch('salir');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/usuario/salir',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('clears token and user from state', async () => {
    store.commit('setToken', 'active-token');
    store.commit('setUsuario', { rol: 'administrador' });
    localStorage.setItem('refreshToken', 'logout-refresh');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await store.dispatch('salir');

    expect(store.state.token).toBeNull();
    expect(store.state.user).toBeNull();
  });

  it('removes refreshToken from localStorage', async () => {
    localStorage.setItem('refreshToken', 'logout-refresh');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await store.dispatch('salir');

    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('calls router.push to Login', async () => {
    localStorage.setItem('refreshToken', 'logout-refresh');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await store.dispatch('salir');

    expect(router.push).toHaveBeenCalledWith({ name: 'Login' });
  });

  it('still clears state and navigates even if fetch throws', async () => {
    localStorage.setItem('refreshToken', 'logout-refresh');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await store.dispatch('salir');

    expect(store.state.token).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(router.push).toHaveBeenCalledWith({ name: 'Login' });
  });
});

// =============================================================================
// ACTION: guardarUbicacion
// =============================================================================

describe('Action: guardarUbicacion', () => {
  beforeEach(resetState);

  it('commits setUbicacion with the correct payload', async () => {
    await store.dispatch('guardarUbicacion', {
      ubicacion: 'Piso 3',
      icono: 'mdi-elevator',
      color: 'green',
    });
    expect(store.state.ubicacion).toBe('Piso 3');
    expect(store.state.icono).toBe('mdi-elevator');
    expect(store.state.color).toBe('green');
  });
});

// =============================================================================
// ACTION: guardarIdentificacion
// =============================================================================

describe('Action: guardarIdentificacion', () => {
  beforeEach(resetState);

  it('commits setIdentificacion with the id extracted from the payload object', async () => {
    // The action reads `identificacion.id` — not the whole object
    await store.dispatch('guardarIdentificacion', { id: 'EQ-999', nombre: 'Ventilador' });
    expect(store.state.identificacion).toBe('EQ-999');
  });
});
