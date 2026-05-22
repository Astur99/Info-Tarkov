import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function StoryDecisions({ onViewChange }) {
  const { t } = useTranslation();
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
    <div className="fade-in-slide terminal-panel" style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      
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
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>{t('storyModule.title')}</h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            {t('storyModule.subtitle')}
          </p>
        </div>
        
        <button 
          onClick={() => onViewChange('home')}
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', transition: 'all 0.3s', fontSize: '0.85rem' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
        >
          {t('common.backToMenu')}
        </button>
      </header>

      {/* FASE 1: CADENA COMÚN INICIAL */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div style={styles.card} className="nodo-interactivo">
            <span style={styles.badge()}>{t('storyModule.initial.fallingSkies.badge')}</span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>{t('storyModule.initial.fallingSkies.title')}</h4>
            <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.4' }}>{t('storyModule.initial.fallingSkies.body')}</p>
          </div>
          <div style={styles.card} className="nodo-interactivo">
            <span style={styles.badge()}>{t('storyModule.initial.armoredCase.badge')}</span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>{t('storyModule.initial.armoredCase.title')}</h4>
            <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.4' }}>{t('storyModule.initial.armoredCase.body')}</p>
          </div>
        </div>

        <div style={styles.lineaConectora}></div>

        {/* PUNTO DE NO RETORNO: EL CONTENEDOR */}
        <div style={{ ...styles.card, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.15)', padding: '2.5rem 2rem' }}>
          <span style={styles.badge('var(--tk-red)', '#fff')}>{t('storyModule.noReturn')}</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', margin: '0.3rem 0 1.5rem 0', letterSpacing: '0.5px' }}>{t('storyModule.armoredCaseQuestion')}</h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { setPaso3Decision('quedarselo'); setPaso6Decision(null); setRamaKerman(null); setVerPraporExigencias(false); }}
              style={styles.btnDecision(paso3Decision === 'quedarselo')}
            >
              {t('storyModule.armoredChoices.keep')}
            </button>
            <button 
              onClick={() => { setPaso3Decision('prapor'); setPaso6Decision(null); setRamaKerman(null); setVerPraporExigencias(false); }}
              style={styles.btnDecision(paso3Decision === 'prapor', '#ffaa00')}
            >
              {t('storyModule.armoredChoices.prapor')}
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
              <span style={styles.badge('var(--tk-green)')}>{t('storyModule.keepPath.badge')}</span>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginTop: '0.4rem' }}>{t('storyModule.keepPath.title')}</h4>
              <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>{t('storyModule.keepPath.body')}</p>
            </div>
          )}

          {/* OPCIÓN: PRAPOR (CADENA LIGHTKEEPER) */}
          {paso3Decision === 'prapor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              <div style={{ ...styles.card, border: '1px solid rgba(255, 170, 0, 0.2)' }}>
                <span style={styles.badge('#ffaa00', '#000')}>{t('storyModule.praporPath.badge')}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.2rem', color: '#fff', fontSize: '0.95rem' }}>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>{t('storyModule.praporPath.steps.lighthouse.label')}</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>{t('storyModule.praporPath.steps.lighthouse.body')}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>{t('storyModule.praporPath.steps.access.label')}</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>{t('storyModule.praporPath.steps.access.body')}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>{t('storyModule.praporPath.steps.bribe.label')}</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>{t('storyModule.praporPath.steps.bribe.body')}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>{t('storyModule.praporPath.steps.signal.label')}</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>{t('storyModule.praporPath.steps.signal.body')}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>{t('storyModule.praporPath.steps.raidCondition.label')}</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>{t('storyModule.praporPath.steps.raidCondition.body')}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: '700' }}>{t('storyModule.praporPath.steps.pickup.label')}</span>
                    <p style={{ marginTop: '0.3rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>{t('storyModule.praporPath.steps.pickup.body')}</p>
                  </div>
                </div>
              </div>
              <div style={styles.lineaConectora}></div>
              <div style={{ ...styles.card, border: '1px solid var(--tk-green)', textAlign: 'center', backgroundColor: 'rgba(26,176,21,0.02)' }}>
                <span style={styles.badge('var(--tk-green)', '#fff')}>{t('storyModule.praporPath.connectionBadge')}</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginTop: '0.2rem' }}>{t('storyModule.praporPath.connectionTitle')}</h4>
              </div>
            </div>
          )}

          {/* FASE 3: APERTURA */}
          <div style={styles.lineaConectora}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={styles.card} className="nodo-interactivo">
              <span style={styles.badge()}>{t('storyModule.containerOpening.decryptBadge')}</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>{t('storyModule.containerOpening.decryptTitle')}</h4>
              <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>{t('storyModule.containerOpening.decryptBody')}</p>
            </div>
            <div style={{ ...styles.card, border: '1px solid var(--tk-green)' }} className="nodo-interactivo">
              <span style={styles.badge('var(--tk-green)')}>{t('storyModule.containerOpening.completeBadge')}</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>{t('storyModule.containerOpening.completeTitle')}</h4>
              <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>{t('storyModule.containerOpening.completeBody')}</p>
            </div>
          </div>

          <div style={styles.lineaConectora}></div>

          {/* PUNTO DE NO RETORNO: KERMAN */}
          <div style={{ ...styles.card, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.15)', padding: '2.5rem 2rem' }}>
            <span style={styles.badge('var(--tk-red)', '#fff')}>{t('storyModule.noReturn')}</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0.3rem 0 1.5rem 0' }}>{t('storyModule.kermanQuestion')}</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { setPaso6Decision('no_kerman'); setRamaKerman(null); setVerPraporExigencias(false); }}
                style={styles.btnDecision(paso6Decision === 'no_kerman', 'var(--tk-red)')}
              >
                {t('storyModule.kermanChoices.noKerman')}
              </button>
              <button 
                onClick={() => { setPaso6Decision('kerman'); setRamaKerman(null); setVerPraporExigencias(false); }}
                style={styles.btnDecision(paso6Decision === 'kerman', 'var(--tk-green)')}
              >
                {t('storyModule.kermanChoices.kerman')}
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
                <span style={styles.badge('var(--tk-red)')}>{t('storyModule.noKerman.accessBadge')}</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>{t('storyModule.noKerman.easyWayTitle')}</h4>
                <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  {t('storyModule.noKerman.easyWayBody')}
                </p>
              </div>
              <div style={{ ...styles.card, border: '1px solid rgba(176,21,21,0.2)' }}>
                <span style={styles.badge()}>{t('storyModule.noKerman.terminalBadge')}</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>{t('storyModule.noKerman.terminalTitle')}</h4>
                <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.4rem', marginBottom: '1.2rem' }}>
                  {t('storyModule.noKerman.terminalBody')}
                </p>
                <button onClick={() => setVerPraporExigencias(!verPraporExigencias)} style={styles.btnDecision(verPraporExigencias, '#fff')}>
                  {verPraporExigencias ? t('storyModule.noKerman.hideRequirements') : t('storyModule.noKerman.showRequirements')}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {verPraporExigencias ? (
                <div style={styles.animacionContenedor}>
                  {paso3Decision === 'prapor' ? (
                    <div style={{ ...styles.card, border: '1px solid var(--tk-green)', backgroundColor: 'rgba(26,176,21,0.02)' }}>
                      <span style={styles.badge('var(--tk-green)', '#fff')}>{t('storyModule.noKerman.prapor.prapor.badge')}</span>
                      <h4 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#fff', marginTop: '0.4rem' }}>{t('storyModule.noKerman.prapor.prapor.title')}</h4>
                      <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                        {t('storyModule.noKerman.prapor.prapor.body')}
                      </p>
                    </div>
                  ) : (
                    <div style={{ ...styles.card, border: '1px solid var(--tk-red)', backgroundColor: 'rgba(176,21,21,0.02)' }}>
                      <span style={{ ...styles.badge('var(--tk-red)', '#fff') }}>{t('storyModule.noKerman.prapor.keep.badge')}</span>
                      <h4 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#fff', marginTop: '0.4rem' }}>{t('storyModule.noKerman.prapor.keep.title')}</h4>
                      <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
                        {t('storyModule.noKerman.prapor.keep.body')}
                      </p>
                      <ul style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem', paddingLeft: '1.2rem', marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {t('storyModule.noKerman.prapor.keep.items', { returnObjects: true }).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                      <div style={{ marginTop: '1.2rem', padding: '0.8rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.85rem', borderLeft: '3px solid var(--tk-red)', color: 'rgba(255,255,255,0.85)' }}>
                        {t('storyModule.noKerman.prapor.keep.penalty')}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textTransform: 'uppercase', textAlign: 'center', color: 'rgba(255,255,255,0.12)', letterSpacing: '2px', fontWeight: '700', fontSize: '1rem' }}>
                  {t('storyModule.noKerman.standby')}
                </div>
              )}
            </div>
          </div>

          {verPraporExigencias && (
            <div style={styles.animacionContenedor}>
              <div style={styles.lineaConectora}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                <div style={styles.card}>
                  <span style={styles.badge('#fff', '#000')}>{t('storyModule.noKerman.terminalPathBadge')}</span>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {t('storyModule.noKerman.terminalPathBody')}
                  </p>
                  <p style={{ marginTop: '0.8rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
                    {t('storyModule.noKerman.terminalRetry')}
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
                  <span style={styles.badge('rgba(255,204,0,0.1)', '#ffcc00')}>{t('storyModule.difficulty.medium')}</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '0.2rem' }}>{t('storyModule.finals.survivor.title')}</h3>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginTop: '1rem', textAlign: 'center' }}>
                    {t('storyModule.finals.survivor.body')}
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
            <span style={styles.badge('var(--tk-green)', '#fff')}>{t('storyModule.kermanIntro.badge')}</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem', color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem' }}>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)' }}>{t('storyModule.kermanIntro.steps.labs.label')}</span>
                <p style={{ marginTop: '0.2rem', lineHeight: '1.4' }}>{t('storyModule.kermanIntro.steps.labs.body')}</p>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)' }}>{t('storyModule.kermanIntro.steps.mechanic.label')}</span>
                <p style={{ marginTop: '0.2rem', lineHeight: '1.4' }}>{t('storyModule.kermanIntro.steps.mechanic.body')}</p>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)' }}>{t('storyModule.kermanIntro.steps.streets.label')}</span>
                <p style={{ marginTop: '0.2rem', lineHeight: '1.4' }}>{t('storyModule.kermanIntro.steps.streets.body')}</p>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)' }}>{t('storyModule.kermanIntro.steps.rfid.label')}</span>
                <p style={{ marginTop: '0.2rem', lineHeight: '1.4' }}>{t('storyModule.kermanIntro.steps.rfid.body')}</p>
              </div>
            </div>
          </div>

          <div style={styles.lineaConectora}></div>

          {/* Punto de decisión de evidencias */}
          <div style={{ ...styles.card, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.15)', padding: '2.5rem 2rem' }}>
            <span style={styles.badge('var(--tk-red)', '#fff')}>{t('storyModule.noReturn')}</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0.3rem 0 1.5rem 0' }}>{t('storyModule.evidenceQuestion')}</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setRamaKerman('full_evidencias')} style={styles.btnDecision(ramaKerman === 'full_evidencias', '#2b7fff')}>
                {t('storyModule.evidenceChoices.fullEvidence')}
              </button>
              <button onClick={() => setRamaKerman('u_turn')} style={styles.btnDecision(ramaKerman === 'u_turn', '#ffaa00')}>
                {t('storyModule.evidenceChoices.lightkeeperTurn')}
              </button>
              <button onClick={() => setRamaKerman('no_evidencias')} style={styles.btnDecision(ramaKerman === 'no_evidencias', 'var(--tk-red)')}>
                {t('storyModule.evidenceChoices.noEvidence')}
              </button>
            </div>
          </div>

          {/* ==================== LEALTAD COMPLETA (FINAL SAVIOR) ==================== */}
          {ramaKerman === 'full_evidencias' && (
            <div style={styles.animacionContenedor}>
              <div style={styles.lineaConectora}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                <div style={styles.card}>
                  <span style={styles.badge('#2b7fff')}>{t('storyModule.routes.fullEvidence.badge')}</span>
                  <ul style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {t('storyModule.routes.fullEvidence.items', { returnObjects: true }).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
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
                  <span style={styles.badge('rgba(255,50,50,0.1)', '#ff4444')}>{t('storyModule.difficulty.veryHard')}</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '0.2rem' }}>{t('storyModule.finals.savior.title')}</h3>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginTop: '1rem', textAlign: 'center' }}>
                    {t('storyModule.finals.savior.body')}
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
                  <span style={styles.badge('#ffaa00', '#000')}>{t('storyModule.routes.lightkeeperTurn.badge')}</span>
                  <ul style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {t('storyModule.routes.lightkeeperTurn.items', { returnObjects: true }).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
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
                  <span style={styles.badge('rgba(255,170,0,0.1)', '#ffaa00')}>{t('storyModule.difficulty.hard')}</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '0.2rem' }}>{t('storyModule.finals.debtor.title')}</h3>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginTop: '1rem', textAlign: 'center' }}>
                    {t('storyModule.finals.debtor.body')}
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
                  <span style={styles.badge('var(--tk-red)')}>{t('storyModule.routes.noEvidence.badge')}</span>
                  
                  {/* COMPROBACIÓN CRUZADA */}
                  <div style={{ padding: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.9rem', borderLeft: '3px solid #ffaa00', marginBottom: '1.2rem', lineHeight: '1.4' }}>
                    {paso3Decision === 'prapor' ? (
                      <span style={{ color: 'var(--tk-green)', fontWeight: '600' }}>{t('storyModule.routes.noEvidence.history.prapor')}</span>
                    ) : (
                      <span style={{ color: 'var(--tk-red)', fontWeight: '600' }}>{t('storyModule.routes.noEvidence.history.keep')}</span>
                    )}
                  </div>

                  <ul style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {t('storyModule.routes.noEvidence.items', { returnObjects: true }).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
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
                  <span style={styles.badge('rgba(255,170,0,0.1)', '#ffaa00')}>{t('storyModule.difficulty.hard')}</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '0.2rem' }}>{t('storyModule.finals.fallen.title')}</h3>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginTop: '1rem', textAlign: 'center' }}>
                    {t('storyModule.finals.fallen.body')}
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
