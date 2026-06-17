/**
 * Tests para la lógica de cambio de contraseña de SeguraComponent.vue
 *
 * Estrategia: se replican las funciones puras de validación y la lógica
 * del método cambiarContrasena sin montar el componente completo
 * (evita dependencias de Vuetify/JSDOM incompatibles).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Constantes replicadas del componente ────────────────────────────────────
const REGEX_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;

/**
 * Replicación de la lógica de validación del método cambiarContrasena.
 * Retorna null si el formulario es válido, o { campo, mensaje } si hay error.
 */
function validarFormulario({ contrasenaActual, nuevaContrasena, confirmarContrasena }) {
  if (!contrasenaActual) {
    return { campo: 'contrasenaActual', mensaje: 'Ingrese su contraseña actual' };
  }
  if (!nuevaContrasena || !REGEX_CONTRASENA.test(nuevaContrasena)) {
    return { campo: 'errorContrasena', mensaje: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.' };
  }
  if (nuevaContrasena !== confirmarContrasena) {
    return { campo: 'errorConfirmar', mensaje: 'Las contraseñas no coinciden' };
  }
  return null;
}

/**
 * Simula el método cambiarContrasena del componente usando un $axios mockeado.
 */
async function ejecutarCambiarContrasena({ form, axiosMock, storeMock }) {
  const estado = {
    errorContrasenaActual: '',
    errorContrasena: '',
    errorConfirmar: '',
    mensajeExito: '',
    guardandoContrasena: false,
  };

  estado.errorContrasenaActual = '';
  estado.errorContrasena = '';
  estado.errorConfirmar = '';
  estado.mensajeExito = '';

  if (!form.contrasenaActual) {
    estado.errorContrasenaActual = 'Ingrese su contraseña actual';
    return estado;
  }

  if (!form.nuevaContrasena || !REGEX_CONTRASENA.test(form.nuevaContrasena)) {
    estado.errorContrasena = 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.';
    return estado;
  }

  if (form.nuevaContrasena !== form.confirmarContrasena) {
    estado.errorConfirmar = 'Las contraseñas no coinciden';
    return estado;
  }

  estado.guardandoContrasena = true;
  try {
    await axiosMock.patch(
      `${storeMock.state.ruta}api/usuario/cambiarcontrasena`,
      { oldPassword: form.contrasenaActual, newPassword: form.nuevaContrasena },
      { headers: { token: storeMock.state.token } }
    );
    estado.mensajeExito = 'Contraseña actualizada correctamente';
    form.contrasenaActual = '';
    form.nuevaContrasena = '';
    form.confirmarContrasena = '';
  } catch (err) {
    const msg = err.response?.data?.message || 'Error al actualizar la contraseña';
    if (err.response?.status === 401) {
      estado.errorContrasenaActual = msg;
    } else {
      estado.errorContrasena = msg;
    }
  } finally {
    estado.guardandoContrasena = false;
  }

  return estado;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const storeMock = { state: { ruta: 'http://localhost:5000/', token: 'jwt-token' } };

const formValido = {
  contrasenaActual: 'Actual@123',
  nuevaContrasena: 'Nueva@456',
  confirmarContrasena: 'Nueva@456',
};

// =============================================================================
// VALIDACIÓN LOCAL (sin llamada HTTP)
// =============================================================================

describe('validarFormulario — validación del formulario', () => {
  it('retorna null cuando el formulario es completamente válido', () => {
    expect(validarFormulario(formValido)).toBeNull();
  });

  it('error en contrasenaActual cuando está vacía', () => {
    const resultado = validarFormulario({ ...formValido, contrasenaActual: '' });
    expect(resultado?.campo).toBe('contrasenaActual');
  });

  it('error en errorContrasena cuando nuevaContrasena no cumple la regex', () => {
    const resultado = validarFormulario({ ...formValido, nuevaContrasena: 'simple', confirmarContrasena: 'simple' });
    expect(resultado?.campo).toBe('errorContrasena');
  });

  it('error en errorContrasena cuando nuevaContrasena está vacía', () => {
    const resultado = validarFormulario({ ...formValido, nuevaContrasena: '', confirmarContrasena: '' });
    expect(resultado?.campo).toBe('errorContrasena');
  });

  it('error en errorConfirmar cuando las contraseñas no coinciden', () => {
    const resultado = validarFormulario({ ...formValido, confirmarContrasena: 'Diferente@1' });
    expect(resultado?.campo).toBe('errorConfirmar');
  });

  it('contrasenaActual vacía tiene prioridad sobre newPassword inválida', () => {
    const resultado = validarFormulario({ contrasenaActual: '', nuevaContrasena: 'mal', confirmarContrasena: '' });
    expect(resultado?.campo).toBe('contrasenaActual');
  });
});

// =============================================================================
// REGEX — contraseñas
// =============================================================================

describe('REGEX_CONTRASENA', () => {
  const validas = ['Abc@123', 'Nueva@456', 'Mi#Pass1', 'Xq!2345a'];
  const invalidas = ['sinmayuscula@1', 'SINMINUSCULA@1', 'SinNumero@a', 'SinEspecial1a', 'Cor@1'];

  validas.forEach(pwd => {
    it(`acepta "${pwd}"`, () => {
      expect(REGEX_CONTRASENA.test(pwd)).toBe(true);
    });
  });

  invalidas.forEach(pwd => {
    it(`rechaza "${pwd}"`, () => {
      expect(REGEX_CONTRASENA.test(pwd)).toBe(false);
    });
  });
});

// =============================================================================
// ejecutarCambiarContrasena — flujo completo con $axios mockeado
// =============================================================================

describe('cambiarContrasena — flujo con axios mockeado', () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = { patch: vi.fn() };
  });

  it('retorna mensajeExito y limpia el formulario en éxito', async () => {
    axiosMock.patch.mockResolvedValue({ data: { message: 'ok' } });
    const form = { ...formValido };

    const estado = await ejecutarCambiarContrasena({ form, axiosMock, storeMock });

    expect(axiosMock.patch).toHaveBeenCalledWith(
      expect.stringContaining('cambiarcontrasena'),
      { oldPassword: 'Actual@123', newPassword: 'Nueva@456' },
      expect.objectContaining({ headers: { token: 'jwt-token' } })
    );
    expect(estado.mensajeExito).toBe('Contraseña actualizada correctamente');
    expect(form.contrasenaActual).toBe('');
    expect(form.nuevaContrasena).toBe('');
    expect(form.confirmarContrasena).toBe('');
  });

  it('muestra errorContrasenaActual cuando el servidor responde 401', async () => {
    const err = { response: { status: 401, data: { message: 'La contraseña actual es incorrecta.' } } };
    axiosMock.patch.mockRejectedValue(err);
    const form = { ...formValido };

    const estado = await ejecutarCambiarContrasena({ form, axiosMock, storeMock });

    expect(estado.errorContrasenaActual).toBe('La contraseña actual es incorrecta.');
    expect(estado.mensajeExito).toBe('');
  });

  it('muestra errorContrasena cuando el servidor responde con error genérico', async () => {
    const err = { response: { status: 500, data: { message: 'Error interno' } } };
    axiosMock.patch.mockRejectedValue(err);
    const form = { ...formValido };

    const estado = await ejecutarCambiarContrasena({ form, axiosMock, storeMock });

    expect(estado.errorContrasena).toBe('Error interno');
    expect(estado.errorContrasenaActual).toBe('');
  });

  it('muestra mensaje genérico cuando el servidor no devuelve message', async () => {
    axiosMock.patch.mockRejectedValue({ response: { status: 500, data: {} } });
    const form = { ...formValido };

    const estado = await ejecutarCambiarContrasena({ form, axiosMock, storeMock });

    expect(estado.errorContrasena).toBe('Error al actualizar la contraseña');
  });

  it('no llama a axios si contrasenaActual está vacía', async () => {
    const form = { ...formValido, contrasenaActual: '' };

    const estado = await ejecutarCambiarContrasena({ form, axiosMock, storeMock });

    expect(axiosMock.patch).not.toHaveBeenCalled();
    expect(estado.errorContrasenaActual).toBeTruthy();
  });

  it('no llama a axios si nuevaContrasena no cumple la regex', async () => {
    const form = { ...formValido, nuevaContrasena: 'debil', confirmarContrasena: 'debil' };

    const estado = await ejecutarCambiarContrasena({ form, axiosMock, storeMock });

    expect(axiosMock.patch).not.toHaveBeenCalled();
    expect(estado.errorContrasena).toBeTruthy();
  });

  it('no llama a axios si las contraseñas no coinciden', async () => {
    const form = { ...formValido, confirmarContrasena: 'Diferente@1' };

    const estado = await ejecutarCambiarContrasena({ form, axiosMock, storeMock });

    expect(axiosMock.patch).not.toHaveBeenCalled();
    expect(estado.errorConfirmar).toBeTruthy();
  });

  it('guardandoContrasena queda en false después de un éxito', async () => {
    axiosMock.patch.mockResolvedValue({});
    const form = { ...formValido };

    const estado = await ejecutarCambiarContrasena({ form, axiosMock, storeMock });

    expect(estado.guardandoContrasena).toBe(false);
  });

  it('guardandoContrasena queda en false después de un error', async () => {
    axiosMock.patch.mockRejectedValue({ response: { status: 401, data: { message: 'Incorrecta' } } });
    const form = { ...formValido };

    const estado = await ejecutarCambiarContrasena({ form, axiosMock, storeMock });

    expect(estado.guardandoContrasena).toBe(false);
  });
});
