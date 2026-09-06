# HUELLA — DESIGN.md
## Sistema de diseño y esquema de vistas para el MVP

---

# 1. PROPÓSITO DEL PRODUCTO

**HUELLA** es una plataforma documental y de verificación destinada inicialmente a familias cubanas y latinoamericanas que buscan información sobre familiares vinculados al conflicto de Ucrania.

La plataforma permite:

1. Crear una solicitud de búsqueda.
2. Verificar la identidad del solicitante mediante KYC.
3. Registrar información sobre la persona buscada.
4. Recopilar documentos y evidencias.
5. Permitir que operadores investiguen y contrasten información.
6. Comunicar resultados con distintos niveles de certeza.
7. Mantener una trazabilidad documental del expediente.

## Principio fundamental

HUELLA:

- NO custodia dinero.
- NO procesa pagos.
- NO garantiza localizar a una persona.
- NO declara automáticamente que una persona está fallecida.
- NO sustituye una autoridad, tribunal o proceso forense.

HUELLA debe distinguir siempre entre:

- Información declarada por la familia.
- Evidencia aportada.
- Evidencia revisada.
- Información verificada.
- Conclusión confirmada.

---

# 2. PERSONALIDAD DE LA MARCA

La aplicación debe transmitir:

- Confianza.
- Dignidad.
- Humanidad.
- Transparencia.
- Protección.
- Esperanza responsable.
- Profesionalismo.

La sensación general debe ser:

> **Una plataforma moderna de investigación documental creada para acompañar a una familia en una búsqueda difícil.**

NO debe parecer:

- Una plataforma militar.
- Una plataforma política.
- Un sitio propagandístico.
- Una fintech.
- Una aplicación crypto.
- Un portal sensacionalista.
- Un dashboard corporativo frío.

---

# 3. IDENTIDAD VISUAL

## Concepto del logo

El símbolo de HUELLA combina conceptualmente:

- **Huella dactilar:** identidad, rastro, evidencia y búsqueda.
- **Paloma:** paz, esperanza y regreso.
- **Arco protector:** acompañamiento, protección y continuidad.

El símbolo debe funcionar como:

- Logo principal.
- Icono de aplicación.
- Favicon.
- Avatar.
- Marca de agua documental.

## Tagline sugerido

**Verdad · Dignidad · Regreso**

Alternativa:

**Buscamos respuestas. Acompañamos familias.**

---

# 4. PALETA DE COLORES

## Azul profundo — Color principal

`#0B1D2A`

Uso:

- Header.
- Sidebar.
- Footer.
- Hero.
- Fondos institucionales.
- Logo oscuro.

Representa:

- Confianza.
- Estabilidad.
- Seguridad.
- Profesionalismo.

---

## Azul acero — Superficies secundarias

`#334B5E`

Uso:

- Navegación secundaria.
- Bordes oscuros.
- Estados neutros.
- Cards oscuras.
- Elementos de soporte.

---

## Verde esperanza — Acción positiva

`#2E7D6B`

Uso:

- CTA principal.
- Progreso.
- Confirmaciones.
- Estados positivos.
- Acciones completadas.

No usar como color dominante de toda la interfaz.

---

## Dorado suave — Identidad y dignidad

`#C9A66B`

Uso:

- Detalles del logo.
- Acentos.
- Divisores institucionales.
- Elementos destacados.
- Pequeños indicadores.

No utilizar como CTA principal de uso frecuente.

---

## Gris claro — Fondo

`#F2F4F5`

Uso:

- Fondo de contenido.
- Secciones claras.
- Formularios.
- Áreas documentales.

---

## Blanco

`#FFFFFF`

Uso:

- Cards.
- Documentos.
- Formularios.
- Superficies principales.

---

# 5. COLORES SEMÁNTICOS

Los colores semánticos no sustituyen la identidad visual.

## Positivo

`#2E7D6B`

## Información

`#3B82A0`

## Advertencia

`#C9953E`

## Error

`#B84C4C`

## Neutral

`#64748B`

Importante:

Nunca depender solamente del color para comunicar un estado.

Cada estado debe incluir:

- Icono.
- Texto.
- Color.

---

# 6. TIPOGRAFÍA

## Marca y titulares editoriales

### Cormorant Garamond

Usar para:

- Logotipo.
- Hero titles.
- Frases institucionales.
- Mensajes humanos relevantes.

Sensación:

- Elegante.
- Humana.
- Sobria.
- Digna.

No usar para:

- Formularios.
- Tablas.
- Texto largo.
- Datos.
- Navegación.

---

## Interfaz

### Inter

Usar para:

- Body.
- Formularios.
- Botones.
- Navegación.
- Tablas.
- Estados.
- Datos.
- Timeline.

Pesos:

- 400: cuerpo.
- 500: labels.
- 600: botones y subtítulos.
- 700: títulos UI.

---

# 7. ESCALA TIPOGRÁFICA

## Desktop

- Display: 56–64px
- H1: 48px
- H2: 36px
- H3: 28px
- H4: 22px
- Body: 16px
- Small: 14px

## Tablet

- H1: 40–44px
- H2: 32px
- H3: 24px
- Body: 16px

## Mobile

- H1: 32–36px
- H2: 26–30px
- H3: 20–24px
- Body: 15–16px
- Small: 13–14px

---

# 8. PRINCIPIOS UX

## 8.1 Primero la familia

El usuario puede:

- Estar emocionalmente afectado.
- Tener poca experiencia digital.
- Usar un teléfono.
- Tener conectividad limitada.

Por ello:

- Formularios cortos.
- Una tarea por pantalla.
- Progreso visible.
- Lenguaje simple.
- Posibilidad de guardar y continuar.
- Confirmaciones claras.

---

## 8.2 Transparencia

Cada expediente debe responder:

1. ¿Qué sabemos?
2. ¿Qué no sabemos?
3. ¿Qué está verificado?
4. ¿Qué falta?
5. ¿Cuál es el siguiente paso?

---

## 8.3 No convertir una declaración en un hecho

Ejemplo:

### Declarado

> La familia informa que perdió contacto.

### En investigación

> Estamos contrastando la información disponible.

### Confirmado

> Existe información documental verificada que permite confirmar el fallecimiento.

Nunca saltar directamente de una declaración a una conclusión.

---

# 9. ARQUITECTURA DE VISTAS

La aplicación tiene tres áreas:

```text
HUELLA
│
├── Sitio público
│
├── Portal familiar
│
└── Backoffice operador
```

---

# 10. SITIO PÚBLICO

## VIEW-P01 — Landing

### Objetivo

Explicar el propósito y generar confianza.

### Estructura

```text
Header
│
Hero
│
Cómo funciona
│
Qué podemos hacer
│
Qué no hacemos
│
Seguridad
│
FAQ
│
CTA
│
Footer
```

### Hero

Título:

> **Buscamos respuestas. Protegemos la verdad.**

Subtítulo:

> Una plataforma documental para ayudar a familias a localizar, verificar y documentar información sobre sus seres queridos.

CTA principal:

**Iniciar una solicitud**

CTA secundaria:

**Cómo funciona**

### Diseño

Desktop:

- Fondo azul profundo.
- Logo destacado.
- Composición editorial.
- Mucho espacio negativo.

Mobile:

- Hero compacto.
- CTA visible.
- Navegación mínima.

---

## VIEW-P02 — Cómo funciona

Mostrar un proceso simple:

```text
01 — Cuéntanos a quién buscas
02 — Verificamos tu identidad
03 — Recopilamos evidencias
04 — Investigamos
05 — Comunicamos lo que podemos confirmar
```

Cada paso debe incluir:

- Qué hace la familia.
- Qué hace HUELLA.
- Qué información se necesita.

---

## VIEW-P03 — Qué verificamos

Cards con:

- Identidad.
- Información documental.
- Evidencias.
- Estado de localización.
- Información sobre fallecimiento cuando sea verificable.

No prometer:

- Resultados.
- Compensaciones.
- Repatriaciones.

---

## VIEW-P04 — Seguridad y privacidad

Explicar:

- Por qué se solicita KYC.
- Qué datos se almacenan.
- Qué documentos se solicitan.
- Quién puede acceder.
- Cómo se protege la información.

Diseño:

- Fondo claro.
- Layout editorial.
- Iconografía de seguridad.

---

## VIEW-P05 — FAQ

Preguntas:

- ¿Qué hace HUELLA?
- ¿HUELLA garantiza encontrar a mi familiar?
- ¿Por qué debo verificar mi identidad?
- ¿Puedo iniciar una solicitud desde Cuba?
- ¿Qué documentos necesito?
- ¿Cómo sabré si hay novedades?
- ¿Qué significa cada estado?

---

# 11. PORTAL FAMILIAR

## VIEW-F01 — Inicio / Mis solicitudes

Esta es la home después de entrar al portal.

### Layout

```text
Header compacto
│
Bienvenida
│
Resumen
│
Solicitudes
│
CTA Nueva solicitud
```

Cada solicitud:

```text
HU-2026-000123

Persona buscada
Juan Pérez

Estado
En investigación

Última actualización
05 Sep 2026
```

Estados:

- Recibida.
- En revisión.
- Requiere información.
- En investigación.
- Resultado disponible.
- Cerrada.

---

## VIEW-F02 — Nueva solicitud / Wizard

La solicitud NO debe ser un formulario único.

### Paso 1 — Datos del solicitante

- Nombre.
- Apellidos.
- País.
- Email.
- Teléfono.

---

### Paso 2 — Verificación de identidad

Explicación:

> Para proteger a las familias y reducir solicitudes fraudulentas, verificamos la identidad de la persona que presenta el expediente.

Botón:

**Verificar mi identidad**

Importante:

KYC NO es autenticación.

---

### Paso 3 — Persona buscada

- Nombre.
- Apellidos.
- Fecha de nacimiento.
- Nacionalidad.
- Alias.
- Identificadores conocidos.
- Información relevante conocida.

---

### Paso 4 — Relación

Opciones:

- Madre.
- Padre.
- Cónyuge.
- Hijo/a.
- Hermano/a.
- Otro familiar.

---

### Paso 5 — Evidencias

Permitir:

- Documento.
- Fotografía.
- Información relevante.

Cada archivo:

```text
Nombre
Tipo
Fecha
Estado: Recibido
```

Nunca marcar automáticamente como verificado.

---

### Paso 6 — Revisión y envío

Mostrar resumen.

Checkbox:

> Confirmo que la información proporcionada es verdadera según mi conocimiento.

CTA:

**Enviar solicitud**

---

## VIEW-F03 — Solicitud enviada

Mensaje:

> **Hemos recibido tu solicitud.**

Mostrar:

```text
Número de expediente
HU-2026-000123

Estado
Solicitud recibida

Próximo paso
Revisión inicial
```

---

## VIEW-F04 — Expediente

Vista principal para la familia.

### Header

```text
HU-2026-000123
Juan Pérez

[ En investigación ]
```

### Secciones

1. Estado actual.
2. Qué sabemos.
3. Qué no está confirmado.
4. Evidencias.
5. Timeline.
6. Próximo paso.

---

## VIEW-F05 — Evidencias

Biblioteca de documentos.

Cada card:

```text
Tipo de documento
Fuente
Fecha
Estado
```

Estados:

- Recibido.
- En revisión.
- Verificado.
- Rechazado.
- Disputado.

---

## VIEW-F06 — Resultado

Vista sensible.

### Si no existe información suficiente

> **Todavía no podemos confirmar el estado de esta persona.**

### Si existe información de localización

> **La información disponible permite confirmar que la persona ha sido localizada.**

### Si existe fallecimiento confirmado

> **La información documental verificada permite confirmar el fallecimiento.**

Siempre mostrar:

- Qué está confirmado.
- Evidencia disponible.
- Qué no se conoce.
- Próximo paso.

No utilizar:

- Animaciones celebratorias.
- Colores dramáticos.
- Iconografía agresiva.

---

## VIEW-F07 — Perfil

- Datos.
- Contacto.
- Solicitudes.
- Configuración.
- Privacidad.

KYC:

Mostrar solamente:

> Identidad verificada

No mostrar datos biométricos.

---

# 12. BACKOFFICE OPERADOR

El operador necesita eficiencia, pero sin romper la identidad visual.

---

## VIEW-O01 — Dashboard

Métricas:

- Nuevas.
- En revisión.
- En investigación.
- Requieren información.
- Resultados pendientes.

Debajo:

- Casos recientes.
- Casos prioritarios.
- Actividad reciente.

No llenar el dashboard de gráficos decorativos.

---

## VIEW-O02 — Bandeja de casos

Desktop:

Tabla.

Mobile:

Cards.

Columnas:

- Expediente.
- Persona.
- Solicitante.
- Estado.
- Prioridad.
- Última actualización.
- Operador.

Filtros:

- Estado.
- Prioridad.
- Fecha.
- Operador.

---

## VIEW-O03 — Workspace de caso

La vista más importante para el operador.

### Desktop

```text
┌──────────────────────────────────────────────────┐
│ Header del caso                                 │
├─────────────────────┬────────────────────────────┤
│ Información         │ Investigación              │
│                     │                            │
│ Persona buscada     │ Timeline                   │
│ Solicitante         │ Notas                     │
│ Evidencias          │ Acciones                   │
└─────────────────────┴────────────────────────────┘
```

### Mobile

Orden:

1. Header.
2. Estado.
3. Persona.
4. Solicitante.
5. Evidencias.
6. Investigación.
7. Timeline.
8. Acciones.

---

## VIEW-O04 — Revisión de evidencia

Layout:

```text
Preview
│
Metadatos
│
Fuente
│
Notas
│
Acciones
```

Acciones:

- Verificar.
- Rechazar.
- Marcar disputada.

Toda acción sensible:

- Requiere confirmación.
- Solicita motivo.
- Genera auditoría.

---

## VIEW-O05 — Verificaciones

Cada verificación debe mostrar:

```text
Tipo
Resultado

Nivel de confianza

Evidencias relacionadas

Operador

Fecha
```

---

## VIEW-O06 — Auditoría

Solo para personal autorizado.

Mostrar:

```text
Fecha
Actor
Acción
Entidad
Cambio
Motivo
```

---

# 13. RESPONSIVE DESIGN

## Mobile

Prioridad máxima.

Características:

- Una columna.
- Formularios por pasos.
- Targets táctiles grandes.
- Cards.
- Timeline vertical.
- Navegación simple.

---

## Tablet

- Dos columnas cuando sea útil.
- Sidebar compacta.
- Formularios centrados.
- Tablas simplificadas.

---

## Desktop

- Sidebar.
- Workspace.
- Paneles.
- Tablas.
- Preview documental.
- Contexto simultáneo.

---

# 14. COMPONENTES

Crear componentes reutilizables:

```text
Button
IconButton
Input
Textarea
Select
PhoneInput
DateInput
FileUpload
DocumentPreview
StatusBadge
CaseCard
EvidenceCard
Timeline
Stepper
Alert
Modal
Drawer
ConfirmationDialog
EmptyState
LoadingState
ErrorState
Skeleton
DataTable
SearchInput
FilterBar
```

---

# 15. BOTONES

## Primary

Fondo:

`#2E7D6B`

Texto blanco.

## Secondary

Fondo transparente.

Borde:

`#334B5E`

## Tertiary

Solo texto.

## Danger

`#B84C4C`

Solo para acciones destructivas.

---

# 16. CARDS Y SUPERFICIES

Radio:

`12px–16px`

Sombras:

Muy suaves.

Preferir:

- Bordes.
- Separación.
- Contraste de superficie.

Evitar:

- Sombras pesadas.
- Cards flotantes excesivas.
- Glassmorphism.

---

# 17. ICONOGRAFÍA

Estilo:

- Lineal.
- Simple.
- Consistente.

Preferencia:

Lucide Icons.

Iconos relevantes:

- Search.
- ShieldCheck.
- FileText.
- Fingerprint.
- UserCheck.
- Clock.
- AlertTriangle.
- CheckCircle.
- MapPin.
- MessageCircle.
- Upload.
- History.

Evitar iconografía militar.

---

# 18. ESTADOS DEL SISTEMA

Todos los estados deben tener:

- Color.
- Icono.
- Texto.

Estados recomendados:

```text
RECIBIDO
EN_REVISIÓN
REQUIERE_INFORMACIÓN
EN_INVESTIGACIÓN
RESULTADO_DISPONIBLE
CERRADO
```

Para evidencia:

```text
RECIBIDA
EN_REVISIÓN
VERIFICADA
RECHAZADA
DISPUTADA
```

---

# 19. ANIMACIONES

Permitido:

- Fade.
- Slide pequeño.
- Progress.
- Skeleton.
- Feedback.

Duración:

`150ms–300ms`

No usar:

- Confeti.
- Animaciones dramáticas.
- Efectos cinematográficos.
- Parallax excesivo.

Respetar:

`prefers-reduced-motion`.

---

# 20. ACCESIBILIDAD

Objetivo:

**WCAG 2.2 AA**

Requisitos:

- Contraste adecuado.
- Foco visible.
- Navegación por teclado.
- Labels.
- Mensajes de error claros.
- No depender solo del color.
- Targets táctiles grandes.

---

# 21. VOZ Y TONO

Debe ser:

- Humana.
- Clara.
- Respetuosa.
- Responsable.
- Transparente.

Ejemplo correcto:

> Todavía no podemos confirmar el estado de esta persona.

Ejemplo incorrecto:

> No encontramos al desaparecido.

Ejemplo correcto:

> La información disponible todavía no permite confirmar su situación.

---

# 22. PROMPT MAESTRO PARA UNA IA DE DISEÑO

Utiliza el siguiente prompt como instrucción global:

---

Diseña una aplicación web llamada **HUELLA**.

HUELLA es una plataforma documental y de verificación destinada inicialmente a familias cubanas y latinoamericanas que buscan información sobre familiares vinculados al conflicto de Ucrania.

La plataforma permite crear solicitudes, verificar la identidad del solicitante mediante KYC, recopilar información y evidencias, gestionar investigaciones y comunicar resultados documentados.

HUELLA NO es una plataforma financiera. No custodia dinero, no procesa pagos y no debe tener estética fintech o crypto.

La marca debe transmitir:

- confianza;
- humanidad;
- dignidad;
- transparencia;
- protección;
- esperanza responsable.

La identidad visual se basa conceptualmente en:

- una huella dactilar;
- una paloma;
- un arco protector.

## Paleta

- Azul profundo: `#0B1D2A`
- Azul acero: `#334B5E`
- Verde esperanza: `#2E7D6B`
- Dorado suave: `#C9A66B`
- Gris claro: `#F2F4F5`
- Blanco: `#FFFFFF`

## Tipografía

- Cormorant Garamond para logotipo y titulares editoriales.
- Inter para toda la interfaz.

## Dirección visual

La interfaz debe sentirse como:

**una plataforma moderna de investigación documental que acompaña a una familia durante una búsqueda difícil.**

Debe ser:

- sobria;
- moderna;
- accesible;
- espaciosa;
- documental;
- humana;
- profesional.

Evita:

- estética militar;
- armas;
- tanques;
- propaganda;
- banderas dominantes;
- rojo como color principal;
- crypto;
- fintech;
- glassmorphism excesivo;
- gradientes llamativos;
- dashboards saturados.

## Principio de información

La UI debe diferenciar visualmente:

1. Información declarada por la familia.
2. Evidencia recibida.
3. Evidencia verificada.
4. Información en investigación.
5. Conclusión confirmada.

Nunca mostrar una conclusión sensible como un hecho si todavía no ha sido verificada.

## Vistas necesarias

### Sitio público

- Landing.
- Cómo funciona.
- Qué verificamos.
- Seguridad y privacidad.
- FAQ.

### Portal familiar

- Mis solicitudes.
- Nueva solicitud wizard.
- KYC.
- Datos de la persona buscada.
- Relación.
- Evidencias.
- Solicitud enviada.
- Expediente.
- Resultado.
- Perfil.

### Backoffice

- Dashboard.
- Bandeja de casos.
- Workspace de investigación.
- Revisión de evidencias.
- Verificaciones.
- Auditoría.

## Responsive

Diseñar mobile-first.

Mobile:

- una columna;
- formularios por pasos;
- navegación simple;
- cards;
- timeline vertical.

Tablet:

- dos columnas cuando sea útil.

Desktop:

- sidebar;
- workspace;
- tablas;
- paneles;
- preview documental.

## UX

Priorizar:

1. Claridad.
2. Confianza.
3. Dignidad.
4. Accesibilidad.
5. Estética.

Cuando exista conflicto entre estética y claridad, siempre gana claridad.

Todos los componentes deben contemplar:

- loading;
- empty;
- error;
- success;
- disabled.

Implementar un sistema de componentes reutilizables y consistente.

---

# 23. PROMPT POR VISTA

Para implementar cada vista:

> Implementa la vista **[NOMBRE DE LA VISTA]** de HUELLA siguiendo estrictamente este DESIGN.md.
>
> Utiliza la paleta oficial, Inter para UI y Cormorant Garamond únicamente para titulares editoriales.
>
> Mantén una estética humana, institucional, moderna y documental.
>
> Diseña mobile-first y adapta cuidadosamente a tablet y desktop.
>
> No introduzcas estética militar, propagandística, fintech o crypto.
>
> Deja claro qué información está declarada, qué evidencia está recibida, qué está en investigación y qué está confirmado.
>
> La pantalla debe permitir al usuario entender inmediatamente:
>
> 1. dónde está;
> 2. qué está viendo;
> 3. qué está confirmado;
> 4. qué falta;
> 5. cuál es el siguiente paso.
>
> Implementa estados loading, empty, error, success y disabled cuando correspondan.
>
> Prioriza accesibilidad y claridad emocional.

---

# 24. REGLA FINAL

> **HUELLA debe parecer una organización seria que ayuda a una familia a encontrar respuestas, no una aplicación que explota emocionalmente el conflicto.**

En cualquier decisión visual o UX, priorizar:

**Claridad + Confianza + Dignidad**
