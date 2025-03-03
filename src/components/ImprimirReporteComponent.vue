<template>
    <div id="body" class="margentotal">
      <div class="paddingfilas">
        <div class="gridencabezado titulo principal negrita">
          <div><img class="miimagen" /></div>
          <div class="nombrereporte">Reporte de asistencia técnica</div>
          <div class="gridparejas">
            <div>N°</div>
            <div class="dato">
              {{ reporte.numero }}
            </div>
          </div>
        </div>
        <div class="gridtitulo titulo principal negrita">
          <div>Detalles de la asistencia</div>
        </div>
        <div class="grid principal" fluid>
          <div class="gridparejas">
            <div class="subtitulonegrita">Tipo de asistencia :</div>
            <div class="dato">{{reporte.tipodeasistencia}}</div>
          </div>
          <div class="gridparejas">
            <div class="subtitulonegrita">Duración (Horas):</div>
            <div class="dato">{{reporte.duracion}}</div>
          </div>
          <div class="gridparejas">
            <div class="subtitulonegrita">Fecha de inicio :</div>
            <div class="dato">{{reporte.fechadeinicio}}</div>
          </div>
          <div class="gridparejas">
            <div class="subtitulonegrita">Fecha de finalización :</div>
            <div class="dato">{{reporte.fechadefinalizacion}}</div>
          </div>
        </div>
        <div class="gridtitulo titulo principal negrita">
          <div>Información del Cliente</div>
        </div>
        <div class="grid principal" fluid>
          <div class="gridparejas">
            <div class="subtitulonegrita">Nombre/R. Social :</div>
            <div class="dato">{{reporte.nombrecliente}}</div>
          </div>
          <div class="gridparejas">
            <div class="subtitulonegrita">NIT :</div>
            <div class="dato">{{reporte.nitcliente}}</div>
          </div>
          <div class="gridparejas">
            <div class="subtitulonegrita">Sede :</div>
            <div class="dato">{{reporte.sedecliente}}</div>
          </div>
  
          <div class="gridparejas">
            <div class="subtitulonegrita">Dirección :</div>
            <div class="dato">{{reporte.direccioncliente}}</div>
          </div>
          <div class="gridparejas">
            <div class="subtitulonegrita">Nombre del Profesional :</div>
            <div class="dato">{{reporte.profesionalcliente}}</div>
          </div>
          <div class="gridparejas">
            <div class="subtitulonegrita">Teléfono :</div>
            <div class="dato">{{reporte.telefonocliente}}</div>
          </div>
        </div>
        <div class="gridtitulo titulo principal negrita">
          <div>Información del Equipo Biomédico</div>
        </div>
        <div class="grid principal" fluid>
          <div class="gridparejas">
            <div class="subtitulonegrita">Nombre :</div>
            <div class="dato">{{reporte.infoequipo.nombre}}</div>
          </div>
          <div class="gridparejas">
            <div class="subtitulonegrita">Número de serie :</div>
            <div class="dato">{{reporte.infoequipo.serie}}</div>
          </div>
          <div class="gridparejas">
            <div class="subtitulonegrita">Marca :</div>
            <div class="dato">{{reporte.infoequipo.marca}}</div>
          </div>
  
          <div class="gridparejas">
            <div class="subtitulonegrita">Propietario :</div>
            <div class="dato">{{reporte.propietario}}</div>
          </div>
        </div>
        <div class="gridtitulo titulo principal negrita">
          <div>Hallazgos</div>
        </div>
        <div class="gridcontenido titulo principal">
          <div>
           {{reporte.hallazgos}}
          </div>
        </div>
        <div class="gridtitulo titulo principal negrita">
          <div>Actividades realizadas</div>
        </div>
        <div class="gridcontenido titulo principal">
          <div>
            {{reporte.actividades}}
          </div>
        </div>
        <div class="gridtitulo titulo principal negrita">
          <div>Pruebas de aceptación</div>
        </div>
        <div class="gridcontenido titulo principal">
          <div>
            {{reporte.pruebas}}
          </div>
        </div>
        <div class="gridtitulo titulo principal negrita">
          <div>Repuestos utilizados</div>
        </div>
        <div class="gridcontenido titulo principal">
          <div>
            {{reporte.repuestos}}
          </div>
        </div>
        <div class="gridtitulo titulo principal negrita">
          <div>Observaciones</div>
        </div>
        <div class="gridcontenido titulo principal">
          <div>
            {{reporte.observaciones}}
          </div>
        </div>
        <div class="grid principal" fluid>
          <div class="gridfirma">
            <div class="lafirma">
              <img :src="reporte.firmacliente" 
              style="max-width: 25%"
              class="imagenfirma" />
            </div>
            <div class="nombrefirma">{{reporte.profesionalcliente}}</div>
          </div>
          <div class="gridfirma">
            <div class="lafirma">
              <img
                :src="reporte.firmaingeniero"
                style="max-width: 25%"
                class="imagenfirma"
              />
            </div>
            <div class="nombrefirma">{{reporte.ingeniero}}</div>
          </div>
        </div>
      </div>
      <pre>
         <!-- <pre> -->
          <!-- {{$data.reporte}} --> <!-- para imprimir las categorias en pantalla -->
      <!-- </pre> -->
      
    </pre>
    </div>
    
  </template>
  
  <script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

export default {
  name: "ImprimirReporteComponent",
  setup() {
    const route = useRoute();
    const idreporte = ref(route.params.idreporte); // Reactivo para asegurar que se actualiza correctamente
    console.log("ID Reporte recibido:", idreporte.value);
    
    return { idreporte };
  },

  data() {
    return {
      reporte: {
        numero: null,
        tipodeasistencia: "",
        duracion: "",
        fechadeinicio: "",
        fechadefinalizacion: "",
        infoequipo: {
          nombre: "",
          serie: "",
          marca: "",
        },
        propietario: "",
        nombrecliente: "",
        nitcliente: "",
        sedecliente: "",
        direccioncliente: "",
        profesionalcliente: "",
        telefonocliente: "",
        hallazgos: "",
        actividades: "",
        pruebas: "",
        repuestos: "",
        observaciones: "",
        firmacliente: "",
        firmaingeniero: "",
        ingeniero: "",
      },
    };
  },

  created() {
    this.listar();
  },

  methods: {
    listar() {
      const id = localStorage.getItem("idreporte");
      if (!id) {
        console.error("No se encontró un ID de reporte.");
        return;
      }

      console.log("Consultando reporte con ID:", id);
      
      axios
        .get(`http://localhost:3001/api/reporte/listaruno/${id}`)
        .then((response) => {
          this.reporte = response.data;
        })
        .catch((error) => {
          console.error("Error al obtener el reporte:", error);
        });
    },
  },
};
</script>
  <style >
  .margentotal{
    margin-left: 2%;
    margin-right: 2%;
  }
  .lafirma {
    height: 100%;
    width: 100%;
  }
  .gridfirma {
    display: grid;
    grid-template-columns: repeat(1, auto);
    grid-template-rows: repeat(1, auto);
    background-color: #424242;
    align-items: center;
  
    /* border: 5px solid black; */
  }
  
  .nombrefirma {
    text-align: center;
    text-justify: justify;
  }
  .miimagen {
    content: url("../imagenes/logo/biosystems.jpg");
    border-radius: 3px;
  }
  
  .grid > div {
    background-color: #ffffff;
    padding: 5px;
    text-align: center;
    text-justify: center;
    border-radius: 3px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(auto, auto);
    gap: 1px;
  }
  .principal {
    padding: 0px;
    background-color: #424242;
  }
  .titulo {
    grid-column: 1;
  }
  .gridencabezado {
    display: grid;
  
    grid-template-columns: 2fr 4fr 3fr;
    grid-template-rows: repeat(1, auto);
    gap: 1px;
    background-color: #424242;
  }
  .gridencabezado > div {
    align-items: center;
  
    background-color: #ffffff;
    padding: 5px;
    text-align: center;
    text-justify: center;
    border-radius: 3px;
  
    /* border: 5px solid black; */
  }
  .nombrereporte {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 150%;
  }
  .gridcontenido {
    display: grid;
    grid-template-columns: repeat(1, auto);
    grid-template-rows: repeat(1, auto);
    gap: 1px;
    background-color: #424242;
  }
  .gridcontenido > div {
    background-color: #ffffff;
    padding: 5px;
    text-align: justify;
    text-justify: center;
    border-radius: 3px;
  
    /* border: 5px solid black; */
  }
  .paddingfilas {
    background-color: #424242;
    display: grid;
    row-gap: 2px;
    padding: 3px;
  }
  .gridtitulo {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(1, auto);
    gap: 1px;
    background-color: #424242;
  }
  .gridtitulo > div {
    background-color: #cfd8dc;
    padding: 5px;
    text-align: center;
    text-justify: center;
    border-radius: 3px;
  
    /* border: 5px solid black; */
  }
  .gridparejas {
    display: grid;
    grid-template-columns: 2fr 3fr;
    grid-template-rows: repeat(1, 2);
    background-color: #424242;
    align-items: center;
  
    /* border: 5px solid black; */
  }
  .gridtrio {
    display: grid;
    grid-template-columns: 2fr 3fr;
    grid-template-rows: repeat(1, 2);
    background-color: #424242;
    align-items: center;
  
    /* border: 5px solid black; */
  }
  
  .dato {
    text-align: left;
    text-justify: center;
  }
  .negrita {
    font-weight: bold;
  }
  .subtitulonegrita {
    font-weight: 500;
  }
  .imagenfirma {
  
    align-self: center;
  }
  
  @media (max-width: 767px) {
    .margentotal{
    margin-left: 0%;
    margin-right: 0%;
  }
    
    .gridencabezado  > div{
    height: 46px;
  }
    .lafirma {
      height: 100%;
      width: 100%;
    }
  
    .gridfirma {
      display: grid;
      grid-template-columns: 3fr 3fr;
      grid-template-rows: repeat(1, auto);
      background-color: #424242;
      align-items: center;
  
      /* border: 5px solid black; */
    }
  
    .nombrefirma {
      text-align: center;
      text-justify: justify;
      font-size: 10px;
  font-family: 'Times New Roman';
    }
    .miimagen {
      content: url("../imagenes/logo/BS.png");
      width: 50%;
      height: 100%;
      border-radius: 3px;
    }
    .nombrereporte {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 100%;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(1, 100%);
      grid-template-rows: repeat(auto, auto);
      gap: 1px;
    }
    .principal {
      padding: 0px;
      background-color: #424242;
      grid-column-start: 1;
      grid-column-end: 2;
    }
    .imgagenfirma {
  align-self: center;
    }
  
    .gridparejas {
      display: grid;
      grid-template-columns: 3fr 3fr;
      grid-template-rows: repeat(1, auto);
      background-color: #424242;
      align-items: center;
  
      /* border: 5px solid black; */
    }
    .paddingfilas {
      background-color: #424242;
      display: grid;
      row-gap: 2px;
      padding: 2px;
      -webkit-print-color-adjust: exact;
    }
  }
  @media print {
  
    .lafirma {
      height: 100%;
      width: 100%;
      
    }
    .gridfirma {
      display: grid;
      grid-template-columns: repeat(1, auto);
      grid-template-rows: repeat(1, auto);
      background-color: #424242;
      align-items: center;
  
      /* border: 5px solid black; */
    }
  
    .nombrefirma {
      text-align: center;
      text-justify: justify;
    }
    .miimagen {
      background: url("../imagenes/logo/biosystems.jpg");
    }
    
  }
  </style>
  