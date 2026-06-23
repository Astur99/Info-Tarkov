const architectureBlocks = [
  {
    title: 'Resumen ejecutivo',
    body:
      'Info Tarkov es una SPA React/Vite que funciona como hub modular para Escape From Tarkov. App.jsx actua como router manual, carga cada vista con React.lazy y coordina sesion, rol, perfil de usuario, menu principal y navegacion por query param.'
  },
  {
    title: 'Flujo principal',
    body:
      'El usuario entra por main.jsx, que monta App.jsx y la capa visual global. App.jsx lee la sesion de Supabase, resuelve el rol del usuario, carga el perfil visible y decide que vista renderizar segun currentView y la URL ?view=.'
  },
  {
    title: 'Persistencia',
    body:
      'La app usa localStorage para modo invitado y Supabase para usuarios autenticados. Misiones usan quest_progress. Modulos nuevos como Hideout y PMC Profile usan user_module_state para guardar estados por usuario, modulo y modo PVP/PVE.'
  },
  {
    title: 'Datos externos',
    body:
      'Los modulos de economia, llaves, misiones y refugio consumen tarkov.dev por GraphQL o JSON API. Perfil PMC usa los JSON publicos estaticos de players.tarkov.dev para perfiles ya indexados. Goons y server status dependen de fuentes externas distintas y por eso tienen fallbacks o avisos cuando la fuente falla.'
  },
  {
    title: 'Estado pre-1.0',
    body:
      'La version 1.0 se plantea como lanzamiento desktop-first. La app esta pensada para PC, la traduccion visible ES/EN esta revisada y Live Events queda retirado porque no existe una fuente fiable que cumpla el estandar de calidad. La adaptacion movil queda planificada para despues de la 1.0 como una capa responsive progresiva, no como una app separada.'
  },
  {
    title: 'Seguridad de producto',
    body:
      'Las vistas sensibles se condicionan por userRole === admin. Supabase sigue siendo la barrera real para datos protegidos mediante RLS y tablas especificas. Este dossier esta pensado para documentacion interna del desarrollador.'
  }
];

const structure = [
  {
    path: 'src/App.jsx',
    role:
      'Router manual de la app, menu principal, botones globales, carga lazy de vistas, sesion Supabase, rol de usuario y navegacion por historial.'
  },
  {
    path: 'src/main.jsx',
    role:
      'Punto de entrada React. Monta la app, activa i18n y crea la capa global de efectos visuales tipo terminal.'
  },
  {
    path: 'src/index.css',
    role:
      'Tema global, variables visuales, fondos tacticos, efectos terminal optimizados, responsive base y estilos compartidos.'
  },
  {
    path: 'src/components/about/',
    role:
      'Vistas informativas: About, Astur, ChangeLog y este dossier tecnico admin.'
  },
  {
    path: 'src/components/auth/',
    role:
      'Login, registro, recuperacion/cambio de contrasena, ajustes de cuenta y configuracion de perfil de usuario.'
  },
  {
    path: 'src/components/admin/',
    role:
      'Panel admin para metricas, usuarios, roles, tickets y operaciones internas. El boton ADMIN muestra contador de tickets que necesitan respuesta.'
  },
  {
    path: 'src/components/communication/',
    role:
      'Sistema de tickets y comunicacion usuario/desarrollador, con badges de notificacion en Report cuando hay respuestas admin nuevas.'
  },
  {
    path: 'src/components/layout/',
    role:
      'Elementos de layout compartidos, actualmente selector de idioma.'
  },
  {
    path: 'src/components/ui/',
    role:
      'Carpeta preparada para componentes reutilizables de UI. Objetivo: sacar botones, switches, estados y paneles repetidos.'
  },
  {
    path: 'src/modules/',
    role:
      'Zona principal de producto. Cada carpeta representa un modulo de usuario independiente, separado por dominio funcional.'
  },
  {
    path: 'src/lib/',
    role:
      'Clientes y helpers compartidos de bajo nivel, como Supabase y sincronizacion generica de estado de modulos.'
  },
  {
    path: 'src/i18n/',
    role:
      'Configuracion multilenguaje, idiomas disponibles y diccionarios ES/EN. Preparado para crecer a mas idiomas.'
  },
  {
    path: 'src/data/',
    role:
      'Datos internos versionados dentro del frontend, como changelog e historicos auxiliares.'
  },
  {
    path: 'src/assets/',
    role:
      'Imagenes de fondos, bosses, iconos y recursos visuales empaquetados por Vite.'
  },
  {
    path: 'docs/',
    role:
      'Documentacion tecnica viva del proyecto, SQL de Supabase, contexto para continuar desarrollo y checklist pre-produccion.'
  }
];

const modules = [
  {
    name: 'Misiones / Kappa',
    files: 'src/modules/kappa/',
    body:
      'Carga quests desde tarkov.dev, separa progreso PVP/PVE, guarda en localStorage o Supabase, renderiza arbol por trader, Collector checklist y Quest Optimizer integrado.'
  },
  {
    name: 'Gestion del Refugio',
    files: 'src/modules/hideout/',
    body:
      'Modulo ya saneado en capas: HideoutModule como contenedor, HideoutHeader, HideoutStationList, HideoutStationDetail, hideoutApi para GraphQL, hideoutStorage para local/cloud y hideoutUtils para reglas puras.'
  },
  {
    name: 'Flea Market Tracker',
    files: 'src/modules/flea/',
    body:
      'Consulta items en tarkov.dev con gameMode regular/pve, permite busqueda, radar de oportunidades, detalle economico por item y tooltip de precio/fecha/variacion en el grafico historico.'
  },
  {
    name: 'Sistema de Llaves',
    files: 'src/modules/keys/',
    body:
      'Buscador vivo de llaves y keycards con precios PVP/PVE, filtros tacticos, fallback curado y enlaces externos.'
  },
  {
    name: 'Bosses',
    files: 'src/modules/bosses/',
    body:
      'Intel comun para PVP/PVE. Combina datos locales, imagenes empaquetadas, filtros, dificultad, spawn breakdown, zonas conocidas por mapa, minimapa esquematico y plan tactico.'
  },
  {
    name: 'Goons',
    files: 'src/modules/goons/',
    body:
      'Consulta fuentes externas de rotacion. Es fragil por dependencia HTML/externa y tiene avisos/fallback.'
  },
  {
    name: 'Perfil de PMC',
    files: 'src/modules/pmc/',
    body:
      'Lee el usuario Tarkov guardado en la cuenta y permite buscar otros PMCs por nombre, con historial local de busquedas. El frontend llama a /api/pmc-profile, una Netlify Function sin cache que busca accountId en players.tarkov.dev/profile/index.json o /pve/index.json sin parsear el indice completo en memoria, normaliza el JSON publico del perfil y calcula el nivel acumulando los tramos de playerLevels como hace tarkov.dev. Para evitar OutOfMemory en producción no carga catálogos JSON completos: usa GraphQL solo para playerLevels, skills e items visibles/favoritos necesarios, y toma los metadatos de logros desde el JSON estatico de tasks/traducciones. Devuelve todos los logros completados para el panel filtrable, una lista limitada de logros raros/exclusivos, habilidades farmeadas con icono oficial, nivel decimal y ultimo acceso, top logro integrado en la ficha principal, boton principal a tarkov.dev en la barra de busqueda, acciones para copiar AccID/exportar un dossier publico PNG con stats/equipo/favoritos/logros/skills y estado de sincronizacion claro. El PNG usa /api/image-proxy para incrustar iconos externos en canvas sin problemas CORS. No usa el endpoint de busqueda protegido por Turnstile.'
  },
  {
    name: 'Prestigios',
    files: 'src/modules/prestige/',
    body:
      'Modulo PVP ONLY con requisitos, recompensas, checklist local por nivel de prestige e insignias visuales cargadas desde src/assets/prestiges/. La UI consume textos desde i18n ES/EN y los datos/imagenes viven separados en prestigeData.js para facilitar nuevos idiomas y mantenimiento.'
  },
  {
    name: 'Simulador balistico',
    files: 'src/modules/armor/',
    body:
      'Calculadora de municion, armaduras, penetracion, dano y simulacion de impactos. Pendiente de refactor matematico/UI.'
  },
  {
    name: 'Server Status',
    files: 'src/modules/server-status/',
    body:
      'Vista de estado de servicios externos, pensada como acceso global desde la esquina superior izquierda.'
  },
  {
    name: 'Mapas, Historia y Troubleshooting',
    files: 'src/modules/maps/, src/modules/story/, src/modules/troubleshooting/',
    body:
      'Mapas es base visual tactica. Story agrupa decisiones/finales. Troubleshooting documenta limitaciones y problemas conocidos.'
  }
];

const flows = [
  {
    title: 'Navegacion',
    steps: ['Click en tarjeta o boton', 'navigateToView(view)', 'history.pushState/replaceState', 'App.jsx renderiza la vista lazy correspondiente']
  },
  {
    title: 'Sesion y rol',
    steps: ['Supabase Auth entrega sesion', 'App.jsx llama user_roles', 'userRole controla admin/messages/dossier', 'Perfil visual se carga desde user_profiles']
  },
  {
    title: 'Modulo con datos externos',
    steps: ['Componente monta', 'API helper consulta fuente externa', 'Se normalizan datos', 'Se guarda estado local/cloud si aplica', 'UI renderiza con fallback si falla']
  },
  {
    title: 'PVP/PVE',
    steps: ['El modulo mantiene modo activo', 'gameMode regular/pve se pasa a tarkov.dev', 'storage keys incluyen modo', 'Supabase guarda estado separado por mode']
  }
];

const nextRefactors = [
  'Revisar bundle/code-splitting antes de 1.0 para reducir el chunk principal si compensa.',
  'Pasada final de QA desktop sobre flujos criticos: registro/login, cuenta, reportes, admin, PMC, Kappa, Hideout, Flea y Bosses.',
  'Mantener la version movil como hito post-1.0: topbar responsive, grids a una columna, tablas con scroll controlado y paneles densos convertidos en bloques.',
  'Terminar limpieza de hooks en Hideout.',
  'Refactorizar KappaTree en QuestGraph, QuestCard, CollectorChecklist, kappaStorage y kappaUtils.',
  'Crear componentes UI compartidos: ModeSwitch, BackButton, LoadingState, ErrorState y ProgressBar.',
  'Crear servicios globales para tarkov.dev, localStorage y Supabase state.',
  'Sacar textos duros a i18n mientras se toquen modulos.',
  'Usar docs/PRE_PRODUCTION_CHECKLIST.md antes de cada deploy para validar lint, build, smoke tests y PMC Function.'
];

function Card({ title, children }) {
  return (
    <article
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '1.25rem',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <h2 style={{ color: '#fff', margin: '0 0 0.65rem', fontSize: '1.15rem', textTransform: 'uppercase' }}>
        {title}
      </h2>
      {children}
    </article>
  );
}

export default function ProjectDossierView({ onViewChange }) {
  return (
    <div
      className="fade-in-slide terminal-panel"
      style={{
        minHeight: '100vh',
        background: '#0a0a0c',
        padding: '6rem 2rem 8rem',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <main style={{ width: 'min(1180px, 100%)', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '2rem',
            alignItems: 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            paddingBottom: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            <p style={{ color: 'var(--tk-green)', margin: '0 0 0.45rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Dossier interno admin
            </p>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '2.8rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Arquitectura Info Tarkov
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '820px', lineHeight: 1.6, fontSize: '1rem' }}>
              Mapa tecnico para explicar el proyecto completo: que hace cada zona, como se comunican los modulos,
              donde viven los datos y cual es la ruta de saneamiento actual.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onViewChange('home')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.8rem 1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '900',
              letterSpacing: '1px',
              whiteSpace: 'nowrap'
            }}
          >
            VOLVER AL MENU
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {architectureBlocks.map((block) => (
            <Card key={block.title} title={block.title}>
              <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.6, margin: 0 }}>{block.body}</p>
            </Card>
          ))}
        </section>

        <Card title="Estructura de carpetas">
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            {structure.map((item) => (
              <div key={item.path} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.65rem' }}>
                <code style={{ color: 'var(--tk-green)', fontWeight: '900' }}>{item.path}</code>
                <p style={{ color: 'var(--tk-text-muted)', margin: '0.25rem 0 0', lineHeight: 1.55 }}>{item.role}</p>
              </div>
            ))}
          </div>
        </Card>

        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.7rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Modulos y responsabilidades
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))', gap: '1rem' }}>
            {modules.map((module) => (
              <Card key={module.name} title={module.name}>
                <code style={{ color: 'var(--tk-green)', fontWeight: '900' }}>{module.files}</code>
                <p style={{ color: 'var(--tk-text-muted)', margin: '0.55rem 0 0', lineHeight: 1.6 }}>{module.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
          {flows.map((flow) => (
            <Card key={flow.title} title={flow.title}>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--tk-text-muted)', lineHeight: 1.65 }}>
                {flow.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Card>
          ))}
        </section>

        <section style={{ marginTop: '2rem' }}>
          <Card title="Siguiente pasos previstos:">
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--tk-text-muted)', lineHeight: 1.7 }}>
              {nextRefactors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </section>
      </main>
    </div>
  );
}
