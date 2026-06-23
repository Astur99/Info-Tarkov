export const HOW_TO_USE_CONTENT = {
  es: {
    eyebrow: 'Manual operativo',
    title: 'Cómo usar Info Tarkov',
    subtitle:
      'Guía completa de la plataforma: qué hace cada módulo, cómo se conectan entre sí y qué buscar cuando tengas una duda concreta.',
    searchPlaceholder: 'Buscar: Kappa, FIR, PVE, reportar bug, hideout, PMC, llaves...',
    empty: 'No hay resultados para esa búsqueda. Prueba con otra palabra clave o revisa el índice de capítulos.',
    allModules: 'Toda la guía',
    results: '{{count}} artículos visibles',
    chaptersLabel: 'Índice de capítulos',
    openModule: 'Abrir módulo',
    keywordsLabel: 'Palabras clave',
    stepsLabel: 'Cómo se usa',
    tipsLabel: 'Consejos',
    connectionLabel: 'Conexión con la app',
    categories: [
      {
        id: 'getting-started',
        module: 'Primeros pasos',
        view: 'home',
        sections: [
          {
            title: 'Qué es Info Tarkov',
            keywords: ['inicio', 'hub', 'app', 'gratis', 'multiidioma', 'pvp', 'pve'],
            summary:
              'Info Tarkov es un hub gratuito para centralizar herramientas de apoyo de Escape From Tarkov: progreso, economía, bosses, mapas, Kappa, Hideout, PMC y soporte.',
            steps: [
              'Entra en la web y usa el menú principal como terminal de módulos.',
              'Puedes usar la app como invitado o crear cuenta para guardar progreso cloud.',
              'Cambia idioma con el selector ES/EN de la esquina superior izquierda.',
              'Cambia PVP/PVE dentro de los módulos que soportan ambos entornos.'
            ],
            tips: [
              'Si solo quieres consultar datos, no necesitas cuenta.',
              'Si quieres guardar progreso entre dispositivos, crea cuenta.',
              'La versión 1.0 está pensada para PC; móvil queda como mejora posterior.'
            ],
            connection:
              'El menú principal conecta con todos los módulos. La cuenta guarda usuario de Tarkov, modo principal y progreso cloud donde aplica.'
          },
          {
            title: 'Idioma, sesión y modo invitado',
            keywords: ['idioma', 'english', 'español', 'login', 'cuenta', 'invitado', 'sesión'],
            summary:
              'La app funciona en español e inglés. Puedes navegar como invitado o iniciar sesión para activar guardado cloud y ajustes personales.',
            steps: [
              'Pulsa ES/EN para cambiar idioma.',
              'Pulsa Login / Crear cuenta para registrarte o iniciar sesión.',
              'En modo invitado, los datos se guardan localmente en el navegador.',
              'Con cuenta, la app puede sincronizar progreso en Supabase.'
            ],
            tips: [
              'El modo invitado es cómodo para probar, pero no es una copia permanente.',
              'Si borras datos del navegador, el progreso invitado puede desaparecer.'
            ],
            connection:
              'Idioma afecta a las vistas públicas principales. La sesión permite Account, Reportes con usuario y sincronización cloud.'
          }
        ]
      },
      {
        id: 'account',
        module: 'Cuenta y perfil',
        view: 'account',
        sections: [
          {
            title: 'Configurar cuenta',
            keywords: ['cuenta', 'usuario', 'nombre', 'modo principal', 'contraseña', 'borrar cuenta'],
            summary:
              'La cuenta controla tu nombre de usuario, modo principal PVP/PVE y opciones sensibles como cambio de contraseña o borrado.',
            steps: [
              'Abre tu botón de usuario en la esquina superior derecha.',
              'Configura tu nombre de usuario de Tarkov.',
              'Elige modo principal: PVP, PVE o ambos según tu uso.',
              'Guarda cambios para que otros módulos usen esa preferencia.'
            ],
            tips: [
              'El nombre no puede repetirse entre usuarios.',
              'El modo principal sirve como preferencia inicial, pero puedes cambiar PVP/PVE dentro de cada módulo compatible.'
            ],
            connection:
              'PMC Profile usa el usuario de Tarkov configurado. Hideout, Flea, Kappa y otros módulos mantienen datos separados por modo.'
          },
          {
            title: 'Reportar bugs o sugerencias',
            keywords: ['report', 'bug', 'sugerencia', 'ticket', 'notificación', 'mensaje'],
            summary:
              'Report funciona como sistema de tickets entre usuarios y administración. Permite enviar bugs, sugerencias y responder conversaciones.',
            steps: [
              'Pulsa Report desde el menú principal si estás logueado.',
              'Crea un ticket con tipo, título y descripción.',
              'Cuando el admin responda, verás una notificación en el botón Report.',
              'Puedes revisar el historial de conversación dentro del ticket.'
            ],
            tips: [
              'Cuanto más concreta sea la descripción, más fácil será reproducir el problema.',
              'Incluye módulo, acción realizada y resultado esperado.'
            ],
            connection:
              'El Panel Admin recibe notificación cuando hay tickets pendientes y los usuarios reciben aviso cuando hay respuesta.'
          }
        ]
      },
      {
        id: 'missions',
        module: 'Misiones / Kappa',
        view: 'kappa',
        sections: [
          {
            title: 'Árbol de misiones',
            keywords: ['misiones', 'quests', 'kappa', 'trader', 'prapor', 'therapist', 'árbol'],
            summary:
              'Muestra misiones por trader en forma de organigrama, separando progreso PVP/PVE y marcando dependencias entre quests.',
            steps: [
              'Abre Misiones / Kappa desde el menú.',
              'Selecciona trader en la barra superior.',
              'Usa el buscador global para localizar misiones por nombre.',
              'Pulsa Completar para marcar progreso.',
              'Alterna PVP/PVE desde el panel lateral.'
            ],
            tips: [
              'El organigrama se centra al abrir para que no tengas que buscar el inicio.',
              'Usa “Mostrar solo incompletas” para limpiar ruido visual.'
            ],
            connection:
              'El progreso alimenta estadísticas de Kappa y se guarda local/cloud según sesión. Quest Optimizer usa las quests pendientes.'
          },
          {
            title: 'Checklist Collector / Kappa Items',
            keywords: ['collector', 'items kappa', 'found in raid', 'fir', 'fence', 'tachar'],
            summary:
              'Dentro de la misión Collector puedes abrir una checklist de todos los objetos necesarios para Kappa y marcarlos a medida que los consigues.',
            steps: [
              'Ve al trader Fence.',
              'Localiza la misión Collector.',
              'Abre el submenú de Items Kappa.',
              'Busca por nombre, pista o spawn.',
              'Marca cada objeto cuando lo tengas Found in Raid.'
            ],
            tips: [
              'Collector exige objetos Found in Raid; comprarlos no sirve.',
              'Usa la búsqueda para localizar rápidamente objetos concretos.'
            ],
            connection:
              'La checklist es local por usuario y ayuda a preparar Kappa sin salir del árbol de misiones.'
          },
          {
            title: 'Quest Optimizer',
            keywords: ['quest optimizer', 'optimizar', 'siguiente raid', 'mapa recomendado', 'llaves'],
            summary:
              'Analiza quests pendientes y sugiere qué mapa puede darte más valor en la siguiente raid.',
            steps: [
              'Pulsa Quest Optimizer dentro de Misiones / Kappa.',
              'Revisa la recomendación principal.',
              'Filtra por mapa o prioriza Kappa si ese es tu objetivo.',
              'Consulta las llaves sugeridas antes de entrar a raid.'
            ],
            tips: [
              'Úsalo cuando tengas muchas quests abiertas y no sepas qué mapa conviene jugar.',
              'No sustituye tu criterio: prioriza supervivencia si llevas objetos importantes.'
            ],
            connection:
              'Combina progreso de misiones, mapas, estado Kappa y Sistema de Llaves.'
          }
        ]
      },
      {
        id: 'hideout',
        module: 'Gestión del Refugio',
        view: 'hideout',
        sections: [
          {
            title: 'Planificar estaciones y niveles',
            keywords: ['hideout', 'refugio', 'estación', 'nivel', 'construido', 'bloqueado'],
            summary:
              'Hideout muestra estaciones en orden natural de progresión, sus niveles, bloqueos y materiales necesarios.',
            steps: [
              'Abre Gestión del Refugio.',
              'Cambia PVP/PVE según tu entorno.',
              'Selecciona una estación en el panel izquierdo.',
              'Elige el nivel objetivo arriba.',
              'Marca el nivel construido si ya lo tienes.'
            ],
            tips: [
              'Al marcar construido un nivel superior, los materiales de niveles anteriores se autocompletan.',
              'Los bloqueos muestran qué estaciones, traders o skills necesitas antes.'
            ],
            connection:
              'Usa precios PVP/PVE del Flea cuando están disponibles y guarda checklist por usuario/modo.'
          },
          {
            title: 'Materiales, FIR y coste pendiente',
            keywords: ['materiales', 'fir', 'found in raid', 'coste', 'flea', 'checklist'],
            summary:
              'Cada estación muestra materiales requeridos, si son FIR obligatorios, coste total y coste pendiente según lo marcado.',
            steps: [
              'Marca cada material cuando lo tengas.',
              'Revisa si aparece etiqueta FIR REQUIRED.',
              'Consulta presupuesto y pendiente según checklist.',
              'Cambia PVP/PVE para recalcular precios de mercado.'
            ],
            tips: [
              'No todo es FIR: la app distingue requisitos reales cuando los datos lo permiten.',
              'Si un item no tiene precio, el coste puede aparecer incompleto.'
            ],
            connection:
              'Se conecta con tarkov.dev para datos y precios, y con Supabase/localStorage para guardar progreso.'
          }
        ]
      },
      {
        id: 'pmc',
        module: 'Perfil de PMC',
        view: 'pmc-profile',
        sections: [
          {
            title: 'Sincronizar perfil público',
            keywords: ['pmc', 'perfil', 'tarkov.dev', 'account id', 'pvp', 'pve', 'buscar jugador'],
            summary:
              'PMC Profile consulta JSON públicos de players.tarkov.dev para jugadores ya indexados y muestra una ficha enriquecida.',
            steps: [
              'Configura tu usuario de Tarkov en Cuenta.',
              'Abre Perfil de PMC.',
              'Cambia PVP/PVE si quieres consultar otro entorno.',
              'Pulsa Mi Perfil o busca otro jugador por nombre.',
              'Usa Tarkov.dev para abrir el perfil oficial si necesitas comprobar fuente.'
            ],
            tips: [
              'Solo aparecen jugadores ya vistos en tarkov.dev/players.',
              'El índice público se actualiza aproximadamente una vez al día.',
              'Si alguien no aparece, abre antes su perfil en tarkov.dev y espera la actualización.'
            ],
            connection:
              'Combina perfil público, items, logros, skills, favoritos y exportación PNG mediante Netlify Functions.'
          },
          {
            title: 'Logros, skills y exportar tarjeta',
            keywords: ['logros', 'achievements', 'skills', 'exportar', 'tarjeta', 'png'],
            summary:
              'La ficha muestra stats, equipo visible, favoritos, logros filtrables, habilidades farmeadas y una tarjeta exportable.',
            steps: [
              'Revisa el bloque superior con nivel, facción, raids, SR y kills.',
              'Consulta equipo táctico y favoritos si el perfil los expone.',
              'Filtra logros por todos, legendarios, raros o comunes.',
              'Revisa skills farmeadas ordenadas por progreso.',
              'Pulsa Exportar tarjeta para generar una imagen resumen.'
            ],
            tips: [
              'La tarjeta PNG está pensada para compartir perfil sin pasar JSON técnico.',
              'Copiar AccID ayuda a depurar o abrir perfiles concretos.'
            ],
            connection:
              'La exportación usa proxy de imágenes para incrustar iconos externos sin problemas CORS.'
          }
        ]
      },
      {
        id: 'economy',
        module: 'Economía: Flea y Llaves',
        view: 'flea',
        sections: [
          {
            title: 'Flea Market Tracker',
            keywords: ['flea', 'mercado', 'precio', 'pvp', 'pve', 'gráfica', 'rentabilidad'],
            summary:
              'Permite buscar items, comparar precios PVP/PVE, ver tendencia histórica y detectar oportunidades de mercado.',
            steps: [
              'Abre Flea Market Tracker.',
              'Elige PVP o PVE.',
              'Busca un item por nombre en inglés o español sin tildes.',
              'Abre el detalle para ver gráfica, precio actual, media y valor trader.',
              'Pasa el ratón por puntos del gráfico para ver precio/fecha.'
            ],
            tips: [
              'PVP y PVE tienen economías separadas; revisa siempre el modo correcto.',
              'El radar de fluctuaciones ayuda a detectar items que han subido o bajado mucho.'
            ],
            connection:
              'Hideout y Keys reutilizan precios para calcular costes o prioridades.'
          },
          {
            title: 'Sistema de Llaves',
            keywords: ['llaves', 'keys', 'keycards', 'mapa', 'quest', 'wiki', 'precio'],
            summary:
              'Buscador vivo de llaves y keycards con precios PVP/PVE, mapa, quests asociadas y capa táctica de prioridades.',
            steps: [
              'Abre Sistema de Llaves.',
              'Busca por llave, mapa, quest o tag.',
              'Filtra por mapa o categoría.',
              'Activa “Importantes primero” si quieres priorizar progreso.',
              'Abre wiki para ubicación exacta o uso detallado.'
            ],
            tips: [
              'Las llaves importantes están marcadas por utilidad, quest o valor táctico.',
              'Si tarkov.dev falla, aparece una capa local de llaves importantes.'
            ],
            connection:
              'Quest Optimizer puede sugerir llaves críticas antes de una ruta de misiones.'
          }
        ]
      },
      {
        id: 'combat',
        module: 'Intel: Bosses, Goons y Simulador',
        view: 'bosses',
        sections: [
          {
            title: 'Intel: Bosses',
            keywords: ['bosses', 'spawn', 'killa', 'wedge', 'mapa', 'loot', 'dificultad'],
            summary:
              'Fichas de bosses con imagen, mapas, probabilidad de spawn, dificultad, escuadra, zonas conocidas, equipo, munición y consejos tácticos.',
            steps: [
              'Abre Intel: Bosses.',
              'Filtra por mapa o busca un boss concreto.',
              'Abre la ficha para ver mapas, zonas de spawn y datos de combate.',
              'Revisa plan de entrada, armas, munición, puntos débiles y loot.'
            ],
            tips: [
              'Las zonas de spawn son texto estructurado cuando no hay coordenadas fiables.',
              'Los porcentajes pueden cambiar con parches; consulta changelog si ves cambios recientes.'
            ],
            connection:
              'Mapas 2.0 y Bosses comparten filosofía: datos útiles y curados antes que prometer precisión falsa.'
          },
          {
            title: 'Tracker de Goons',
            keywords: ['goons', 'birdeye', 'knight', 'big pipe', 'rotación', 'ubicación'],
            summary:
              'Consulta fuentes externas para estimar la ubicación o rotación de los Goons.',
            steps: [
              'Abre Tracker de Goons.',
              'Revisa mapa activo, fuente y estado.',
              'Contrasta si aparece aviso de fuente externa o dato no fiable.'
            ],
            tips: [
              'Este módulo depende de fuentes externas y puede fallar si cambia el HTML de origen.',
              'Úsalo como orientación, no como certeza absoluta.'
            ],
            connection:
              'Troubleshooting documenta limitaciones de fuentes externas como Goons.'
          },
          {
            title: 'Simulador Balístico',
            keywords: ['simulador', 'balística', 'munición', 'armor', 'ttk', 'penetración'],
            summary:
              'Herramienta para comparar munición y armaduras, estimar penetración, daño y tiempo aproximado para matar.',
            steps: [
              'Abre Simulador Balístico.',
              'Busca munición por calibre o nombre.',
              'Selecciona blindaje objetivo.',
              'Revisa tiros estimados, probabilidad y telemetría de impactos.'
            ],
            tips: [
              'Úsalo para entender tendencias, no como predicción perfecta de cada combate.',
              'Durabilidad, distancia y zonas de impacto pueden cambiar el resultado real.'
            ],
            connection:
              'Complementa Bosses y preparación de raid al decidir munición antes de entrar.'
          }
        ]
      },
      {
        id: 'maps-story-prestige',
        module: 'Mapas, Historia y Prestigios',
        view: 'maps',
        sections: [
          {
            title: 'Mapas tácticos',
            keywords: ['mapas', 'transits', 'icebreaker', 'labyrinth', 'terminal', 'zonas'],
            summary:
              'Mapas combina visor externo con briefings limpios: descripción, datos base, zonas de conflicto y puntos de interés.',
            steps: [
              'Abre Mapas Tácticos.',
              'Elige mapa en la rejilla superior.',
              'Lee el briefing antes de usar el visor.',
              'Consulta el iframe para extracciones, rutas y puntos visuales.',
              'Usa Transits para ver conexiones entre mapas.'
            ],
            tips: [
              'Icebreaker, Labyrinth y Terminal tienen datos especiales curados.',
              'Transits no intenta ser mapa de loot; es organigrama de conexión.'
            ],
            connection:
              'Mapas ayuda a preparar rutas para quests, bosses, llaves y progresión de historia.'
          },
          {
            title: 'Decisiones / Finales',
            keywords: ['finales', 'story', 'decisiones', 'armored case', 'kerman', 'terminal'],
            summary:
              'Guía de decisiones narrativas, puntos de no retorno y requisitos críticos para las rutas de historia.',
            steps: [
              'Abre Decisiones / Finales.',
              'Lee el bloque inicial y las decisiones principales.',
              'Despliega requisitos cuando una ruta lo permita.',
              'Compara consecuencias antes de comprometer objetos o dinero.'
            ],
            tips: [
              'No tomes decisiones irreversibles sin revisar requisitos posteriores.',
              'Este módulo está pensado como brújula de historia, no como wiki exhaustiva.'
            ],
            connection:
              'Se relaciona con Kappa, Hideout, Mapas y futuras rutas endgame como Terminal.'
          },
          {
            title: 'Prestigios',
            keywords: ['prestige', 'prestigio', 'pvp only', 'recompensas', 'insignia'],
            summary:
              'Módulo PVP ONLY para preparar cada nivel de prestigio con requisitos, recompensas, checklist e insignias.',
            steps: [
              'Abre Prestigios.',
              'Selecciona nivel 1-6.',
              'Revisa nivel PMC, dinero, quests, historia, skills y hideout.',
              'Marca requisitos completados para controlar avance.'
            ],
            tips: [
              'Prestigios no aplica a PVE.',
              'El dinero requerido se muestra aparte porque no se trackea automáticamente.'
            ],
            connection:
              'Prestigios cruza progreso endgame con quests, historia, skills e infraestructura del Hideout.'
          }
        ]
      },
      {
        id: 'support',
        module: 'Soporte, Admin y Changelog',
        view: 'trouble',
        sections: [
          {
            title: 'Troubleshooting',
            keywords: ['troubleshooting', 'errores', 'fallos', 'api', 'bundle', 'limitaciones'],
            summary:
              'Lista de incidencias conocidas, limitaciones técnicas y qué hacer cuando un módulo no responde como esperas.',
            steps: [
              'Abre Troubleshooting desde el menú.',
              'Busca el síntoma más parecido.',
              'Lee la solución recomendada.',
              'Si no aparece, abre un Report con detalles.'
            ],
            tips: [
              'Es especialmente útil para problemas de APIs externas o perfiles PMC no indexados.',
              'No todos los errores son de Info Tarkov: algunas fuentes externas pueden fallar temporalmente.'
            ],
            connection:
              'Troubleshooting conecta documentación pública, Reportes y decisiones de calidad del proyecto.'
          },
          {
            title: 'ChangeLog',
            keywords: ['changelog', 'version', 'actualizaciones', '1.0', 'cambios'],
            summary:
              'Registro público de versiones para saber qué se ha añadido, cambiado o corregido.',
            steps: [
              'Pulsa ChangeLog en la esquina inferior izquierda.',
              'Revisa la versión actual arriba.',
              'Lee entradas por versión para conocer cambios recientes.'
            ],
            tips: [
              'Si algo cambia de comportamiento, revisa primero el Changelog.',
              'El número visible abajo a la izquierda identifica la build activa.'
            ],
            connection:
              'Cada mejora importante se documenta en changelog para que usuarios y testers sepan qué versión están usando.'
          },
          {
            title: 'Panel Admin',
            keywords: ['admin', 'usuarios', 'tickets', 'roles', 'métricas', 'dossier'],
            summary:
              'Zona privada para administradores: usuarios, roles, tickets, métricas internas y dossier técnico.',
            steps: [
              'Solo aparece si tu rol es admin.',
              'Abre Admin para revisar usuarios, tickets y métricas.',
              'Usa Dossier para entender arquitectura interna del proyecto.',
              'Responde tickets para que el usuario reciba notificación.'
            ],
            tips: [
              'El Dossier no se traduce porque es documentación privada.',
              'La cuenta owner está protegida frente a cambios accidentales.'
            ],
            connection:
              'Admin conecta Reportes, usuarios, Supabase, métricas y documentación interna.'
          }
        ]
      }
    ]
  },
  en: {
    eyebrow: 'Operational manual',
    title: 'How to Use Info Tarkov',
    subtitle:
      'Complete platform guide: what each module does, how everything connects and what to search when you have a specific question.',
    searchPlaceholder: 'Search: Kappa, FIR, PVE, report bug, hideout, PMC, keys...',
    empty: 'No results for that search. Try another keyword or use the chapter index.',
    allModules: 'Full guide',
    results: '{{count}} visible articles',
    chaptersLabel: 'Chapter index',
    openModule: 'Open module',
    keywordsLabel: 'Keywords',
    stepsLabel: 'How to use it',
    tipsLabel: 'Tips',
    connectionLabel: 'App connection',
    categories: [
      {
        id: 'getting-started',
        module: 'Getting Started',
        view: 'home',
        sections: [
          {
            title: 'What Info Tarkov is',
            keywords: ['home', 'hub', 'app', 'free', 'multilingual', 'pvp', 'pve'],
            summary:
              'Info Tarkov is a free hub for centralizing Escape From Tarkov support tools: progression, economy, bosses, maps, Kappa, Hideout, PMC and support.',
            steps: [
              'Open the website and use the main menu as your module terminal.',
              'Use the app as guest or create an account to save cloud progress.',
              'Switch language with the ES/EN selector in the top-left corner.',
              'Switch PVP/PVE inside modules that support both environments.'
            ],
            tips: [
              'If you only want to check data, you do not need an account.',
              'If you want progress across devices, create an account.',
              'Version 1.0 is designed for PC; mobile is planned as a later improvement.'
            ],
            connection:
              'The main menu connects to every module. Account stores Tarkov username, main mode and cloud progress where supported.'
          },
          {
            title: 'Language, session and guest mode',
            keywords: ['language', 'english', 'spanish', 'login', 'account', 'guest', 'session'],
            summary:
              'The app works in Spanish and English. You can browse as guest or log in to enable cloud saving and personal settings.',
            steps: [
              'Press ES/EN to switch language.',
              'Press Login / Create account to register or log in.',
              'In guest mode, data is stored locally in your browser.',
              'With an account, the app can sync progress to Supabase.'
            ],
            tips: [
              'Guest mode is good for trying the app, but it is not permanent backup.',
              'If browser data is cleared, guest progress can disappear.'
            ],
            connection:
              'Language affects the main public views. Session enables Account, user reports and cloud sync.'
          }
        ]
      },
      {
        id: 'account',
        module: 'Account and Profile',
        view: 'account',
        sections: [
          {
            title: 'Set up your account',
            keywords: ['account', 'username', 'main mode', 'password', 'delete account'],
            summary:
              'Account controls your username, main PVP/PVE mode and sensitive options such as password change or account deletion.',
            steps: [
              'Open your user button in the top-right corner.',
              'Set your Tarkov username.',
              'Choose main mode: PVP, PVE or both.',
              'Save changes so other modules can use that preference.'
            ],
            tips: [
              'Usernames cannot be duplicated.',
              'Main mode is a starting preference, but you can still switch PVP/PVE inside compatible modules.'
            ],
            connection:
              'PMC Profile uses the configured Tarkov username. Hideout, Flea, Kappa and other modules keep data separated by mode.'
          },
          {
            title: 'Report bugs or suggestions',
            keywords: ['report', 'bug', 'suggestion', 'ticket', 'notification', 'message'],
            summary:
              'Report works as a ticket system between users and administration. It supports bugs, suggestions and threaded replies.',
            steps: [
              'Press Report from the main menu while logged in.',
              'Create a ticket with type, title and description.',
              'When admin replies, you will see a notification on the Report button.',
              'Review the conversation history inside the ticket.'
            ],
            tips: [
              'The more specific the description, the easier it is to reproduce the issue.',
              'Include module, action performed and expected result.'
            ],
            connection:
              'Admin Panel gets notifications for pending tickets and users get notified when an admin replies.'
          }
        ]
      },
      {
        id: 'missions',
        module: 'Missions / Kappa',
        view: 'kappa',
        sections: [
          {
            title: 'Quest tree',
            keywords: ['missions', 'quests', 'kappa', 'trader', 'prapor', 'therapist', 'tree'],
            summary:
              'Shows quests per trader as a graph, separates PVP/PVE progress and displays dependencies between quests.',
            steps: [
              'Open Missions / Kappa from the menu.',
              'Select a trader from the top bar.',
              'Use global search to find quests by name.',
              'Press Complete to mark progress.',
              'Switch PVP/PVE from the side panel.'
            ],
            tips: [
              'The graph opens centered so you do not have to hunt for the start.',
              'Use “show incomplete only” to reduce visual noise.'
            ],
            connection:
              'Progress feeds Kappa stats and saves locally/cloud depending on session. Quest Optimizer uses pending quests.'
          },
          {
            title: 'Collector / Kappa Items checklist',
            keywords: ['collector', 'kappa items', 'found in raid', 'fir', 'fence', 'checklist'],
            summary:
              'Inside Collector you can open a checklist for every Kappa item and mark them as you find them.',
            steps: [
              'Go to trader Fence.',
              'Find the Collector quest.',
              'Open the Kappa Items submenu.',
              'Search by name, clue or spawn.',
              'Mark each object when you have it Found in Raid.'
            ],
            tips: [
              'Collector requires Found in Raid items; buying them is not enough.',
              'Use search to locate a specific object quickly.'
            ],
            connection:
              'The checklist is local per user and helps prepare Kappa without leaving the quest tree.'
          },
          {
            title: 'Quest Optimizer',
            keywords: ['quest optimizer', 'optimize', 'next raid', 'recommended map', 'keys'],
            summary:
              'Analyzes pending quests and suggests which map can give the most value in your next raid.',
            steps: [
              'Press Quest Optimizer inside Missions / Kappa.',
              'Review the main recommendation.',
              'Filter by map or prioritize Kappa if that is your goal.',
              'Check suggested keys before entering raid.'
            ],
            tips: [
              'Use it when you have many open quests and do not know which map to play.',
              'It does not replace judgment: prioritize survival if carrying important items.'
            ],
            connection:
              'Combines quest progress, maps, Kappa status and Key System.'
          }
        ]
      },
      {
        id: 'hideout',
        module: 'Hideout Management',
        view: 'hideout',
        sections: [
          {
            title: 'Plan stations and levels',
            keywords: ['hideout', 'station', 'level', 'built', 'blocked'],
            summary:
              'Hideout shows stations in natural progression order, with levels, blockers and required materials.',
            steps: [
              'Open Hideout Management.',
              'Switch PVP/PVE depending on your environment.',
              'Select a station in the left panel.',
              'Choose target level at the top.',
              'Mark the built level if you already have it.'
            ],
            tips: [
              'Marking a higher built level auto-completes materials from previous levels.',
              'Blockers show required stations, traders or skills first.'
            ],
            connection:
              'Uses PVP/PVE flea prices where available and saves checklist by user/mode.'
          },
          {
            title: 'Materials, FIR and pending cost',
            keywords: ['materials', 'fir', 'found in raid', 'cost', 'flea', 'checklist'],
            summary:
              'Each station shows required materials, mandatory FIR tags, total budget and pending cost based on your checklist.',
            steps: [
              'Mark each material when obtained.',
              'Check if FIR REQUIRED appears.',
              'Review budget and pending amount from checklist.',
              'Switch PVP/PVE to recalculate market prices.'
            ],
            tips: [
              'Not everything is FIR: the app distinguishes real requirements when data allows it.',
              'If an item has no price, the cost can be incomplete.'
            ],
            connection:
              'Connects to tarkov.dev for data/prices and Supabase/localStorage for progress.'
          }
        ]
      },
      {
        id: 'pmc',
        module: 'PMC Profile',
        view: 'pmc-profile',
        sections: [
          {
            title: 'Sync a public profile',
            keywords: ['pmc', 'profile', 'tarkov.dev', 'account id', 'pvp', 'pve', 'search player'],
            summary:
              'PMC Profile reads public players.tarkov.dev JSON for already indexed players and shows an enriched dossier.',
            steps: [
              'Set your Tarkov username in Account.',
              'Open PMC Profile.',
              'Switch PVP/PVE if needed.',
              'Press My Profile or search another player by name.',
              'Use Tarkov.dev to open the official profile if you need source verification.'
            ],
            tips: [
              'Only players already viewed on tarkov.dev/players appear.',
              'The public index updates roughly once per day.',
              'If someone does not appear, open their tarkov.dev profile first and wait for the index update.'
            ],
            connection:
              'Combines public profile, items, achievements, skills, favorites and PNG export through Netlify Functions.'
          },
          {
            title: 'Achievements, skills and card export',
            keywords: ['achievements', 'skills', 'export', 'card', 'png'],
            summary:
              'The dossier shows stats, visible gear, favorites, filterable achievements, farmed skills and an exportable card.',
            steps: [
              'Review the top block with level, faction, raids, SR and kills.',
              'Check tactical gear and favorites if the profile exposes them.',
              'Filter achievements by all, legendary, rare or common.',
              'Review farmed skills sorted by progress.',
              'Press Export card to generate a summary image.'
            ],
            tips: [
              'The PNG card is meant for sharing a profile without exposing technical JSON.',
              'Copying AccID helps debug or open specific profiles.'
            ],
            connection:
              'Export uses an image proxy to embed external icons into canvas without CORS issues.'
          }
        ]
      },
      {
        id: 'economy',
        module: 'Economy: Flea and Keys',
        view: 'flea',
        sections: [
          {
            title: 'Flea Market Tracker',
            keywords: ['flea', 'market', 'price', 'pvp', 'pve', 'chart', 'profitability'],
            summary:
              'Lets you search items, compare PVP/PVE prices, inspect historical trends and spot market opportunities.',
            steps: [
              'Open Flea Market Tracker.',
              'Choose PVP or PVE.',
              'Search an item by English or Spanish name without accents.',
              'Open detail to see chart, current price, average and trader value.',
              'Hover chart points to see price/date.'
            ],
            tips: [
              'PVP and PVE have separate economies; always check the correct mode.',
              'The fluctuation radar helps detect items that moved strongly.'
            ],
            connection:
              'Hideout and Keys reuse prices to calculate costs or priorities.'
          },
          {
            title: 'Key System',
            keywords: ['keys', 'keycards', 'map', 'quest', 'wiki', 'price'],
            summary:
              'Live key and keycard search with PVP/PVE prices, map, linked quests and a tactical priority layer.',
            steps: [
              'Open Key System.',
              'Search by key, map, quest or tag.',
              'Filter by map or category.',
              'Enable “Important first” if you want progression priority.',
              'Open wiki for exact location or detailed use.'
            ],
            tips: [
              'Important keys are marked by utility, quest use or tactical value.',
              'If tarkov.dev fails, a local important-key layer appears.'
            ],
            connection:
              'Quest Optimizer can suggest critical keys before a quest route.'
          }
        ]
      },
      {
        id: 'combat',
        module: 'Intel: Bosses, Goons and Simulator',
        view: 'bosses',
        sections: [
          {
            title: 'Intel: Bosses',
            keywords: ['bosses', 'spawn', 'killa', 'wedge', 'map', 'loot', 'difficulty'],
            summary:
              'Boss dossiers with portrait, maps, spawn chance, difficulty, squad, known zones, gear, ammo and tactical notes.',
            steps: [
              'Open Intel: Bosses.',
              'Filter by map or search a specific boss.',
              'Open a dossier to see maps, spawn zones and combat data.',
              'Review entry plan, weapons, ammo, weak points and loot.'
            ],
            tips: [
              'Spawn zones are structured text when reliable coordinates are not available.',
              'Percentages can change with patches; check changelog if you notice recent changes.'
            ],
            connection:
              'Maps 2.0 and Bosses share the same philosophy: useful curated data instead of false precision.'
          },
          {
            title: 'Goons Tracker',
            keywords: ['goons', 'birdeye', 'knight', 'big pipe', 'rotation', 'location'],
            summary:
              'Checks external sources to estimate Goons location or rotation.',
            steps: [
              'Open Goons Tracker.',
              'Review active map, source and status.',
              'Cross-check if a warning about external source reliability appears.'
            ],
            tips: [
              'This module depends on external sources and can fail if source HTML changes.',
              'Use it as orientation, not absolute certainty.'
            ],
            connection:
              'Troubleshooting documents limitations for external sources such as Goons.'
          },
          {
            title: 'Ballistics Simulator',
            keywords: ['simulator', 'ballistics', 'ammo', 'armor', 'ttk', 'penetration'],
            summary:
              'Tool for comparing ammo and armor, estimating penetration, damage and approximate time to kill.',
            steps: [
              'Open Ballistics Simulator.',
              'Search ammo by caliber or name.',
              'Select target armor.',
              'Review estimated shots, probability and impact telemetry.'
            ],
            tips: [
              'Use it to understand tendencies, not as perfect combat prediction.',
              'Durability, distance and impact zones can change real outcomes.'
            ],
            connection:
              'Complements Bosses and raid preparation when choosing ammo.'
          }
        ]
      },
      {
        id: 'maps-story-prestige',
        module: 'Maps, Story and Prestige',
        view: 'maps',
        sections: [
          {
            title: 'Tactical Maps',
            keywords: ['maps', 'transits', 'icebreaker', 'labyrinth', 'terminal', 'zones'],
            summary:
              'Maps combines an external viewer with clean briefings: description, base data, conflict zones and points of interest.',
            steps: [
              'Open Tactical Maps.',
              'Choose a map in the top grid.',
              'Read the briefing before using the viewer.',
              'Use the iframe for extracts, routes and visual points.',
              'Use Transits to view map connections.'
            ],
            tips: [
              'Icebreaker, Labyrinth and Terminal have special curated data.',
              'Transits is not a loot map; it is a connection chart.'
            ],
            connection:
              'Maps helps prepare routes for quests, bosses, keys and story progression.'
          },
          {
            title: 'Decisions / Endings',
            keywords: ['endings', 'story', 'decisions', 'armored case', 'kerman', 'terminal'],
            summary:
              'Guide for narrative decisions, points of no return and critical requirements for story routes.',
            steps: [
              'Open Decisions / Endings.',
              'Read the initial block and main decisions.',
              'Expand requirements where a route allows it.',
              'Compare consequences before committing items or money.'
            ],
            tips: [
              'Do not take irreversible decisions without checking later requirements.',
              'This module is a story compass, not a full wiki.'
            ],
            connection:
              'Relates to Kappa, Hideout, Maps and future endgame routes such as Terminal.'
          },
          {
            title: 'Prestige',
            keywords: ['prestige', 'pvp only', 'rewards', 'badge'],
            summary:
              'PVP ONLY module for preparing each prestige level with requirements, rewards, checklist and visual badges.',
            steps: [
              'Open Prestige.',
              'Select level 1-6.',
              'Review PMC level, money, quests, story, skills and hideout.',
              'Mark completed requirements to track progress.'
            ],
            tips: [
              'Prestige does not apply to PVE.',
              'Required money is shown separately because it is not tracked automatically.'
            ],
            connection:
              'Prestige crosses endgame progress with quests, story, skills and Hideout infrastructure.'
          }
        ]
      },
      {
        id: 'support',
        module: 'Support, Admin and Changelog',
        view: 'trouble',
        sections: [
          {
            title: 'Troubleshooting',
            keywords: ['troubleshooting', 'errors', 'issues', 'api', 'bundle', 'limitations'],
            summary:
              'Known issues, technical limitations and what to do when a module does not respond as expected.',
            steps: [
              'Open Troubleshooting from the menu.',
              'Find the closest symptom.',
              'Read the recommended fix.',
              'If it is not listed, open a Report with details.'
            ],
            tips: [
              'Especially useful for external API issues or non-indexed PMC profiles.',
              'Not every issue comes from Info Tarkov: some external sources can fail temporarily.'
            ],
            connection:
              'Troubleshooting connects public documentation, Reports and project quality decisions.'
          },
          {
            title: 'ChangeLog',
            keywords: ['changelog', 'version', 'updates', '1.0', 'changes'],
            summary:
              'Public version history to know what has been added, changed or fixed.',
            steps: [
              'Press ChangeLog in the bottom-left corner.',
              'Check current version at the top.',
              'Read entries by version to understand recent changes.'
            ],
            tips: [
              'If something changes behavior, check Changelog first.',
              'The visible number in the bottom-left identifies the active build.'
            ],
            connection:
              'Every relevant improvement is documented so users and testers know which version they are using.'
          },
          {
            title: 'Admin Panel',
            keywords: ['admin', 'users', 'tickets', 'roles', 'metrics', 'dossier'],
            summary:
              'Private administrator area: users, roles, tickets, internal metrics and technical dossier.',
            steps: [
              'Only appears if your role is admin.',
              'Open Admin to review users, tickets and metrics.',
              'Use Dossier to understand internal project architecture.',
              'Reply to tickets so the user receives a notification.'
            ],
            tips: [
              'Dossier is not translated because it is private documentation.',
              'The owner account is protected from accidental changes.'
            ],
            connection:
              'Admin connects Reports, users, Supabase, metrics and internal documentation.'
          }
        ]
      }
    ]
  }
};
