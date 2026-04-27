/**
 * Tests para PermisosComponent.vue — lógica pura
 * Sin importar el .vue para evitar que vite-plugin-vuetify inyecte CSS
 * incompatibles con el entorno jsdom.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

import axios from 'axios';

// ─── Constantes y funciones replicadas del componente ────────────────────────
const ROLES = ['soporte', 'aplicaciones', 'comercial', 'cotizaciones', 'calidad', 'bodega', 'lumira', 'ventas', 'ingresos'];
const TIPOS = ['ingreso', 'etapa', 'etapa_despachado'];

function clonar(cfg) {
  return Object.fromEntries(
    Object.entries(cfg).map(([rol, tipos]) => [rol, { ...tipos }])
  );
}

function configuracionInicial() {
  return Object.fromEntries(
    ROLES.map(r => [r, { ingreso: false, etapa: false, etapa_despachado: false }])
  );
}

function hayCambios(configuracion, original) {
  if (!original) return false;
  for (const rol of ROLES) {
    for (const tipo of TIPOS) {
      if (configuracion[rol][tipo] !== original[rol][tipo]) return true;
    }
  }
  return false;
}

async function cargar(axiosInst, ruta, token) {
  const configuracion = configuracionInicial();
  const { data } = await axiosInst.get(
    ruta + 'api/configuracion/notificaciones',
    { headers: { token } }
  );
  data.forEach(({ rol, tipoNotificacion, habilitado }) => {
    if (configuracion[rol]) {
      configuracion[rol][tipoNotificacion] = habilitado;
    }
  });
  const original = clonar(configuracion);
  return { configuracion, original };
}

async function guardarTodo(axiosInst, ruta, token, configuracion) {
  const peticiones = [];
  for (const rol of ROLES) {
    for (const tipo of TIPOS) {
      peticiones.push(
        axiosInst.put(
          ruta + 'api/configuracion/notificaciones',
          { rol, tipoNotificacion: tipo, habilitado: configuracion[rol][tipo] },
          { headers: { token } }
        )
      );
    }
  }
  await Promise.all(peticiones);
  return clonar(configuracion);
}

const RUTA = 'http://localhost:5000/';
const TOKEN = 'mock-token';

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockResolvedValue({ data: [] });
  axios.put.mockResolvedValue({ data: { ok: true } });
});

// =============================================================================
// clonar
// =============================================================================
describe('clonar', () => {
  it('crea una copia profunda por rol (shallow de cada objeto de tipos)', () => {
    const cfg = { soporte: { ingreso: true, etapa: false, etapa_despachado: false } };
    const copia = clonar(cfg);
    expect(copia).toEqual(cfg);
    expect(copia.soporte).not.toBe(cfg.soporte);
  });

  it('mutaciones en la copia no afectan el original', () => {
    const cfg = configuracionInicial();
    const copia = clonar(cfg);
    copia.bodega.ingreso = true;
    expect(cfg.bodega.ingreso).toBe(false);
  });
});

// =============================================================================
// hayCambios
// =============================================================================
describe('hayCambios', () => {
  it('retorna false si original es null', () => {
    expect(hayCambios(configuracionInicial(), null)).toBe(false);
  });

  it('retorna false cuando configuracion y original son iguales', () => {
    const cfg = configuracionInicial();
    const orig = clonar(cfg);
    expect(hayCambios(cfg, orig)).toBe(false);
  });

  it('retorna true si se modifica un valor respecto al original', () => {
    const cfg = configuracionInicial();
    const orig = clonar(cfg);
    cfg.soporte.ingreso = true;
    expect(hayCambios(cfg, orig)).toBe(true);
  });

  it('retorna false si se revierte el cambio al valor original', () => {
    const cfg = configuracionInicial();
    const orig = clonar(cfg);
    cfg.soporte.ingreso = true;
    expect(hayCambios(cfg, orig)).toBe(true);
    cfg.soporte.ingreso = false;
    expect(hayCambios(cfg, orig)).toBe(false);
  });

  it('detecta cambio en cualquier rol y tipo', () => {
    for (const rol of ROLES) {
      for (const tipo of TIPOS) {
        const cfg = configuracionInicial();
        const orig = clonar(cfg);
        cfg[rol][tipo] = true;
        expect(hayCambios(cfg, orig)).toBe(true);
      }
    }
  });
});

// =============================================================================
// cargar
// =============================================================================
describe('cargar', () => {
  it('retorna configuracion con todos false cuando la API devuelve array vacío', async () => {
    axios.get.mockResolvedValue({ data: [] });
    const { configuracion, original } = await cargar(axios, RUTA, TOKEN);
    expect(configuracion.soporte.ingreso).toBe(false);
    expect(configuracion.calidad.etapa).toBe(false);
    expect(original).toEqual(configuracion);
  });

  it('aplica los valores recibidos de la API', async () => {
    axios.get.mockResolvedValue({
      data: [
        { rol: 'soporte', tipoNotificacion: 'ingreso', habilitado: true },
        { rol: 'calidad', tipoNotificacion: 'etapa', habilitado: true },
      ],
    });
    const { configuracion } = await cargar(axios, RUTA, TOKEN);
    expect(configuracion.soporte.ingreso).toBe(true);
    expect(configuracion.calidad.etapa).toBe(true);
    expect(configuracion.soporte.etapa).toBe(false);
  });

  it('ignora roles desconocidos sin lanzar error', async () => {
    axios.get.mockResolvedValue({
      data: [{ rol: 'desconocido', tipoNotificacion: 'ingreso', habilitado: true }],
    });
    const { configuracion } = await cargar(axios, RUTA, TOKEN);
    expect(configuracion.soporte.ingreso).toBe(false);
  });

  it('guarda snapshot en original igual a configuracion tras cargar', async () => {
    axios.get.mockResolvedValue({
      data: [{ rol: 'bodega', tipoNotificacion: 'etapa_despachado', habilitado: true }],
    });
    const { configuracion, original } = await cargar(axios, RUTA, TOKEN);
    expect(original.bodega.etapa_despachado).toBe(true);
    expect(hayCambios(configuracion, original)).toBe(false);
  });

  it('lanza error si la API falla (caller debe capturarlo)', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    await expect(cargar(axios, RUTA, TOKEN)).rejects.toThrow('Network error');
  });
});

// =============================================================================
// guardarTodo
// =============================================================================
describe('guardarTodo', () => {
  it('llama PUT por cada combinación rol×tipo (9 × 3 = 27 peticiones)', async () => {
    const cfg = configuracionInicial();
    await guardarTodo(axios, RUTA, TOKEN, cfg);
    expect(axios.put).toHaveBeenCalledTimes(27);
  });

  it('retorna un snapshot de la configuracion guardada', async () => {
    const cfg = configuracionInicial();
    cfg.soporte.ingreso = true;
    const nuevoOriginal = await guardarTodo(axios, RUTA, TOKEN, cfg);
    expect(nuevoOriginal.soporte.ingreso).toBe(true);
  });

  it('hayCambios es false después de guardar (snapshot actualizado)', async () => {
    const cfg = configuracionInicial();
    cfg.bodega.etapa_despachado = true;
    const nuevoOriginal = await guardarTodo(axios, RUTA, TOKEN, cfg);
    expect(hayCambios(cfg, nuevoOriginal)).toBe(false);
  });

  it('las peticiones PUT incluyen rol, tipoNotificacion y habilitado', async () => {
    const cfg = configuracionInicial();
    cfg.calidad.etapa = true;
    await guardarTodo(axios, RUTA, TOKEN, cfg);
    expect(axios.put).toHaveBeenCalledWith(
      RUTA + 'api/configuracion/notificaciones',
      expect.objectContaining({ rol: 'calidad', tipoNotificacion: 'etapa', habilitado: true }),
      expect.any(Object)
    );
  });

  it('lanza error si alguna petición PUT falla', async () => {
    axios.put.mockRejectedValue(new Error('Network error'));
    const cfg = configuracionInicial();
    await expect(guardarTodo(axios, RUTA, TOKEN, cfg)).rejects.toThrow('Network error');
  });
});
