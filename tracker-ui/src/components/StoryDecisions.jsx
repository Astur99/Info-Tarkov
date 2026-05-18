import { useState } from 'react';

export default function StoryDecisions({ onViewChange }) {
  // CONTROL DE BIFURCACIONES Y DECISIONES (PASOS DE TU GUÍA)
  const [paso3Decision, setPaso3Decision] = useState(null); // null | 'quedarselo' | 'prapor'
  const [paso6Decision, setPaso6Decision] = useState(null); // null | 'no_kerman' | 'kerman'
  const [ramaKerman, setRamaKerman] = useState(null); // null | 'full_evidencias' | 'u_turn' | 'no_evidencias'
  const [verPraporExigencias, setVerPraporExigencias] = useState(false);

  const styles = {
    card: {
      backgroundColor: 'var(--tk-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--tk-glass-border)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    btnDecision: (activo, colorBorder = 'var(--tk-green)') => ({
      backgroundColor: activo ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.4)',
      color: '#fff',
      border: activo ? `2px solid ${colorBorder}` : '1px solid var(--tk-glass-border)',
      padding: '14px 28px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontFamily: "'Rajdhani', sans-serif",
      fontWeight: '700',
      fontSize: '0.95rem',
      letterSpacing: '1px',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: activo ? `0 0 20px ${colorBorder}33` : 'none',
      transform: activo ? 'scale(1.02)' : 'scale(1)'
    }),
    badge: (bg = 'rgba(255,255,255,0.06)', col = '#fff') => ({
      backgroundColor: bg,
      color: col,
      fontSize: '0.75rem',
      fontWeight: '800',
      padding: '4px 12px',
      borderRadius: '4px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      display: 'inline-block',
      marginBottom: '0.8rem'
    }),
    lineaConectora: {
      width: '2px',
      height: '40px',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
      margin: '0 auto',
      animation: 'pulseLinea 2s infinite alternate'
    },
    animacionContenedor: {
      animation: 'fadeScaleIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    },
    contenedorLogo: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }
  };

  return (
    <div className="fade-in-slide" style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      
      {/* INYECCIÓN DE ESTILOS CSS PARA ANIMACIONES NATIVAS */}
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: translateY(15px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseLinea {
          from { opacity: 0.3; }
          to { opacity: 0.8; }
        }
        .nodo-interactivo {
          transition: all 0.3s ease;
        }
        .nodo-interactivo:hover {
          border-color: rgba(255,255,255,0.2) !important;
          background-color: rgba(255,255,255,0.01) !important;
        }
      `}</style>

      {/* CABECERA */}
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>STORY DECISIONS</h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            Todas las rutas, decisiones y puntos de no retorno que debes tener en cuenta para llegar a los distintos finales del modo historia de Tarkov.
          </p>
        </div>
        
        <button 
          onClick={() => onViewChange('home')}
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', transition: 'all 0.3s', fontSize: '0.85rem' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
        >
          VOLVER AL MENÚ
        </button>
      </header>

      {/* FASE 1: CADENA COMÚN INICIAL */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div style={styles.card} className="nodo-interactivo">
            <span style={styles.badge()}>OBJETIVO DE CAMPAÑA</span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>FALLING SKIES</h4>
            <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.4' }}>Progresar el capítulo "Falling Skies".</p>
          </div>
          <div style={styles.card} className="nodo-interactivo">
            <span style={styles.badge()}>OBJETIVO DE RECOLECCIÓN</span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>RECUPERAR ARMORED CASE</h4>
            <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.4' }}>Recuperar el Armored Case del avión estrellado en Woods.</p>
          </div>
        </div>

        <div style={styles.lineaConectora}></div>

        {/* PUNTO DE NO RETORNO: EL CONTENEDOR */}
        <div style={{ ...styles.card, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.15)', padding: '2.5rem 2rem' }}>
          <span style={styles.badge('var(--tk-red)', '#fff')}>PUNTO DE NO RETORNO</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', margin: '0.3rem 0 1.5rem 0', letterSpacing: '0.5px' }}>¿QUÉ HACES CON EL ARMORED CASE?</h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { setPaso3Decision('quedarselo'); setPaso6Decision(null); setRamaKerman(null); setVerPraporExigencias(false); }}
              style={styles.btnDecision(paso3Decision === 'quedarselo')}
            >
              OPCIÓN: QUEDARTE EL ARMORED CASE
            </button>
            <button 
              onClick={() => { setPaso3Decision('prapor'); setPaso6Decision(null); setRamaKerman(null); setVerPraporExigencias(false); }}
              style={styles.btnDecision(paso3Decision === 'prapor', '#ffaa00')}
            >
              OPCIÓN: ENTREGÁRSELO A PRAPOR
            </button>
          </div>
        </div>
      </section>

      {/* FLUJO DINÁMICO DEPENDIENDO DEL CONTENEDOR */}
      {paso3Decision && (
        <section style={styles.animacionContenedor}>
          <div style={styles.lineaConectora}></div>

          {/* OPCIÓN: QUEDÁRSELO */}
          {paso3Decision === 'quedarselo' && (
            <div style={styles.card} className="nodo-interactivo">
              <span style={styles.badge('var(--tk-green)')}>CAPÍTULO: THE TICKET</span>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginTop: '0.4rem' }}>CONTENEDOR EN TUS MANOS</h4>
              <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>El Armored Case está en tus manos. Avanzas de forma directa hacia su apertura.</p>
            </div>
          )}

          {/* OPCIÓN: PRAPOR (CADENA LIGHTKEEPER) */}
          {paso3Decision === 'prapor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              <div style={{ ...styles.card, border: '1px solid rgba(255, 170, 0, 0.2)' }}>
                <span style={styles.badge('#ffaa00', '#000')}>CAPÍTULO: THE TICKET</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.2rem', color: '#fff', fontSize: '0.95rem' }}>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>LIGHTHOUSE</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>Encuentra material comprometedor de Prapor en Lighthouse.</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>REQUISITO DE ACCESO</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>Consigue acceso a Lightkeeper. La misión Network Provider 1 debe estar disponible.</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>SOBORNO DE TRADEO</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>Habla con Lightkeeper y págale tres TerraGroup Blue Folders.</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>SEÑALIZACIÓN</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>Dispara una Bengala Amarilla en frente del Ultra Mall en Interchange.</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>CONDICIÓN EN RAID</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>Mata a 15 targets sin morir en la misma raid de la bengala.</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>RECOGIDA</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>Recoge el Armored Case de Lightkeeper. Se guarda en el slot especial.</p>
                  </div>
                </div>
              </div>
              <div style={styles.lineaConectora}></div>
              <div style={{ ...styles.card, border: '1px solid var(--tk-green)', textAlign: 'center', backgroundColor: 'rgba(26,176,21,0.02)' }}>
                <span style={styles.badge('var(--tk-green)', '#fff')}>CONEXIÓN DE PUNTOS</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginTop: '0.2rem' }}>EL ARMORED CASE ESTÁ EN TUS MANOS</h4>
              </div>
            </div>
          )}

          {/* FASE 3: APERTURA */}
          <div style={styles.lineaConectora}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={styles.card} className="nodo-interactivo">
              <span style={styles.badge()}>DESENCRIPTACIÓN</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>APERTURA DEL CONTENEDOR</h4>
              <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Encuentra el Signal Jammer en LABS.</p>
            </div>
            <div style={{ ...styles.card, border: '1px solid var(--tk-green)' }} className="nodo-interactivo">
              <span style={styles.badge('var(--tk-green)')}>ESTADO COMPLETO</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>EL ARMORED CASE ESTÁ ABIERTO</h4>
              <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Planos internos expuestos.</p>
            </div>
          </div>

          <div style={styles.lineaConectora}></div>

          {/* PUNTO DE NO RETORNO: KERMAN */}
          <div style={{ ...styles.card, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.15)', padding: '2.5rem 2rem' }}>
            <span style={styles.badge('var(--tk-red)', '#fff')}>PUNTO DE NO RETORNO</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0.3rem 0 1.5rem 0' }}>¿TRABAJAR CON KERMAN O NO TRABAJAR CON KERMAN?</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { setPaso6Decision('no_kerman'); setRamaKerman(null); setVerPraporExigencias(false); }}
                style={styles.btnDecision(paso6Decision === 'no_kerman', 'var(--tk-red)')}
              >
                RAMA: NO TRABAJAR CON KERMAN
              </button>
              <button 
                onClick={() => { setPaso6Decision('kerman'); setRamaKerman(null); setVerPraporExigencias(false); }}
                style={styles.btnDecision(paso6Decision === 'kerman', 'var(--tk-green)')}
              >
                RAMA: TRABAJAR CON KERMAN
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* RAMA: NO TRABAJAR CON KERMAN (FINAL SURVIVOR)                             */}
      {/* ========================================================================= */}
      {paso6Decision === 'no_kerman' && (
        <section style={styles.animacionContenedor}>
          <div style={styles.lineaConectora}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={styles.card} className="nodo-interactivo">
                <span style={styles.badge('var(--tk-red)')}>ACCESO AL PUERTO</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>LOGRO EASY WAY</h4>
                <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  Ve a la entrada del puerto (intercom) y pasa la Keycard.
                </p>
              </div>
              <div style={{ ...styles.card, border: '1px solid rgba(176,21,21,0.2)' }}>
                <span style={styles.badge()}>RESPUESTA DEL TERMINAL</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>LA TARJETA NO FUNCIONÓ</h4>
                <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.4rem', marginBottom: '1.2rem' }}>
                  Tarjeta rechazada. Pídele ayuda a Prapor para buscar una alternativa.
                </p>
                <button onClick={() => setVerPraporExigencias(!verPraporExigencias)} style={styles.btnDecision(verPraporExigencias, '#fff')}>
                  {verPraporExigencias ? 'OCULTAR REQUISITOS DE AYUDA' : 'MOSTRAR REQUISITOS DE AYUDA'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {verPraporExigencias ? (
                <div style={styles.animacionContenedor}>
                  {paso3Decision === 'prapor' ? (
                    <div style={{ ...styles.card, border: '1px solid var(--tk-green)', backgroundColor: 'rgba(26,176,21,0.02)' }}>
                      <span style={styles.badge('var(--tk-green)', '#fff')}>HISTORIAL: CASE ENTREGADO A PRAPOR</span>
                      <h4 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#fff', marginTop: '0.4rem' }}>TASA: 300M DE RUBLOS</h4>
                      <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                        Prapor quiere 300M de rublos si le diste el Armored Case. A cambio te dará una nota para los soldados de Terminal para cerrar la rama.
                      </p>
                    </div>
                  ) : (
                    <div style={{ ...styles.card, border: '1px solid var(--tk-red)', backgroundColor: 'rgba(176,21,21,0.02)' }}>
                      <span style={{ ...styles.badge('var(--tk-red)', '#fff') }}>HISTORIAL: CONTENEDOR RETENIDO</span>
                      <h4 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#fff', marginTop: '0.4rem' }}>TASA: 500M DE RUBLOS + CONDICIONES</h4>
                      <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
                        Prapor quiere 500M de rublos si NO le diste el Armored Case. Tareas a contrarreloj requeridas:
                      </p>
                      <ul style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem', paddingLeft: '1.2rem', marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li>• Encuentra 4 TerraGroup Report Folders en LABS.</li>
                        <li>• Dale a Prapor el Flash Drive con Datos.</li>
                        <li>• Mata 50 Targets en Streets of Tarkov.</li>
                        <li>• Mata 4 PMCs y sobrevive en una única raid.</li>
                      </ul>
                      <div style={{ marginTop: '1.2rem', padding: '0.8rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.85rem', borderLeft: '3px solid var(--tk-red)', color: 'rgba(255,255,255,0.85)' }}>
                        PENALIZACIÓN: Estas tareas deben hacerse en menos de 72 horas o se deberá entregar el contenedor Kappa para poder avanzar. Si se completa en plazo, consigues el logro "I Am Speed".
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textTransform: 'uppercase', textAlign: 'center', color: 'rgba(255,255,255,0.12)', letterSpacing: '2px', fontWeight: '700', fontSize: '1rem' }}>
                  Sistema en espera.<br />Activa el cálculo para proyectar la ventana de escape.
                </div>
              )}
            </div>
          </div>

          {verPraporExigencias && (
            <div style={styles.animacionContenedor}>
              <div style={styles.lineaConectora}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                <div style={styles.card}>
                  <span style={styles.badge('#fff', '#000')}>CAMINO A TERMINAL</span>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    Ve a Shoreline entre las 21:00 y las 06:00, habla en el intercom de la torre y pasa la Keycard. Acércate al portón de Terminal sin el arma en la mano y empieza tu intento de Escapar de Tarkov.
                  </p>
                  <p style={{ marginTop: '0.8rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
                    Si el intento falla, necesitarás comprar una nueva Nota a Prapor por 5M de Rublos (2 por restock).
                  </p>
                </div>
                
                {/* VECTOR LOGO: SURVIVOR (MONIGOTE CORRIENDO AMARILLO) */}
                <div style={{ ...styles.card, border: '1px solid #ffcc00', backgroundColor: 'rgba(255,204,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2.5rem' }}>
                  <div style={{ ...styles.contenedorLogo, borderColor: '#ffcc00' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 22v-4M4 22v-6M10 22v-5M14 22v-8" />
                      <path d="M4 11V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4" />
                      <circle cx="12" cy="9" r="1.5" fill="#ffcc00" />
                      <path d="m7 14 3-2 3 2 4-3" />
                    </svg>
                  </div>
                  <span style={styles.badge('rgba(255,204,0,0.1)', '#ffcc00')}>MEDIUM</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '0.2rem' }}>FINAL SURVIVOR</h3>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginTop: '1rem', textAlign: 'center' }}>
                    Huiste esperando escapar, parecía que todo terminaría fuera de Tarkov, pero el infierno estalló a tus espaldas. No sabías que eras parte de la cadena que destruyó la ciudad. Mientras las cenizas seguían calientes, TerraGroup renació y el mundo cayó a sus pies. Sobreviviste, pero ¿a qué precio?
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* RAMA: TRABAJAR CON KERMAN                                                 */}
      {/* ========================================================================= */}
      {paso6Decision === 'kerman' && (
        <section style={styles.animacionContenedor}>
          <div style={styles.lineaConectora}></div>
          
          {/* Cadena inicial común de Kerman */}
          <div style={{ ...styles.card, border: '1px solid rgba(26,176,21,0.2)' }}>
            <span style={styles.badge('var(--tk-green)', '#fff')}>PRIMERA FASE CON KERMAN</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem', color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem' }}>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)' }}>INFILTRACIÓN LABS</span>
                <p style={{ marginTop: '0.2rem', lineHeight: '1.4' }}>Busca la Masterkeycard y el dispositivo RFID en LABS.</p>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)' }}>AYUDA DE MECHANIC</span>
                <p style={{ marginTop: '0.2rem', lineHeight: '1.4' }}>Masterkeycard adquirida, pero no el RFID: habla con Mechanic y págale 40 Bitcoins.</p>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)' }}>TOCA IR A EN STREETS</span>
                <p style={{ marginTop: '0.2rem', lineHeight: '1.4' }}>Obtén la llave de Elektroniks y ve a su apartamento en Streets de Tarkov a por el dispositivo RFID.</p>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)' }}>ACTIVACIÓN DE TARJETA RFID</span>
                <p style={{ marginTop: '0.2rem', lineHeight: '1.4' }}>Activa la tarjeta RFID desde el Armored Case. Ve a la entrada del puerto (intercom) y pasala por el lector.</p>
              </div>
            </div>
          </div>

          <div style={styles.lineaConectora}></div>

          {/* Punto de decisión de evidencias */}
          <div style={{ ...styles.card, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.15)', padding: '2.5rem 2rem' }}>
            <span style={styles.badge('var(--tk-red)', '#fff')}>PUNTO DE NO RETORNO</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0.3rem 0 1.5rem 0' }}>RECABA EVIDENCIAS CONTRA TERRAGROUP</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setRamaKerman('full_evidencias')} style={styles.btnDecision(ramaKerman === 'full_evidencias', '#2b7fff')}>
                OPCIÓN A: ENTREGAR TODAS LAS EVIDENCIAS A KERMAN
              </button>
              <button onClick={() => setRamaKerman('u_turn')} style={styles.btnDecision(ramaKerman === 'u_turn', '#ffaa00')}>
                OPCIÓN A-2: ENTREGAR 2 EVIDENCIAS E IRTE CON LIGHTKEEPER
              </button>
              <button onClick={() => setRamaKerman('no_evidencias')} style={styles.btnDecision(ramaKerman === 'no_evidencias', 'var(--tk-red)')}>
                OPCIÓN B: NEGARSE A AYUDAR A KERMAN
              </button>
            </div>
          </div>

          {/* ==================== LEALTAD COMPLETA (FINAL SAVIOR) ==================== */}
          {ramaKerman === 'full_evidencias' && (
            <div style={styles.animacionContenedor}>
              <div style={styles.lineaConectora}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                <div style={styles.card}>
                  <span style={styles.badge('#2b7fff')}>REQUISITOS PARA COMPLETAR ESTA RUTA</span>
                  <ul style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>• Construye el Intelligence Center Nivel 3 en el Hideout.</li>
                    <li>• Entregar las 8 "Major Evidence" a Kerman.</li>
                    <li>• Kerman te considera contacto de confianza. Recibes un mensaje a través de Fence.</li>
                    <li>• Alcanza reputación 4.0 con Fence. Debes matar 5 PMCs en una raid sin matar Scavs en Shoreline o Interchange (PVE), o usar extracciones cooperativas con scavs en Woods y Reserve (PVP).</li>
                    <li>• Sube la reputación con el BTR Driver a 0.4. Completa la misión "The Price of Independence", si fallas aquí, deberás continuar hacia el final Survivor.</li>
                    <li>• Construye las Placas Solares (Solar Power) en el Hideout.</li>
                    <li>• Craftea la blank RFID en el Intelligence Center Nivel 3.</li>
                    <li>• RAID FINAL: Ve a Shoreline entre las 21:00 y las 06:00, usa el intercom de la torre, pasa la Keycard y ve al portón de Terminal sin armas en las manos. Si fallas, la tarjeta se destruye y necesitas craftear una nueva Blank RFID Card.</li>
                  </ul>
                </div>
                
                {/* VECTOR LOGO: SAVIOR (PALOMA DE LA PAZ BLANCA) */}
                <div style={{ ...styles.card, border: '1px solid #4a90e2', backgroundColor: 'rgba(74,144,226,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2.5rem' }}>
                  <div style={{ ...styles.contenedorLogo, borderColor: '#fff' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2s-8 7-11 8a5 5 0 0 0-.5 8.5c1.5 1 4.5.5 6-1 2-2 4.5-9.5 5.5-15.5Z" />
                      <path d="M11 10s-4-1-6-1-4 3-4 3 4 1 5 3 2 4 4 4 1-5 1-9Z" />
                    </svg>
                  </div>
                  <span style={styles.badge('rgba(255,50,50,0.1)', '#ff4444')}>VERY HARD</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '0.2rem' }}>FINAL SAVIOR</h3>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginTop: '1rem', textAlign: 'center' }}>
                    Escapaste de Tarkov por la humanidad. Pusiste tu confianza en Kerman, un paso mucho más allá del mero instinto de sobrevivir. El golpe contra TerraGroup destrozó su máscara: los secretos quedaron al descubierto, los políticos corruptos perdieron su poder y la humanidad se quitó las cadenas para respirar libre. La gente se dio cuenta de que podía vivir de otra manera, sin caer en la ruina. Escapaste de Tarkov, pero contigo también se liberó la verdad. Lo hiciste por el bien de todos nosotros.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== CAMBIO A LIGHTKEEPER (FINAL DEBTOR) ==================== */}
          {ramaKerman === 'u_turn' && (
            <div style={styles.animacionContenedor}>
              <div style={styles.lineaConectora}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                <div style={styles.card}>
                  <span style={styles.badge('#ffaa00', '#000')}>REQUISITOS PARA CAMBIAR DE BANDO</span>
                  <ul style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <li>• Construye el Intelligence Center Nivel 3 en el Hideout.</li>
                    <li>• Entrega solo 2 Major Evidence a Kerman y corta lazos (Consigues el logro "U Turn"). Despues ve y habla con Lightkeeper.</li>
                    <li>• Encuentra 5 mapas de reconocimiento (1 en cada mapa).</li>
                    <li>• Consigue y entrega un Flash Drive especial con datos a Lightkeeper.</li>
                    <li>• Mata a 30 PMCs en Woods y entrega 100 dogtags de PMC a Lightkeeper.</li>
                    <li>• Localiza un Cultist Amulet en cada una de las Marked Rooms del juego.</li>
                    <li>• Coloca los amuletos en la Shared Bedroom Marked Key en la isla de Lightkeeper.</li>
                    <li>• Lightkeeper te da la Keycard de Terminal.</li>
                    <li>• RAID FINAL: Ve a Shoreline (21:00 - 06:00), intercom, Keycard y acércate al portón desarmado. Si mueres, necesitas tradear una Blue Folder con Lightkeeper para otra tarjeta.</li>
                  </ul>
                </div>
                
                {/* VECTOR LOGO: DEBTOR (BOLSA DE DINERO NARANJA) */}
                <div style={{ ...styles.card, border: '1px solid #ffaa00', backgroundColor: 'rgba(255,170,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2.5rem' }}>
                  <div style={{ ...styles.contenedorLogo, borderColor: '#ffaa00' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffaa00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4M12 14v3M10 15h4" />
                    </svg>
                  </div>
                  <span style={styles.badge('rgba(255,170,0,0.1)', '#ffaa00')}>HARD</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '0.2rem' }}>FINAL DEBTOR</h3>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginTop: '1rem', textAlign: 'center' }}>
                    Escapaste de Tarkov pero no escapaste de ti mismo. Rozaste la verdad con los dedos, pero te congelaste a mitad de camino llamando precaución a tu miedo. Kerman te recordó como alguien poco fiable. Todo lo que habías descubierto se disolvió en el caos creciente. TerraGroup sobrevivió y se hizo más fuerte. Ahora no eres más que un mercenario sin honor, ligado a una deuda que pesa en tu corazón. Saliste, pero no pudiste escapar. Nunca escaparás de ti mismo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== NEGARSE A AYUDAR A KERMAN (FINAL FALLEN) ==================== */}
          {ramaKerman === 'no_evidencias' && (
            <div style={styles.animacionContenedor}>
              <div style={styles.lineaConectora}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                <div style={styles.card}>
                  <span style={styles.badge('var(--tk-red)')}>COMPROBACIÓN DE COSTES ("HAND OVER...")</span>
                  
                  {/* COMPROBACIÓN CRUZADA */}
                  <div style={{ padding: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.9rem', borderLeft: '3px solid #ffaa00', marginBottom: '1.2rem', lineHeight: '1.4' }}>
                    {paso3Decision === 'prapor' ? (
                      <span style={{ color: 'var(--tk-green)', fontWeight: '600' }}>ACCIONES PASADAS: Le diste el Armored Case a Prapor. Te lo devuelve tras recuperarlo de Lightkeeper sin penalizaciones.</span>
                    ) : (
                      <span style={{ color: 'var(--tk-red)', fontWeight: '600' }}>ACCIONES PASADAS: NO le diste el Case a Prapor. Te exige 40 Repair Kits al 100% de durabilidad, entregar tu contenedor seguro (Kappa, Theta o Epsilon) y entregar 50 Military Components (Virtex, COFDM, etc.).</span>
                    )}
                  </div>

                  <ul style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <li>• No entregues ninguna evidencia a Kerman (Logro Enough of your Games!).</li>
                    <li>• Ve a hablar con Prapor.</li>
                    <li>• Recuperas el "Maletín con cargamento peligroso" y se lo das a Prapor.</li>
                    <li>• Paga 1.000.000 de dólares a Prapor (Consigues el logro Will it Blow?).</li>
                    <li>• Prapor te da un USB con códigos Hash.</li>
                    <li>• Construye las Placas Solares (Solar Power) en el Hideout.</li>
                    <li>• Craftea la blank RFID en el Intelligence Center Nivel 3.</li>
                    <li>• RAID FINAL: Ve a Shoreline (21:00 - 06:00), intercom de la torre, Keycard y ve desarmado hacia Terminal. Si fallas, necesitas craftear una nueva Blank RFID Card desde cero.</li>
                  </ul>
                </div>
                
                {/* VECTOR LOGO: FALLEN (CALAVERA BLANCA/ROJA) */}
                <div style={{ ...styles.card, border: '1px solid var(--tk-red)', backgroundColor: 'rgba(176,21,21,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2.5rem' }}>
                  <div style={{ ...styles.contenedorLogo, borderColor: 'var(--tk-red)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--tk-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12h.01M15 12h.01M10 16h4" />
                      <path d="M19 10a7 7 0 0 0-14 0c0 3.5 2.5 6.5 5 7.5v3h4v-3c2.5-1 5-4 5-7.5Z" />
                    </svg>
                  </div>
                  <span style={styles.badge('rgba(255,170,0,0.1)', '#ffaa00')}>HARD</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '0.2rem' }}>FINAL FALLEN</h3>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginTop: '1rem', textAlign: 'center' }}>
                    Escapaste de Tarkov para caer en la oscuridad. No le creíste, te escondiste tras el miedo llamándolo precaución. Tarkov cayó y con ella llegó la locura; la gente perdió la cabeza, el mundo comenzó a agrietarse. TerraGroup regresó como un salvador, pero fueron ellos quienes trajeron la ruina. Querías sobrevivir, pero caíste. Hacia la oscuridad, sin camino de vuelta.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  );
}