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
  ["R-118","Entrada prohibida a VMP","Prohíbe la entrada a vehículos de movilidad personal."],
  ["R-120","Entrada prohibida según distintivo ambiental","Restringe el acceso según el distintivo ambiental del vehículo."],
  ["S-1c","Carretera 2+1","Indica el principio de una carretera 2+1."],
  ["S-47","Zona de coexistencia","Indica una zona de coexistencia con prioridad peatonal y velocidad limitada."],
  ["S-51b","Carril reservado para VAO","Indica un carril reservado a vehículos de alta ocupación."],
  ["S-63b","Bifurcación en calzada de tres carriles","Indica la bifurcación de una calzada de tres carriles."],
  ["S-70","Confluencia de un carril","Advierte o informa de la confluencia de un carril."],
  ["S-892","Vigilancia por medios automáticos","Informa de vigilancia mediante dispositivos automáticos."],
  ["S-991g","Control de velocidad por medios aéreos","Informa de control de velocidad por medios aéreos."],
  ["S-992","Distancia mínima entre vehículos","Indica la distancia mínima que debe mantenerse entre vehículos."]
];

const elementos = [
  { nombre:"Hito kilométrico", grupo:"Referencias y localización", texto:"Elemento de señalización situado junto a la carretera que identifica la vía y el punto kilométrico. Permite ubicar con precisión un accidente, una avería, una incidencia o una actuación de conservación.", imagen:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hito_kilom%C3%A9trico_antiguo.jpg/1280px-Hito_kilom%C3%A9trico_antiguo.jpg", fuente:"https://commons.wikimedia.org/wiki/File:Hito_kilom%C3%A9trico_antiguo.jpg", credito:"Juan Emilio Prades Bel · CC BY-SA 4.0" },
  { nombre:"Hito de arista", grupo:"Balizamiento", texto:"Poste de balizamiento colocado en el borde de la carretera. Delimita visualmente la plataforma y ayuda a seguir el trazado, especialmente de noche o con meteorología adversa. No es un hito kilométrico: no indica el PK.", imagen:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Hito_de_arista_Junta_de_Extremadura.JPG/500px-Hito_de_arista_Junta_de_Extremadura.JPG", fuente:"https://commons.wikimedia.org/wiki/File:Hito_de_arista_Junta_de_Extremadura.JPG", credito:"Junta de Extremadura · Wikimedia Commons" },
  { nombre:"Bionda o barrera metálica", grupo:"Contención y seguridad", texto:"Sistema de contención longitudinal formado habitualmente por una banda metálica ondulada fijada a postes. Está diseñado para contener o reconducir vehículos que impactan contra ella. Su comportamiento depende del tipo de sistema, terminales, anclajes y condiciones de instalación.", imagen:"https://i.servimg.com/u/f69/13/29/42/60/01022011.jpg", fuente:"https://motoclubsanandres.forosactivos.net/t547-instalacion-de-doble-bionda-en-las-curvas-de-la-le414-despues-de-el-ferral-del-bernesga", credito:"Fotografía de instalación de doble bionda" },
  { nombre:"Barrera rígida de hormigón", grupo:"Contención y seguridad", texto:"Sistema de contención de perfil rígido, normalmente de hormigón, empleado para separar sentidos de circulación, proteger obstáculos o contener vehículos. Puede formar parte de una mediana o situarse en márgenes.", imagen:"https://www.givasa.com/productos/img/P1010252.jpg", fuente:"https://www.givasa.com/es/nemasco/productos/ficha/61", credito:"GIVASA · sistema de contención" },
  { nombre:"Calzada", grupo:"Partes de la vía", texto:"Parte de la vía destinada a la circulación de vehículos. Puede comprender uno o varios carriles y uno o varios sentidos. No debe confundirse con la plataforma completa, que puede incluir arcenes y otros elementos.", imagen:"https://avilared.com/upload/images/12_2023/2778_autopista.jpg", fuente:"https://avilared.com/art/73897/peajes-en-la-autopista-ap-51-ap-6-conexion-con-avila", credito:"Fotografía de autopista" },
  { nombre:"Carril", grupo:"Partes de la vía", texto:"Banda longitudinal en que puede estar subdividida la calzada, con anchura suficiente para permitir la circulación de una fila de automóviles que no sean motocicletas. Puede estar delimitado por marcas viales o no.", imagen:"https://img2.huffingtonpost.es/uploads/2023/07/23/imagen-de-archivo-de-la-dgt.jpeg", fuente:"https://www.huffingtonpost.es/sociedad/actualizan-ranking-carreteras-mas-peligrosas-nueva-mas-accidentes-espana.html", credito:"Fotografía de vía multicarril" },
  { nombre:"Arcén", grupo:"Partes de la vía", texto:"Franja longitudinal afirmada contigua a la calzada, no destinada al uso ordinario de automóviles salvo en los supuestos previstos. Puede ser transitable o no, y su anchura y estado condicionan su utilización.", imagen:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Arc%C3%A9n.jpeg/960px-Arc%C3%A9n.jpeg", fuente:"https://commons.wikimedia.org/wiki/File:Arc%C3%A9n.jpeg", credito:"Alejandro Navarro López · Dominio público" },
  { nombre:"Mediana", grupo:"Partes de la vía", texto:"Franja longitudinal situada entre dos plataformas separadas, no destinada a la circulación. Separa calzadas o sentidos y puede estar ajardinada, pavimentada o equipada con barreras de seguridad.", imagen:"https://img2.huffingtonpost.es/uploads/2023/07/23/imagen-de-archivo-de-la-dgt.jpeg", fuente:"https://www.huffingtonpost.es/sociedad/actualizan-ranking-carreteras-mas-peligrosas-nueva-mas-accidentes-espana.html", credito:"Fotografía de autovía con mediana" },
  { nombre:"Cuneta", grupo:"Drenaje y explanación", texto:"Zanja longitudinal, normalmente situada al pie del talud o junto al borde exterior de la plataforma, que recoge y evacua el agua de escorrentía para evitar acumulaciones y daños en el firme.", imagen:"https://imot.dip-badajoz.es/storage/media/Galerias/CARRETERAS/4vr-ba022.jpg", fuente:"https://imot.dip-badajoz.es/carreteras", credito:"Diputación de Badajoz · carretera BA-022" },
  { nombre:"Camino vecinal o rural", grupo:"Tipos de vía", texto:"Vía de ámbito local que suele comunicar fincas, explotaciones, diseminados o pequeños núcleos. La denominación no determina por sí sola quién es su titular ni su régimen jurídico: debe comprobarse el inventario de caminos y la señalización aplicable.", imagen:"https://cdn.thinkwebcontent.com/property/18692/9376492/20251108201334/w1200h800/s1600x1200/x-266465140.jpg", fuente:"https://www.thinkspain.com/nl/vastgoed-te-koop-spanje/9376492", credito:"Fotografía de camino rural en España" },
  { nombre:"Baliza / hito de balizamiento", grupo:"Balizamiento", texto:"Dispositivo de guía visual que advierte, delimita o canaliza la circulación. Puede ser fijo o temporal y utilizar elementos retrorreflectantes para mejorar la percepción del trazado y de los obstáculos.", imagen:"https://densl.com/wp-content/uploads/2024/06/zzz-1024x1024.jpg", fuente:"https://densl.com/producto/hitos-de-arista-3-modelos-2-reflectancias/", credito:"DENS L · hito de arista reflectante" },
  { nombre:"Glorieta", grupo:"Intersecciones y enlaces", texto:"Intersección organizada alrededor de una isleta central, en la que los vehículos circulan en sentido giratorio alrededor de ella. La prioridad y la elección de carril se determinan por la señalización y las normas de circulación.", imagen:"https://4.bp.blogspot.com/-CzeWp57IC9A/TmpOW3hY_PI/AAAAAAAAAG4/pCMsEioWBOE/s1600/Glorieta%2B%2522Los%2BMonjes%2522.jpg", fuente:"https://lascarreterasdeextremadura.blogspot.com/2011/09/de-glorietas-y-rotondas.html", credito:"Las carreteras de Extremadura · glorieta de Plasencia" },
  { nombre:"Pórtico de señalización", grupo:"Señalización e instalaciones", texto:"Estructura transversal que soporta carteles, señales o equipos sobre uno o varios carriles. Permite ofrecer información de orientación, regulación o gestión del tráfico con antelación.", imagen:"https://image.ondacero.es/clipping/cmsimages01/2022/08/08/BC80A340-6DEA-42A9-B513-F8FD7715C8D5/96.jpg?crop=1200%2C675%2Cx0%2Cy47&format=webply&height=675&optimize=low&width=1200", fuente:"https://www.ondacero.es/emisoras/andalucia/sevilla/noticias/nuevos-cortes-trafico-nocturnos-acceso-capital-obra-refuerzo-firme-92_2022080862f0c6e7142d7b000184bc02.html", credito:"Fotografía de señalización sobre la calzada" },
  { nombre:"Talud de desmonte", grupo:"Drenaje y explanación", texto:"Superficie inclinada que resulta de excavar el terreno para alojar la carretera. Su estabilidad, drenaje y protección frente a desprendimientos son relevantes para la seguridad vial y la conservación.", imagen:"https://s2.wklcdn.com/image_45/1360160/89978718/58766786Master.jpg", fuente:"https://es.wikiloc.com/rutas-coche/itinerario-geologico-y-minero-entre-alcaniz-caspe-y-las-inmediaciones-de-maella-89978710", credito:"Fotografía de talud en carretera" },
  { nombre:"Túnel y boca de túnel", grupo:"Obras de fábrica", texto:"Obra subterránea que permite el paso de la carretera a través de un obstáculo natural o construido. Sus accesos pueden contar con señalización específica, iluminación, ventilación, apartaderos y salidas de emergencia.", imagen:"https://www.cadenadesuministro.es/uploads/s1/24/66/15/3/tunel-despenaperros-a-4-carretera.jpeg", fuente:"https://www.cadenadesuministro.es/transporte-carretera/afectaciones-trafico-por-obras-en-varias-vias-principales-granada-jaen_1515765_102.html", credito:"Fotografía de túneles de Despeñaperros" },
  { nombre:"Drenaje transversal", grupo:"Drenaje y explanación", texto:"Obra o dispositivo que permite evacuar el agua de un lado al otro de la carretera, por ejemplo mediante caños, marcos o pequeñas obras de paso. Evita que el agua se acumule sobre la plataforma o erosione los márgenes.", imagen:"https://img.europapress.es/fotoweb/fotonoticia_20220104152828_1200.jpg", fuente:"https://www.europapress.es/esandalucia/cordoba/noticia-junta-mejora-carretera-3131-318-badolatosa-termino-municipal-lucena-cordoba-20220104152828.html", credito:"Europa Press · mejora de drenaje en carretera" }
];

const gruposElementos = ["Todos", ...new Set(elementos.map((e) => e.grupo))];

export default function Senales({ volver }) {
  const [pestana, setPestana] = useState("senales");
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [abiertas, setAbiertas] = useState([]);
  const [novedades, setNovedades] = useState(false);
  const elementosFiltrados = useMemo(() => elementos.filter(e => (filtro === "Todos" || e.grupo === filtro) && (e.nombre + " " + e.texto + " " + e.grupo).toLowerCase().includes(busqueda.toLowerCase())), [filtro,busqueda]);
  const toggle = (nombre) => setAbiertas(actual => actual.includes(nombre) ? actual.filter(x=>x!==nombre) : [...actual,nombre]);
  return <section className="senales-modulo">
    <div className="senales-cabecera">
      <div><span className="etiqueta-seccion">MÓDULO 03 · HERRAMIENTAS</span><h1>Señales y elementos de la vía</h1><p>Catálogo oficial de señalización y guía fotográfica de infraestructura viaria.</p></div>
      <button className="boton boton--secundario" onClick={volver}>← Herramientas</button>
    </div>
    <div className="senales-pestanas">
      <button className={pestana==="senales"?"activa":""} onClick={()=>setPestana("senales")}>Señales de tráfico</button>
      <button className={pestana==="elementos"?"activa":""} onClick={()=>setPestana("elementos")}>Elementos de la vía</button>
    </div>
    {pestana === "senales" ? <div className="catalogo-senales">
      <div className="catalogo-intro"><strong>Catálogo oficial de señales verticales · edición 2025</strong><p>Las fichas visuales siguientes reproducen las láminas oficiales del BOE: cada lámina reúne las señales de su familia con su código, denominación y significado.</p><span>18 familias · láminas oficiales del Real Decreto 465/2025</span></div>
      <div className="catalogo-acciones"><button className={novedades?"activa":""} onClick={()=>setNovedades(!novedades)}>{novedades?"Ocultar":"Ver"} novedades del catálogo 2025</button><a href={BOE} target="_blank" rel="noreferrer">Abrir normativa en el BOE ↗</a><a href={PDF_DGT} target="_blank" rel="noreferrer">Manual de normas y señales DGT 2025 ↗</a></div>
      {novedades && <section className="novedades-senales"><h2>Novedades destacadas de 2025</h2><div className="novedades-grid">{novedades2025.map(([codigo,nombre,detalle])=><article key={codigo}><strong>{codigo}</strong><b>{nombre}</b><p>{detalle}</p></article>)}</div><p className="senales-nota">La actualización de 2025 también incorpora variantes y modifica diseños. Para evitar confusiones, consulta las láminas completas del BOE y distingue el nuevo catálogo de las señales anteriores que todavía pueden encontrarse instaladas.</p></section>}
      <div className="familias-grid">{familias.map(f=><article className="familia-senal" key={f.nombre}>
        <button className="familia-senal__cabecera" onClick={()=>toggle(f.nombre)} aria-expanded={abiertas.includes(f.nombre)}><span><small>{f.codigo}</small><strong>{f.nombre}</strong><em>{f.descripcion}</em><i>{f.paginas.length} lámina{f.paginas.length===1?"":"s"} oficiales</i></span><b>{abiertas.includes(f.nombre)?"−":"+"}</b></button>
        {abiertas.includes(f.nombre) && <div className="familia-senal__laminas">{f.paginas.map((n,i)=><a className="lamina-senal" key={n} href={BOE_IMG+n+".png"} target="_blank" rel="noreferrer"><img src={BOE_IMG+n+".png"} alt={`Catálogo oficial 2025: ${f.nombre}, lámina ${i+1}`} loading="lazy"/><span>Ampliar lámina {i+1} ↗</span></a>)}</div>}
      </article>)}</div>
      <div className="catalogo-otros"><h2>Otras formas de señalización</h2><p>El anexo I también recoge señales y órdenes de los agentes, señalización circunstancial y de obras, balizamiento, semáforos y marcas viales.</p><a href={BOE} target="_blank" rel="noreferrer">Consultar el anexo I completo del Reglamento General de Circulación ↗</a></div>
    </div> : <div className="elementos-via">
      <div className="elementos-intro"><strong>Guía fotográfica de infraestructura viaria</strong><p>Fotografías reales para reconocer los elementos sobre el terreno. Pulsa una ficha para ampliar su explicación.</p></div>
      <div className="senales-controles"><input type="search" value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar elemento (ej. bionda, cuneta, arcén…)" aria-label="Buscar elemento"/><select value={filtro} onChange={e=>setFiltro(e.target.value)} aria-label="Filtrar elementos">{gruposElementos.map(g=><option key={g}>{g}</option>)}</select></div>
      <p className="senales-contador">{elementosFiltrados.length} elementos en esta selección</p>
      <div className="elementos-grid">{elementosFiltrados.map(e=><article className="elemento-foto" key={e.nombre}><a className="elemento-foto__imagen" href={e.fuente} target="_blank" rel="noreferrer"><img src={e.imagen} alt={e.nombre} loading="lazy"/><span>Ver procedencia ↗</span></a><div className="elemento-foto__texto"><small>{e.grupo}</small><h2>{e.nombre}</h2><p>{e.texto}</p><a href={e.fuente} target="_blank" rel="noreferrer">Fuente de la fotografía · {e.credito}</a></div></article>)}</div>
      <p className="senales-nota">Las fotografías se muestran como material de identificación. La descripción técnica y la aplicación de cada elemento deben interpretarse conforme a la normativa y a las características concretas de la vía.</p>
    </div>}
    <div className="senales-fuentes"><strong>Fuentes principales</strong><a href={BOE} target="_blank" rel="noreferrer">BOE · Reglamento General de Circulación y catálogo 2025</a><a href={PDF_DGT} target="_blank" rel="noreferrer">DGT · Manual de normas y señales 2025</a></div>
  </section>;
}
