<template>
    <v-card class="pa-2">
        <div class="text-center mb-4">
            <v-btn color="primary" @click="abrirCrearUsuario">Crear Usuario</v-btn>
        </div>
        <v-data-table :headers="headers" :items="usuarios" :loading="cargando" class="elevation-1"
            loading-text="Cargando ... por favor espere" hide-default-footer>
            <template v-slot:item.actions="{ item }">
                <v-icon small @click="editarUsuario(item)">mdi-pencil</v-icon>
            </template>
            <template v-slot:item.accionfirma="{ item }">
                <v-icon small @click="abrirDialogoFirma(item)">mdi-draw</v-icon>
            </template>
            <template v-slot:item.estado="{ item }">
                <v-chip :color="item.estado === 1 ? 'green' : 'red'" dark>
                    {{ item.estado === 1 ? 'Activo' : 'Bloqueado' }}
                </v-chip>
            </template>
        </v-data-table>

        <!-- Formulario Dialog -->
        <v-dialog v-model="dialogoEditarUsuario" max-width="500px" persistent scrollable>
            <v-card>
                <v-card-title>{{ esNuevo ? 'Crear Usuario' : 'Editar Usuario' }}</v-card-title>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field v-model="usuario.nombre" label="Nombre*"
                                :rules="[v => !!v || 'Campo obligatorio']" />
                        </v-col>

                        <v-col cols="12">
                            <v-text-field v-model="usuario.email" label="Email*"
                                :rules="[v => !!v || 'Campo obligatorio']" />
                        </v-col>

                        <v-col cols="12">
                            <v-select v-model="usuario.rol" :items="rolesDisponibles" label="Rol*"
                                :rules="[v => !!v || 'Campo obligatorio']" />
                        </v-col>

                        <v-col cols="12">
                            <v-select v-model="usuario.estado" :items="estadoOpciones" item-title="text"
                                item-value="value" label="Estado*" :rules="[v => !!v || 'Campo obligatorio']" />
                        </v-col>

                        <!-- Solo para nuevo usuario -->
                        <v-col cols="12" v-if="esNuevo">
                            <v-text-field v-model="usuario.password" label="Contraseña*" type="password"
                                :rules="[validarPassword]" />
                            <v-text-field v-model="confirmarPassword" label="Confirmar Contraseña*" type="password"
                                :rules="[v => v === usuario.password || 'Las contraseñas no coinciden']" />
                            <small class="text-caption text-medium-emphasis">
                                La contraseña debe contener al menos una mayúscula, una minúscula, un número y un
                                carácter especial.
                            </small>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <v-btn text="Cerrar" variant="plain" @click="dialogoEditarUsuario = false" />
                    <v-btn color="primary" text="Guardar" variant="tonal" @click="guardarUsuario" />
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Confirmación -->
        <v-dialog transition="dialog-bottom-transition" max-width="600" persistent v-model="dialogoConfirmacion">
            <v-card>
                <v-toolbar class="text-h4 text-center justify-center" :color="esExito ? 'green' : 'red'" dark>
                    {{ esExito ? '¡Genial!' : '¡Error!' }}
                </v-toolbar>
                <v-card-text class="text-h5 pa-5">{{ mensajeConfirmacion }}</v-card-text>
                <v-card-actions class="justify-center">
                    <v-btn color="primary" @click="dialogoConfirmacion = false">Aceptar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Cargando -->
        <v-dialog v-model="dialogoEsperar" persistent width="500">
            <v-card color="c6" dark>
                <v-card-text>
                    Por favor espere...
                    <v-progress-linear indeterminate color="white" class="mb-0" />
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogoFirma" max-width="500" persistent>
            <v-card>
                <!-- Título centrado -->
                <v-card-title class="d-flex justify-center">
                    <div class="text-h6 font-weight-bold text-center">Firma Usuario</div>
                </v-card-title>

                <!-- Firma centrada -->
                <v-card-text class="d-flex justify-center">
                    <VueSignaturePad id="signature" height="200px" width="350px" ref="signaturePad"
                        :options="options" />
                </v-card-text>

                <!-- Botones distribuidos -->
                <v-card-actions class="d-flex justify-space-between px-4">
                    <v-btn color="c1" variant="tonal" @click="undo">Deshacer</v-btn>
                    <v-btn color="grey" variant="tonal" @click="dialogoFirma = false">Cancelar</v-btn>
                    <v-btn color="primary darken-1" variant="tonal" @click="save">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
    import axios from "axios";
    import FirmaComponent from '@/components/FirmaComponent.vue'
    export default {
        name: "AdministracionUsuariosComponent",
        components: {
            FirmaComponent
        },

        data: () => ({
            cargando: true,
            dialogoEditarUsuario: false,
            dialogoEsperar: false,
            dialogoConfirmacion: false,
            dialogoFirma: false,
            mensajeConfirmacion: "",
            esExito: true,
            esNuevo: false,
            confirmarPassword: '',
            usuarios: [],
            usuarioSeleccionado: null,
            options: {
                penColor: "black",
            },
            usuario: {
                nombre: '',
                email: '',
                rol: '',
                estado: 1,
                password: ''
            },
            rolesDisponibles: ["administrador", "calidad", "cotizaciones", "soporte", "comercial","bodega"],
            estadoOpciones: [
                { text: 'Activo', value: 1 },
                { text: 'Bloqueado', value: 0 }
            ],
            headers: [
                { title: "Nombre", value: "nombre", align: "center" },
                { title: "Email", value: "email", align: "center" },
                { title: "Rol", value: "rol", align: "center" },
                { title: "Estado", value: "estado", align: "center" },

                { title: "Acciones", value: "actions", sortable: false, align: "center" },
                { title: "Firma", value: "accionfirma", sortable: false, align: "center" }
            ],
        }),

        created() {
            this.$store.dispatch("autoLogin");
            if (this.$store.state.existe === 0) {
                this.$router.push({ name: "Login" });
            } else {
                this.listar();
            }
            this.$store.dispatch("guardarUbicacion", {
                ubicacion: "Admin. de Usuarios",
                icono: "mdi-badge-account-outline",
                color: "c6",
            });
        },

        methods: {
            listar() {
                axios.get(this.$store.state.ruta + "api/usuario/listar", {
                    headers: { token: this.$store.state.token }
                })
                    .then((res) => {
                        this.usuarios = res.data;
                        this.cargando = false;
                    });
            },

            abrirCrearUsuario() {
                this.usuario = { nombre: '', email: '', rol: '', estado: 1, password: '' };
                this.confirmarPassword = '';
                this.esNuevo = true;
                this.dialogoEditarUsuario = true;
            },

            editarUsuario(usuario) {
                this.usuario = { ...usuario, password: '' };
                this.confirmarPassword = '';
                this.esNuevo = false;
                this.dialogoEditarUsuario = true;
            },

            guardarUsuario() {
                if (!this.usuario.nombre || !this.usuario.email || !this.usuario.rol || this.usuario.estado === null) {
                    this.mensajeConfirmacion = "Por favor completa todos los campos obligatorios.";
                    this.esExito = false;
                    this.dialogoConfirmacion = true;
                    return;
                }

                if (this.esNuevo && !this.validarPassword(this.usuario.password)) {
                    this.mensajeConfirmacion = "La contraseña no cumple los requisitos.";
                    this.esExito = false;
                    this.dialogoConfirmacion = true;
                    return;
                }

                if (this.esNuevo && this.usuario.password !== this.confirmarPassword) {
                    this.mensajeConfirmacion = "Las contraseñas no coinciden.";
                    this.esExito = false;
                    this.dialogoConfirmacion = true;
                    return;
                }

                this.dialogoEsperar = true;

                const endpoint = this.esNuevo
                    ? this.$store.state.ruta + "api/usuario/registrar"
                    : this.$store.state.ruta + "api/usuario/actualizar/" + this.usuario.id;

                const payload = {
                    nombre: this.usuario.nombre,
                    email: this.usuario.email,
                    rol: this.usuario.rol,
                    ...(this.esNuevo ? { password: this.usuario.password } : { estado: this.usuario.estado })
                };

                const metodo = this.esNuevo ? "post" : "patch";

                axios[metodo](endpoint, payload, {
                    headers: { token: this.$store.state.token }
                })
                    .then(() => {
                        this.dialogoEditarUsuario = false;
                        this.listar();
                        this.mensajeConfirmacion = this.esNuevo ? "Usuario creado exitosamente" : "Usuario actualizado correctamente";
                        this.esExito = true;
                    })
                    .catch((error) => {
                        console.error(error);
                        this.mensajeConfirmacion = error.response?.data?.message || "Error en la operación";
                        this.esExito = false;
                    })
                    .finally(() => {
                        this.dialogoEsperar = false;
                        this.dialogoConfirmacion = true;
                    });
            },

            validarPassword(password) {
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&.,_-]).{8,}$/;
                return regex.test(password) || "Debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
            },
            abrirDialogoFirma(usuario) {
                this.usuarioSeleccionado = usuario;
                this.dialogoFirma = true;
            },
            undo() {
                this.$refs.signaturePad.undoSignature();
            },
            async save() {
                const { isEmpty, data } = this.$refs.signaturePad.saveSignature("image/png");

                if (isEmpty) {
                    this.mensajeConfirmacion = "La firma está vacía. Por favor, firma antes de guardar.";
                    this.colorDialogo = "red";
                    this.esExito = false;
                    this.dialogoConfirmacion = true;
                    return;
                }

                this.dialogoEsperar = true;

                try {
                    const response = await axios.patch(
                        this.$store.state.ruta + "api/usuario/actualizarfirma/",
                        {
                            email: this.usuarioSeleccionado.email,
                            firma: data,
                        },
                        {
                            headers: {
                                token: localStorage.getItem("token"),
                            },
                        }
                    );

                    this.mensajeConfirmacion = "Firma actualizada exitosamente";
                    this.colorDialogo = "green";
                    this.esExito = true;
                    this.dialogoFirma = false;
                    this.listar(); // refrescar tabla
                } catch (error) {
                    this.mensajeConfirmacion =
                        "Error al actualizar la firma: " +
                        (error.response?.data?.error || error.message);
                    this.colorDialogo = "red";
                    this.esExito = false;
                } finally {
                    this.dialogoEsperar = false;
                    this.dialogoConfirmacion = true;
                }
            }
        },
    };
</script>