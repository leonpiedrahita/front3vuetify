<template>
    <ImprimirReporteComponent/>
  </template>
  
  <script>

import ImprimirReporteComponent from "@/components/ImprimirReporteComponent.vue";
  export default {
    components: {
    
    ImprimirReporteComponent
},
    mounted() {
      setTimeout(() => {  this.imprimir(); },2000);
         
    },
    methods: {
      
      imprimir() {
        var printContents = document.getElementById("body").innerHTML;
        
  
        document.body.innerHTML = printContents;
  
        window.print();
        
      },
      
    },
  };
  </script>
  <style >
  
  .grid :deep(div)  {
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
  .gridencabezado :deep(div)  {
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
  gap: 1px;
  background-color: #424242;

 /* 1.2em es un valor típico de line-height */
}
  .gridcontenido :deep(div)  {
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
  .gridtitulo :deep(div)  {
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
    grid-template-rows: repeat(1, auto);
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
  .miimagen {
    width: 70%;
    height: 100%;
  }
  .miimagen {
    content: url("../imagenes/logo/biosystems.jpg");
    border-radius: 3px;
  }
  
  @media (max-width: 767px) {
  
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
    .miimagen {
    width: 70%;
    height: 100%;
  }
    .grid > div {
      background-color: #ffffff;
      padding: 2px;
      /* border: 5px solid black; */
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
      -webkit-print-color-adjust: exact;
    }
    .titulo {
      grid-column: 1;
      font-size: 10px;
  font-family: 'Times New Roman';
    }
    .gridencabezado {
      display: grid;
  
      grid-template-columns: 2fr 4fr 3fr;
      grid-template-rows: repeat(1, auto);
      gap: 1px;
      background-color: #424242;
    }
    .gridencabezado :deep(div)  {
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
      font-size: 100%;
    }
    .gridcontenido {
  display: grid;
  grid-template-columns: repeat(1, auto);
  gap: 1px;
  background-color: #424242;

  /* clave */
  min-height: calc(1.2em * 6); /* 1.2em es un valor típico de line-height */
}
    .gridcontenido :deep(div)  {
      background-color: #ffffff;
      padding: 2px;
      text-align: justify;
      text-justify: center;
      border-radius: 3px;
  
      /* border: 5px solid black; */
    }
    .paddingfilas {
      background-color: #424242;
      display: grid;
      row-gap: 2px;
      padding: 5px;
      -webkit-print-color-adjust: exact;
    }
    .gridtitulo {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: repeat(1, auto);
      gap: 1px;
      background-color: #424242;
    }
    .gridtitulo :deep(div)  {
      background-color: #cfd8dc;
      padding: 1px;
      text-align: center;
      text-justify: center;
      border-radius: 3px;
  
      /* border: 5px solid black; */
    }
    .gridparejas {
      display: grid;
      grid-template-columns: 3fr 4fr;
      grid-template-rows: repeat(1, auto);
      background-color: #424242;
      align-items: center;
  
      /* border: 5px solid black; */
    }
    .dato {
      text-align: left;
      text-justify: center;
      font-size: 10px;
  font-family: 'Times New Roman';
    }
    .negrita {
      font-weight: bold;
    }
    .subtitulonegrita {
      font-weight: 500;
      font-size: 10px;
  font-family: 'Times New Roman';
    }
   
    .miimagen {
      content: url("../imagenes/logo/biosystems.jpg");
    }
  }
  </style>
  