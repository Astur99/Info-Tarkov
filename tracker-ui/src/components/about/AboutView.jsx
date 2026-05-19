const sections = [
  {
    title: 'Que es Info Tarkov',
    body:
      'Info Tarkov es un hub modular para Escape From Tarkov pensado como centro tactico de consulta, seguimiento y decision. La idea es reunir en una sola interfaz herramientas que normalmente estarian dispersas: progreso de misiones, informacion de bosses, eventos activos, estado de servidores, calculos de combate y utilidades de planificacion.'
  },
  {
    title: 'Que se puede hacer',
    body:
      'La app permite consultar mapas tacticos, seguir el progreso de misiones para Kappa, revisar decisiones y finales del modo historia, investigar bosses, consultar rotaciones de Goons, explorar precios del flea market, planificar el hideout, simular enfrentamientos balisticos, revisar eventos en directo, mantener un perfil local de PMC con objetivo de wipe y comunicar bugs o sugerencias mediante tickets.'
  },
  {
    title: 'Sistema de usuarios',
    body:
      'Info Tarkov funciona tanto en modo invitado como con cuenta. En modo invitado el progreso se guarda localmente en el navegador. Con cuenta, Supabase Auth permite iniciar sesion y asociar progreso persistente en la nube por usuario, con separacion de perfiles PVP y PVE.'
  },
  {
    title: 'Panel de administracion',
    body:
      'La app incluye un panel admin reservado a usuarios con rol autorizado. Desde ahi se pueden revisar metricas internas, usuarios registrados, usuarios activos, roles, tickets de soporte y acciones administrativas. La cuenta owner queda protegida para evitar cambios accidentales sobre el propietario del sistema.'
  },
  {
    title: 'Comunicacion y soporte',
    body:
      'El modulo Report funciona como sistema de tickets entre usuarios y el desarrollador. Cada ticket conserva su conversacion, permite respuestas por ambas partes y puede cerrarse cuando el problema queda resuelto. Los usuarios pueden ocultar tickets de su lista y el admin puede gestionar tickets globalmente.'
  },
  {
    title: 'Arquitectura frontend',
    body:
      'El frontend esta construido con React y Vite. La navegacion es interna y se gestiona desde App.jsx mediante vistas modulares. Cada modulo vive en su propio componente y se carga con React.lazy y Suspense para reducir el peso inicial del bundle.'
  },
  {
    title: 'Backend y persistencia',
    body:
      'El backend usa Supabase: PostgreSQL como base de datos, Supabase Auth para autenticacion y Row Level Security para proteger datos por usuario. La app combina persistencia local mediante localStorage con persistencia cloud cuando existe una sesion activa.'
  },
  {
    title: 'Tecnologias principales',
    body:
      'React, Vite, Supabase, PostgreSQL, Supabase Auth, Row Level Security, localStorage, i18next, react-i18next, Netlify, GitHub y consumo de APIs externas relacionadas con Tarkov.'
  },
  {
    title: 'Estado actual',
    body:
      'El proyecto ya cuenta con autenticacion, roles, panel admin, tickets, lazy loading, primeras bases multilenguaje ES/EN, tarjetas visuales de modulos y herramientas principales funcionales, incluido Perfil de PMC con persistencia local. Las siguientes fases naturales son completar la traduccion, limpiar deuda tecnica detectada por lint y seguir ampliando cada modulo con datos mas fiables.'
  }
];

const moduleDetails = [
  {
    name: 'Mapas tacticos',
    purpose:
      'Modulo pensado para consulta rapida de mapas, extracciones y puntos de interes. Funciona como puerta de entrada para organizar rutas antes de una raid y como base futura para superponer quests, llaves, loot y riesgo.',
    actions: ['Consultar mapas por zona', 'Preparar rutas de extraccion', 'Ubicar puntos importantes antes de entrar a raid'],
    status: 'Base visual preparada para evolucionar hacia mapas tacticos interactivos.'
  },
  {
    name: 'Misiones / Kappa',
    purpose:
      'Arbol global de quests conectado con tarkov.dev. Permite seguir progreso, completar ramas, separar PVP/PVE y visualizar dependencias entre misiones para avanzar hacia Kappa sin perderse en cadenas de traders. Incluye Quest Optimizer como subherramienta interna y la mision Collector de Fence abre un checklist propio de items Kappa.',
    actions: ['Marcar quests completadas', 'Autocompletar prerequisitos', 'Filtrar por Kappa', 'Abrir Quest Optimizer', 'Abrir checklist Collector', 'Sincronizar progreso con Supabase si hay cuenta'],
    status: 'Modulo critico de progresion con persistencia local/cloud hibrida para quests, optimizador integrado y checklist local de items Collector.'
  },
  {
    name: 'Decisiones / Finales',
    purpose:
      'Modulo dedicado a decisiones narrativas, puntos de no retorno y rutas del modo historia. Ayuda a entender que decisiones bloquean otras rutas y que consecuencias puede tener aceptar ciertos encargos.',
    actions: ['Revisar rutas narrativas', 'Identificar puntos de no retorno', 'Comparar opciones antes de comprometer una linea de historia'],
    status: 'Base de story intelligence para evitar decisiones irreversibles sin informacion.'
  },
  {
    name: 'Intel: Bosses',
    purpose:
      'Ficha de inteligencia de bosses con informacion de ubicaciones, equipo, comportamiento, puntos debiles y loot. Esta pensado para preparar enfrentamientos y decidir si una raid merece asumir riesgo de boss.',
    actions: ['Consultar bosses por mapa', 'Ver informacion de combate', 'Revisar loot y amenazas', 'Preparar estrategia antes de entrar'],
    status: 'Modulo informativo ampliable con spawn rates, rutas y builds recomendadas.'
  },
  {
    name: 'Tracker de Goons',
    purpose:
      'Herramienta para consultar la rotacion o ubicacion estimada de los Goons usando fuentes externas. Centraliza el dato para no depender de revisar manualmente trackers fuera de la app.',
    actions: ['Consultar ultimo reporte', 'Ver mapa activo estimado', 'Distinguir errores de fuente externa', 'Preparar raids de busqueda o evitacion'],
    status: 'Dependiente de fuentes externas y parser HTML; documentado en Troubleshooting.'
  },
  {
    name: 'Flea Market Tracker',
    purpose:
      'Modulo economico para consultar precios, fluctuaciones y rentabilidad. Sirve para decidir compras, ventas y oportunidades relacionadas con items, hideout o barters.',
    actions: ['Buscar items', 'Consultar precios aproximados', 'Evaluar rentabilidad', 'Detectar oportunidades de mercado'],
    status: 'Preparado para crecer hacia watchlist, alertas y calculadora de barters.'
  },
  {
    name: 'Gestion del Refugio',
    purpose:
      'Planificador de hideout para organizar estaciones, niveles objetivo, materiales necesarios y progreso. Su objetivo es convertir la mejora del refugio en una checklist clara y accionable.',
    actions: ['Revisar estaciones', 'Planificar upgrades', 'Identificar materiales necesarios', 'Priorizar mejoras segun progreso'],
    status: 'Modulo funcional con fallback local; pendiente de limpieza tecnica detectada por lint.'
  },
  {
    name: 'Simulador balistico',
    purpose:
      'Herramienta de calculo para entender penetracion, dano, armaduras y tiempo estimado para matar. Ayuda a comparar municiones y tomar mejores decisiones de equipamiento.',
    actions: ['Comparar municion contra armaduras', 'Simular impactos', 'Estimar TTK', 'Entender si una bala merece la pena'],
    status: 'Modulo tecnico con potencial para convertirse en Ammo Intelligence completo.'
  },
  {
    name: 'Eventos en directo',
    purpose:
      'Centro de seguimiento para eventos temporales, anuncios, cambios activos y comunicaciones relevantes del juego. Busca separar eventos recientes de eventos realmente activos.',
    actions: ['Consultar eventos activos', 'Ver eventos recientes', 'Usar fallback manual si las fuentes fallan', 'Evitar informacion antigua confundida como evento actual'],
    status: 'Depende de fuentes externas, con fallback para mantener informacion util.'
  },
  {
    name: 'Prestigios',
    purpose:
      'Modulo de progresion endgame PVP con requisitos de Prestige 1 a 6. Incluye nivel PMC, dinero, quests, historia, skills, hideout, recompensas y checklist local por prestigio.',
    actions: ['Seleccionar nivel de prestigio', 'Marcar requisitos completados', 'Consultar recompensas', 'Preparar el siguiente reset de progresion'],
    status: 'Nuevo modulo independiente con checklist local y datos base revisados contra la wiki oficial.'
  },
  {
    name: 'Sistema de llaves',
    purpose:
      'Motor de busqueda de llaves y keycards conectado a tarkov.dev, con una capa tactica encima para destacar llaves importantes. Permite encontrar cualquier llave del catalogo vivo y entender cuales conviene guardar, comprar o llevar.',
    actions: ['Buscar cualquier llave', 'Filtrar por mapa', 'Filtrar por tipo', 'Ver llaves importantes', 'Consultar precio e icono', 'Abrir wiki externa'],
    status: 'Buscador vivo con fallback local de llaves prioritarias si la API externa falla.'
  },
  {
    name: 'Quest Optimizer',
    purpose:
      'Subherramienta integrada dentro de Misiones / Kappa para recomendar el mejor mapa de la siguiente raid segun quests pendientes, progreso de KappaTree, Kappa requerido, riesgo y llaves recomendadas.',
    actions: ['Analizar progreso PVP/PVE', 'Agrupar quests pendientes por mapa', 'Priorizar Kappa', 'Ver recomendacion principal', 'Preparar llaves necesarias'],
    status: 'Integrado dentro de KappaTree; la URL antigua se mantiene como acceso directo al submenú.'
  },
  {
    name: 'Perfil de PMC',
    purpose:
      'Panel local para resumir el estado del wipe del jugador. Reune nivel, faccion, modo, supervivencia, economia, quests, progreso de hideout e items Kappa para dar una lectura rapida del objetivo principal desde una tarjeta propia con imagen PMC.',
    actions: ['Guardar callsign local', 'Elegir objetivo principal', 'Medir progreso operativo', 'Ver prioridades recomendadas', 'Consultar resumen visual desde el menu'],
    status: 'Modulo local-first con persistencia en el navegador e imagen pmc.png integrada en la tarjeta principal, preparado para sincronizacion futura con cuenta.'
  }
];

const techGroups = [
  {
    title: 'Frontend',
    items: ['React', 'Vite', 'JavaScript', 'CSS inline + variables globales', 'React.lazy', 'Suspense']
  },
  {
    title: 'Backend',
    items: ['Supabase', 'PostgreSQL', 'RPC SQL', 'Row Level Security', 'Supabase Auth']
  },
  {
    title: 'Persistencia',
    items: ['localStorage', 'Supabase por usuario', 'Progreso separado PVP/PVE', 'Sesiones persistentes']
  },
  {
    title: 'Producto',
    items: ['Netlify', 'GitHub', 'i18next', 'react-i18next', 'APIs externas', 'Sistema de tickets']
  }
];

export default function AboutView({ onViewChange }) {
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
      <main style={{ width: 'min(1120px, 100%)', margin: '0 auto' }}>
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
            <p
              style={{
                color: 'var(--tk-green)',
                margin: '0 0 0.45rem',
                fontWeight: '900',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}
            >
              Memoria del proyecto
            </p>
            <h1
              style={{
                color: '#fff',
                margin: 0,
                fontSize: '2.8rem',
                letterSpacing: '1.5px',
                textTransform: 'uppercase'
              }}
            >
              About Info Tarkov
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '760px', lineHeight: 1.6, fontSize: '1rem' }}>
              Resumen completo del proposito, alcance, arquitectura y tecnologias que dan forma a la app.
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

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          {techGroups.map((group) => (
            <article
              key={group.title}
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '1.2rem'
              }}
            >
              <h2 style={{ color: '#fff', marginTop: 0, fontSize: '1.1rem' }}>{group.title}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {group.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      color: 'var(--tk-green)',
                      background: 'rgba(26,176,21,0.08)',
                      border: '1px solid rgba(26,176,21,0.18)',
                      borderRadius: '999px',
                      padding: '0.25rem 0.55rem',
                      fontWeight: '800',
                      fontSize: '0.78rem'
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p
              style={{
                color: 'var(--tk-green)',
                margin: '0 0 0.35rem',
                fontWeight: '900',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}
            >
              Modulos de la app
            </p>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', textTransform: 'uppercase' }}>
              Herramientas disponibles para el usuario
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1rem' }}>
            {moduleDetails.map((module) => (
              <article
                key={module.name}
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '1.35rem',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                <h3
                  style={{
                    color: '#fff',
                    margin: '0 0 0.6rem',
                    fontSize: '1.2rem',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase'
                  }}
                >
                  {module.name}
                </h3>
                <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.6, margin: '0 0 0.9rem' }}>
                  {module.purpose}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.9rem' }}>
                  {module.actions.map((action) => (
                    <span
                      key={action}
                      style={{
                        color: 'var(--tk-green)',
                        background: 'rgba(26,176,21,0.07)',
                        border: '1px solid rgba(26,176,21,0.16)',
                        borderRadius: '999px',
                        padding: '0.22rem 0.55rem',
                        fontWeight: '800',
                        fontSize: '0.76rem'
                      }}
                    >
                      {action}
                    </span>
                  ))}
                </div>
                <p style={{ color: '#d8d8d8', lineHeight: 1.55, margin: 0 }}>
                  <strong style={{ color: '#fff' }}>Estado:</strong> {module.status}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gap: '1rem' }}>
          {sections.map((section) => (
            <article
              key={section.title}
              style={{
                background: 'var(--tk-glass)',
                border: '1px solid var(--tk-glass-border)',
                borderRadius: '8px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <h2
                style={{
                  color: '#fff',
                  margin: '0 0 0.65rem',
                  fontSize: '1.25rem',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase'
                }}
              >
                {section.title}
              </h2>
              <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.65, margin: 0 }}>
                {section.body}
              </p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
