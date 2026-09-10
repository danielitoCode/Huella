<script lang="ts">
  import { irAPublica } from '../../lib/stores/router';
  import { TERMINOS_VERSION } from '../../lib/types';

  const secciones = [
    { id: 'que-es', titulo: '1. Qué es Huella' },
    { id: 'servicio', titulo: '2. Naturaleza del servicio' },
    { id: 'no-hace', titulo: '3. Lo que Huella no hace' },
    { id: 'obligaciones', titulo: '4. Obligaciones del solicitante' },
    { id: 'datos', titulo: '5. Datos personales y confidencialidad' },
    { id: 'kyc', titulo: '6. Verificación de identidad' },
    { id: 'estados', titulo: '7. Estados del expediente' },
    { id: 'responsabilidad', titulo: '8. Limitación de responsabilidad' },
    { id: 'modificaciones', titulo: '9. Modificaciones' },
    { id: 'contacto', titulo: '10. Contacto' },
  ];

  function irASeccion(id: string) {
    if (typeof document === 'undefined') return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<div class="page-header">
  <div class="header-container">
    <span class="eyebrow">Marco de uso</span>
    <h1 class="serif-title">Términos y condiciones</h1>
    <p class="header-desc">
      Este documento explica, en lenguaje claro, qué ofrece Huella, qué puedes esperar al registrar una
      solicitud y qué límites tiene el servicio. Léelo antes de aceptar en el formulario de búsqueda.
    </p>
    <p class="version">Versión {TERMINOS_VERSION} · Documento orientativo de uso de la plataforma</p>
  </div>
</div>

<div class="legal-layout">
  <aside class="toc card" aria-label="Índice de contenidos">
    <span class="toc-title">Contenido</span>
    <nav class="toc-nav">
      {#each secciones as s}
        <button type="button" class="toc-link" onclick={() => irASeccion(s.id)}>{s.titulo}</button>
      {/each}
    </nav>
  </aside>

  <article class="legal card glass-panel">
    <div class="callout callout-gold">
      <strong>En una frase:</strong> Huella es una plataforma de
      <em>averiguación sobre familiares</em>. Si el caso lo permite, también puede orientarte sobre la
      <em>prima o compensación</em>, pero <strong>no procesa pagos</strong> ni garantiza un resultado o un cobro.
    </div>

    <section id="que-es">
      <h2>1. Qué es Huella</h2>
      <p>
        <strong>Huella</strong> es un espacio digital pensado para familias —en especial vinculadas a
        ciudadanos cubanos— que necesitan <strong>saber qué ocurrió con un ser querido</strong> en contextos
        de conflicto en el exterior (por ejemplo, personas que participaron como combatientes o
        contratados en escenarios de guerra).
      </p>
      <p>
        En muchos de estos casos las familias están en la isla, tienen poca representación formal en el
        extranjero y carecen de canales claros para enterarse del estado de la persona (si vive, si
        falleció, o si hay información documental disponible). Huella existe para
        <strong>ordenar esa búsqueda</strong>: recibir la solicitud, asignarla a un operador, investigar
        con las fuentes a las que se pueda acceder y devolver información a través de un expediente con
        código de seguimiento.
      </p>
      <p>
        El <strong>objetivo principal del producto</strong> es la
        <strong>averiguación y el seguimiento del caso</strong>. De forma
        <strong>complementaria</strong>, cuando la investigación apunta a un fallecimiento y el marco del
        caso lo permite, el equipo puede <strong>orientar</strong> a la familia sobre la posibilidad de
        gestionar una <strong>prima o compensación</strong> a la que pudieran tener derecho como
        beneficiarios. Esa orientación no es un trámite bancario dentro de la web ni una promesa de
        dinero.
      </p>
      <p>
        Huella <strong>no es un banco, una aseguradora, un despacho de abogados ni un intermediario de
        pagos en línea</strong>. Cualquier movimiento de fondos relacionado con primas, si existiera, se
        gestiona <strong>fuera de esta aplicación</strong>, por los canales que el equipo indique en su
        momento y conforme a las reglas del lugar correspondiente.
      </p>
    </section>

    <section id="servicio">
      <h2>2. Naturaleza del servicio</h2>
      <p>
        Al usar Huella inicias un <strong>expediente de averiguación</strong>. El flujo habitual es el
        siguiente:
      </p>
      <ol class="steps-list">
        <li>
          <strong>Registro de la solicitud.</strong> Completas el formulario con tus datos de contacto y
          la información de la persona que buscas. No necesitas crear una cuenta de usuario para el área
          pública: el identificador del caso es el <strong>código de seguimiento</strong> que recibes al
          finalizar.
        </li>
        <li>
          <strong>Revisión por un operador.</strong> Un miembro del equipo toma el expediente, revisa la
          información y puede pedirte aclaraciones o documentación adicional.
        </li>
        <li>
          <strong>Verificación de identidad (cuando corresponda).</strong> Antes de profundizar en datos
          sensibles o en gestiones posteriores, el equipo puede pedirte confirmar que eres quien dices ser
          (verificación digital o asistida). Esto protege a las familias frente a impostores.
        </li>
        <li>
          <strong>Investigación.</strong> El equipo intenta esclarecer el estado de la persona buscada con
          la información disponible. El resultado puede ser confirmación de vida, de fallecimiento, o la
          imposibilidad de concluir con certeza con las fuentes alcanzables.
        </li>
        <li>
          <strong>Orientación sobre prima (solo si aplica).</strong> Si el caso se orienta a un
          fallecimiento y existen vías de compensación, el equipo puede explicar pasos posibles. Eso no
          implica que Huella cobre, retiene o transfiera la prima dentro de la plataforma.
        </li>
        <li>
          <strong>Cierre o cancelación.</strong> El expediente se marca como cerrado cuando el proceso se
          completa de forma satisfactoria según el equipo, o como cancelado si no puede o no debe
          continuar.
        </li>
      </ol>
      <div class="callout callout-muted">
        <strong>Importante:</strong> los plazos dependen de la complejidad del caso, de la respuesta de
        terceros y de la conectividad. Huella <strong>no garantiza fechas fijas</strong> ni un resultado
        concreto (incluido el cobro de cualquier compensación).
      </div>
    </section>

    <section id="no-hace">
      <h2>3. Lo que Huella no hace</h2>
      <p>Para evitar malentendidos, dejamos explícito lo que esta plataforma <strong>no</strong> ofrece:</p>
      <ul>
        <li>
          <strong>No es representación oficial.</strong> Huella no actúa necesariamente en nombre de
          autoridades militares, gobiernos, consulados o tribunales. Es un servicio de gestión e
          investigación privada de solicitudes.
        </li>
        <li>
          <strong>No sustituye asesoría legal profesional.</strong> Los textos del sitio y los mensajes del
          equipo son orientativos. Si necesitas un abogado o un trámite formal ante una institución, debes
          gestionarlo por los canales correspondientes.
        </li>
        <li>
          <strong>No garantiza localización, restos ni prima.</strong> Haremos lo posible por investigar,
          pero hay casos sin respuesta clara, sin acceso a fuentes, o sin derecho a compensación.
        </li>
        <li>
          <strong>No procesa ni custodia pagos de primas en esta web.</strong> No verás un “checkout” ni un
          saldo de dinero de la prima dentro de Huella.
        </li>
        <li>
          <strong>No es una red social ni un chat entre usuarios.</strong> El canal es el expediente y el
          contacto que el equipo habilite contigo.
        </li>
        <li>
          <strong>No ofrece servicio de emergencia médica o policial.</strong> Si hay riesgo inmediato para
          una persona, contacta a las autoridades competentes de tu jurisdicción.
        </li>
      </ul>
    </section>

    <section id="obligaciones">
      <h2>4. Obligaciones del solicitante</h2>
      <p>
        Al registrar una solicitud y aceptar estos términos, te comprometes a lo siguiente:
      </p>
      <ul>
        <li>
          <strong>Veracidad.</strong> Facilitar datos ciertos y lo más completos posible (nombres,
          parentesco, fechas, lugares). Los datos falsos o deliberadamente engañosos pueden llevar a la
          cancelación del expediente.
        </li>
        <li>
          <strong>Interés legítimo.</strong> Usar la plataforma solo si tienes un vínculo justificado con
          la persona buscada (familiar u otra relación que el equipo pueda considerar válida). No uses
          Huella para espiar, hostigar o suplantar a terceros.
        </li>
        <li>
          <strong>Custodia del código de seguimiento.</strong> Ese código es la llave del expediente en el
          área pública. Quien lo conozca podrá ver el estado y los mensajes públicos del caso. No lo
          publiques en redes abiertas.
        </li>
        <li>
          <strong>Colaboración en la verificación.</strong> Si se te pide confirmar identidad (Didit u otra
          vía asistida, útil también con baja conectividad), debes hacerlo de buena fe y en un tiempo
          razonable. La falta de verificación puede detener el avance del expediente.
        </li>
        <li>
          <strong>Uso respetuoso.</strong> No sobrecargar el sistema con solicitudes repetidas sin motivo,
          ni utilizar el servicio para actividades ilícitas.
        </li>
      </ul>
    </section>

    <section id="datos">
      <h2>5. Datos personales y confidencialidad</h2>
      <p>
        Tratamos los datos que nos envías para <strong>abrir y gestionar el expediente</strong>,
        contactarte, verificar identidad cuando proceda y dejar constancia del proceso. Entre esos datos
        pueden figurar: nombre y correo del solicitante, teléfono opcional, datos de la persona buscada,
        descripción del caso y, en su momento, resultados de verificación.
      </p>
      <p>
        Distinguimos dos tipos de información en el expediente:
      </p>
      <ul>
        <li>
          <strong>Notas internas del operador:</strong> solo las ve el equipo. Sirven para registrar
          hallazgos, incidencias o detalles operativos. <strong>No aparecen</strong> en la consulta
          pública de seguimiento.
        </li>
        <li>
          <strong>Mensaje público:</strong> texto que el equipo puede dejar visible para quien consulte el
          código de seguimiento (por ejemplo, “estamos atendiendo tu caso” o una actualización breve).
        </li>
      </ul>
      <p>
        Como el seguimiento público se basa en el <strong>código</strong> (no en un login de familiar),
        asume que ese código es información sensible. Si alguien más lo obtiene, podría ver el estado y
        los mensajes públicos del expediente.
      </p>
      <p>
        No vendemos tus datos con fines publicitarios. El acceso del equipo se limita a lo necesario para
        operar el servicio. Pueden existir proveedores técnicos (alojamiento, base de datos, verificación
        de identidad) que tratan datos bajo instrucciones de Huella y con medidas de seguridad razonables.
      </p>
    </section>

    <section id="kyc">
      <h2>6. Verificación de identidad</h2>
      <p>
        En la etapa <strong>Atendido · no verificado</strong> (y cuando el equipo lo considere necesario),
        puede pedirse una verificación de identidad del solicitante. El objetivo es doble:
      </p>
      <ul>
        <li>Confirmar que quien reclama información o gestiones es realmente el familiar o interesado.</li>
        <li>Reducir el riesgo de fraudes, suplantaciones o usos indebidos de datos de personas vulnerables.</li>
      </ul>
      <p>
        La verificación puede hacerse de dos formas complementarias:
      </p>
      <ul>
        <li>
          <strong>Digital</strong> (por ejemplo, mediante un proveedor como Didit), siguiendo el enlace que
          el equipo facilite en el seguimiento o por correo.
        </li>
        <li>
          <strong>Asistida</strong>, cuando hay baja conectividad u otras limitaciones: el operador indica
          un canal de contacto y un procedimiento alternativo.
        </li>
      </ul>
      <p>
        Si la verificación no se completa, se rechaza o resulta inconsistente, el equipo puede mantener el
        expediente detenido, solicitar más pruebas o cancelarlo. Eso no es un juicio moral sobre ti: es una
        medida de protección del proceso y de las familias.
      </p>
    </section>

    <section id="estados">
      <h2>7. Estados del expediente</h2>
      <p>
        Para que sepas qué significa cada etapa al consultar tu código, usamos estos estados:
      </p>
      <div class="estados-grid">
        <div class="estado-card">
          <span class="estado-name">Pendiente</span>
          <p>
            La solicitud quedó registrada correctamente y espera a que un operador la tome. Aún no hay
            investigación activa asignada.
          </p>
        </div>
        <div class="estado-card">
          <span class="estado-name">Atendido · no verificado</span>
          <p>
            Un operador ya está a cargo del caso. Falta confirmar la identidad del solicitante (digital o
            asistida) antes de avanzar en profundidad.
          </p>
        </div>
        <div class="estado-card">
          <span class="estado-name">Verificado</span>
          <p>
            La identidad quedó confirmada. El equipo continúa con la investigación documental y las
            gestiones que correspondan al caso.
          </p>
        </div>
        <div class="estado-card">
          <span class="estado-name">Cerrado</span>
          <p>
            El proceso se completó de forma satisfactoria según el criterio del equipo (averiguación y, si
            aplicó, la orientación asociada). Es el cierre de <strong>éxito operativo</strong>, no una
            promesa de cobro de prima.
          </p>
        </div>
        <div class="estado-card estado-card-alert">
          <span class="estado-name">Cancelada</span>
          <p>
            El expediente no continúa (datos insuficientes, falta de colaboración, duplicado, uso indebido
            u otras causas). <strong>No es lo mismo que un cierre exitoso.</strong>
          </p>
        </div>
      </div>
    </section>

    <section id="responsabilidad">
      <h2>8. Limitación de responsabilidad</h2>
      <p>
        Huella pone a disposición un canal ordenado de solicitud e investigación. Aun así, el resultado
        depende de factores que no controlamos del todo: fuentes externas, demoras de terceros, calidad de
        los datos que tú aportas, restricciones de acceso a información y condiciones de conectividad en
        distintos países.
      </p>
      <p>
        En la medida permitida por la ley aplicable, Huella y su equipo <strong>no responden</strong> por:
      </p>
      <ul>
        <li>Daños indirectos o lucro cesante derivados del uso o la imposibilidad de usar la plataforma.</li>
        <li>Expectativas de cobro de primas o compensaciones que no se materialicen.</li>
        <li>Información incompleta, desactualizada o errónea aportada por el solicitante o por terceros.</li>
        <li>Decisiones que tomes basándote únicamente en mensajes orientativos del expediente.</li>
        <li>Interrupciones técnicas, mantenimiento o límites del plan de infraestructura utilizado.</li>
      </ul>
      <p>
        Nada en estos términos busca excluir responsabilidades que la ley no permita limitar. Si una
        cláusula no pudiera aplicarse en tu jurisdicción, el resto del documento seguirá vigente.
      </p>
    </section>

    <section id="modificaciones">
      <h2>9. Modificaciones</h2>
      <p>
        Podemos actualizar estos términos cuando cambie el servicio, la normativa o la forma de operar.
        Cada versión lleva una <strong>fecha de versión</strong> visible al inicio de esta página
        (actualmente <strong>{TERMINOS_VERSION}</strong>).
      </p>
      <p>
        Si registras una solicitud nueva después de una actualización, se considerará que aceptas la
        versión vigente en ese momento (mediante el checkbox del formulario). Para expedientes ya abiertos,
        el equipo podrá informar cambios relevantes cuando afecten de forma material el tratamiento del
        caso.
      </p>
      <p>
        Te recomendamos revisar esta página de vez en cuando, sobre todo antes de enviar una nueva
        solicitud.
      </p>
    </section>

    <section id="contacto">
      <h2>10. Contacto</h2>
      <p>
        Para dudas sobre un <strong>expediente en curso</strong>, el canal principal es el
        <strong>seguimiento con tu código</strong> y, cuando el equipo lo active, el correo o teléfono que
        aparezcan en el panel de verificación asistida o en los mensajes públicos del caso.
      </p>
      <p>
        Para cuestiones generales sobre el funcionamiento de la plataforma (no sobre un caso concreto),
        utiliza los datos de contacto publicados en el sitio o los que el equipo de Huella comunique de
        forma oficial.
      </p>
      <p>
        Al aceptar estos términos en el formulario de solicitud, confirmas que has leído este documento,
        que comprendes el alcance de la averiguación y el carácter orientativo de cualquier gestión sobre
        prima, y que deseas iniciar el expediente bajo estas condiciones.
      </p>
    </section>

    <div class="actions">
      <button type="button" class="btn btn-secondary" onclick={() => irAPublica('home')}>Volver al inicio</button>
      <button type="button" class="btn btn-gold" onclick={() => irAPublica('solicitud')}>
        Ir a registrar solicitud
      </button>
    </div>
  </article>
</div>

<style>
  .page-header {
    background: var(--color-obsidian-navy);
    color: #fff;
    padding: 3rem 1.5rem 2.75rem;
    text-align: center;
    border-bottom: 1px solid var(--color-border-gold);
  }
  .header-container {
    max-width: 720px;
    margin: 0 auto;
  }
  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.5rem;
  }
  .header-desc {
    color: #a4b4c0;
    margin: 0.75rem 0 0.5rem;
    line-height: 1.55;
  }
  .version {
    margin: 0;
    font-size: 0.8rem;
    color: var(--gold);
    opacity: 0.9;
  }

  .legal-layout {
    max-width: 1100px;
    margin: 2rem auto 4rem;
    padding: 0 1.25rem;
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .toc {
    position: sticky;
    top: 5.5rem;
    padding: 1rem 0.85rem;
  }
  .toc-title {
    display: block;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.65rem;
    padding: 0 0.35rem;
  }
  .toc-nav {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .toc-link {
    background: transparent;
    border: none;
    text-align: left;
    font-size: 0.78rem;
    line-height: 1.35;
    color: var(--text-muted);
    padding: 0.4rem 0.45rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .toc-link:hover {
    color: var(--gold);
    background: rgba(198, 164, 106, 0.08);
  }

  .legal {
    padding: 2rem 1.85rem 2.25rem;
  }
  .legal section {
    margin-bottom: 2.25rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    scroll-margin-top: 5.5rem;
  }
  .legal section:last-of-type {
    border-bottom: none;
    margin-bottom: 1rem;
  }
  .legal h2 {
    font-size: 1.2rem;
    margin: 0 0 0.85rem;
    color: var(--text-h);
  }
  .legal p,
  .legal li {
    line-height: 1.65;
    color: var(--text);
    font-size: 0.95rem;
  }
  .legal p {
    margin: 0 0 0.85rem;
  }
  .legal ul,
  .legal ol {
    margin: 0.35rem 0 0.85rem;
    padding-left: 1.25rem;
  }
  .legal li {
    margin-bottom: 0.55rem;
  }

  .steps-list {
    list-style: decimal;
  }
  .steps-list li {
    margin-bottom: 0.75rem;
  }

  .callout {
    border-radius: var(--radius);
    padding: 1rem 1.15rem;
    margin: 0 0 1.5rem;
    font-size: 0.92rem;
    line-height: 1.55;
  }
  .callout-gold {
    background: rgba(198, 164, 106, 0.1);
    border: 1px solid rgba(198, 164, 106, 0.35);
  }
  .callout-muted {
    background: var(--surface-muted);
    border: 1px solid var(--border);
    margin-top: 1rem;
  }

  .estados-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.85rem;
    margin-top: 0.75rem;
  }
  .estado-card {
    padding: 1rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface-muted);
  }
  .estado-card p {
    margin: 0;
    font-size: 0.88rem;
  }
  .estado-name {
    display: block;
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--gold);
    margin-bottom: 0.4rem;
  }
  .estado-card-alert {
    border-color: rgba(217, 56, 58, 0.35);
    background: rgba(217, 56, 58, 0.06);
  }
  .estado-card-alert .estado-name {
    color: var(--color-alert, #b84c4c);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }

  @media (max-width: 900px) {
    .legal-layout {
      grid-template-columns: 1fr;
    }
    .toc {
      position: static;
    }
    .toc-nav {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.25rem;
    }
  }

  @media (max-width: 520px) {
    .toc-nav {
      grid-template-columns: 1fr;
    }
    .legal {
      padding: 1.35rem 1.1rem;
    }
  }
</style>
