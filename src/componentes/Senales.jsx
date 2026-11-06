import { useMemo, useState } from "react";

const BOE_IMG = "https://www.boe.es/datos/imagenes/disp/2025/145/12199_15781073_";
const BOE = "https://www.boe.es/eli/es/rd/2003/11/21/1428/con";
const PDF_DGT = "https://sede.dgt.gob.es/export/sites/dgt/.galleries/permisos-de-conducir/certificacion-aptitud-profesores-formacion-vial/2025/Manual-I-Normas-y-Senales-2025.pdf";

const familias = [
  { nombre:"Advertencia de peligro", codigo:"P", descripcion:"Advierten de la proximidad y naturaleza de un peligro difícil de percibir a tiempo.", paginas:[3,4,5,6,7,8,9,10,11] },
  { nombre:"Prioridad", codigo:"R · prioridad", descripcion:"Regulan la prioridad en intersecciones y pasos estrechos.", paginas:[13,14] },
  { nombre:"Prohibición de entrada", codigo:"R · entrada", descripcion:"Prohíben el acceso a los usuarios a quienes se dirigen.", paginas:[16,17,18,19] },
  { nombre:"Restricción de paso", codigo:"R · restricción", descripcion:"Limitan el acceso según las características del vehículo o de la carga.", paginas:[21] },
  { nombre:"Otras prohibiciones y restricciones", codigo:"R · prohibición", descripcion:"Prohíben o limitan maniobras, velocidades y comportamientos concretos.", paginas:[23,24,25,26,27] },
  { nombre:"Obligación", codigo:"R · obligación", descripcion:"Imponen una dirección, sentido, velocidad o uso obligatorio.", paginas:[29,30,31,32,33,34] },
  { nombre:"Fin de prohibición, restricción u obligación", codigo:"R · fin", descripcion:"Indican dónde dejan de aplicarse determinadas restricciones u obligaciones.", paginas:[36,37,38] },
  { nombre:"Indicaciones generales", codigo:"S · general", descripcion:"Informan de situaciones, condiciones y servicios generales de la vía.", paginas:[40,41,42,43,44,45,46,47,48,49,50,51,52] },
  { nombre:"Señales de carriles", codigo:"S · carriles", descripcion:"Informan sobre los carriles disponibles, su sentido, uso y cambios.", paginas:[54,55,56,57,58,59,60,61,62,63] },
  { nombre:"Señales de servicio", codigo:"S · servicio", descripcion:"Identifican servicios de posible utilidad para los usuarios.", paginas:[65,66,67,68,69] },
  { nombre:"Preseñalización", codigo:"S · preseñalización", descripcion:"Anticipan salidas, enlaces, destinos y decisiones que deben tomarse.", paginas:[71,72,73,74,75,76,77,78,79] },
  { nombre:"Dirección", codigo:"S · dirección", descripcion:"Indican la dirección que debe seguirse para alcanzar destinos.", paginas:[81,82,83,84,85,86,87,88,89,90] },
  { nombre:"Identificación de carreteras", codigo:"S · carreteras", descripcion:"Identifican las carreteras y los itinerarios a los que pertenecen.", paginas:[92,93] },
  { nombre:"Localización", codigo:"S · localización", descripcion:"Señalan el comienzo, final o situación de lugares y puntos de referencia.", paginas:[95,96,97,98,99,100] },
  { nombre:"Confirmación", codigo:"S · confirmación", descripcion:"Confirman destinos y distancias durante el recorrido.", paginas:[102] },
  { nombre:"Uso específico en poblado", codigo:"S · poblado", descripcion:"Informan sobre zonas y situaciones específicas de las vías urbanas.", paginas:[104,105] },
  { nombre:"Paneles complementarios", codigo:"S · paneles", descripcion:"Matizan, precisan o amplían el significado de otra señal.", paginas:[107,108,109,110] },
  { nombre:"Otras señales", codigo:"S · otras", descripcion:"Incluyen señales específicas adicionales recogidas en el catálogo.", paginas:[112,113,114,115,116,117] }
];

const novedades2025 = [
  ["P-1e","Tramo con accesos directos","Advierte de un tramo con varios accesos directos a la vía."],
  ["P-20c","Paso para peatones y ciclistas","Advierte de un paso compartido por peatones y ciclistas."],
  ["P-24a","Paso de animales en libertad","Advierte de la posible presencia de animales en libertad."],
  ["P-33","Visibilidad reducida","Advierte de un tramo en el que la visibilidad está reducida."],
  ["P-35","Trenzado","Advierte de una zona donde se cruzan trayectorias de entrada y salida."],
  ["R-2","Detención obligatoria o STOP · diseño actualizado","Se actualiza el diseño de la señal de detención obligatoria."],
  ["R-118","Entrada prohibida a VMP","Prohíbe la entrada a vehículos de movilidad personal."],
  ["R-120","Entrada prohibida según distintivo ambiental","Restringe el acceso según el distintivo ambiental del vehículo."],
  ["S-1c","Carretera 2+1","Indica el principio de una carretera 2+1."],
  ["S-14a a S-14f","Pasos superiores e inferiores para peatones","Variantes de señalización de pasos peatonales superiores e inferiores."],
  ["S-47","Zona de coexistencia","Indica una zona de coexistencia con prioridad peatonal y velocidad limitada."],
  ["S-51b","Carril reservado para VAO","Indica un carril reservado a vehículos de alta ocupación."],
  ["S-63b","Bifurcación en calzada de tres carriles","Indica la bifurcación de una calzada de tres carriles."],
  ["S-70","Confluencia de un carril","Advierte o informa de la confluencia de un carril."],
  ["S-105a a S-105f","Estación de servicio","Variantes de estación de servicio, incluidos los servicios de recarga."],
  ["S-940","Limitaciones de velocidad en España","Recuerda las limitaciones genéricas de velocidad en España."],
  ["S-892","Vigilancia por medios automáticos","Informa de vigilancia mediante dispositivos automáticos."],
  ["S-991g","Control de velocidad por medios aéreos","Informa de control de velocidad por medios aéreos."],
  ["S-992","Distancia mínima entre vehículos","Indica la distancia mínima que debe mantenerse entre vehículos."]
];

const elementos = [
  { nombre:"Hito kilométrico", grupo:"Referencias y localización", texto:"Elemento de señalización situado junto a la carretera que identifica la vía y el punto kilométrico. Permite ubicar con precisión un accidente, una avería, una incidencia o una actuación de conservación.", imagen:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hito_kilom%C3%A9trico_antiguo.jpg/1280px-Hito_kilom%C3%A9trico_antiguo.jpg", fuente:"https://commons.wikimedia.org/wiki/File:Hito_kilom%C3%A9trico_antiguo.jpg", credito:"Juan Emilio Prades Bel · CC BY-SA 4.0" },
  { nombre:"Hito de arista", grupo:"Balizamiento", texto:"Poste de balizamiento colocado en el borde de la carretera. Delimita visualmente la plataforma y ayuda a seguir el trazado, especialmente de noche o con meteorología adversa. No es un hito kilométrico: no indica el PK.", imagen:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Hito_de_arista_Junta_de_Extremadura.JPG/500px-Hito_de_arista_Junta_de_Extremadura.JPG", fuente:"https://commons.wikimedia.org/wiki/File:Hito_de_arista_Junta_de_Extremadura.JPG", credito:"Junta de Extremadura · Wikimedia Commons" },
  { nombre:"Bionda o barrera metálica", grupo:"Contención y seguridad", texto:"Sistema de contención longitudinal formado habitualmente por una banda metálica ondulada fijada a postes. Está diseñado para contener o reconducir vehículos que impactan contra ella. Su comportamiento depende del tipo de sistema, terminales, anclajes y condiciones de instalación.", imagen:"https://imagenes.20minutos.es/files/image_1920_1080/uploads/imagenes/2024/10/03/quitamiedos-carretera.jpeg", fuente:"https://www.20minutos.es/motor/movilidad/quitamiedos-carreteras-espana-funcionamiento-5639958/", credito:"20minutos · fotografía de barrera metálica" },
  { nombre:"Barrera rígida de hormigón", grupo:"Contención y seguridad", texto:"Sistema de contención de perfil rígido, normalmente de hormigón, empleado para separar sentidos de circulación, proteger obstáculos o contener vehículos. Puede formar parte de una mediana o situarse en márgenes.", imagen:"https://www.givasa.com/productos/img/P1010252.jpg", fuente:"https://www.givasa.com/es/nemasco/productos/ficha/61", credito:"GIVASA · sistema de contención" },
  { nombre:"Calzada", grupo:"Partes de la vía", texto:"Parte de la vía destinada a la circulación de vehículos. Puede comprender uno o varios carriles y uno o varios sentidos. No debe confundirse con la plataforma completa, que puede incluir arcenes y otros elementos.", imagen:"https://avilared.com/upload/images/12_2023/2778_autopista.jpg", fuente:"https://avilared.com/art/73897/peajes-en-la-autopista-ap-51-ap-6-conexion-con-avila", credito:"Fotografía de autopista" },
  { nombre:"Carril", grupo:"Partes de la vía", texto:"Banda longitudinal en que puede estar subdividida la calzada, con anchura suficiente para permitir la circulación de una fila de automóviles que no sean motocicletas. Puede estar delimitado por marcas viales o no.", imagen:"https://img2.huffingtonpost.es/uploads/2023/07/23/imagen-de-archivo-de-la-dgt.jpeg", fuente:"https://www.huffingtonpost.es/sociedad/actualizan-ranking-carreteras-mas-peligrosas-nueva-mas-accidentes-espana.html", credito:"Fotografía de vía multicarril" },
  { nombre:"Arcén", grupo:"Partes de la vía", texto:"Franja longitudinal afirmada contigua a la calzada, no destinada al uso ordinario de automóviles salvo en los supuestos previstos. Puede ser transitable o no, y su anchura y estado condicionan su utilización.", imagen:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Arc%C3%A9n.jpeg/960px-Arc%C3%A9n.jpeg", fuente:"https://commons.wikimedia.org/wiki/File:Arc%C3%A9n.jpeg", credito:"Alejandro Navarro López · Dominio público" },
  { nombre:"Mediana", grupo:"Partes de la vía", texto:"Franja longitudinal situada entre dos plataformas separadas, no destinada a la circulación. Separa calzadas o sentidos y puede estar ajardinada, pavimentada o equipada con barreras de seguridad.", imagen:"https://www.arlita.es/sites/arlita.es/files/styles/webp/public/2021-03/autoviaA315.jpg.webp?itok=JwPbNqQT", fuente:"https://www.arlita.es/obras/autovia-a31-en-bonete", credito:"Arlita · fotografía de mediana y separadores" },
  { nombre:"Cuneta", grupo:"Drenaje y explanación", texto:"Zanja longitudinal, normalmente situada al pie del talud o junto al borde exterior de la plataforma, que recoge y evacua el agua de escorrentía para evitar acumulaciones y daños en el firme.", imagen:"https://imot.dip-badajoz.es/storage/media/Galerias/CARRETERAS/4vr-ba022.jpg", fuente:"https://imot.dip-badajoz.es/carreteras", credito:"Diputación de Badajoz · carretera BA-022" },
  { nombre:"Camino vecinal o rural", grupo:"Tipos de vía", texto:"Vía de ámbito local que suele comunicar fincas, explotaciones, diseminados o pequeños núcleos. La denominación no determina por sí sola quién es su titular ni su régimen jurídico: debe comprobarse el inventario de caminos y la señalización aplicable.", imagen:"https://cdn.thinkwebcontent.com/property/18692/9376492/20251108201334/w1200h800/s1600x1200/x-266465140.jpg", fuente:"https://www.thinkspain.com/nl/vastgoed-te-koop-spanje/9376492", credito:"Fotografía de camino rural en España" },
  { nombre:"Baliza / hito de balizamiento", grupo:"Balizamiento", texto:"Dispositivo de guía visual que advierte, delimita o canaliza la circulación. Puede ser fijo o temporal y utilizar elementos retrorreflectantes para mejorar la percepción del trazado y de los obstáculos.", imagen:"https://densl.com/wp-content/uploads/2024/06/zzz-1024x1024.jpg", fuente:"https://densl.com/producto/hitos-de-arista-3-modelos-2-reflectancias/", credito:"DENS L · hito de arista reflectante" },
  { nombre:"Glorieta", grupo:"Intersecciones y enlaces", texto:"Intersección organizada alrededor de una isleta central, en la que los vehículos circulan en sentido giratorio alrededor de ella. La prioridad y la elección de carril se determinan por la señalización y las normas de circulación.", imagen:"https://4.bp.blogspot.com/-CzeWp57IC9A/TmpOW3hY_PI/AAAAAAAAAG4/pCMsEioWBOE/s1600/Glorieta%2B%2522Los%2BMonjes%2522.jpg", fuente:"https://lascarreterasdeextremadura.blogspot.com/2011/09/de-glorietas-y-rotondas.html", credito:"Las carreteras de Extremadura · glorieta de Plasencia" },
  { nombre:"Pórtico de señalización", grupo:"Señalización e instalaciones", texto:"Estructura transversal que soporta carteles, señales o equipos sobre uno o varios carriles. Permite ofrecer información de orientación, regulación o gestión del tráfico con antelación.", imagen:"https://image.ondacero.es/clipping/cmsimages01/2022/08/08/BC80A340-6DEA-42A9-B513-F8FD7715C8D5/96.jpg?crop=1200%2C675%2Cx0%2Cy47&format=webply&height=675&optimize=low&width=1200", fuente:"https://www.ondacero.es/emisoras/andalucia/sevilla/noticias/nuevos-cortes-trafico-nocturnos-acceso-capital-obra-refuerzo-firme-92_2022080862f0c6e7142d7b000184bc02.html", credito:"Fotografía de señalización sobre la calzada" },
  { nombre:"Talud de desmonte", grupo:"Drenaje y explanación", texto:"Superficie inclinada que resulta de excavar el terreno para alojar la carretera. Su estabilidad, drenaje y protección frente a desprendimientos son relevantes para la seguridad vial y la conservación.", imagen:"https://s2.wklcdn.com/image_45/1360160/89978718/58766786Master.jpg", fuente:"https://es.wikiloc.com/rutas-coche/itinerario-geologico-y-minero-entre-alcaniz-caspe-y-las-inmediaciones-de-maella-89978710", credito:"Fotografía de talud en carretera" },
  { nombre:"Túnel y boca de túnel", grupo:"Obras de fábrica", texto:"Obra subterránea que permite el paso de la carretera a través de un obstáculo natural o construido. Sus accesos pueden contar con señalización específica, iluminación, ventilación, apartaderos y salidas de emergencia.", imagen:"https://www.cadenadesuministro.es/uploads/s1/24/66/15/3/tunel-despenaperros-a-4-carretera.jpeg", fuente:"https://www.cadenadesuministro.es/transporte-carretera/afectaciones-trafico-por-obras-en-varias-vias-principales-granada-jaen_1515765_102.html", credito:"Fotografía de túneles de Despeñaperros" },
  { nombre:"Drenaje transversal", grupo:"Drenaje y explanación", texto:"Obra o dispositivo que permite evacuar el agua de un lado al otro de la carretera, por ejemplo mediante caños, marcos o pequeñas obras de paso. Evita que el agua se acumule sobre la plataforma o erosione los márgenes.", imagen:"https://img.europapress.es/fotoweb/fotonoticia_20220104152828_1200.jpg", fuente:"https://www.europapress.es/esandalucia/cordoba/noticia-junta-mejora-carretera-3131-318-badolatosa-termino-municipal-lucena-cordoba-20220104152828.html", credito:"Europa Press · mejora de drenaje en carretera" },
  { nombre:"Conos de balizamiento", grupo:"Balizamiento", texto:"Dispositivos temporales de color muy visible que delimitan una zona de obras, un obstáculo o un itinerario provisional. La línea real o imaginaria que forman no debe franquearse cuando así lo establece la señalización circunstancial.", imagen:"https://imagenes.autobild.es/files/image_1920_1080/uploads/imagenes/2023/05/29/68cd85642af30.jpeg", fuente:"https://www.autobild.es/noticias/cuatro-normas-obligatorias-dgt-cuando-hay-obras-carretera-1100163", credito:"AutoBild · fotografía de obras y conos en carretera" },
  { nombre:"Balizamiento de obras", grupo:"Balizamiento", texto:"Conjunto temporal de conos, paneles, señales y luces que canaliza el tráfico y separa a los usuarios de la zona de trabajo. Su disposición debe permitir una transición clara y segura hacia el itinerario habilitado.", imagen:"https://static.motor.es/cdn-cgi/image/fit%3Dcover%2Cwidth%3D694/fotos-diccionario/2020/08/senales-balizamiento_1597146735.jpg", fuente:"https://www.motor.es/que-es/senales-balizamiento", credito:"Motor.es · fotografía de balizamiento en carretera" },
  { nombre:"Panel direccional provisional", grupo:"Balizamiento", texto:"Panel temporal con franjas o chevrones que indica el sentido que debe seguirse y prohíbe el paso por el lado que cierra. Se utiliza en obras, desvíos y situaciones circunstanciales.", imagen:"https://estaticosgn-cdn.deia.eus/clip/9eb3c7eb-316f-4969-86c8-d941a356a5ab_16-9-discover-aspect-ratio_default_0.jpg", fuente:"https://www.noticiasdegipuzkoa.eus/sociedad/2024/11/13/ap-1-cerrara-eskoriatza-luko-8925901.amp.html", credito:"Noticias de Gipuzkoa · fotografía de paneles y conos en la AP-1" },
  { nombre:"Semáforo portátil de obras", grupo:"Señalización e instalaciones", texto:"Equipo móvil que regula alternativamente el paso cuando una obra ocupa total o parcialmente la calzada y solo puede habilitarse un sentido cada vez. Debe respetarse junto con el resto de la señalización provisional.", imagen:"https://img.auto-motor-und-sport.de/_/bg%3AFFFFFF/f%3Abest/rt%3Afill/w%3A2200/plain/2215935.jpg", fuente:"https://www.auto-motor-und-sport.de/verkehr/achtung-spanien-urlauber-grosse-radaraktion-bis-zum-wochenende/", credito:"Auto Motor und Sport · fotografía de semáforo portátil" },
  { nombre:"Marcas viales longitudinales", grupo:"Señalización horizontal", texto:"Líneas pintadas sobre el pavimento que ordenan los movimientos, separan sentidos o carriles y delimitan zonas de circulación. Pueden ser continuas, discontinuas o combinadas; su significado depende del tipo y disposición.", imagen:"https://www.arlita.es/sites/arlita.es/files/styles/webp/public/2021-03/autoviaA315.jpg.webp?itok=JwPbNqQT", fuente:"https://www.arlita.es/obras/autovia-a31-en-bonete", credito:"Arlita · fotografía de marcas y delimitación de carriles" },
  { nombre:"Paso superior / pasarela", grupo:"Obras de fábrica", texto:"Estructura que permite que una vía, camino o itinerario peatonal cruce por encima de otra infraestructura. En carretera puede ser un paso superior para vehículos o una pasarela peatonal.", imagen:"https://canpipa.com/wp-content/uploads/2019/01/18_Vilatenim_Ctra_acabada_3667.jpg", fuente:"https://www.canpipa.com/es/portfolio-items/vilatenim-2/", credito:"Can Pipa · fotografía de paso superior en la C-260" },
  { nombre:"Barrera modular de hormigón", grupo:"Contención y seguridad", texto:"Elemento prefabricado de hormigón que separa tráficos o protege zonas de trabajo y obstáculos. Puede emplearse como sistema de contención o delimitación, según su diseño, unión y condiciones de instalación.", imagen:"https://www.givasa.com/productos/img/P1010252.jpg", fuente:"https://www.givasa.com/es/nemasco/productos/ficha/61", credito:"GIVASA · fotografía de sistema de contención" },
  { nombre:"Carretera con carriles y arcenes", grupo:"Partes de la vía", texto:"Ejemplo de sección de carretera donde pueden reconocerse los carriles, las líneas de separación, el borde de calzada y los márgenes. La configuración concreta depende de la clase de vía.", imagen:"https://avilared.com/upload/images/12_2023/2778_autopista.jpg", fuente:"https://avilared.com/art/73897/peajes-en-la-autopista-ap-51-ap-6-conexion-con-avila", credito:"Ávilared · fotografía de carretera multicarril" },
];

const gruposElementos = ["Todos", ...new Set(elementos.map((e) => e.grupo))];

function IlustracionElemento({ nombre }) {
  const n = nombre.toLowerCase();
  let dibujo = "road";
  if (n.includes("bionda") || n.includes("barrera") || n.includes("quitamiedos")) dibujo = "guardrail";
  else if (n.includes("hito") || n.includes("baliza")) dibujo = "post";
  else if (n.includes("cono") || n.includes("obras") || n.includes("panel direccional")) dibujo = "works";
  else if (n.includes("cuneta") || n.includes("drenaje")) dibujo = "drain";
  else if (n.includes("túnel")) dibujo = "tunnel";
  else if (n.includes("glorieta")) dibujo = "roundabout";
  else if (n.includes("pórtico")) dibujo = "gantry";
  else if (n.includes("talud")) dibujo = "slope";
  else if (n.includes("paso superior") || n.includes("pasarela")) dibujo = "bridge";
  else if (n.includes("camino")) dibujo = "rural";
  else if (n.includes("semáforo")) dibujo = "trafficlight";
  return <svg viewBox="0 0 180 100" role="img" aria-label={`Representación de ${nombre}`}>
    <rect x="3" y="3" width="174" height="94" rx="12" fill="#26352c"/>
    <path d="M8 82H172" stroke="#718276" strokeWidth="2" strokeDasharray="5 5"/>
    {dibujo==="road" && <><path d="M52 94 75 12h30l23 82" fill="#59665e"/><path d="M90 88V70m0-12V43m0-12V20" stroke="#f4f0d9" strokeWidth="3" strokeDasharray="7 5"/><path d="M48 94 72 12m60 82-24-82" stroke="#dce4dc" strokeWidth="2"/></>}
    {dibujo==="guardrail" && <><path d="M22 38h136v17H22z" fill="#b8c4bd" stroke="#edf2ed" strokeWidth="2"/><path d="M35 55v28m36-28v28m36-28v28m36-28v28" stroke="#aab7af" strokeWidth="5"/><path d="M22 46h136" stroke="#6d7c72" strokeWidth="3"/></>}
    {dibujo==="post" && <><path d="M83 88V19h14v69" fill="#e7e9df"/><rect x="78" y="20" width="24" height="23" rx="3" fill="#f5f4e9" stroke="#d7dfd7" strokeWidth="2"/><path d="M82 25h16v13H82z" fill="#d84b3e"/><path d="M88 55h4m-4 10h4" stroke="#6a7a70" strokeWidth="3"/></>}
    {dibujo==="works" && <><path d="m58 81 15-48h28l16 48z" fill="#f07832" stroke="#f7f1df" strokeWidth="3"/><path d="M66 58h44" stroke="#fff" strokeWidth="8"/><path d="M36 80h108" stroke="#d9e1d8" strokeWidth="4"/><path d="M130 26h24v20h-24z" fill="#f4eee0" stroke="#d84b3e" strokeWidth="3"/></>}
    {dibujo==="drain" && <><path d="M20 42h140v43H20z" fill="#64736a"/><path d="M20 55h140" stroke="#d5e0d7" strokeWidth="3"/><path d="M30 62 65 82h50l35-20" fill="none" stroke="#6bb5d5" strokeWidth="5"/><path d="M75 31h30v15H75z" fill="#aebbb1"/></>}
    {dibujo==="tunnel" && <><path d="M28 88V53a62 62 0 0 1 124 0v35z" fill="#69776e"/><path d="M51 88V54a39 39 0 0 1 78 0v34z" fill="#18221c"/><path d="M78 72h24" stroke="#f4f0d9" strokeWidth="3" strokeDasharray="5 4"/></>}
    {dibujo==="roundabout" && <><circle cx="90" cy="53" r="35" fill="#65736a"/><circle cx="90" cy="53" r="15" fill="#8aa27e" stroke="#dce6d8" strokeWidth="2"/><path d="M90 12v15m0 52v9M49 53H31m118 0h-18" stroke="#f5f1dc" strokeWidth="5"/><path d="m84 20 6-8 6 8m28 27 8 6-8 6" fill="none" stroke="#f5f1dc" strokeWidth="3"/></>}
    {dibujo==="gantry" && <><path d="M32 88V19h8v69m100 0V19h8v69M36 25h108" stroke="#bac7bd" strokeWidth="6" fill="none"/><rect x="48" y="27" width="84" height="30" rx="3" fill="#246b50" stroke="#dce8dc" strokeWidth="2"/><path d="M68 42h43m-7-7 7 7-7 7" stroke="white" strokeWidth="3" fill="none"/></>}
    {dibujo==="slope" && <><path d="M20 84 82 20l78 64z" fill="#8b987e"/><path d="M20 84h140" stroke="#d9e1d8" strokeWidth="3"/><path d="m82 20 10 64" stroke="#d4dfd2" strokeWidth="2" strokeDasharray="4 4"/></>}
    {dibujo==="bridge" && <><path d="M18 65h144" stroke="#c3d0c6" strokeWidth="8"/><path d="M34 65V38m112 27V38M34 38h112" stroke="#aebdb2" strokeWidth="5"/><path d="M47 65v22m86-22v22" stroke="#aebdb2" strokeWidth="5"/><path d="M18 86h144" stroke="#6b7b70" strokeWidth="3"/></>}
    {dibujo==="rural" && <><path d="M62 96 78 16h24l16 80" fill="#8b8875"/><path d="M90 91V72m0-14V43" stroke="#eee9d5" strokeWidth="3" strokeDasharray="6 5"/><path d="M18 74 45 48m117 26-27-26" stroke="#7c9a70" strokeWidth="9"/></>}
    {dibujo==="trafficlight" && <><rect x="73" y="12" width="34" height="68" rx="8" fill="#242b27" stroke="#d1d9d2" strokeWidth="2"/><circle cx="90" cy="27" r="7" fill="#e54e43"/><circle cx="90" cy="46" r="7" fill="#e8bd48"/><circle cx="90" cy="65" r="7" fill="#6cba76"/><path d="M90 80v12" stroke="#c7d2c8" strokeWidth="5"/></>}
  </svg>;
}

export default function Senales({ volver }) {
  const [pestana, setPestana] = useState("senales");
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [abiertas, setAbiertas] = useState([]);
  const [novedades, setNovedades] = useState(false);
  const familiasFiltradas = useMemo(() => familias.filter(f => (filtro === "Todos" || f.codigo.startsWith(filtro)) && (f.nombre+" "+f.codigo+" "+f.descripcion).toLowerCase().includes(busqueda.toLowerCase().trim())), [filtro,busqueda]);
  const elementosFiltrados = useMemo(() => elementos.filter(e => (filtro === "Todos" || e.grupo === filtro) && (e.nombre+" "+e.texto+" "+e.grupo).toLowerCase().includes(busqueda.toLowerCase().trim())), [filtro,busqueda]);
  const gruposElementos = ["Todos", ...new Set(elementos.map(e=>e.grupo))];
  const categoriasSenales = ["Todos","P","R","S"];
  const toggle = (nombre) => setAbiertas(actual => actual.includes(nombre) ? actual.filter(x=>x!==nombre) : [...actual,nombre]);
  return <section className="senales-modulo">
    <div className="senales-cabecera">
      <div><span className="etiqueta-seccion">MÓDULO 03 · HERRAMIENTAS</span><h1>Señales y elementos de la vía</h1><p>Consulta rápida por nombre, código o categoría.</p></div>
      <button className="boton boton--secundario" onClick={volver}>← Herramientas</button>
    </div>
    <div className="senales-pestanas">
      <button className={pestana==="senales"?"activa":""} onClick={()=>{setPestana("senales");setFiltro("Todos");setBusqueda("");}}>Señales de tráfico</button>
      <button className={pestana==="elementos"?"activa":""} onClick={()=>{setPestana("elementos");setFiltro("Todos");setBusqueda("");}}>Elementos de la vía</button>
    </div>
    <div className="senales-controles">
      <input type="search" value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder={pestana==="senales"?"Buscar señal, código o categoría…":"Buscar elemento de la vía…"} aria-label="Buscar en el catálogo"/>
      <select value={filtro} onChange={e=>setFiltro(e.target.value)} aria-label="Filtrar por categoría">
        {(pestana==="senales"?categoriasSenales:gruposElementos).map(g=><option key={g} value={g}>{g==="P"?"Advertencia de peligro":g==="R"?"Reglamentación":g==="S"?"Indicación":g}</option>)}
      </select>
    </div>
    {pestana==="senales" ? <>
      <p className="senales-contador">{familiasFiltradas.length} grupos de señales · selecciona un grupo para consultar sus láminas</p>
      <div className="familias-grid">{familiasFiltradas.map(f=><article className="familia-senal" key={f.nombre}>
        <button className="familia-senal__cabecera" onClick={()=>toggle(f.nombre)} aria-expanded={abiertas.includes(f.nombre)}><span><small>{f.codigo}</small><strong>{f.nombre}</strong><em>{f.descripcion}</em><i>{f.paginas.length} lámina{f.paginas.length===1?"":"s"} oficiales</i></span><b>{abiertas.includes(f.nombre)?"−":"+"}</b></button>
        {abiertas.includes(f.nombre) && <div className="familia-senal__laminas">{f.paginas.map((n,i)=><a className="lamina-senal" key={n} href={BOE_IMG+n+".png"} target="_blank" rel="noreferrer"><img src={BOE_IMG+n+".png"} alt={`Catálogo oficial 2025: ${f.nombre}, lámina ${i+1}`} loading="lazy"/><span>Ampliar lámina {i+1} ↗</span></a>)}</div>}
      </article>)}</div>
      <section className="novedades-compactas"><button className="novedades-compactas__boton" onClick={()=>setNovedades(!novedades)}>{novedades?"Ocultar novedades 2025":"Consultar novedades del catálogo 2025"} <span>{novedades?"−":"+"}</span></button>
      {novedades && <div className="novedades-grid">{novedades2025.map(([codigo,nombre,detalle])=><article key={codigo}><strong>{codigo}</strong><b>{nombre}</b><p>{detalle}</p></article>)}</div>}</section>
    </> : <>
      <p className="senales-contador">{elementosFiltrados.length} elementos</p>
      <div className="elementos-grid elementos-grid--compactos">{elementosFiltrados.map(e=><article className="elemento-foto elemento-foto--compacto" key={e.nombre}>
        <div className="elemento-foto__miniatura"><IlustracionElemento nombre={e.nombre}/></div>
        <div className="elemento-foto__texto"><small>{e.grupo}</small><h2>{e.nombre}</h2><p>{e.texto}</p><a href={e.fuente} target="_blank" rel="noreferrer">Ver referencia ↗</a></div>
      </article>)}</div>
    </>}
    <details className="senales-informacion-final"><summary>Información del catálogo, normativa y fuentes</summary>
      <div className="senales-informacion-final__contenido">
        <section><strong>Catálogo oficial de señales verticales · edición 2025</strong><p>Las familias agrupan las láminas oficiales publicadas con la actualización del catálogo. Dentro de cada grupo puedes ampliar las láminas, que contienen las señales, sus códigos y diseños. El buscador localiza grupos por denominación, código de familia o descripción; no busca todavía cada código individual dentro de una lámina.</p><p>El catálogo vertical se organiza en señales de advertencia de peligro (P), reglamentación (R) e indicación (S). Además existen señales de los agentes, señalización circunstancial y de obras, balizamiento, semáforos y marcas viales.</p></section>
        <section><strong>Elementos de la vía</strong><p>Las miniaturas son representaciones esquemáticas para identificar visualmente cada concepto; no sustituyen fotografías de una instalación concreta ni planos técnicos.</p></section>
        <div className="senales-fuentes"><a href={BOE} target="_blank" rel="noreferrer">BOE · Reglamento General de Circulación y catálogo 2025 ↗</a><a href={PDF_DGT} target="_blank" rel="noreferrer">DGT · Manual de normas y señales 2025 ↗</a></div>
      </div>
    </details>
  </section>;
}
