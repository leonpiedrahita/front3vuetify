export default {
    mounted(el, binding) {
        const userRole = binding.instance.$store.state.user.rol; // Rol del usuario desde Vuex o Pinia
        const allowedRoles = binding.value; // Roles permitidos
    
        // Verifica si el rol del usuario está en la lista de roles permitidos
        if (!allowedRoles.includes(userRole)) {
          // Deshabilita el botón en lugar de ocultarlo
          el.disabled = true;
          el.classList.add('disabled'); // Agrega una clase opcional para estilos
        }
      }
  };