export const APP_VERSION = '1.1.0';

export const VERSION_POLICY = {
  current: '1.x',
  labels: {
    es: {
      title: 'Sistema de versiones',
      body:
        'Info Tarkov usa versionado semantico. La version 1.0.0 marca el primer lanzamiento publico estable desktop-first; los fixes suben el tercer numero, las funciones relevantes suben el segundo y los cambios mayores reservan una nueva version principal.'
    },
    en: {
      title: 'Versioning system',
      body:
        'Info Tarkov uses semantic versioning. Version 1.0.0 marks the first stable public desktop-first release; fixes bump the third number, relevant features bump the second, and major changes reserve a new main version.'
    }
  }
};

export const changelogEntries = [
  {
    version: '1.1.0',
    date: '2026-06-23',
    codename: 'How to Use Manual',
    type: 'feature',
    title: {
      es: 'Guía completa de uso',
      en: 'Complete how-to-use guide'
    },
    summary: {
      es: 'About incorpora una sección Cómo usar / How to Use con buscador, índice por módulos y explicación detallada de toda la plataforma.',
      en: 'About adds a How to Use section with search, module index and detailed explanations for the whole platform.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Nueva vista de manual operativo con contenido ES/EN, búsqueda por palabras clave, filtros por módulo y bloques desplegables.',
          en: 'New operational manual view with ES/EN content, keyword search, module filters and expandable blocks.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'La guía cubre inicio, cuenta, idioma, reportes, admin, Misiones/Kappa, Quest Optimizer, Collector, Hideout, PMC, Flea, Llaves, Bosses, Goons, Simulador, Mapas, Historia, Prestigios, Troubleshooting y ChangeLog.',
          en: 'The guide covers home, account, language, reports, admin, Missions/Kappa, Quest Optimizer, Collector, Hideout, PMC, Flea, Keys, Bosses, Goons, Simulator, Maps, Story, Prestige, Troubleshooting and ChangeLog.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'About añade un acceso destacado a la guía para reducir fricción de usuarios nuevos tras el lanzamiento 1.0.',
          en: 'About adds a featured entry point to the guide to reduce friction for new users after the 1.0 launch.'
        }
      }
    ]
  },
  {
    version: '1.0.0',
    date: '2026-06-23',
    codename: 'First Stable Release',
    type: 'release',
    title: {
      es: 'Primer lanzamiento estable',
      en: 'First stable release'
    },
    summary: {
      es: 'Info Tarkov llega a su primera version estable desktop-first con los modulos principales revisados, traduccion ES/EN, progreso PVP/PVE y documentacion publica alineada.',
      en: 'Info Tarkov reaches its first stable desktop-first release with the main modules reviewed, ES/EN translation, PVP/PVE progress and aligned public documentation.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Se consolida la experiencia publica con Mapas 2.0, Misiones/Kappa, Hideout, PMC Profile, Flea, Bosses, Goons, Llaves, Prestigios, Simulador, Reportes, Admin, About, Changelog y Troubleshooting.',
          en: 'The public experience is consolidated with Maps 2.0, Missions/Kappa, Hideout, PMC Profile, Flea, Bosses, Goons, Keys, Prestige, Simulator, Reports, Admin, About, Changelog and Troubleshooting.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'La version visible pasa a v1.0.0 y el sistema de versiones deja atras la fase beta 0.x.',
          en: 'The visible version moves to v1.0.0 and the versioning system leaves the 0.x beta phase behind.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'La 1.0 se declara desktop-first: la adaptacion movil queda planificada como hito posterior sin bloquear el lanzamiento.',
          en: '1.0 is declared desktop-first: mobile adaptation remains planned as a later milestone without blocking release.'
        }
      }
    ]
  },
  {
    version: '0.14.40',
    date: '2026-06-23',
    codename: 'Pre-1.0 Release Polish',
    type: 'changed',
    title: {
      es: 'Pulido final pre-1.0',
      en: 'Final pre-1.0 polish'
    },
    summary: {
      es: 'Se limpia la documentacion publica del proyecto para reflejar el estado real de lanzamiento desktop-first y la retirada de Live Events.',
      en: 'Public project documentation is cleaned up to reflect the real desktop-first launch state and the removal of Live Events.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'About elimina el modulo fantasma de Eventos en Directo y actualiza Mapas como Mapas 2.0 con briefings limpios.',
          en: 'About removes the ghost Live Events module and updates Maps as Maps 2.0 with clean briefings.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Troubleshooting deja de presentar Live Events como modulo activo y actualiza la cobertura ES/EN como revisada para la fase pre-1.0.',
          en: 'Troubleshooting no longer presents Live Events as an active module and marks ES/EN coverage as reviewed for the pre-1.0 phase.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'El numero visible de version sube a v0.14.40 para identificar esta build de pulido.',
          en: 'The visible version number moves to v0.14.40 to identify this polish build.'
        }
      }
    ]
  },
  {
    version: '0.14.39',
    date: '2026-06-23',
    codename: 'Tactical Map Briefings',
    type: 'feature',
    title: {
      es: 'Briefings tácticos en Mapas',
      en: 'Tactical briefings in Maps'
    },
    summary: {
      es: 'La sección de Mapas añade briefings limpios por mapa con descripción, datos base, zonas de conflicto y puntos de interés.',
      en: 'The Maps section adds clean briefings per map with description, base data, conflict zones and points of interest.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Mapas incorpora un panel de briefing bajo la selección de mapas, preparado en ES/EN y separado en datos mantenibles.',
          en: 'Maps now includes a briefing panel below map selection, prepared in ES/EN and split into maintainable data.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Icebreaker, Labyrinth y Terminal reciben tratamiento especial con datos base revisados; Transits queda reducido a su función principal de organigrama de conexiones.',
          en: 'Icebreaker, Labyrinth and Terminal receive special treatment with reviewed base data; Transits is reduced to its main connection-chart purpose.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'El dossier interno documenta que Mapas combina visor externo con briefings tácticos curados mediante mapBriefings.js e i18n.',
          en: 'The internal dossier documents that Maps combines the external viewer with curated tactical briefings through mapBriefings.js and i18n.'
        }
      }
    ]
  },
  {
    version: '0.14.38',
    date: '2026-06-23',
    codename: 'Pre-1.0 Quality Gate',
    type: 'changed',
    title: {
      es: 'Live Events sale de la build',
      en: 'Live Events leaves the build'
    },
    summary: {
      es: 'Se retira Eventos en Directo antes de la 1.0 porque no existe una fuente fiable que cumpla el estándar de calidad de Info Tarkov.',
      en: 'Live Events is removed before 1.0 because there is no reliable source that meets Info Tarkov quality standards.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'El menú principal ya no muestra Eventos en Directo y la ruta interna del módulo queda eliminada.',
          en: 'The main menu no longer shows Live Events and the internal module route has been removed.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Se eliminan los ficheros del módulo experimental y sus textos activos de About/Troubleshooting/i18n.',
          en: 'The experimental module files and active About/Troubleshooting/i18n copy have been removed.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'El dossier interno documenta el criterio pre-1.0: lanzamiento desktop-first y adaptación móvil planificada para después.',
          en: 'The internal dossier documents the pre-1.0 decision: desktop-first launch and mobile adaptation planned afterwards.'
        }
      }
    ]
  },
  {
    version: '0.14.37',
    date: '2026-06-23',
    codename: 'Boss Portrait Framing',
    type: 'improvement',
    title: {
      es: 'Retratos de bosses mejor encuadrados',
      en: 'Better framed boss portraits'
    },
    summary: {
      es: 'Se ajusta el encuadre visual de varios bosses en Intel: Bosses y se corrige The Wedge como spawn garantizado.',
      en: 'Several boss portrait crops are refined in Intel: Bosses and The Wedge is corrected as a guaranteed spawn.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Birdeye, Kollontay y The Wedge usan foco de imagen específico para que la cara/equipo principal no quede cortado en la lista.',
          en: 'Birdeye, Kollontay and The Wedge now use specific image focus points so their face/main gear is not cropped in the list.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'The Wedge pasa de spawn no confirmado a 100%, al ser el boss garantizado de Icebreaker.',
          en: 'The Wedge changes from unconfirmed spawn to 100%, as the guaranteed Icebreaker boss.'
        }
      }
    ]
  },
  {
    version: '0.14.36',
    date: '2026-06-23',
    codename: 'The Wedge Intel Polish',
    type: 'improvement',
    title: {
      es: 'The Wedge queda integrado',
      en: 'The Wedge is fully integrated'
    },
    summary: {
      es: 'Se completa la ficha de The Wedge con imagen local, zona más precisa en Icebreaker y mejor tratamiento de spawn sin porcentaje confirmado.',
      en: 'The Wedge dossier is completed with a local image, more precise Icebreaker zone data and better handling for unconfirmed spawn rates.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Intel: Bosses usa la imagen local de The Wedge y evita mostrar 0% cuando el porcentaje de spawn no está confirmado.',
          en: 'Intel: Bosses now uses The Wedge local image and avoids showing 0% when the spawn rate is not confirmed.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'La ficha de The Wedge concreta gimnasio del nivel 3 de Icebreaker, 880 de vida y escolta Black Division de 3-6 seguidores.',
          en: 'The Wedge dossier now specifies Icebreaker level 3 gym, 880 health and a 3-6 Black Division follower escort.'
        }
      }
    ]
  },
  {
    version: '0.14.35',
    date: '2026-06-15',
    codename: 'Public Copy i18n Cleanup',
    type: 'improvement',
    title: {
      es: 'Traducción pública más cerrada',
      en: 'Public translation coverage tightened'
    },
    summary: {
      es: 'Se revisan textos visibles restantes en Cuenta, Report, Astur, Quest Optimizer y Simulador Balístico.',
      en: 'Remaining visible copy is reviewed across Account, Report, Astur, Quest Optimizer and Ballistics Simulator.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'La vista Astur pasa a usar i18n y cambia correctamente entre ES/EN.',
          en: 'The Astur view now uses i18n and switches correctly between ES/EN.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Los errores de respuesta/cierre de tickets del usuario pasan a plantillas traducibles.',
          en: 'User ticket reply/close errors now use translatable templates.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Quest Optimizer mueve riesgos y recomendaciones fallback al sistema de locales.',
          en: 'Quest Optimizer moves fallback risks and recommendations into locale files.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Sistema de Llaves mueve usos, zonas y recomendaciones de llaves importantes a claves ES/EN.',
          en: 'Key System moves important-key uses, areas and recommendations into ES/EN keys.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'ChangeLog y botones inferiores del menú se conectan al sistema global de i18n.',
          en: 'ChangeLog and lower menu buttons are connected to the global i18n system.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'About deja de mantener textos fallback en español dentro del componente y consume solo datos localizados.',
          en: 'About no longer keeps Spanish fallback copy inside the component and now consumes localized data only.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Intel: Bosses traduce las zonas de spawn conocidas por boss y mapa, manteniendo fallback técnico si falta alguna clave.',
          en: 'Intel: Bosses now translates known spawn zones by boss and map while keeping technical fallbacks if a key is missing.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Intel: Bosses añade The Wedge con ficha basada en la wiki, soporte de mapa Icebreaker y textos ES/EN.',
          en: 'Intel: Bosses adds The Wedge with a wiki-based dossier, Icebreaker map support and ES/EN copy.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Perfil de PMC aplica formato de fechas y números según el idioma activo, también en la tarjeta exportada.',
          en: 'PMC Profile now formats dates and numbers according to the active language, including the exported card.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Panel Admin elimina fallbacks internos en español para estados y tipos de tickets.',
          en: 'Admin Panel removes internal Spanish fallbacks for ticket states and types.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Simulador Balístico localiza los nombres fallback de blindajes y la etiqueta de clase del selector.',
          en: 'Ballistics Simulator localizes fallback armor names and the selector class label.'
        }
      }
    ]
  },
  {
    version: '0.14.34',
    date: '2026-05-22',
    codename: 'Account and Ballistics i18n Polish',
    type: 'improvement',
    title: {
      es: 'Cuenta y simulador cierran textos sueltos',
      en: 'Account and simulator close loose copy'
    },
    summary: {
      es: 'El Centro de cuenta y los placeholders del simulador balístico pasan al sistema ES/EN.',
      en: 'The Account Center and ballistic simulator placeholders now go through the ES/EN system.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Resumen operativo, accesos rápidos y fallback de usuario en Cuenta quedan listos para traducción.',
          en: 'Operational summary, quick access and account username fallback are now translation-ready.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Los ejemplos de búsqueda de munición y blindaje del simulador balístico ya cambian con el idioma.',
          en: 'Ammo and armor search examples in the ballistic simulator now switch with the selected language.'
        }
      }
    ]
  },
  {
    version: '0.14.33',
    date: '2026-05-22',
    codename: 'Admin and Story i18n Polish',
    type: 'improvement',
    title: {
      es: 'Admin y Decisiones pulen traducción',
      en: 'Admin and Decisions polish translation'
    },
    summary: {
      es: 'Se eliminan etiquetas sueltas del Panel Admin y se corrige copy español en Decisiones / Finales.',
      en: 'Loose Admin Panel labels are removed and Spanish copy is corrected in Decisions / Endings.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Email, roles, estado online, owner y usuario sin configurar pasan por i18n en Admin.',
          en: 'Email, roles, online state, owner and unconfigured user labels now go through i18n in Admin.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Se corrigen tildes y textos antiguos en rutas de historia, opciones, penalizaciones y finales.',
          en: 'Accents and older text are corrected across story routes, options, penalties and endings.'
        }
      }
    ]
  },
  {
    version: '0.14.32',
    date: '2026-05-22',
    codename: 'Prestige i18n Polish',
    type: 'improvement',
    title: {
      es: 'Prestigios pulido para traducción',
      en: 'Prestige polished for translation'
    },
    summary: {
      es: 'El módulo de Prestigios queda revisado dentro del sistema ES/EN y se corrigen textos españoles sin tilde.',
      en: 'The Prestige module is reviewed within the ES/EN system and Spanish copy without accents is corrected.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Se pulen textos de progresión, disponibilidad PVP y resumen de requisitos para que la versión española sea más fiel.',
          en: 'Progression, PVP availability and requirement summary copy are polished so the Spanish version is more accurate.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Troubleshooting actualiza el estado real del despliegue ES/EN y excluye Dossier de la traducción pública.',
          en: 'Troubleshooting updates the real ES/EN rollout status and excludes Dossier from public translation work.'
        }
      }
    ]
  },
  {
    version: '0.14.31',
    date: '2026-05-22',
    codename: 'Kappa Tree i18n Polish',
    type: 'improvement',
    title: {
      es: 'Misiones / Kappa cierra textos pendientes',
      en: 'Missions / Kappa closes pending text strings'
    },
    summary: {
      es: 'El organigrama de Misiones / Kappa completa pequeños textos visibles que seguían fuera del sistema ES/EN.',
      en: 'The Missions / Kappa tree completes small visible strings that were still outside the ES/EN system.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Carga de la matriz, cabecera de Collector, icono fallback de items y tooltip de wiki pasan a claves i18n.',
          en: 'Matrix loading, Collector header, item fallback icon and wiki tooltip now use i18n keys.'
        }
      }
    ]
  },
  {
    version: '0.14.30',
    date: '2026-05-22',
    codename: 'Goons Tracker i18n Pass',
    type: 'improvement',
    title: {
      es: 'Tracker de Goons preparado para traducción',
      en: 'Goons Tracker prepared for translation'
    },
    summary: {
      es: 'El Tracker de Goons avanza su migración ES/EN para perfiles, telemetría, mapas y estados de captura externa.',
      en: 'The Goons Tracker advances its ES/EN migration for profiles, telemetry, maps and external capture states.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Roles, descripciones, ubicación detectada, modo de juego, último reporte, estado de transmisión y errores de extracción pasan a claves i18n.',
          en: 'Roles, descriptions, detected location, game mode, last report, transmission state and extraction errors now use i18n keys.'
        }
      }
    ]
  },
  {
    version: '0.14.29',
    date: '2026-05-22',
    codename: 'Armor Simulator i18n Pass',
    type: 'improvement',
    title: {
      es: 'Simulador balístico preparado para traducción',
      en: 'Ballistics simulator prepared for translation'
    },
    summary: {
      es: 'El Simulador Balístico avanza su migración ES/EN en la interfaz principal y limpia etiquetas antiguas de resultado/telemetría.',
      en: 'The Ballistics Simulator advances its ES/EN migration in the main interface and cleans up old result/telemetry labels.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Carga, cabecera, buscadores, resultado TTK, estados de letalidad y telemetría de impactos pasan a claves i18n.',
          en: 'Loading, header, search controls, TTK result, lethality states and impact telemetry now use i18n keys.'
        }
      }
    ]
  },
  {
    version: '0.14.28',
    date: '2026-05-22',
    codename: 'Maps i18n Pass',
    type: 'improvement',
    title: {
      es: 'Mapas preparado para traducción',
      en: 'Maps prepared for translation'
    },
    summary: {
      es: 'La vista de Mapas Tácticos pasa a usar claves ES/EN para los textos visibles principales.',
      en: 'The Tactical Maps view now uses ES/EN keys for its main visible text.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Título, subtítulo, botón de vuelta, barra de feed, etiqueta de navegación y título del iframe quedan conectados a i18n.',
          en: 'Title, subtitle, back button, feed bar, navigation label and iframe title are now connected to i18n.'
        }
      }
    ]
  },
  {
    version: '0.14.27',
    date: '2026-05-22',
    codename: 'About i18n Pass',
    type: 'improvement',
    title: {
      es: 'About preparado para traducción',
      en: 'About prepared for translation'
    },
    summary: {
      es: 'La vista About pasa a consumir contenido ES/EN para explicar el proyecto y sus módulos sin depender de textos visibles hardcodeados.',
      en: 'The About view now consumes ES/EN content to explain the project and its modules without relying on visible hardcoded text.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Cabecera, resumen del proyecto, grupos técnicos, listado de módulos, acciones y estados pasan a claves i18n.',
          en: 'Header, project summary, technical groups, module list, actions and statuses now use i18n keys.'
        }
      }
    ]
  },
  {
    version: '0.14.26',
    date: '2026-05-22',
    codename: 'Troubleshooting Refresh',
    type: 'improvement',
    title: {
      es: 'Troubleshooting actualizado y Admin en traducción',
      en: 'Troubleshooting refreshed and Admin translation started'
    },
    summary: {
      es: 'Se actualiza el registro de problemas conocidos con el estado real de la app y se inicia la migración ES/EN del panel de administración.',
      en: 'Known issues are refreshed to match the current app state, and the Admin Panel ES/EN migration begins.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Troubleshooting elimina incidencias ya superadas de lint/Hideout y añade limitaciones actuales: índice público de PMC, Live Events experimental, traducción parcial y aviso de bundle grande.',
          en: 'Troubleshooting removes outdated lint/Hideout entries and adds current limitations: public PMC index, experimental Live Events, partial translation and large bundle warning.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Admin Panel empieza su pasada i18n con cabecera, métricas, filtros de usuarios, acciones, reportes, prompts, mensajes y detalle de usuario.',
          en: 'Admin Panel starts its i18n pass with header, metrics, user filters, actions, reports, prompts, messages and user detail.'
        }
      }
    ]
  },
  {
    version: '0.14.25',
    date: '2026-05-22',
    codename: 'Quest Optimizer i18n Pass',
    type: 'improvement',
    title: {
      es: 'Quest Optimizer preparado para traducción',
      en: 'Quest Optimizer prepared for translation'
    },
    summary: {
      es: 'Se avanza la internacionalización del submódulo Quest Optimizer sin cambiar su lógica de recomendación ni su integración con Misiones / Kappa.',
      en: 'Internationalization advances in the Quest Optimizer submodule without changing its recommendation logic or its Missions / Kappa integration.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Cabecera, selectores, botón de prioridad Kappa, estados, recomendación principal, metadatos de rutas y bloques de quests/llaves usan ahora claves ES/EN.',
          en: 'Header, selectors, Kappa priority button, states, main recommendation, route metadata and quest/key blocks now use ES/EN keys.'
        }
      }
    ]
  },
  {
    version: '0.14.24',
    date: '2026-05-22',
    codename: 'Keys i18n Pass',
    type: 'improvement',
    title: {
      es: 'Sistema de Llaves preparado para traducción',
      en: 'Key System prepared for translation'
    },
    summary: {
      es: 'Se avanza la cobertura ES/EN del Sistema de Llaves y se guarda en la memoria del proyecto la estimación actual hacia la versión 1.0.',
      en: 'ES/EN coverage advances in the Key System, and the current estimate toward version 1.0 is recorded in the project memory.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Cabecera, buscador, filtros, acciones, estadísticas, estados de carga, mensajes vacíos y etiquetas de tarjetas de llaves pasan a claves i18n.',
          en: 'Header, search, filters, actions, stats, loading states, empty messages and key card labels now use i18n keys.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Se añade a PROJECT_CONTEXT la estimación viva de traducción, preparación multiidioma y distancia a 1.0 para futuras sesiones.',
          en: 'PROJECT_CONTEXT now includes the live estimate for translation, multilingual readiness and distance to 1.0 for future sessions.'
        }
      }
    ]
  },
  {
    version: '0.14.23',
    date: '2026-05-22',
    codename: 'Live Events Maintenance',
    type: 'improvement',
    title: {
      es: 'Saneamiento interno de Eventos en Directo',
      en: 'Internal cleanup for Live Events'
    },
    summary: {
      es: 'El modulo de eventos queda preparado para mantenerse, sustituirse o retirarse mas adelante sin arrastrar logica mezclada en la vista.',
      en: 'The live events module is now easier to maintain, replace or remove later without keeping mixed data logic inside the view.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Las fuentes externas, eventos manuales verificados y fallback de referencia se separan en un fichero dedicado.',
          en: 'External sources, verified manual events and the reference fallback have been moved into a dedicated file.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'La normalizacion de fechas, deduplicacion, ordenacion y carga del feed pasan a utilidades independientes para reducir el tamano del componente principal.',
          en: 'Date normalization, deduplication, sorting and feed loading now live in independent utilities to reduce the size of the main component.'
        }
      }
    ]
  },
  {
    version: '0.14.22',
    date: '2026-05-22',
    codename: 'Boss Intel Cleanup',
    type: 'improvement',
    title: {
      es: 'Saneamiento interno de Intel: Bosses',
      en: 'Internal cleanup for Boss Intel'
    },
    summary: {
      es: 'El módulo de bosses queda dividido en datos base, zonas de spawn y componente visual para facilitar mantenimiento y traducciones futuras.',
      en: 'The boss module is now split into base data, spawn zones and visual component logic to make maintenance and future translations easier.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'La metadata fallback de bosses se mueve a un fichero dedicado, reduciendo el tamaño y la mezcla de responsabilidades de BossesIntel.',
          en: 'Boss fallback metadata has been moved to a dedicated file, reducing the size and mixed responsibilities of BossesIntel.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Las zonas de spawn conocidas se separan en su propio módulo, dejando la UI centrada en renderizado, filtros y sincronización con tarkov.dev.',
          en: 'Known spawn zones are now separated into their own module, leaving the UI focused on rendering, filters and tarkov.dev synchronization.'
        }
      }
    ]
  },
  {
    version: '0.14.21',
    date: '2026-05-22',
    codename: 'Bosses i18n Pass',
    type: 'improvement',
    title: {
      es: 'Intel de Bosses preparado para traducción',
      en: 'Boss Intel prepared for translation'
    },
    summary: {
      es: 'Se migra la interfaz principal de Intel: Bosses a claves ES/EN y se prepara el módulo para traducir sus fichas tácticas completas por fases.',
      en: 'The main Boss Intel interface has been migrated to ES/EN keys and the module is ready for phased translation of its full tactical dossiers.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Cabecera, buscador, filtros de mapa/dificultad, contador de objetivos, estado de carga y etiquetas del panel detallado pasan a i18n.',
          en: 'Header, search, map/difficulty filters, visible target counter, loading state and detail panel labels now use i18n.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'El plan de entrada recomendado se genera desde claves traducibles, manteniendo la lógica táctica actual sin cambiar la interfaz.',
          en: 'The recommended entry plan is now generated from translatable keys while preserving the current tactical logic and interface.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Las fichas visibles de cada boss usan claves traducibles para guardias, descripción física, comportamiento, armas, munición, debilidades y loot.',
          en: 'Each boss dossier now uses translatable keys for guards, visual profile, behavior, weapons, ammunition, weaknesses and loot.'
        }
      }
    ]
  },
  {
    version: '0.14.20',
    date: '2026-05-21',
    codename: 'Visible Version and Hideout i18n',
    type: 'improvement',
    title: {
      es: 'Versión visible y Refugio preparado para traducción',
      en: 'Visible version and Hideout prepared for translation'
    },
    summary: {
      es: 'Se añade el número de versión en el menú principal y se avanza la traducción modular del Refugio y Decisiones / Finales.',
      en: 'Adds the visible version number to the main menu and advances modular translation for Hideout and Story Decisions.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'El menú principal muestra ahora la versión activa en la esquina inferior izquierda para que usuarios y testers puedan identificar la build exacta.',
          en: 'The main menu now shows the active version in the bottom-left corner so users and testers can identify the exact build.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'El módulo de Refugio migra cabecera, estados cloud/local, listado de secciones, estadísticas y detalle de requisitos a claves ES/EN.',
          en: 'The Hideout module now moves its header, cloud/local states, section list, stats and requirement detail to ES/EN keys.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Tracker de Goons empieza su migración a i18n con cabecera, carga, canales PVP/PVE, estados de radar y etiquetas de mapas preparadas en ES/EN.',
          en: 'Goons Tracker starts its i18n migration with header, loading state, PVP/PVE channels, radar states and map labels prepared in ES/EN.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Decisiones / Finales recibe textos más fieles y descriptivos para explicar mejor consecuencias, rutas y puntos de no retorno.',
          en: 'Story Decisions receives more faithful and descriptive copy to better explain consequences, routes and points of no return.'
        }
      }
    ]
  },
  {
    version: '0.14.19',
    date: '2026-05-21',
    codename: 'Story Decisions i18n',
    type: 'improvement',
    title: {
      es: 'Decisiones / Finales preparado para traducción',
      en: 'Story Decisions prepared for translation'
    },
    summary: {
      es: 'El módulo de Decisiones / Finales deja de depender de textos visibles escritos directamente en el componente y pasa a usar claves ES/EN.',
      en: 'The Story Decisions module no longer depends on visible text hardcoded in the component and now uses ES/EN keys.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Migradas a i18n las cabeceras, puntos de no retorno, decisiones principales, ramas Kerman/Prapor, rutas de final y bloques de requisitos.',
          en: 'Migrated headers, points of no return, main decisions, Kerman/Prapor branches, ending routes and requirement blocks to i18n.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Las listas de requisitos ahora salen de los ficheros de idioma, facilitando futuras traducciones a francés, alemán, italiano o ruso.',
          en: 'Requirement lists now come from locale files, making future French, German, Italian or Russian translations easier.'
        }
      }
    ]
  },
  {
    version: '0.14.18',
    date: '2026-05-21',
    codename: 'PMC and Flea i18n',
    type: 'improvement',
    title: {
      es: 'Traducción de Perfil PMC y Flea',
      en: 'PMC Profile and Flea translation'
    },
    summary: {
      es: 'Se avanza la arquitectura bilingüe moviendo Perfil PMC y Flea Market Tracker a claves ES/EN preparadas para más idiomas.',
      en: 'The bilingual architecture moves forward by migrating PMC Profile and Flea Market Tracker to ES/EN keys ready for more languages.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Perfil PMC usa i18n para cabecera, búsqueda, estado de sincronización, stats, equipo, favoritos, logros, skills, datos técnicos y exportación PNG.',
          en: 'PMC Profile now uses i18n for the header, search, sync status, stats, gear, favorites, achievements, skills, technical data and PNG export.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Flea Market Tracker usa i18n para buscador, mensajes vacíos, tooltip de gráfica, detalle de precios, valor de traders y radar de fluctuaciones.',
          en: 'Flea Market Tracker now uses i18n for search, empty states, chart tooltip, price detail, trader values and fluctuation radar.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'Las cadenas españolas nuevas incluyen tildes y caracteres propios del idioma para evitar textos planos tipo contrasena/sincronizacion.',
          en: 'New Spanish strings include accents and language-specific characters to avoid flattened text such as contrasena/sincronizacion.'
        }
      }
    ]
  },
  {
    version: '0.14.17',
    date: '2026-05-21',
    codename: 'Export Image Icons',
    type: 'fixed',
    title: {
      es: 'Iconos visibles en la exportacion PMC',
      en: 'Visible icons in PMC export'
    },
    summary: {
      es: 'La exportacion PNG del Perfil PMC carga iconos mediante un proxy seguro y anade pictogramas propios a las stats principales.',
      en: 'The PMC Profile PNG export now loads icons through a safe proxy and adds custom pictograms to the main stats.'
    },
    changes: [
      {
        type: 'fixed',
        text: {
          es: 'Anadido `/api/image-proxy` para que los iconos externos de items, logros y skills puedan incrustarse en canvas sin aparecer como cuadrados negros.',
          en: 'Added `/api/image-proxy` so external item, achievement and skill icons can be embedded into canvas without showing as black squares.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'El proxy de imagenes queda limitado por host permitido, tipo image/* y tamano maximo para evitar picos de memoria en produccion.',
          en: 'The image proxy is constrained by allowed host, image/* content type and maximum size to avoid production memory spikes.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Las stats del dossier exportado ahora incluyen pequenos iconos dibujados para faccion, XP, raids, extracciones, SR, kills, PMC kills y logros.',
          en: 'The exported dossier stats now include small drawn icons for faction, XP, raids, extractions, SR, kills, PMC kills and achievements.'
        }
      }
    ]
  },
  {
    version: '0.14.16',
    date: '2026-05-21',
    codename: 'PMC Dossier Export',
    type: 'improvement',
    title: {
      es: 'Exportacion ampliada de Perfil PMC',
      en: 'Expanded PMC Profile export'
    },
    summary: {
      es: 'La tarjeta exportada del Perfil PMC pasa a ser un mini-dossier vertical con mas datos del jugador, logros, equipo, favoritos y skills.',
      en: 'The exported PMC Profile card is now a vertical mini dossier with more player data, achievements, gear, favorites and skills.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Exportar tarjeta genera una imagen mas larga con identidad, stats principales, equipo tactico, favoritos, logros destacados y habilidades farmeadas.',
          en: 'Export card now generates a taller image with identity, core stats, tactical gear, favorites, highlighted achievements and farmed skills.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'La exportacion intenta incrustar iconos externos de items, logros y skills con carga segura y fallback si algun asset no responde.',
          en: 'The export attempts to embed external item, achievement and skill icons with safe loading and fallback if an asset does not respond.'
        }
      }
    ]
  },
  {
    version: '0.14.15',
    date: '2026-05-21',
    codename: 'PMC Skill Icons',
    type: 'improvement',
    title: {
      es: 'Iconos reales de skills PMC',
      en: 'Real PMC skill icons'
    },
    summary: {
      es: 'El panel de habilidades del Perfil PMC usa ahora los iconos oficiales expuestos por tarkov.dev, igual que el panel de logros.',
      en: 'The PMC Profile skills panel now uses the official icons exposed by tarkov.dev, matching the achievements panel.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'La Function de PMC consulta el catálogo ligero `skills { id name imageLink }` de tarkov.dev y cruza cada skill farmeada con su nombre e imagen.',
          en: 'The PMC Function now queries the lightweight tarkov.dev `skills { id name imageLink }` catalog and enriches each farmed skill with its name and image.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'La tabla de habilidades reemplaza las iniciales por imágenes lazy-loaded cuando el icono está disponible, manteniendo fallback textual si falta algún asset.',
          en: 'The skills table replaces initials with lazy-loaded images when an icon is available, while keeping a text fallback if any asset is missing.'
        }
      }
    ]
  },
  {
    version: '0.14.14',
    date: '2026-05-21',
    codename: 'PMC Skills Panel',
    type: 'improvement',
    title: {
      es: 'Skills farmeadas en Perfil PMC',
      en: 'Farmed skills in PMC Profile'
    },
    summary: {
      es: 'Perfil PMC muestra ahora las habilidades detectadas en el perfil publico, con nivel decimal y ultimo acceso, justo debajo del panel de logros.',
      en: 'PMC Profile now shows detected public profile skills with decimal level and last access, directly below the achievements panel.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadido panel de habilidades farmeadas en Perfil PMC, ordenado por progreso y con formato compacto similar a tarkov.dev.',
          en: 'Added a farmed skills panel in PMC Profile, sorted by progress and presented in a compact tarkov.dev-like format.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'La Function de PMC ya no recorta las skills principales a un resumen corto: devuelve todas las habilidades con progreso real para que el frontend las liste.',
          en: 'The PMC Function no longer trims main skills into a short summary: it returns every skill with real progress so the frontend can list them.'
        }
      }
    ]
  },
  {
    version: '0.14.13',
    date: '2026-05-21',
    codename: 'Ticket Notifications',
    type: 'improvement',
    title: {
      es: 'Notificaciones de tickets',
      en: 'Ticket notifications'
    },
    summary: {
      es: 'El sistema de reportes gana contadores visuales para avisar al admin de tickets pendientes y a los usuarios de respuestas nuevas.',
      en: 'The report system now has visual counters to notify admins about pending tickets and users about new replies.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'El boton ADMIN muestra un badge amarillo con tickets abiertos o en revision cuya ultima actividad viene del usuario.',
          en: 'The ADMIN button now shows a yellow badge for open or reviewing tickets whose latest activity came from the user.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'El boton REPORT muestra un badge amarillo al usuario cuando hay respuestas admin nuevas desde la ultima vez que abrio Report.',
          en: 'The REPORT button now shows a yellow badge when the user has new admin replies since the last time they opened Report.'
        }
      }
    ]
  },
  {
    version: '0.14.12',
    date: '2026-05-21',
    codename: 'Ticket Suggestions Pass',
    type: 'improvement',
    title: {
      es: 'Mejoras sugeridas por usuarios',
      en: 'User-suggested improvements'
    },
    summary: {
      es: 'Se atienden sugerencias del panel de reportes con tooltips de precio en Flea Market y zonas de spawn mas claras en Bosses.',
      en: 'Suggestions from the report panel were addressed with price tooltips in Flea Market and clearer spawn zones in Bosses.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'El grafico historico del Flea Market muestra tooltip al pasar el raton por cada punto, con precio, fecha y variacion frente al punto anterior.',
          en: 'The Flea Market historical chart now shows a tooltip on each hovered point with price, date and variation from the previous point.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Bosses incorpora zonas de spawn conocidas por mapa y un minimapa esquematico inicial para orientar la busqueda sin depender aun de assets cartograficos completos.',
          en: 'Bosses now includes known spawn zones per map and an initial schematic minimap to guide searches without depending on full cartographic assets yet.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Decisiones / Finales queda reestructurado con datos separados y claves ES/EN para no dejar la pantalla a medias durante la fase de traduccion.',
          en: 'Decisions / Endings was restructured with separated data and ES/EN keys so the screen is not left halfway through the translation phase.'
        }
      }
    ]
  },
  {
    version: '0.14.11',
    date: '2026-05-21',
    codename: 'Prestige Cleanup',
    type: 'improvement',
    title: {
      es: 'Prestigios mas ligero y preparado para idiomas',
      en: 'Lighter Prestige module ready for languages'
    },
    summary: {
      es: 'Se sanea el modulo de Prestigios por dentro, se optimizan sus insignias y se anade una checklist pre-produccion para reducir errores antes de publicar.',
      en: 'The Prestige module was cleaned internally, its insignias were optimized, and a pre-production checklist was added to reduce release mistakes.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Prestigios separa datos/imagenes en un fichero propio y conecta los textos de la interfaz a i18n ES/EN.',
          en: 'Prestige now separates data/images into its own file and connects interface text to ES/EN i18n.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Las insignias de Prestige 1, 2, 3, 5 y 6 se reducen a 512px para bajar peso sin perder calidad visible en la app.',
          en: 'Prestige 1, 2, 3, 5 and 6 insignias were resized to 512px to reduce weight without visible quality loss in the app.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'Eliminada una copia accidental antigua de App.jsx que solo metia ruido en busquedas y conteos de codigo.',
          en: 'Removed an old accidental App.jsx copy that only added noise to searches and code counts.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadida documentacion de checklist pre-produccion para lint, build, smoke test local, PMC Function y revision post-deploy.',
          en: 'Added pre-production checklist documentation for lint, build, local smoke tests, PMC Function checks and post-deploy review.'
        }
      }
    ]
  },
  {
    version: '0.14.10',
    date: '2026-05-21',
    codename: 'PMC Action Polish',
    type: 'improvement',
    title: {
      es: 'Perfil PMC mas limpio',
      en: 'Cleaner PMC Profile'
    },
    summary: {
      es: 'Se remata el pulido visual del Perfil PMC eliminando acciones redundantes y dejando la ficha mas enfocada al usuario final.',
      en: 'Finished the PMC Profile visual polish by removing redundant actions and keeping the sheet focused on the end user.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'El enlace duplicado a tarkov.dev desaparece del panel inferior porque ya existe el boton principal TARKOV.DEV en la barra de busqueda.',
          en: 'The duplicated tarkov.dev link was removed from the lower action panel because the main TARKOV.DEV button already exists in the search bar.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'El panel de acciones del Perfil PMC queda reducido a Copiar AccID y Exportar tarjeta, reequilibrado en dos botones utiles.',
          en: 'The PMC Profile actions panel is reduced to Copy AccID and Export card, rebalanced into two useful buttons.'
        }
      }
    ]
  },
  {
    version: '0.14.9',
    date: '2026-05-21',
    codename: 'Prestige Insignias',
    type: 'improvement',
    title: {
      es: 'Insignias visuales de prestigio',
      en: 'Visual prestige insignias'
    },
    summary: {
      es: 'El modulo de Prestigios incorpora las insignias oficiales de cada nivel para reforzar la lectura visual del progreso endgame.',
      en: 'The Prestige module now includes official-looking insignias for each level to make endgame progression easier to read visually.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadidas imagenes de Prestige 1 a 6 en el panel lateral del modulo, sincronizadas con el prestigio seleccionado.',
          en: 'Added Prestige 1 to 6 images in the module side panel, synchronized with the selected prestige level.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'Preparada la insignia de Prestige 4 con fondo transparente y guardada como `prestige_4.png` junto al resto de assets.',
          en: 'Prepared the Prestige 4 insignia with a transparent background and saved it as `prestige_4.png` alongside the rest of the assets.'
        }
      }
    ]
  },
  {
    version: '0.14.8',
    date: '2026-05-21',
    codename: 'PMC Readability Pass',
    type: 'improvement',
    title: {
      es: 'Perfil PMC mas legible',
      en: 'More readable PMC Profile'
    },
    summary: {
      es: 'Se pule la ficha de Perfil PMC para que las estadisticas sean mas comodas y los logros completados se puedan revisar completos.',
      en: 'Polished the PMC Profile sheet so stats are easier to read and completed achievements can be reviewed in full.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'La banda de nivel, faccion, XP, raids, supervivencia y resto de datos pasa a ser un bloque responsive sin scroll lateral.',
          en: 'The level, faction, XP, raids, survival rate and related stats strip is now a responsive block without sideways scrolling.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'La ficha de estadisticas del PMC elimina textos auxiliares innecesarios y agrupa Raids/Extracted como dos datos paralelos.',
          en: 'The PMC stats sheet removes unnecessary helper labels and groups Raids/Extracted as paired data.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Perfil PMC incorpora historial de busquedas, top logro integrado en la ficha principal, acciones para abrir tarkov.dev, copiar AccID y exportar una tarjeta publica en PNG.',
          en: 'PMC Profile adds search history, top achievement inside the main sheet, actions to open tarkov.dev, copy AccID and export a public PNG card.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Logros queda unificado en un panel ancho con showcase de logros exclusivos, buscador, filtros por rareza y ordenacion.',
          en: 'Achievements are unified into a wide panel with exclusive-achievement showcase, search, rarity filters and sorting.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Equipo visible pasa a una vista tactica por slots para que arma, melee, contenedor, armband y equipo sean mas faciles de leer.',
          en: 'Visible equipment now uses a tactical slot view so weapon, melee, container, armband and gear are easier to read.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'La tabla principal de logros muestra todos los logros completados del perfil con scroll interno controlado.',
          en: 'The main achievements table now shows every completed achievement from the profile with controlled internal scrolling.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Logros raros se mantiene como una seleccion limitada de los mas exclusivos, separada de la lista completa.',
          en: 'Rare achievements remain as a limited selection of the most exclusive ones, separate from the full list.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'La Function evita parsear completo el indice PVP de jugadores y localiza el accountId por texto, reduciendo el uso de memoria en Netlify de forma drástica.',
          en: 'The Function avoids fully parsing the PVP player index and resolves accountId through text matching, drastically reducing Netlify memory usage.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'La Function evita pedir el catalogo completo de achievements por GraphQL y usa el endpoint JSON estatico de tareas/traducciones para mantener bajo el consumo de memoria.',
          en: 'The Function avoids requesting the full achievements catalog through GraphQL and uses the static tasks/translations JSON endpoint to keep memory usage low.'
        }
      }
    ]
  },
  {
    version: '0.14.7',
    date: '2026-05-20',
    codename: 'PMC Layout Pass',
    type: 'improvement',
    title: {
      es: 'Perfil PMC más compacto',
      en: 'More compact PMC Profile'
    },
    summary: {
      es: 'Se reorganiza el Perfil PMC para reducir scroll y acercarlo a una ficha de jugador más legible.',
      en: 'Reorganized PMC Profile to reduce scrolling and make it feel closer to a readable player sheet.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'La cabecera del jugador ahora usa una banda horizontal de estadísticas para nivel, facción, XP, raids, supervivencia, kills, cuenta y actividad.',
          en: 'The player header now uses a horizontal stats strip for level, faction, XP, raids, survival rate, kills, account and activity.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Equipo visible y favoritos pasan justo debajo de la ficha principal, los logros quedan después en tablas compactas y el bloque técnico de datos disponibles queda al final.',
          en: 'Visible equipment and favorites now sit just below the main sheet, achievements follow in compact tables, and the technical available-data block moves to the bottom.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'La Function PMC deja de cargar catálogos JSON completos en producción y usa GraphQL para pedir solo playerLevels, achievements e items necesarios, evitando errores 502 por OutOfMemory.',
          en: 'The PMC Function no longer loads full JSON catalogs in production and uses GraphQL for only playerLevels, achievements and required items, avoiding 502 OutOfMemory crashes.'
        }
      }
    ]
  },
  {
    version: '0.14.6',
    date: '2026-05-20',
    codename: 'PMC Intel Expansion',
    type: 'improvement',
    title: {
      es: 'Perfil PMC ampliado y sin cache',
      en: 'Expanded PMC Profile and no-cache sync'
    },
    summary: {
      es: 'Se evita que el perfil sirva niveles antiguos en cache y se amplian los datos visibles del PMC.',
      en: 'Prevented cached profile responses from serving old levels and expanded visible PMC data.'
    },
    changes: [
      {
        type: 'fixed',
        text: {
          es: 'La Function de Perfil PMC y el frontend fuerzan no-cache para que el nivel corregido se refleje inmediatamente tras desplegar.',
          en: 'The PMC Profile Function and frontend now force no-cache so corrected levels appear immediately after deploy.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Perfil PMC muestra ultima actividad estimada, tipo de cuenta por flags, skills con nivel, logros recientes, logros raros, equipo visible y favoritos con iconos/nombres cuando el catalogo lo permite.',
          en: 'PMC Profile now shows estimated last activity, account type from flags, skill levels, recent achievements, rare achievements, visible equipment and favorites with icons/names when catalog data allows it.'
        }
      }
    ]
  },
  {
    version: '0.14.5',
    date: '2026-05-20',
    codename: 'PMC Search Polish',
    type: 'improvement',
    title: {
      es: 'Buscador de PMCs y nivel corregido',
      en: 'PMC search and corrected level'
    },
    summary: {
      es: 'Se mejora el Perfil PMC con búsqueda de jugadores externos y se corrige el cálculo de nivel para coincidir con tarkov.dev.',
      en: 'Improved PMC Profile with external player search and corrected level calculation to match tarkov.dev.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Añadida barra de búsqueda dentro del Perfil PMC para consultar otros jugadores por nombre en PVP o PVE usando el índice estático público.',
          en: 'Added an in-module search bar to look up other players by name in PVP or PVE using the public static index.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'El nivel del PMC ahora se calcula acumulando los tramos de experiencia de playerLevels, igual que tarkov.dev, evitando niveles inflados.',
          en: 'PMC level is now calculated by accumulating playerLevels experience steps like tarkov.dev, avoiding inflated levels.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'El perfil enlazado de la cuenta sigue siendo el predeterminado, pero se puede volver a él con el botón Mi Perfil tras buscar otros PMCs.',
          en: 'The account-linked profile remains the default, but users can return to it with the My Profile button after searching other PMCs.'
        }
      }
    ]
  },
  {
    version: '0.14.4',
    date: '2026-05-20',
    codename: 'Static PMC Sync',
    type: 'improvement',
    title: {
      es: 'Perfil PMC con JSON estático de tarkov.dev',
      en: 'PMC Profile using tarkov.dev static JSON'
    },
    summary: {
      es: 'Se sustituye la búsqueda bloqueada por Turnstile por el índice público estático de players.tarkov.dev para perfiles ya vistos.',
      en: 'Replaced the Turnstile-blocked lookup with the public static players.tarkov.dev index for already viewed profiles.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Perfil de PMC ahora usa `/api/pmc-profile`, una Function de Netlify que resuelve accountId desde `players.tarkov.dev/profile/index.json` o `/pve/index.json` y abre el JSON público del jugador.',
          en: 'PMC Profile now uses `/api/pmc-profile`, a Netlify Function that resolves accountId from `players.tarkov.dev/profile/index.json` or `/pve/index.json` and opens the player public JSON.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Se calcula el nivel a partir de la experiencia usando los playerLevels del JSON API y se muestran raids, supervivencia, kills, tiempo PMC, equipo, favoritos, logros y última actualización pública.',
          en: 'Level is calculated from experience using JSON API playerLevels, and the UI shows raids, survival rate, kills, PMC time, equipment, favorites, achievements and public updated time.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'Cuando un jugador no está indexado, el mensaje explica la limitación real: debe abrirse antes en tarkov.dev/players y esperar a la actualización diaria del índice.',
          en: 'When a player is not indexed, the message explains the real limitation: it must be opened first on tarkov.dev/players and wait for the daily index update.'
        }
      }
    ]
  },
  {
    version: '0.14.3',
    date: '2026-05-20',
    codename: 'Account Hub',
    type: 'improvement',
    title: {
      es: 'Cuenta y Admin Panel 2.0',
      en: 'Account and Admin Panel 2.0'
    },
    summary: {
      es: 'Se pule el registro sin verificacion de email, se mejora el panel admin y Cuenta pasa a funcionar como hub operativo del usuario.',
      en: 'Polished registration without email verification, improved the admin panel, and turned Account into an operational user hub.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'El registro muestra cuenta creada y sesion iniciada, y vuelve automaticamente al terminal.',
          en: 'Registration now shows account created and session started, then returns automatically to the terminal.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Admin Panel incorpora buscador, filtros por rol/actividad, conteo online por actividad reciente y detalle de progreso cloud por usuario.',
          en: 'Admin Panel adds search, role/activity filters, online count based on recent activity, and per-user cloud progress detail.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Cuenta ahora muestra resumen operativo y accesos rapidos a Misiones/Kappa, Hideout, Flea y perfil oficial de tarkov.dev.',
          en: 'Account now shows an operational summary and quick access to Missions/Kappa, Hideout, Flea and the official tarkov.dev profile search.'
        }
      }
    ]
  },
  {
    version: '0.14.2',
    date: '2026-05-20',
    codename: 'Admin Usernames',
    type: 'fixed',
    title: {
      es: 'Usuarios de registro visibles en Admin',
      en: 'Registration usernames visible in Admin'
    },
    summary: {
      es: 'Se blinda el flujo de usuario Tarkov para que no se dupliquen nombres y el panel admin muestre automaticamente el nombre elegido al registrarse.',
      en: 'Hardened the Tarkov username flow so names cannot be duplicated and the admin panel automatically shows the selected registration username.'
    },
    changes: [
      {
        type: 'fixed',
        text: {
          es: 'El registro comprueba disponibilidad de usuario antes de crear la cuenta y el SQL anade indices unicos case-insensitive.',
          en: 'Registration checks username availability before account creation and SQL adds case-insensitive unique indexes.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'La migracion de perfil crea un trigger sobre auth.users para rellenar user_profiles desde los metadatos del registro aunque el email requiera confirmacion.',
          en: 'The profile migration creates an auth.users trigger to fill user_profiles from signup metadata even when email confirmation is required.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'list_admin_users ahora puede mostrar usuario desde user_profiles o desde metadatos Auth como fallback.',
          en: 'list_admin_users can now show usernames from user_profiles or Auth metadata as fallback.'
        }
      }
    ]
  },
  {
    version: '0.14.1',
    date: '2026-05-20',
    codename: 'PMC API Guardrail',
    type: 'fixed',
    title: {
      es: 'Perfil PMC: bloqueo Turnstile documentado',
      en: 'PMC Profile: Turnstile block documented'
    },
    summary: {
      es: 'Se corrige el mensaje del Perfil PMC cuando tarkov.dev rechaza la consulta publica de players con 401.',
      en: 'Fixed PMC Profile messaging when tarkov.dev rejects public player lookup with 401.'
    },
    changes: [
      {
        type: 'fixed',
        text: {
          es: 'El modulo ya no sugiere que un proxy simple resolveria el problema: el endpoint de players exige token humano Turnstile.',
          en: 'The module no longer suggests that a simple proxy would solve it: the players endpoint requires a human Turnstile token.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Anadido enlace directo al buscador oficial de tarkov.dev/players cuando la extraccion automatica queda bloqueada.',
          en: 'Added a direct link to the official tarkov.dev/players search when automatic extraction is blocked.'
        }
      }
    ]
  },
  {
    version: '0.14.0',
    date: '2026-05-20',
    codename: 'Connected PMC Profile',
    type: 'feature',
    title: {
      es: 'Perfil PMC conectado y preferencia global PVP/PVE',
      en: 'Connected PMC Profile and global PVP/PVE preference'
    },
    summary: {
      es: 'El registro pasa a capturar usuario de Tarkov y modo principal, y el Perfil de PMC consulta los datos publicos disponibles desde tarkov.dev/players.',
      en: 'Registration now captures Tarkov username and main mode, and PMC Profile reads available public data from tarkov.dev/players.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Crear cuenta ahora pide usuario de Tarkov, modo principal PVP/PVE/Ambos, email y contrasena.',
          en: 'Account creation now asks for Tarkov username, main PVP/PVE/Both mode, email and password.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Perfil de PMC busca el jugador en player.tarkov.dev por modo PVP/PVE y muestra nivel, faccion, experiencia, raids, kills, supervivencia y campos disponibles cuando la API los entrega.',
          en: 'PMC Profile searches player.tarkov.dev by PVP/PVE mode and shows level, faction, experience, raids, kills, survival rate and available fields when the API provides them.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'La preferencia de modo principal se guarda como base comun para Misiones/Kappa, Quest Optimizer, Flea Market, Llaves, Goons, Hideout y Perfil PMC.',
          en: 'The main mode preference is now shared as the default for Missions/Kappa, Quest Optimizer, Flea Market, Keys, Goons, Hideout and PMC Profile.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Anadida migracion SQL para ampliar user_profiles con tarkov_username y primary_game_mode sin romper instalaciones antiguas.',
          en: 'Added SQL migration to extend user_profiles with tarkov_username and primary_game_mode without breaking older installations.'
        }
      }
    ]
  },
  {
    version: '0.13.6',
    date: '2026-05-20',
    codename: 'Lint Cleanup',
    type: 'improvement',
    title: {
      es: 'Limpieza completa de errores lint',
      en: 'Full lint error cleanup'
    },
    summary: {
      es: 'Se sanea la deuda tecnica restante de React/ESLint manteniendo la interfaz y el comportamiento visible de la app.',
      en: 'Cleaned the remaining React/ESLint technical debt while preserving the app interface and visible behavior.'
    },
    changes: [
      {
        type: 'fixed',
        text: {
          es: '`npm run lint` queda limpio sin errores ni warnings pendientes.',
          en: '`npm run lint` now passes with no remaining errors or warnings.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Estabilizadas cargas de datos y efectos en Admin, Reportes, Flea, Goons, Bosses, Eventos, Perfil PMC, Estado de Servidores y Simulador Balistico.',
          en: 'Stabilized data loading and effects in Admin, Reports, Flea, Goons, Bosses, Events, PMC Profile, Server Status and Ballistic Simulator.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'El Simulador Balistico vuelve a ejecutar la simulacion aleatoria fuera del render, evitando calculos impuros durante el pintado React.',
          en: 'The Ballistic Simulator now runs random simulation work outside render, avoiding impure calculations during React rendering.'
        }
      }
    ]
  },
  {
    version: '0.13.5',
    date: '2026-05-20',
    codename: 'Kappa Cleanup',
    type: 'improvement',
    title: {
      es: 'Saneamiento tecnico de Misiones / Kappa',
      en: 'Missions / Kappa technical cleanup'
    },
    summary: {
      es: 'KappaTree queda mejor dividido internamente, con datos, API, storage y calculo del organigrama separados sin cambiar la experiencia visual.',
      en: 'KappaTree is now internally split into data, API, storage and quest graph helpers without changing the visible experience.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'KappaTree separa datos Collector, API de tarkov.dev, storage local/cloud, configuracion de traders y calculo del organigrama en helpers propios.',
          en: 'KappaTree now separates Collector data, tarkov.dev API, local/cloud storage, trader config and quest graph calculation into dedicated helpers.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'KappaTree queda fuera del listado de errores de lint propios al convertir el organigrama en estado derivado y diferir el centrado de busqueda.',
          en: 'KappaTree no longer appears in its own lint error list after converting the quest tree into derived state and deferring search centering.'
        }
      }
    ]
  },
  {
    version: '0.13.4',
    date: '2026-05-20',
    codename: 'Hideout Lint Pass',
    type: 'improvement',
    title: {
      es: 'Limpieza tecnica final de Hideout',
      en: 'Final Hideout technical cleanup'
    },
    summary: {
      es: 'Se remata la fase de saneamiento del Refugio reduciendo deuda tecnica sin tocar su interfaz ni sus flujos.',
      en: 'Completed the Hideout cleanup phase by reducing technical debt without touching its interface or flows.'
    },
    changes: [
      {
        type: 'fixed',
        text: {
          es: 'Hideout queda fuera del listado de errores de lint propios.',
          en: 'Hideout no longer appears in its own lint error list.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Se mantiene la recarga al cambiar PVP/PVE usando eventos y refs internas.',
          en: 'PVP/PVE reload behavior is preserved through events and internal refs.'
        }
      }
    ]
  },
  {
    version: '0.13.3',
    date: '2026-05-20',
    codename: 'Admin Dossier',
    type: 'feature',
    title: {
      es: 'Dossier tecnico solo para administradores',
      en: 'Admin-only technical dossier'
    },
    summary: {
      es: 'Se anade una vista interna para entender como esta construido el proyecto completo, visible solo para usuarios admin.',
      en: 'Added an internal view to understand how the whole project is built, visible only to admin users.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Anadido Dossier tecnico interno con mapa de arquitectura, carpetas, modulos, flujos y proximos refactors.',
          en: 'Added an internal technical dossier with architecture map, folders, modules, flows and next refactors.'
        }
      },
      {
        type: 'fixed',
        text: {
          es: 'La ruta del dossier queda protegida tambien en `App.jsx`, no solo ocultada en el menu.',
          en: 'The dossier route is guarded in `App.jsx`, not only hidden from the menu.'
        }
      }
    ]
  },
  {
    version: '0.13.2',
    date: '2026-05-20',
    codename: 'Hideout Split',
    type: 'improvement',
    title: {
      es: 'Refactor interno de Gestion del Refugio',
      en: 'Hideout Management internal refactor'
    },
    summary: {
      es: 'Gestion del Refugio queda dividida en piezas mas mantenibles, conservando exactamente la misma experiencia visible.',
      en: 'Hideout Management is now split into more maintainable pieces while preserving the exact same visible experience.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Gestion del Refugio separa la API de tarkov.dev y las utilidades de progreso, orden natural, FIR, precios y formato.',
          en: 'Hideout Management separates the tarkov.dev API and utilities for progress, natural order, FIR, prices and formatting.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Hideout queda dividido en contenedor, cabecera, lista de estaciones, detalle de estacion y capa de storage local/cloud.',
          en: 'Hideout is now split into container, header, station list, station detail and local/cloud storage layer.'
        }
      }
    ]
  },
  {
    version: '0.13.1',
    date: '2026-05-20',
    codename: 'Module Architecture',
    type: 'improvement',
    title: {
      es: 'Nueva estructura base de modulos',
      en: 'New base module structure'
    },
    summary: {
      es: 'Arranca la reestructuracion tecnica moviendo los modulos a una arquitectura por dominio y preparando carpetas comunes.',
      en: 'Started the technical restructure by moving modules into a domain-based architecture and preparing shared folders.'
    },
    changes: [
      {
        type: 'changed',
        text: {
          es: 'Los modulos principales salen de `components/modules` y pasan a `src/modules`, agrupados por dominio funcional.',
          en: 'Main modules moved out of `components/modules` into `src/modules`, grouped by functional domain.'
        }
      },
      {
        type: 'added',
        text: {
          es: 'Preparadas carpetas base para `components/ui`, `hooks` y `services`, que se usaran en las siguientes fases para UI comun, estado reutilizable y llamadas compartidas.',
          en: 'Prepared base folders for `components/ui`, `hooks` and `services`, to be used in the next phases for shared UI, reusable state and shared API calls.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Actualizadas las cargas lazy de `App.jsx` para apuntar a la nueva arquitectura modular.',
          en: 'Updated `App.jsx` lazy imports to point to the new modular architecture.'
        }
      }
    ]
  },
  {
    version: '0.13.0',
    date: '2026-05-20',
    codename: 'Technical Rebuild',
    type: 'improvement',
    title: {
      es: 'Inicio de reestructuracion tecnica',
      en: 'Technical restructure kickoff'
    },
    summary: {
      es: 'Se abre la fase de saneamiento interno para reducir la jungla de modulos grandes sin cambiar la estetica ni el funcionamiento visible de la app.',
      en: 'Started the internal cleanup phase to reduce large-module sprawl without changing the app visuals or visible behavior.'
    },
    changes: [
      {
        type: 'fixed',
        text: {
          es: 'Refactor conservador: no cambia rutas publicas, apariencia, textos de interfaz ni comportamiento de usuario.',
          en: 'Conservative refactor: no public routes, visual styling, interface copy or user behavior changed.'
        }
      }
    ]
  },
  {
    version: '0.12.0',
    date: '2026-05-20',
    codename: 'Hybrid Mode',
    type: 'feature',
    title: {
      es: 'Cierre de capa hibrida PVP/PVE',
      en: 'PVP/PVE hybrid layer completion'
    },
    summary: {
      es: 'Se remata la separacion de modos en los modulos donde importa el mercado o el progreso personal.',
      en: 'Completed mode separation across modules where market data or personal progress matters.'
    },
    changes: [
      {
        type: 'added',
        text: {
          es: 'Sistema de Llaves ahora usa precios separados PVP/PVE mediante `items(gameMode)`.',
          en: 'Key System now uses separated PVP/PVE prices through `items(gameMode)`.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Perfil de PMC ahora guarda perfiles separados para PVP y PVE, tambien en cloud si `user_module_state` esta disponible.',
          en: 'PMC Profile now stores separated PVP and PVE profiles, including cloud sync when `user_module_state` is available.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Prestigios queda marcado claramente como modulo PVP ONLY.',
          en: 'Prestige is now clearly marked as a PVP ONLY module.'
        }
      },
      {
        type: 'changed',
        text: {
          es: 'Bosses se mantiene como intel comun, ya que no guarda progreso de jugador ni mercado.',
          en: 'Bosses remains shared intel, since it does not store player progress or market data.'
        }
      }
    ]
  },
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
