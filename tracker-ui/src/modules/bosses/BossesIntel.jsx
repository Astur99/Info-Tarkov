import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FALLBACK_BOSSES } from './bossesData';
import { BOSS_SPAWN_ZONES } from './bossSpawnZones';

const bossImageModules = import.meta.glob('../../assets/bosses/*', {
  eager: true,
  query: '?url',
  import: 'default'
});

const getBossImage = (boss) => bossImageModules[`../../assets/bosses/${boss.fileName}`] || '';

const getSpawnMapKey = (mapName) => String(mapName || '').replace(/\W+/g, '_');

const getBossSpawnZones = (boss, t) => {
  if (!boss) return [];
  const zoneMap = BOSS_SPAWN_ZONES[boss.id] || {};

  return (boss.spawnDetails || []).map((spawn) => {
    const zones = zoneMap[spawn.name] || zoneMap[spawn.name.replace('The Lab', 'Laboratory')] || [t('bossesModule.unknownExactZone')];
    const mapKey = getSpawnMapKey(spawn.name);

    return {
      ...spawn,
      zones: zones.map((zone, index) =>
        t(`bossesModule.spawnZones.${boss.id}.${mapKey}.${index}`, { defaultValue: zone })
      )
    };
  });
};

function BossImage({ boss, style }) {
  const [failed, setFailed] = useState(false);
  const src = getBossImage(boss);

  if (!src || failed) {
    return (
      <div
        style={{
          ...style,
          display: 'grid',
          placeItems: 'center',
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(26,176,21,0.12), rgba(0,0,0,0.55))',
          color: 'var(--tk-green)',
          fontWeight: 900,
          letterSpacing: '1px',
          textAlign: 'center'
        }}
      >
        {boss.name}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={boss.name}
      onError={() => setFailed(true)}
      style={style}
    />
  );
}

export default function BossesView({ onViewChange }) {
  const { t } = useTranslation();
  const [busqueda, setBusqueda] = useState('');
  const [mapaFiltro, setMapaFiltro] = useState('ALL');
  const [dificultadFiltro, setDificultadFiltro] = useState('ALL');
  const [bossSeleccionado, setBossSeleccionado] = useState(null);
  const [bossesData, setBossesData] = useState([]);
  const [cargando, setCargando] = useState(true);

  const poolBossesTraducido = useMemo(
    () =>
      FALLBACK_BOSSES.map((boss) => ({
        ...boss,
        guardias: t(`bossesModule.dossiers.${boss.id}.guards`, { defaultValue: boss.guardias }),
        fisico: t(`bossesModule.dossiers.${boss.id}.visuals`, { defaultValue: boss.fisico }),
        actitud: t(`bossesModule.dossiers.${boss.id}.behavior`, { defaultValue: boss.actitud }),
        armas: t(`bossesModule.dossiers.${boss.id}.weapons`, { defaultValue: boss.armas }),
        municion: t(`bossesModule.dossiers.${boss.id}.ammo`, { defaultValue: boss.municion }),
        debiles: t(`bossesModule.dossiers.${boss.id}.weaknesses`, { defaultValue: boss.debiles }),
        loot: t(`bossesModule.dossiers.${boss.id}.loot`, { defaultValue: boss.loot })
      })),
    [t]
  );

  // FETCH GRAPHQL PARA MAPAS Y SPAWNS
  useEffect(() => {
    const queryGraphQL = JSON.stringify({
      query: `{
        bosses {
          name
          maps {
            name
            spawnChance
          }
        }
      }`
    });

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: queryGraphQL,
    })
      .then(res => res.json())
      .then(result => {
        if (result?.data?.bosses) {
          const poolActualizado = poolBossesTraducido.map(bossLocal => {
            const bossAPI = result.data.bosses.find(b => b.name.toLowerCase() === bossLocal.name.toLowerCase());
            
            if (bossAPI && bossAPI.maps && bossAPI.maps.length > 0) {
              const listaMapas = bossAPI.maps.map(m => m.name).join(', ');
              const ratioPorcentaje = `${Math.round(bossAPI.maps[0].spawnChance * 100)}%`;
              
              return {
                ...bossLocal,
                mapa: listaMapas,
                spawn: ratioPorcentaje,
                spawnDetails: bossAPI.maps.map((map) => ({
                  name: map.name,
                  chance: Math.round(map.spawnChance * 100)
                })).sort((a, b) => b.chance - a.chance)
              };
            }
            return {
              ...bossLocal,
              mapa: bossLocal.mapaDefault,
              spawn: bossLocal.spawnDefault,
              spawnDetails: bossLocal.mapaDefault.split(', ').map((name) => ({
                name,
                chance: Number.parseInt(bossLocal.spawnDefault, 10) || 0
              }))
            };
          });
          setBossesData(poolActualizado);
        } else {
          setBossesData(poolBossesTraducido.map(b => ({
            ...b,
            mapa: b.mapaDefault,
            spawn: b.spawnDefault,
            spawnDetails: b.mapaDefault.split(', ').map((name) => ({ name, chance: Number.parseInt(b.spawnDefault, 10) || 0 }))
          })));
        }
        setCargando(false);
      })
      .catch(() => {
        setBossesData(poolBossesTraducido.map(b => ({
          ...b,
          mapa: b.mapaDefault,
          spawn: b.spawnDefault,
          spawnDetails: b.mapaDefault.split(', ').map((name) => ({ name, chance: Number.parseInt(b.spawnDefault, 10) || 0 }))
        })));
        setCargando(false);
      });
  }, [poolBossesTraducido]);

  const bossesFiltrados = bossesData.filter(boss => {
    const coincideBusqueda = boss.name.toLowerCase().includes(busqueda.toLowerCase());
    const coincideMapa = mapaFiltro === 'ALL' || boss.mapa.toLowerCase().includes(mapaFiltro.toLowerCase());
    const coincideDificultad = dificultadFiltro === 'ALL' || boss.dificultad === dificultadFiltro;
    return coincideBusqueda && coincideMapa && coincideDificultad;
  });

  const getBossPlan = (boss) => {
    if (!boss) return [];

    const base = [
      t('bossesModule.plan.confirmSpawn', { map: boss.spawnDetails?.[0]?.name || boss.mapa }),
      t('bossesModule.plan.avoidLongDuels', { weakness: boss.debiles }),
      t('bossesModule.plan.expectedAmmo', { ammo: boss.municion })
    ];

    if (boss.dificultad === 'Very Hard') {
      return [
        t('bossesModule.plan.veryHard.line1'),
        t('bossesModule.plan.veryHard.line2'),
        ...base
      ].slice(0, 5);
    }

    if (boss.dificultad === 'Hard') {
      return [
        t('bossesModule.plan.hard.line1'),
        t('bossesModule.plan.hard.line2'),
        ...base
      ].slice(0, 5);
    }

    return [
      t('bossesModule.plan.medium.line1'),
      t('bossesModule.plan.medium.line2'),
      ...base
    ].slice(0, 5);
  };

  const getDifficultyLabel = (difficulty) => t(`bossesModule.difficulty.${difficulty}`, { defaultValue: difficulty });
  const getSquadLabel = (boss) => {
    const guardText = String(boss.guardias || '').toLowerCase();
    return guardText.includes('solo') ? t('bossesModule.solo') : t('bossesModule.squad');
  };

  const styles = {
    card: {
      backgroundColor: 'var(--tk-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--tk-glass-border)',
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    badge: (bg = 'rgba(255,255,255,0.06)', col = '#fff') => ({
      backgroundColor: bg,
      color: col,
      fontSize: '0.7rem',
      fontWeight: '800',
      padding: '4px 10px',
      borderRadius: '4px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      display: 'inline-block'
    }),
    input: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      border: '1px solid var(--tk-glass-border)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#fff',
      fontSize: '1rem',
      fontFamily: "'Rajdhani', sans-serif",
      width: '100%',
      maxWidth: '300px',
      outline: 'none'
    },
    selector: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      border: '1px solid var(--tk-glass-border)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#fff',
      fontSize: '1rem',
      fontFamily: "'Rajdhani', sans-serif",
      cursor: 'pointer',
      outline: 'none'
    }
  };

  return (
    <div className="fade-in-slide terminal-panel" style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      
      <style>{`
        @keyframes desgloseFicha {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .boss-card:hover {
          border-color: var(--tk-green) !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(26,176,21,0.08);
        }
      `}</style>

      {/* CABECERA */}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>{t('bossesModule.title')}</h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            {t('bossesModule.subtitle')}
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

      {/* FILTROS TÃCTICOS */}
      <section style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder={t('bossesModule.searchPlaceholder')} 
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setBossSeleccionado(null); }}
          style={styles.input}
          disabled={cargando}
        />
        
        <select 
          value={mapaFiltro} 
          onChange={(e) => { setMapaFiltro(e.target.value); setBossSeleccionado(null); }}
          style={styles.selector}
          disabled={cargando}
        >
          <option value="ALL">{t('bossesModule.allMaps')}</option>
          <option value="Customs">CUSTOMS</option>
          <option value="Factory">FACTORY</option>
          <option value="Icebreaker">ICEBREAKER</option>
          <option value="Interchange">INTERCHANGE</option>
          <option value="Lighthouse">LIGHTHOUSE</option>
          <option value="Reserve">RESERVE</option>
          <option value="Shoreline">SHORELINE</option>
          <option value="Streets">STREETS OF TARKOV</option>
          <option value="Woods">WOODS</option>
        </select>

        <select
          value={dificultadFiltro}
          onChange={(e) => { setDificultadFiltro(e.target.value); setBossSeleccionado(null); }}
          style={styles.selector}
          disabled={cargando}
        >
          <option value="ALL">{t('bossesModule.allDifficulties')}</option>
          <option value="Medium">{getDifficultyLabel('Medium')}</option>
          <option value="Hard">{getDifficultyLabel('Hard')}</option>
          <option value="Very Hard">{getDifficultyLabel('Very Hard')}</option>
        </select>

        <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800', letterSpacing: '1px' }}>
          {t('bossesModule.visibleTargets', { count: bossesFiltrados.length })}
        </span>
      </section>

      {/* MONITOR DE CARGA */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--tk-text-muted)', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: '700' }}>
          {t('bossesModule.loadingIntel')}
        </div>
      ) : (
        <>
          {/* GRID DE CARDS GENERAL */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            {bossesFiltrados.map((boss) => {
              const activo = bossSeleccionado?.id === boss.id;
              return (
                <div
                  key={boss.id}
                  onClick={() => setBossSeleccionado(boss)}
                  style={{
                    ...styles.card,
                    border: activo ? '1px solid var(--tk-green)' : '1px solid var(--tk-glass-border)',
                    backgroundColor: activo ? 'rgba(255,255,255,0.04)' : 'var(--tk-glass)'
                  }}
                  className="boss-card"
                >
                  {/* COMPILADOR DINÃMICO DE VITE: Resuelve la imagen en local y producciÃ³n */}
                  <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#09090a' }}>
                    <BossImage
                      boss={boss}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.85', filter: 'contrast(102%) brightness(95%)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{boss.name}</h3>
                    <span style={styles.badge('rgba(26,176,21,0.08)', 'var(--tk-green)')}>{boss.spawn}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span style={styles.badge('rgba(255,255,255,0.04)', boss.colorDificultad)}>{getDifficultyLabel(boss.dificultad)}</span>
                    <span style={styles.badge('rgba(255,207,102,0.07)', '#ffcf66')}>
                      {getSquadLabel(boss)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '-0.3rem' }}>{boss.mapa}</p>
                </div>
              );
            })}
          </section>

          {/* PANEL DETALLADO DEL OBJETIVO */}
          {bossSeleccionado && (
            <section style={{ animation: 'desgloseFicha 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', backgroundColor: 'var(--tk-glass)', border: '1px solid var(--tk-glass-border)', borderRadius: '16px', padding: '2.5rem' }}>
              
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '140px', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--tk-glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', flexShrink: 0, backgroundColor: '#000' }}>
                  <BossImage
                    boss={bossSeleccionado}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={styles.badge('rgba(26,176,21,0.1)', 'var(--tk-green)')}>{t('bossesModule.reviewedIntel')}</span>
                    <span style={styles.badge('rgba(255,255,255,0.04)', bossSeleccionado.colorDificultad)}>{getDifficultyLabel(bossSeleccionado.dificultad)}</span>
                  </div>
                  <h3 style={{ fontSize: '2.4rem', fontWeight: '700', color: '#fff', letterSpacing: '1px', marginTop: '0.3rem' }}>{bossSeleccionado.name}</h3>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2.5rem', color: '#fff' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.6rem' }}>{t('bossesModule.sections.spawnByMap')}</span>
                    <div style={{ display: 'grid', gap: '0.45rem' }}>
                      {(bossSeleccionado.spawnDetails || []).map((spawn) => (
                        <div key={spawn.name} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 46px', alignItems: 'center', gap: '0.75rem' }}>
                          <strong style={{ color: '#fff' }}>{spawn.name}</strong>
                          <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, spawn.chance)}%`, height: '100%', background: 'var(--tk-green)' }} />
                          </div>
                          <span style={{ color: 'var(--tk-green)', fontWeight: '900', textAlign: 'right' }}>{spawn.chance}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.6rem' }}>{t('bossesModule.sections.knownSpawnZones')}</span>
                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                      {getBossSpawnZones(bossSeleccionado, t).map((spawn) => (
                        <div
                          key={`${spawn.name}-zones`}
                          style={{
                            background: 'rgba(0,0,0,0.22)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            padding: '0.85rem'
                          }}
                        >
                          <div style={{ marginBottom: '0.65rem' }}>
                            <strong style={{ color: '#fff', fontSize: '1rem' }}>{spawn.name}</strong>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '0.8rem', alignItems: 'stretch' }}>
                            <div
                              aria-hidden="true"
                              style={{
                                minHeight: '72px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                background:
                                  'linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), radial-gradient(circle at 62% 38%, rgba(26,176,21,0.38), transparent 9px), rgba(0,0,0,0.28)',
                                backgroundSize: '22px 22px, 22px 22px, auto, auto',
                                boxShadow: 'inset 0 0 18px rgba(0,0,0,0.35)'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignContent: 'flex-start' }}>
                              {spawn.zones.map((zone) => (
                                <span
                                  key={zone}
                                  style={{
                                    color: '#d7d7d7',
                                    background: 'rgba(255,255,255,0.045)',
                                    border: '1px solid rgba(255,255,255,0.075)',
                                    borderRadius: '999px',
                                    padding: '0.28rem 0.55rem',
                                    fontSize: '0.82rem',
                                    fontWeight: '800'
                                  }}
                                >
                                  {zone}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>{t('bossesModule.sections.registeredLocations')}</span>
                    <p style={{ fontSize: '1.05rem', color: '#fff' }}>{bossSeleccionado.mapa}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>{t('bossesModule.sections.guards')}</span>
                    <p style={{ fontSize: '1.05rem', color: '#fff' }}>{bossSeleccionado.guardias}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>{t('bossesModule.sections.visuals')}</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-text-muted)', lineHeight: '1.5' }}>{bossSeleccionado.fisico}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>{t('bossesModule.sections.behavior')}</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-text-muted)', lineHeight: '1.5' }}>{bossSeleccionado.actitud}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.6rem' }}>{t('bossesModule.sections.entryPlan')}</span>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--tk-text-muted)', lineHeight: 1.55 }}>
                      {getBossPlan(bossSeleccionado).map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>{t('bossesModule.sections.weapons')}</span>
                    <p style={{ fontSize: '1.05rem', color: '#fff' }}>{bossSeleccionado.armas}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>{t('bossesModule.sections.ammo')}</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-red)' }}>{bossSeleccionado.municion}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>{t('bossesModule.sections.weaknesses')}</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-green)' }}>{bossSeleccionado.debiles}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>{t('bossesModule.sections.loot')}</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-text-muted)', lineHeight: '1.5' }}>{bossSeleccionado.loot}</p>
                  </div>
                </div>

              </div>
            </section>
          )}
        </>
      )}

    </div>
  );
}



