export const APP_VERSION = '0.11.1';

export const VERSION_POLICY = {
  current: '0.x',
  labels: {
    es: {
      title: 'Sistema de versiones',
      body:
        'Mientras Info Tarkov siga en fase beta, usamos versionado 0.x. Subimos el tercer numero para fixes pequenos, el segundo numero para nuevas funciones o cambios importantes de modulos, y reservamos la version 1.0.0 para una primera version publica estable con traduccion y QA mas completos.'
    },
    en: {
      title: 'Versioning system',
      body:
        'While Info Tarkov is still in beta, we use 0.x versioning. The third number is for small fixes, the second number is for new features or relevant module changes, and 1.0.0 is reserved for the first stable public release with fuller translation and QA.'
    }
  }
};

export const changelogEntries = [
  {
    version: '0.11.1',
    date: '2026-05-20',
    codename: 'Hideout Auto Checklist',
    type: 'improvement',
    title: {
      es: 'Autocompletado de materiales al marcar niveles construidos',
      en: 'Material auto-completion when marking built levels'
    },
    summary: {
      es: 'Gestion del Refugio ahora automatiza el checklist cuando marcas una estacion como construida a cierto nivel.',
      en: 'Hideout Management now automates the checklist when marking a station as built to a given level.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Al marcar una instancia como construida a nivel X, se tachan automaticamente los materiales de todos los niveles hasta X.',
          en: 'When marking a station as built to level X, all material requirements up to level X are automatically checked.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Si bajas el nivel construido, se limpian los materiales de niveles superiores para mantener coherente el checklist.',
          en: 'If the built level is lowered, higher-level materials are cleared to keep the checklist consistent.'
        }
      }
    ]
  },
  {
    version: '0.11.0',
    date: '2026-05-20',
    codename: 'Connected Operations',
    type: 'feature',
    title: {
      es: 'Hideout 2.0, Bosses 2.0 y perfiles conectados',
      en: 'Hideout 2.0, Bosses 2.0 and connected profiles'
    },
    summary: {
      es: 'Se amplian los modulos de refugio, bosses y PMC con progreso mas profundo y sincronizacion cloud preparada para cuentas.',
      en: 'Expanded hideout, bosses and PMC modules with deeper progress tracking and account-ready cloud sync.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Hideout 2.0: seguimiento de niveles construidos, progreso total y mejoras desbloqueadas o bloqueadas.',
          en: 'Hideout 2.0: built-level tracking, total progress and unlocked or blocked upgrades.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Sincronizacion cloud preparada para checklist/niveles del Hideout y Perfil de PMC mediante `user_module_state`.',
          en: 'Cloud sync prepared for Hideout checklist/levels and PMC Profile through `user_module_state`.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Bosses 2.0: filtro por dificultad, contador de objetivos, desglose de spawn por mapa y plan tactico recomendado.',
          en: 'Bosses 2.0: difficulty filter, target counter, map spawn breakdown and recommended tactical plan.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido SQL documentado para crear la tabla generica de estado por modulo en Supabase.',
          en: 'Added documented SQL for creating the generic per-module state table in Supabase.'
        }
      }
    ]
  },
  {
    version: '0.10.1',
    date: '2026-05-20',
    codename: 'Hideout FIR Fix',
    type: 'improvement',
    title: {
      es: 'Correccion del detector FIR en Gestion del Refugio',
      en: 'Hideout FIR detector correction'
    },
    summary: {
      es: 'Se ajusta la logica que distingue requisitos Found In Raid para evitar falsos positivos en materiales comprables.',
      en: 'Adjusted the logic that identifies Found In Raid requirements to avoid false positives on buyable materials.'
    },
    changes: [
      {
        type: 'fixed',
        text: {
          es: 'El modulo ya no marca como FIR cualquier requisito que mencione raid en sus atributos internos.',
          en: 'The module no longer marks any requirement mentioning raid in internal attributes as FIR.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Ahora el distintivo FIR exige un atributo explicito y positivo de found-in-raid.',
          en: 'The FIR label now requires an explicit positive found-in-raid attribute.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Reordenadas las secciones del refugio para que sigan una progresion mas natural de construccion.',
          en: 'Reordered hideout sections to follow a more natural construction progression.'
        }
      }
    ]
  },
  {
    version: '0.10.0',
    date: '2026-05-19',
    codename: 'Hideout Logistics',
    type: 'feature',
    title: {
      es: 'Gestion del Refugio con PVP/PVE, checklist y requisitos completos',
      en: 'Hideout Management with PVP/PVE, checklist and full requirements'
    },
    summary: {
      es: 'El modulo de refugio pasa a usar costes separados por mercado, permite marcar materiales conseguidos y muestra bloqueos reales de construccion.',
      en: 'The hideout module now uses separated market costs, lets users tick collected materials and shows real construction blockers.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadido selector PVP/PVE en Gestion del Refugio con precios ajustados por `gameMode`.',
          en: 'Added PVP/PVE switch to Hideout Management with prices adjusted by `gameMode`.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido checklist local por modo, estacion y nivel para tachar materiales ya conseguidos.',
          en: 'Added local checklist by mode, station and level for ticking collected materials.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadidos avisos FIR/FLEA OK segun los atributos de requisito que devuelve la API.',
          en: 'Added FIR/FLEA OK labels based on requirement attributes returned by the API.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadidos requisitos de otras instancias del refugio, traders y skills para cada nivel.',
          en: 'Added required hideout stations, traders and skills for each level.'
        }
      }
    ]
  },
  {
    version: '0.9.0',
    date: '2026-05-19',
    codename: 'Market Split',
    type: 'feature',
    title: {
      es: 'Flea Market separado por PVP/PVE y notas de parche publicas',
      en: 'PVP/PVE Flea Market split and public patch notes'
    },
    summary: {
      es: 'El tracker economico empieza a tratar PVP y PVE como mercados separados, y la app estrena un historial publico de cambios.',
      en: 'The economy tracker now treats PVP and PVE as separate markets, and the app gets a public update history.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadido selector PVP/PVE en Flea Market Tracker.',
          en: 'Added a PVP/PVE switch to Flea Market Tracker.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Las queries del flea usan `gameMode: regular` para PVP y `gameMode: pve` para PVE.',
          en: 'Flea queries now use `gameMode: regular` for PVP and `gameMode: pve` for PVE.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadida vista publica de notas de parche con sistema de versiones propio.',
          en: 'Added a public patch notes view with its own versioning system.'
        }
      }
    ]
  },
  {
    version: '0.8.0',
    date: '2026-05-19',
    codename: 'Polish Pass',
    type: 'improvement',
    title: {
      es: 'Pulido visual, rendimiento, traduccion y login de produccion',
      en: 'Visual polish, performance, translation and production login'
    },
    summary: {
      es: 'Pase grande de acabado: efectos terminal mas suaves, menos lag, correcciones de login y base multilenguaje mas ordenada.',
      en: 'A broad finishing pass: smoother terminal visuals, less lag, login fixes and a cleaner multilingual base.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Optimizados los efectos esteticos globales para reducir coste de render y evitar parpadeos molestos.',
          en: 'Optimized global visual effects to reduce render cost and remove uncomfortable flicker.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'Corregida la redireccion de verificacion de email para evitar enlaces de produccion apuntando a localhost.',
          en: 'Fixed email verification redirects so production links no longer point to localhost.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Avanzada la traduccion ES/EN en login, cuenta, tickets, estado de servidores, eventos, troubleshooting y Misiones/Kappa.',
          en: 'Expanded ES/EN translation across login, account, tickets, server status, events, troubleshooting and Missions/Kappa.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'Restaurada la carga de imagenes de bosses tras cambios de assets.',
          en: 'Restored boss image loading after asset changes.'
        }
      }
    ]
  },
  {
    version: '0.7.0',
    date: '2026-05-19',
    codename: 'Command Center',
    type: 'feature',
    title: {
      es: 'Llaves completas, PMC Profile y Quest Optimizer integrado',
      en: 'Full key system, PMC Profile and integrated Quest Optimizer'
    },
    summary: {
      es: 'La app crece como hub operativo: buscador vivo de llaves, perfil local de PMC y optimizador de quests dentro de KappaTree.',
      en: 'The app grows as an operations hub: live key search, local PMC profile and quest optimizer inside KappaTree.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Creado Sistema de Llaves con catalogo vivo desde tarkov.dev, filtros, llaves importantes, precios, iconos y fallback local.',
          en: 'Created Key System with live tarkov.dev catalog, filters, important keys, prices, icons and local fallback.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Creado Perfil de PMC local-first con modo, faccion, nivel, supervivencia, economia, objetivo de wipe y recomendaciones.',
          en: 'Created local-first PMC Profile with mode, faction, level, survival, economy, wipe goal and recommendations.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Quest Optimizer deja de ser tarjeta independiente y pasa a vivir dentro de Misiones / Kappa.',
          en: 'Quest Optimizer moved from standalone card into Missions / Kappa.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'Recentrado inicial del organigrama de Misiones / Kappa y corregido bloque visual del encabezado.',
          en: 'Recentred the initial Missions / Kappa graph view and fixed the header visual block.'
        }
      }
    ]
  },
  {
    version: '0.6.0',
    date: '2026-05-19',
    codename: 'Accounts',
    type: 'feature',
    title: {
      es: 'Cuentas, Supabase, panel admin y sistema de tickets',
      en: 'Accounts, Supabase, admin panel and ticket system'
    },
    summary: {
      es: 'Se incorpora la capa de usuarios: autenticacion, roles, panel administrativo, metricas y comunicacion usuario-admin.',
      en: 'Introduced the user layer: authentication, roles, admin panel, metrics and user-admin communication.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadido login y registro con Supabase Auth.',
          en: 'Added login and registration with Supabase Auth.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido sistema de usuarios, nombres publicos, roles y owner protegido.',
          en: 'Added users, public usernames, roles and protected owner account.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido panel admin con usuarios, roles, metricas, sesiones activas y gestion de tickets.',
          en: 'Added admin panel with users, roles, metrics, active sessions and ticket management.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido sistema Report para bugs, sugerencias, respuestas, cierre y borrado local de tickets.',
          en: 'Added Report system for bugs, suggestions, replies, closing and local ticket removal.'
        }
      }
    ]
  },
  {
    version: '0.5.0',
    date: '2026-05-19',
    codename: 'Live Feed',
    type: 'feature',
    title: {
      es: 'Eventos en directo y estado de servidores',
      en: 'Live events and server status'
    },
    summary: {
      es: 'La app empieza a mirar hacia fuera: estado de servicios, feed de eventos, fuentes externas y fallback manual.',
      en: 'The app starts watching external sources: service status, event feeds, external sources and manual fallback.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadido modulo Estado de Servidores con telemetria de servicios logicos.',
          en: 'Added Server Status module with logical service telemetry.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido modulo Eventos en Directo con lectura de tarkovdata, CDN/proxy fallback y clasificacion activo/reciente/finalizado.',
          en: 'Added Live Events module with tarkovdata reading, CDN/proxy fallback and active/recent/ended classification.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Anadido fallback manual para eventos verificados cuando las fuentes automaticas no detectan un evento activo.',
          en: 'Added manual fallback for verified events when automatic sources miss an active event.'
        }
      }
    ]
  },
  {
    version: '0.4.0',
    date: '2026-05-18',
    codename: 'Kappa Tree',
    type: 'feature',
    title: {
      es: 'Misiones / Kappa avanzado y Gestion del Refugio',
      en: 'Advanced Missions / Kappa and Hideout Management'
    },
    summary: {
      es: 'La progresion se convierte en una herramienta central: arbol de quests, PVP/PVE, guardado local/cloud y checklist Collector.',
      en: 'Progression becomes a central tool: quest tree, PVP/PVE, local/cloud saving and Collector checklist.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadido organigrama de Misiones / Kappa conectado a tarkov.dev.',
          en: 'Added Missions / Kappa quest tree connected to tarkov.dev.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido progreso separado PVP/PVE, modo invitado con localStorage y sincronizacion con Supabase si hay cuenta.',
          en: 'Added separated PVP/PVE progress, guest localStorage and Supabase sync when logged in.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido checklist de items Collector/Kappa con busqueda, progreso e imagenes cuando la API las devuelve.',
          en: 'Added Collector/Kappa item checklist with search, progress and icons when the API provides them.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido modulo Gestion del Refugio como planificador de hideout.',
          en: 'Added Hideout Management as a hideout planner.'
        }
      }
    ]
  },
  {
    version: '0.3.0',
    date: '2026-05-18',
    codename: 'Economy',
    type: 'feature',
    title: {
      es: 'Flea Market Tracker y mejoras visuales',
      en: 'Flea Market Tracker and visual improvements'
    },
    summary: {
      es: 'Primera herramienta economica: busqueda de items, precios, graficas historicas y radar de fluctuaciones.',
      en: 'First economy tool: item search, prices, historical charts and fluctuation radar.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadido Flea Market Tracker con datos de tarkov.dev.',
          en: 'Added Flea Market Tracker using tarkov.dev data.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadidos calculos de precio por slot, media 24h, ultimo precio bajo y vendedores.',
          en: 'Added price per slot, 24h average, last low price and trader sell values.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Mejorada estetica general de tarjetas, fondos y estilo terminal.',
          en: 'Improved overall card, background and terminal styling.'
        }
      }
    ]
  },
  {
    version: '0.2.0',
    date: '2026-05-18',
    codename: 'Intel Modules',
    type: 'feature',
    title: {
      es: 'Mapas, Goons, finales e inteligencia de bosses',
      en: 'Maps, Goons, endings and boss intelligence'
    },
    summary: {
      es: 'Primer bloque de modulos tacticos para consulta rapida antes de raid.',
      en: 'First group of tactical modules for quick pre-raid consultation.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadido modulo de Mapas Tacticos.',
          en: 'Added Tactical Maps module.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido Tracker de Goons con lectura de fuente externa.',
          en: 'Added Goons Tracker with external source reading.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido modulo Decisiones / Finales.',
          en: 'Added Decisions / Endings module.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadido Intel: Bosses con fichas de informacion, mapas y loot.',
          en: 'Added Intel: Bosses with information cards, maps and loot.'
        }
      }
    ]
  },
  {
    version: '0.1.0',
    date: '2026-05-18',
    codename: 'Sherpa Core',
    type: 'foundation',
    title: {
      es: 'Primera base de Info Tarkov',
      en: 'First Info Tarkov foundation'
    },
    summary: {
      es: 'Arranque del proyecto como hub modular para Escape From Tarkov, todavia con nombre interno Sherpa.',
      en: 'Project started as a modular Escape From Tarkov hub, still under the internal Sherpa name.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Creada la base React/Vite de la app.',
          en: 'Created the React/Vite app foundation.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadida navegacion modular desde el menu principal.',
          en: 'Added modular navigation from the main menu.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Primer pase de naming, title cases y estructura visual.',
          en: 'First pass on naming, title casing and visual structure.'
        }
      }
    ]
  }
];
