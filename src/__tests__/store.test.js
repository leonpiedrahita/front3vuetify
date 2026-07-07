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
  store.commit('setSnackbarSesion', { visible: false, texto: '' });
  store.commit('setSesionExpirando', false);
  store.commit('setMovimientosPendientes', 0);
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

  it('resets refreshCount to 0 on successful refresh', async () => {
    localStorage.setItem('refreshToken', 'valid-refresh');
    store.commit('setRefreshCount', 2);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'new-access-token' }),
    }));

    await store.dispatch('autoLogin');

    expect(store.state.refreshCount).toBe(0);
  });

  it('rotates the refreshToken in localStorage when the server returns a new one', async () => {
    localStorage.setItem('refreshToken', 'old-refresh');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'new-access-token', refreshToken: 'rotated-refresh' }),
    }));

    const result = await store.dispatch('autoLogin');

    expect(result).toBe(true);
    expect(localStorage.getItem('refreshToken')).toBe('rotated-refresh');
  });

  it('keeps the existing refreshToken when the server does not rotate it', async () => {
    localStorage.setItem('refreshToken', 'keep-me');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'new-access-token' }),
    }));

    const result = await store.dispatch('autoLogin');

    expect(result).toBe(true);
    expect(localStorage.getItem('refreshToken')).toBe('keep-me');
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

  it('preserves refreshToken and returns false when fetch throws a network error', async () => {
    localStorage.setItem('refreshToken', 'some-refresh');

    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const result = await store.dispatch('autoLogin');

    expect(result).toBe(false);
    expect(store.state.existe).toBe(0);
    // Hallazgo 13: errores transitorios no deben destruir un refreshToken válido
    expect(localStorage.getItem('refreshToken')).toBe('some-refresh');
  });

  it('preserves refreshToken when server returns ok:true but accessToken is missing', async () => {
    localStorage.setItem('refreshToken', 'still-valid');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ /* accessToken ausente */ }),
    }));

    const result = await store.dispatch('autoLogin');

    expect(result).toBe(false);
    expect(store.state.existe).toBe(0);
    // El refreshToken puede seguir siendo válido — no se debe eliminar
    expect(localStorage.getItem('refreshToken')).toBe('still-valid');
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

// =============================================================================
// MUTATIONS: snackbarSesion, sesionExpirando, movimientosPendientes
// =============================================================================

describe('Store mutations — sesión y movimientos', () => {
  beforeEach(resetState);

  it('setSnackbarSesion — actualiza visible y texto', () => {
    store.commit('setSnackbarSesion', { visible: true, texto: 'Sesión expirada' });
    expect(store.state.snackbarSesion.visible).toBe(true);
    expect(store.state.snackbarSesion.texto).toBe('Sesión expirada');
  });

  it('setSnackbarSesion — puede ocultarse con visible: false', () => {
    store.commit('setSnackbarSesion', { visible: true, texto: 'msg' });
    store.commit('setSnackbarSesion', { visible: false, texto: '' });
    expect(store.state.snackbarSesion.visible).toBe(false);
  });

  it('setSesionExpirando — actualiza a true', () => {
    store.commit('setSesionExpirando', true);
    expect(store.state.sesionExpirando).toBe(true);
  });

  it('setSesionExpirando — puede restablecerse a false', () => {
    store.commit('setSesionExpirando', true);
    store.commit('setSesionExpirando', false);
    expect(store.state.sesionExpirando).toBe(false);
  });

  it('setMovimientosPendientes — actualiza el conteo', () => {
    store.commit('setMovimientosPendientes', 5);
    expect(store.state.movimientosPendientes).toBe(5);
  });

  it('setMovimientosPendientes — puede ponerse en 0', () => {
    store.commit('setMovimientosPendientes', 3);
    store.commit('setMovimientosPendientes', 0);
    expect(store.state.movimientosPendientes).toBe(0);
  });
});

// =============================================================================
// ACTION: sesionExpirada
// =============================================================================

describe('Action: sesionExpirada', () => {
  let setTimeoutSpy;
  let capturedFn;

  beforeEach(() => {
    resetState();
    capturedFn = null;
    // Interceptar setTimeout sin instalar fake timers globales (evita conflicto con Vitest)
    setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      capturedFn = fn;
      return 0;
    });
  });

  afterEach(() => {
    setTimeoutSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('activa el snackbar con el mensaje de sesión expirada', async () => {
    await store.dispatch('sesionExpirada');
    expect(store.state.snackbarSesion.visible).toBe(true);
    expect(store.state.snackbarSesion.texto).toContain('expirado');
  });

  it('establece sesionExpirando en true para evitar llamadas duplicadas', async () => {
    await store.dispatch('sesionExpirada');
    expect(store.state.sesionExpirando).toBe(true);
  });

  it('no dispara un segundo snackbar si ya está en curso', async () => {
    store.commit('setSesionExpirando', true);
    store.commit('setSnackbarSesion', { visible: false, texto: '' });
    await store.dispatch('sesionExpirada');
    expect(store.state.snackbarSesion.visible).toBe(false);
  });

  it('programa salir con un setTimeout de 2500ms y navega al Login al ejecutarlo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    await store.dispatch('sesionExpirada');

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2500);
    expect(router.push).not.toHaveBeenCalled();

    // Ejecutar el callback capturado simula el disparo del timer
    await capturedFn();
    expect(router.push).toHaveBeenCalledWith({ name: 'Login' });
  });
});

// =============================================================================
// ACTION: fetchMovimientosPendientes
// =============================================================================

describe('Action: fetchMovimientosPendientes', () => {
  beforeEach(resetState);
  afterEach(() => vi.unstubAllGlobals());

  const rolesQueDescargan = ['administrador', 'bodega', 'soporte', 'aplicaciones', 'lumira', 'ingresos'];
  const rolesQueNoDescargan = ['comercial', 'calidad', 'cotizaciones', 'ventas'];

  rolesQueDescargan.forEach(rol => {
    it(`descarga el conteo para el rol "${rol}"`, async () => {
      store.commit('setToken', 'tok');
      store.commit('setUsuario', { rol });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 4 }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await store.dispatch('fetchMovimientosPendientes');

      expect(mockFetch).toHaveBeenCalled();
      expect(store.state.movimientosPendientes).toBe(4);
    });
  });

  rolesQueNoDescargan.forEach(rol => {
    it(`no hace fetch para el rol "${rol}"`, async () => {
      store.commit('setToken', 'tok');
      store.commit('setUsuario', { rol });

      const mockFetch = vi.fn();
      vi.stubGlobal('fetch', mockFetch);

      await store.dispatch('fetchMovimientosPendientes');

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it('no altera el conteo si el servidor responde con error', async () => {
    store.commit('setToken', 'tok');
    store.commit('setUsuario', { rol: 'administrador' });
    store.commit('setMovimientosPendientes', 2);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await store.dispatch('fetchMovimientosPendientes');

    expect(store.state.movimientosPendientes).toBe(2);
  });
});
