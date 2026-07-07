// Directiva v-permission: restringe elementos de UI según el rol del usuario.
// NOTA: esto es solo UX — la autorización real la aplica el backend en cada endpoint.
// Uso: v-permission="['administrador', 'soporte']"
// Con modificador hide: v-permission.hide="['administrador']" — oculta en vez de deshabilitar.

function aplicarPermiso(el, binding) {
  const userRole = binding.instance?.$store?.state?.user?.rol;
  const allowedRoles = Array.isArray(binding.value) ? binding.value : [];
  const autorizado = allowedRoles.includes(userRole);
  const modifiers = binding.modifiers || {};

  if (!autorizado) {
    if (modifiers.hide) {
      el.style.display = 'none';
    } else {
      el.disabled = true;
      el.classList.add('disabled');
      el.setAttribute('aria-disabled', 'true');
      el.style.pointerEvents = 'none';
    }
  }
}

export default {
  mounted: aplicarPermiso,
  updated: aplicarPermiso,
};
