/**
 * Traducción de etiquetas de flujo interno para roles con vista simplificada.
 *
 * Los roles 'calidad' y 'Dir. Comercial' pueden ver ciertas etapas/ubicaciones
 * internas con un nombre alternativo cuando el administrador habilita la opción
 * en el menú de Permisos. Es solo un cambio de presentación: el valor real
 * almacenado no se modifica, por eso la traducción se aplica en el render y
 * nunca sobre los datos que se usan para filtros, colores o comparaciones.
 */

// valor real → valor mostrado
export const MAPA_ETIQUETAS = {
  'Soporte aplicaciones': 'Soporte ingeniería',
  'Bodega Prado': 'Bodega Cliente',
};

// Roles a los que aplica la vista con etiquetas alternativas.
export const ROLES_ETIQUETAS_ALTERNATIVAS = ['calidad', 'Dir. Comercial'];

/**
 * Devuelve la etiqueta a mostrar. Si la traducción no está activa o el texto no
 * tiene equivalente, retorna el texto original sin cambios.
 * @param {string|null|undefined} texto
 * @param {boolean} activo - si la traducción está habilitada para el usuario actual
 * @returns {string|null|undefined}
 */
export function traducirEtiqueta(texto, activo) {
  if (!activo || texto == null) return texto;
  return MAPA_ETIQUETAS[texto] ?? texto;
}
