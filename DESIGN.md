# HUELLA — DESIGN.md

> **Dirección de diseño:** Contemporary Memorial Technology
> **Concepto central:** Memorial digital contemporáneo · Archivo · Homenaje · Investigación · Legado

---

# 1. VISIÓN GENERAL

## ¿Qué es HUella visualmente?

HUella no debe sentirse como:

* una web de guerra;
* una plataforma gubernamental;
* una ONG tradicional;
* un portal de noticias;
* un CRM;
* un dashboard administrativo tradicional;
* una aplicación SaaS con temática humanitaria.

HUella debe sentirse como un espacio digital creado con respeto hacia personas reales.

La experiencia visual debe situarse en la intersección entre:

> **MEMORIAL · ARCHIVO · HOMENAJE · INVESTIGACIÓN · LEGADO**

La primera impresión debe transmitir que el visitante está entrando en una institución digital contemporánea.

Una experiencia que combina:

* la solemnidad de un memorial;
* la composición de una galería contemporánea;
* la sofisticación de una revista editorial;
* la rigurosidad de un archivo documental;
* la claridad y eficiencia de un producto tecnológico moderno.

---

# 2. PRINCIPIO FUNDAMENTAL

## Las personas no son registros

La plataforma puede trabajar con:

* solicitudes;
* identidades;
* documentos;
* evidencias;
* cronologías;
* investigaciones;
* resultados.

Pero visualmente nunca debe reducir una historia humana a un simple registro administrativo.

La arquitectura visual debe recordar constantemente:

> **DETRÁS DE CADA BÚSQUEDA HAY UNA PERSONA.
> DETRÁS DE CADA PERSONA HAY UNA HISTORIA.
> DETRÁS DE CADA HISTORIA HAY ALGUIEN QUE ESPERA RESPUESTAS.**

---

# 3. PERSONALIDAD DE MARCA

HUella debe sentirse:

* solemne;
* elegante;
* humana;
* contemporánea;
* rigurosa;
* silenciosamente tecnológica;
* memorable;
* respetuosa.

HUella no debe sentirse:

* dramática;
* sensacionalista;
* militar;
* propagandística;
* excesivamente institucional;
* burocrática;
* funeraria;
* fría;
* clínica;
* tecnológica de forma agresiva.

---

# 4. CONCEPTO DE DISEÑO

## Contemporary Memorial Technology

La identidad visual se compone aproximadamente de:

### 35% — Memorial contemporáneo

Representado mediante:

* espacio;
* silencio visual;
* composición;
* ausencia;
* memoria;
* homenaje;
* elementos abstractos;
* profundidad emocional.

---

### 25% — Editorial premium

Representado mediante:

* tipografía expresiva;
* titulares grandes;
* composiciones asimétricas;
* mucho espacio negativo;
* jerarquías visuales fuertes;
* ritmo de lectura;
* números y textos como elementos gráficos.

---

### 25% — Producto tecnológico moderno

Representado mediante:

* UX clara;
* componentes reutilizables;
* formularios simples;
* navegación intuitiva;
* estados visibles;
* responsive design;
* accesibilidad;
* progresión clara.

---

### 15% — Archivo documental

Representado mediante:

* códigos de expediente;
* fechas;
* líneas;
* referencias;
* documentos;
* evidencias;
* trazabilidad;
* numeración;
* sellos abstractos;
* metadatos.

---

# 5. IDEA CENTRAL DE IDENTIDAD

## Una huella que se convierte en camino

La identidad conceptual de HUella debe representar:

```text
IDENTIDAD
    ↓
RASTRO
    ↓
BÚSQUEDA
    ↓
RECORRIDO
    ↓
RESPUESTA
```

La plataforma no debe representar únicamente una búsqueda.

Debe representar un recorrido.

Este concepto puede aparecer en múltiples niveles:

* logotipo;
* líneas decorativas;
* timelines;
* animaciones;
* navegación;
* progreso de expedientes;
* transiciones entre secciones.

---

# 6. PALETA DE COLOR

## Obsidian Navy

```css
--color-obsidian-navy: #071923;
```

Color principal emocional de HUella.

Representa:

* profundidad;
* memoria;
* solemnidad;
* confianza;
* silencio;
* investigación.

Usar principalmente en:

* hero;
* navegación;
* footer;
* secciones de homenaje;
* fondos editoriales oscuros.

---

## Midnight Blue

```css
--color-midnight-blue: #102A38;
```

Color secundario oscuro.

Usar para:

* superficies;
* capas;
* cards oscuras;
* paneles;
* fondos secundarios dentro de zonas oscuras.

Debe crear profundidad sin utilizar negro puro.

---

## Memorial Gold

```css
--color-memorial-gold: #C6A46A;
```

Color de acento institucional y editorial.

Representa:

* memoria;
* valor;
* legado;
* archivo;
* continuidad.

No debe utilizarse como un color comercial agresivo.

Evitar convertirlo en el color principal de todos los botones.

Usarlo para:

* líneas;
* detalles;
* numeración;
* símbolos;
* indicadores;
* partes del logotipo;
* elementos editoriales;
* progreso de investigación;
* animaciones;
* bordes sutiles.

El dorado debe sentirse como un detalle valioso.

---

## Stone

```css
--color-stone: #E8E5DF;
```

Representa:

* papel;
* piedra;
* archivo;
* museo;
* memoria material.

Usar para:

* fondos secundarios;
* superficies cálidas;
* cards;
* secciones documentales.

---

## Ivory

```css
--color-ivory: #F8F7F3;
```

Color principal de superficies claras.

Usar para:

* fondo principal;
* contenido editorial;
* formularios;
* expedientes;
* páginas informativas.

Debe evitarse el blanco puro como color dominante.

HUella debe sentirse cálida y material.

---

## Hope Teal

```css
--color-hope-teal: #3C8B7A;
```

Color funcional positivo.

Usar exclusivamente para:

* progreso positivo;
* acciones confirmadas;
* estados satisfactorios;
* información completada;
* señales de avance.

No debe competir visualmente con Memorial Gold.

---

# 7. COLORES FUNCIONALES

```css
--color-text-primary: #071923;
--color-text-secondary: #52606A;
--color-text-muted: #7A858C;

--color-border-subtle: rgba(7, 25, 35, 0.12);
--color-border-gold: rgba(198, 164, 106, 0.35);

--color-surface-primary: #F8F7F3;
--color-surface-secondary: #E8E5DF;

--color-surface-dark: #071923;
--color-surface-dark-secondary: #102A38;
```

Evitar:

* negros absolutos;
* grises fríos dominantes;
* azules saturados;
* dorados brillantes;
* gradientes tecnológicos agresivos.

---

# 8. TIPOGRAFÍA

## Principio

HUella utiliza deliberadamente dos mundos tipográficos:

```text
EDITORIAL / MEMORIAL
          +
TECNOLOGÍA / INTERFAZ
```

---

# 9. TIPOGRAFÍA EDITORIAL

## Opción principal

### DM Serif Display

Usar para:

* Hero;
* grandes titulares;
* citas;
* nombres;
* secciones de homenaje;
* statements editoriales;
* CTA emocionales.

---

## Alternativa

### Cormorant Garamond

Puede utilizarse cuando se busque una expresión más histórica, humana o contemplativa.

No combinar ambas de manera indiscriminada dentro de la misma pantalla.

Seleccionar una como tipografía editorial principal del producto.

---

## Escala recomendada

Desktop:

```text
Display XL    110px
Display L      88px
Display M      72px
H1             56px
H2             42px
H3             32px
```

Tablet:

```text
Display XL     76px
Display L      64px
Display M      56px
H1             46px
H2             36px
```

Mobile:

```text
Display XL     52px
Display L      46px
Display M      40px
H1             36px
H2             30px
```

Los grandes titulares deben tener suficiente espacio para respirar.

No reducir automáticamente la identidad editorial por miedo al espacio.

En mobile se conserva el carácter, ajustando composición y longitud.

---

# 10. TIPOGRAFÍA DE INTERFAZ

## Inter

Usar para:

* navegación;
* botones;
* formularios;
* tablas;
* expedientes;
* metadatos;
* estados;
* evidencias;
* información funcional.

La interfaz debe sentirse:

* clara;
* precisa;
* contemporánea;
* accesible.

---

# 11. EL HERO

## Objetivo

El hero no debe parecer una landing SaaS.

Debe sentirse como entrar en un espacio digital significativo.

La experiencia debe ser más cercana a una institución cultural contemporánea que a una aplicación comercial.

---

## Composición

Pantalla completa.

Fondo:

```text
OBSIDIAN NAVY
```

Elemento visual central abstracto compuesto potencialmente por:

* fragmentos;
* siluetas abstractas;
* texturas documentales;
* líneas topográficas;
* partículas sutiles;
* trazos inspirados en huellas;
* conexiones;
* luz dorada extremadamente tenue.

---

## Contenido

```text
                    HUELLA

             VERDAD · MEMORIA · DIGNIDAD


              Para quienes esperan
                  respuestas.

              Para quienes merecen
                 ser encontrados.


              [ Comenzar una búsqueda ]
```

El contenido debe permanecer claro incluso si la composición artística evoluciona.

---

## Regla

Nunca utilizar imágenes explícitas de:

* violencia;
* cadáveres;
* sufrimiento gráfico;
* escenas bélicas.

El impacto emocional debe provenir de:

* composición;
* escala;
* espacio;
* ausencia;
* luz;
* tipografía;
* abstracción.

---

# 12. LA AUSENCIA VISUAL

Uno de los principales recursos conceptuales de HUella.

Representar historias mediante elementos abstractos:

```text
      ·

            ·          ·


   ·


                   ·


         ·
```

Cada elemento puede representar conceptualmente:

* una persona;
* una historia;
* una búsqueda;
* una conexión;
* una ausencia.

Algunos elementos pueden conectarse.

Otros permanecen aislados.

No debe explicarse siempre literalmente.

La metáfora visual debe poder sentirse antes de comprenderse.

---

# 13. LA LÍNEA DE BÚSQUEDA

## Elemento de identidad transversal

HUella debe tener un recurso visual recurrente:

```text
────────●────────────●────────────◉────────────○
```

Representando:

```text
Solicitud
     ↓
Identificación
     ↓
Evidencias
     ↓
Investigación
     ↓
Resultado
```

Esta línea no debe comportarse como una barra de progreso SaaS.

Debe sentirse como un recorrido.

Una marca.

Un rastro.

---

## Uso

Puede aparecer:

* parcialmente;
* verticalmente;
* horizontalmente;
* fragmentada;
* animada;
* conectando elementos;
* como borde editorial.

Nunca debe saturar la interfaz.

---

# 14. HOME PAGE

La Home debe sentirse como:

> **Una exposición digital contemporánea que gradualmente revela una herramienta de investigación.**

---

## SECCIÓN 01 — HERO

Fondo oscuro.

Identidad.

Elemento abstracto.

Mensaje humano.

CTA claro.

---

## SECCIÓN 02 — DECLARACIÓN

Fondo Ivory.

Titular editorial grande:

```text
UNA BÚSQUEDA
COMIENZA CON
UNA HISTORIA.
```

Mucho espacio negativo.

Sin cards SaaS alrededor.

---

## SECCIÓN 03 — IDENTIFICACIÓN

Número editorial:

```text
01
```

Titular:

```text
IDENTIFICAMOS
LA INFORMACIÓN
DISPONIBLE.
```

Descripción breve y funcional.

Línea Memorial Gold como elemento de continuidad.

---

## SECCIÓN 04 — EVIDENCIAS

Fondo oscuro.

Número:

```text
02
```

Titular:

```text
RECOPILAMOS
LAS HUELLAS
QUE PERMANECEN.
```

Puede incorporar elementos abstractos inspirados en:

* documentos;
* fragmentos;
* conexiones;
* referencias.

---

## SECCIÓN 05 — INVESTIGACIÓN

Fondo claro.

Número:

```text
03
```

Titular:

```text
BUSCAMOS
RESPUESTAS
CON RIGOR.
```

Aquí puede comenzar a aparecer más claramente la dimensión tecnológica.

---

## SECCIÓN 06 — CTA

Fondo oscuro o Midnight Blue.

```text
SI ESTÁS BUSCANDO
A ALGUIEN,

EMPIEZA AQUÍ.
```

CTA:

```text
[ Iniciar solicitud ]
```

Debe sentirse como una invitación clara y humana.

No como un CTA comercial.

---

# 15. SECCIÓN "CADA BÚSQUEDA TIENE UN NOMBRE"

Esta debe ser una de las piezas emocionales centrales de HUella.

Fondo claro.

Titular:

```text
NO SON SOLO DATOS.

SON PERSONAS.

SON HISTORIAS.

SON FAMILIAS QUE ESPERAN RESPUESTAS.
```

---

## Grid visual

Utilizar tarjetas abstractas.

No depender inicialmente de fotografías reales.

Cada tarjeta puede utilizar:

* un símbolo;
* una forma;
* un fragmento documental;
* una composición;
* un patrón;
* un identificador abstracto.

Ejemplo conceptual:

```text
┌──────────────┐    ┌──────────────┐
│              │    │              │
│      ○       │    │      ╱╲      │
│              │    │              │
│   HISTORIA   │    │   HISTORIA   │
└──────────────┘    └──────────────┘


        ┌──────────────┐
        │              │
        │      ◌       │
        │              │
        │   HISTORIA   │
        └──────────────┘
```

La abstracción también ayuda a proteger:

* privacidad;
* dignidad;
* información sensible.

---

# 16. EXPEDIENTE

## El expediente no debe sentirse como un dashboard

Para la persona que realiza una búsqueda, el expediente debe presentarse como:

> **Una historia documental en curso.**

---

## Cabecera

```text
HUELLA / EXPEDIENTE


NOMBRE DE LA PERSONA

HU-2026-00127
```

El identificador debe utilizar tipografía UI.

El nombre debe utilizar tipografía editorial.

---

## Estado

```text
ESTADO ACTUAL

EN INVESTIGACIÓN
```

Descripción:

```text
Estamos contrastando la información disponible.
```

El lenguaje debe ser:

* claro;
* humano;
* preciso;
* no burocrático.

---

# 17. EL RECORRIDO DEL EXPEDIENTE

Ejemplo:

```text
● Solicitud recibida
│
● Identidad verificada
│
● Evidencias recopiladas
│
◉ Investigación en curso
│
○ Resultado documental
```

El estado actual debe tener presencia visual.

Los estados futuros deben ser visibles sin generar falsas expectativas.

---

# 18. NAVEGACIÓN

La navegación pública debe ser discreta.

No debe competir con la experiencia editorial.

Elementos posibles:

```text
HUELLA

Buscar
Cómo funciona
Memoria
Ayuda

[ Comenzar búsqueda ]
```

En fondos oscuros:

* logo claro;
* texto Stone;
* detalles Gold.

En fondos claros:

* texto Obsidian Navy;
* detalles Gold.

---

# 19. BOTONES

## Primario

Debe comunicar acción.

```text
[ Comenzar una búsqueda ]
```

Color recomendado:

* Obsidian Navy sobre fondos claros;
* Stone/Ivory sobre fondos oscuros.

---

## Secundario

Más silencioso.

Puede utilizar:

* borde sutil;
* fondo transparente;
* texto Obsidian Navy.

---

## Regla

Memorial Gold no debe convertirse en un botón primario universal.

El dorado representa valor visual.

No urgencia comercial.

---

# 20. CARDS

Las cards no deben sentirse como componentes SaaS genéricos.

Preferir:

* bordes finos;
* fondos cálidos;
* sombras extremadamente suaves;
* proporciones editoriales;
* espacio interno generoso.

Hover:

* elevación mínima;
* borde Gold tenue;
* aparición progresiva de detalles.

Evitar:

* sombras grandes;
* gradientes brillantes;
* bordes redondeados excesivos;
* glassmorphism agresivo.

---

# 21. BORDES Y FORMAS

Preferir radios discretos.

```text
Small     4px
Medium    8px
Large     12px
```

Evitar que todo tenga grandes esquinas redondeadas.

HUella debe sentirse:

* editorial;
* institucional;
* contemporánea.

No como una aplicación fintech genérica.

---

# 22. ANIMACIONES

## Principio

Las animaciones deben sentirse como:

> **Movimiento de memoria y recorrido.**

No como decoración tecnológica.

---

## Hero

Posibles movimientos:

* partículas extremadamente lentas;
* líneas que aparecen;
* conexiones suaves;
* textura inspirada en huellas;
* luz dorada muy tenue.

Movimiento lento.

Nunca agresivo.

---

## Scroll

Las líneas pueden:

* extenderse;
* conectar;
* revelarse;
* transformarse.

La interacción debe reforzar el concepto de:

```text
RASTRO → RECORRIDO
```

---

## Cards

Hover:

* translate mínimo;
* borde Gold;
* aparición de metadata;
* movimiento máximo: 4px.

---

## Timeline

El progreso debe avanzar como una línea que deja una marca.

No como una barra de carga.

---

# 23. VELOCIDAD DE MOVIMIENTO

Recomendación:

```text
Microinteracciones:
150ms – 250ms

Transiciones de componentes:
250ms – 450ms

Elementos editoriales:
500ms – 900ms

Movimientos ambientales:
8s – 30s
```

Utilizar curvas suaves.

Respetar siempre:

```css
prefers-reduced-motion
```

---

# 24. RESPONSIVE DESIGN

La identidad debe mantenerse en:

* Desktop;
* Tablet;
* Mobile.

No simplemente reducir tamaños.

---

## Desktop

Aprovechar:

* composición;
* asimetría;
* espacio negativo;
* tipografía grande;
* elementos visuales ambientales.

---

## Tablet

Reorganizar composición.

Mantener:

* jerarquía editorial;
* ritmo;
* contraste.

Reducir complejidad visual antes que reducir legibilidad.

---

## Mobile

La experiencia debe sentirse como un:

> **Recorrido vertical íntimo.**

Priorizar:

* lectura;
* respiración;
* una acción principal;
* navegación clara.

Los elementos abstractos deben acompañar.

Nunca dificultar la lectura.

---

# 25. ACCESIBILIDAD

La solemnidad visual nunca debe reducir la accesibilidad.

Garantizar:

* contraste adecuado;
* navegación por teclado;
* estados de foco visibles;
* labels claros;
* tamaños táctiles adecuados;
* reduced motion;
* jerarquía semántica;
* mensajes de estado comprensibles.

Los colores nunca deben ser el único indicador de estado.

---

# 26. LENGUAJE VISUAL DE ESTADOS

## En progreso

Utilizar:

* Memorial Gold;
* línea activa;
* símbolo ◉.

---

## Completado

Utilizar:

* Hope Teal;
* confirmación textual.

---

## Pendiente

Utilizar:

* Stone;
* bordes suaves;
* símbolo ○.

---

## Requiere atención

Utilizar un color funcional de alerta definido específicamente.

Nunca reutilizar Memorial Gold para errores.

---

# 27. ICONOGRAFÍA

La iconografía debe ser:

* minimalista;
* geométrica;
* discreta;
* consistente.

Preferir:

* líneas;
* formas simples;
* símbolos abstractos.

Evitar iconografía:

* militar;
* bélica;
* religiosa dominante;
* excesivamente humanitaria;
* decorativa sin función.

---

# 28. IMÁGENES

Las imágenes deben priorizar:

* humanidad;
* detalles;
* espacios;
* documentos;
* texturas;
* manos cuando sea apropiado;
* lugares;
* objetos;
* archivo.

Evitar:

* violencia explícita;
* imágenes sensacionalistas;
* propaganda;
* heroísmo militar;
* representaciones estereotipadas.

Cuando la privacidad sea importante, preferir:

* abstracción;
* fragmentos;
* desenfoque contextual;
* representación documental no identificable.

---

# 29. DIRECCIÓN DEL LOGOTIPO

El símbolo debe evolucionar hacia una abstracción.

No depender de:

```text
Paloma + Huella + Arco
```

La nueva dirección conceptual debe sugerir simultáneamente:

* huella;
* camino;
* espiral;
* recorrido;
* retorno;
* conexión;
* una H abstracta.

Concepto:

> **Una huella que se convierte en camino.**

El símbolo debe funcionar:

* pequeño;
* monocromático;
* sin contexto;
* en favicon;
* en interfaz;
* en grandes composiciones editoriales.

---

# 30. DO / DON'T

## DO

* utilizar espacio;
* permitir silencio visual;
* utilizar tipografía como elemento gráfico;
* crear composiciones memorables;
* utilizar abstracción;
* mantener claridad funcional;
* mostrar progreso con dignidad;
* combinar editorial + tecnología.

---

## DON'T

No convertir HUella en:

* una landing SaaS;
* una plataforma gubernamental;
* una ONG tradicional;
* un portal de noticias;
* un dashboard administrativo frío;
* un memorial funerario;
* una estética bélica;
* una experiencia excesivamente oscura.

---

# 31. TEST DE DECISIONES DE DISEÑO

Antes de aprobar cualquier pantalla, componente o interacción, preguntar:

### 1.

¿Esto se siente como un producto SaaS genérico?

Si la respuesta es sí:

> Reconsiderar.

---

### 2.

¿Esto trata la historia humana con dignidad?

Si la respuesta es no:

> Reconsiderar.

---

### 3.

¿Esto podría pertenecer a cualquier plataforma?

Si la respuesta es sí:

> Añadir identidad.

---

### 4.

¿La funcionalidad sigue siendo clara?

Si la respuesta es no:

> Simplificar.

---

### 5.

¿El diseño parece intentar provocar tristeza?

Si la respuesta es sí:

> Reducir dramatización.

La emoción debe surgir de:

* respeto;
* ausencia;
* memoria;
* composición.

Nunca de explotación emocional.

---

# 32. DIRECCIÓN DEFINITIVA

HUella debe evolucionar hacia:

# CONTEMPORARY MEMORIAL TECHNOLOGY

Una experiencia donde:

```text
MEMORIA
   +
DISEÑO EDITORIAL
   +
ARCHIVO
   +
INVESTIGACIÓN
   +
TECNOLOGÍA
```

conviven dentro de una misma identidad.

La Home debe sentirse como:

> **Una exposición digital contemporánea que gradualmente se convierte en una herramienta de investigación.**

El expediente debe sentirse como:

> **Una historia documental en curso.**

La timeline debe sentirse como:

> **Un recorrido que deja una huella.**

Y la plataforma completa debe comunicar:

# HUELLA

### VERDAD · MEMORIA · DIGNIDAD

> **Para quienes esperan respuestas.
> Para quienes merecen ser encontrados.**

---

# PRINCIPIO FINAL

HUella no debe intentar impresionar mediante:

* exceso;
* dramatismo;
* tecnología visible;
* efectos llamativos.

Debe resultar memorable porque cada elemento parece haber sido colocado con intención.

La experiencia debe transmitir:

> **Aquí hay tecnología.
> Pero está al servicio de algo profundamente humano.**
