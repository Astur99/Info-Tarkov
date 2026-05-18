import { useState, useEffect } from 'react';

export default function HideoutModule({ onViewChange }) {
  const [estaciones, setEstaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);
  const [nivelObjetivo, setNivelObjetivo] = useState(1);

  // =========================
  // FALLBACK LOCAL
  // =========================

  const poolHideoutLocal = [
    {
      id: 'h1',
      name: 'Workbench',
      imageLink:
        'https://assets.tarkov.dev/5d484fc0654e76006657e335-image.png',
      levels: [
        {
          level: 1,
          constructionTime: 14400,
          traderRequirements: [
            {
              trader: { name: 'Mechanic' },
              level: 1
            }
          ],
          itemRequirements: [
            {
              item: {
                id: 'i1',
                name: 'Multitool',
                shortName: 'Tool',
                lastLowPrice: 25000,
                iconLink:
                  'https://assets.tarkov.dev/544fb5454bdc2df8738b456f-icon.png'
              },
              count: 1
            }
          ]
        }
      ]
    }
  ];

  // =========================
  // FETCH
  // =========================

  useEffect(() => {
    const queryHideout = JSON.stringify({
      query: `
        query GetHideoutData {
          hideoutStations {
            id
            name
            imageLink

            levels {
              level
              constructionTime

              traderRequirements {
                trader {
                  name
                }
                level
              }

              itemRequirements {
                count

                item {
                  id
                  name
                  shortName
                  lastLowPrice
                  iconLink
                }
              }
            }
          }
        }
      `
    });

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: queryHideout
    })
      .then((res) => res.json())
      .then((result) => {
        if (
          !result?.data?.hideoutStations ||
          !Array.isArray(result.data.hideoutStations)
        ) {
          cargarLocal();
          return;
        }

        const datosFiltrados = result.data.hideoutStations
          .filter((st) => st && st.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (datosFiltrados.length === 0) {
          cargarLocal();
          return;
        }

        setEstaciones(datosFiltrados);
        setEstacionSeleccionada(datosFiltrados[0]);
        setNivelObjetivo(
          datosFiltrados[0]?.levels?.[0]?.level || 1
        );

        setCargando(false);
      })
      .catch(() => {
        cargarLocal();
      });
  }, []);

  const cargarLocal = () => {
    setEstaciones(poolHideoutLocal);
    setEstacionSeleccionada(poolHideoutLocal[0]);
    setNivelObjetivo(1);
    setCargando(false);
  };

  // =========================
  // HELPERS
  // =========================

  const formatRublos = (val) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(val || 0);

  // =========================
  // LOADING
  // =========================

  if (cargando) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '10rem',
          color: 'var(--tk-green)',
          fontSize: '1.2rem',
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: '2px'
        }}
      >
        CONECTANDO CON MÓDULO DEL REFUGIO, ESPERE...
      </div>
    );
  }

  // =========================
  // DATOS NIVEL
  // =========================

  const datosNivel =
    estacionSeleccionada?.levels?.find(
      (l) => l.level === nivelObjetivo
    ) || null;

  const costeTotalFlea =
    datosNivel?.itemRequirements?.reduce((acc, req) => {
      const precioItem =
        req?.item?.lastLowPrice || 0;

      return acc + precioItem * req.count;
    }, 0) || 0;

  // =========================
  // RENDER
  // =========================

  return (
    <div
      className="fade-in-slide"
      style={{
        padding: '6rem 2rem 8rem 2rem',
        maxWidth: '1500px',
        margin: '0 auto',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      {/* CABECERA */}
      <header
        style={{
          marginBottom: '3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom:
            '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '2.2rem',
              letterSpacing: '1.5px',
              fontWeight: '700',
              color: '#fff'
            }}
          >
            HIDEOUT LOGISTICS 
          </h2>

          <p
            style={{
              color: 'var(--tk-text-muted)',
              fontSize: '1rem',
              marginTop: '0.3rem'
            }}
          >
             Planificación modular del refugio,
            requisitos de construcción y costes
            calculados en tiempo real a partir del flea.
          </p>
        </div>

        <button
          onClick={() => onViewChange('home')}
          style={{
            backgroundColor:
              'rgba(255,255,255,0.02)',
            color: '#fff',
            border:
              '1px solid rgba(255,255,255,0.08)',
            padding: '12px 22px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '700',
            letterSpacing: '1px'
          }}
        >
          VOLVER AL MENÚ
        </button>
      </header>

      {/* GRID PRINCIPAL */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '2rem'
        }}
      >
        {/* SIDEBAR */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--tk-text-muted)',
              fontWeight: '800',
              letterSpacing: '2px',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}
          >
            📡 SECCIONES
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, 1fr)',
              gap: '0.65rem',
              maxHeight: '700px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            {estaciones.map((est) => {
              const activo =
                estacionSeleccionada?.id === est.id;

              return (
                <button
                  key={est.id}
                  onClick={() => {
                    setEstacionSeleccionada(est);
                    setNivelObjetivo(
                      est.levels?.[0]?.level || 1
                    );
                  }}
                  title={est.name}
                  style={{
                    minHeight: '110px',
                    backgroundColor: activo
                      ? 'rgba(26,176,21,0.10)'
                      : 'rgba(255,255,255,0.025)',

                    border: `1px solid ${
                      activo
                        ? 'var(--tk-green)'
                        : 'rgba(255,255,255,0.08)'
                    }`,

                    borderRadius: '10px',
                    padding: '0.75rem 0.5rem',
                    color: '#fff',
                    fontFamily:
                      "'Rajdhani', sans-serif",
                    cursor: 'pointer',

                    transition:
                      'all 0.18s ease-out',

                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',

                    boxShadow: activo
                      ? '0 0 18px rgba(26,176,21,0.18)'
                      : 'none'
                  }}
                >
                  {/* ICONO */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',

                      borderRadius: '8px',

                      backgroundColor:
                        'rgba(0,0,0,0.35)',

                      border:
                        '1px solid rgba(255,255,255,0.06)',

                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',

                      overflow: 'hidden'
                    }}
                  >
                    {est.imageLink ? (
                      <img
                        src={est.imageLink}
                        alt={est.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',

                          filter: activo
                            ? 'brightness(1.15)'
                            : 'brightness(0.85)'
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: '1.4rem'
                        }}
                      >
                        ⌂
                      </span>
                    )}
                  </div>

                  {/* NOMBRE */}
                  <span
                    style={{
                      maxWidth: '100%',

                      fontSize: '0.76rem',
                      fontWeight: '800',

                      lineHeight: '1.05',

                      textAlign: 'center',

                      textTransform: 'uppercase',

                      color: activo
                        ? '#fff'
                        : 'rgba(255,255,255,0.78)',

                      overflow: 'hidden',

                      display: '-webkit-box',

                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {est.name}
                  </span>

                  {/* LVLS */}
                  <span
                    style={{
                      fontSize: '0.68rem',

                      color: activo
                        ? 'var(--tk-green)'
                        : 'var(--tk-text-muted)',

                      backgroundColor:
                        'rgba(0,0,0,0.35)',

                      padding: '2px 6px',

                      borderRadius: '999px',

                      fontWeight: '800'
                    }}
                  >
                    {est.levels?.length || 0} LVL
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* PANEL DERECHO */}
        {estacionSeleccionada && (
          <section
            style={{
              backgroundColor: 'var(--tk-glass)',
              backdropFilter: 'blur(25px)',

              border:
                '1px solid var(--tk-glass-border)',

              borderRadius: '12px',

              padding: '2rem',

              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',

                borderBottom:
                  '1px solid rgba(255,255,255,0.05)',

                paddingBottom: '1.25rem'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: 'var(--tk-green)',
                    letterSpacing: '1.5px'
                  }}
                >
                  NOMBRE
                </span>

                <h3
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#fff',
                    margin: '0.2rem 0 0 0'
                  }}
                >
                  {estacionSeleccionada.name.toUpperCase()}
                </h3>
              </div>

              {/* BOTONES NIVEL */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}
              >
                {estacionSeleccionada.levels?.map(
                  (l) => (
                    <button
                      key={l.level}
                      onClick={() =>
                        setNivelObjetivo(l.level)
                      }
                      style={{
                        backgroundColor:
                          nivelObjetivo === l.level
                            ? 'var(--tk-green)'
                            : 'rgba(0,0,0,0.4)',

                        border: `1px solid ${
                          nivelObjetivo === l.level
                            ? 'var(--tk-green)'
                            : 'var(--tk-glass-border)'
                        }`,

                        color:
                          nivelObjetivo === l.level
                            ? '#000'
                            : '#fff',

                        width: '40px',
                        height: '40px',

                        borderRadius: '4px',

                        fontWeight: '800',

                        cursor: 'pointer'
                      }}
                    >
                      L{l.level}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* INFO GENERAL */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',

                gap: '1.5rem',

                backgroundColor:
                  'rgba(0,0,0,0.3)',

                padding: '1.5rem',

                borderRadius: '8px',

                border:
                  '1px solid rgba(255,255,255,0.02)'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color:
                      'var(--tk-text-muted)',

                    fontWeight: '700',

                    display: 'block',

                    letterSpacing: '0.5px'
                  }}
                >
                  PRESUPUESTO ESTIMADO
                </span>

                <div
                  style={{
                    fontSize: '2.2rem',
                    fontWeight: '800',

                    color:
                      costeTotalFlea > 0
                        ? 'var(--tk-green)'
                        : '#fff',

                    marginTop: '0.3rem'
                  }}
                >
                  {costeTotalFlea > 0
                    ? formatRublos(
                        costeTotalFlea
                      )
                    : 'SIN COSTE'}
                </div>
              </div>

              <div
                style={{
                  textAlign: 'right',

                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    color:
                      'var(--tk-text-muted)',

                    fontWeight: '700',

                    display: 'block'
                  }}
                >
                  TIEMPO DE CRAFTEO
                </span>

                <span
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginTop: '0.3rem'
                  }}
                >
                  {datosNivel?.constructionTime
                    ? `${Math.round(
                        datosNivel.constructionTime /
                          3600
                      )} HORAS`
                    : 'INMEDIATO'}
                </span>
              </div>
            </div>

            {/* REQUISITOS */}
            {datosNivel?.traderRequirements
              ?.length > 0 && (
              <div>
                <h4
                  style={{
                    fontSize: '0.85rem',

                    color:
                      'var(--tk-text-muted)',

                    fontWeight: '800',

                    letterSpacing: '1px',

                    marginBottom: '0.8rem',

                    textTransform:
                      'uppercase'
                  }}
                >
                  🔏 REQUISITOS DE
                  TRADERS
                </h4>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  {datosNivel.traderRequirements.map(
                    (tr, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor:
                            'rgba(255,255,255,0.02)',

                          border:
                            '1px solid rgba(255,255,255,0.05)',

                          padding:
                            '0.6rem 1rem',

                          borderRadius:
                            '4px',

                          fontSize:
                            '0.9rem',

                          color: '#fff'
                        }}
                      >
                        🔑{' '}
                        {tr.trader?.name}{' '}
                        <span
                          style={{
                            fontWeight:
                              '700',

                            color:
                              'var(--tk-green)'
                          }}
                        >
                          NIVEL{' '}
                          {tr.level}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* COMPONENTES */}
            <div>
              <h4
                style={{
                  fontSize: '0.85rem',
                  color:
                    'var(--tk-text-muted)',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  marginBottom: '1rem',
                  textTransform: 'uppercase'
                }}
              >
                📦 OBJETOS REQUERIDOS
              </h4>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                {datosNivel?.itemRequirements?.map(
                  (req) => {
                    const precioUnidad =
                      req.item?.lastLowPrice ||
                      0;

                    return (
                      <div
                        key={req.item?.id}
                        style={{
                          backgroundColor:
                            'rgba(0,0,0,0.2)',

                          border:
                            '1px solid rgba(255,255,255,0.03)',

                          borderRadius:
                            '6px',

                          padding:
                            '0.75rem 1rem',

                          display: 'flex',

                          justifyContent:
                            'space-between',

                          alignItems:
                            'center'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems:
                              'center',

                            gap: '1rem'
                          }}
                        >
                          <div
                            style={{
                              width: '40px',
                              height: '40px',

                              backgroundColor:
                                'rgba(0,0,0,0.3)',

                              borderRadius:
                                '4px',

                              display: 'flex',

                              alignItems:
                                'center',

                              justifyContent:
                                'center',

                              padding: '2px'
                            }}
                          >
                            <img
                              src={
                                req.item?.iconLink
                              }
                              alt={
                                req.item?.shortName
                              }
                              style={{
                                maxWidth:
                                  '100%',

                                maxHeight:
                                  '100%',

                                objectFit:
                                  'contain'
                              }}
                            />
                          </div>

                          <div>
                            <span
                              style={{
                                color:
                                  '#fff',

                                fontWeight:
                                  '700',

                                fontSize:
                                  '1.05rem'
                              }}
                            >
                              {req.item?.name}
                            </span>

                            <div
                              style={{
                                fontSize:
                                  '0.8rem',

                                color:
                                  'var(--tk-text-muted)'
                              }}
                            >
                              Flea c/u:{' '}
                              {precioUnidad > 0
                                ? formatRublos(
                                    precioUnidad
                                  )
                                : '—'}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            textAlign:
                              'right',

                            fontSize:
                              '1.1rem',

                            fontWeight:
                              '800',

                            color: '#fff'
                          }}
                        >
                          <span
                            style={{
                              color:
                                'var(--tk-green)'
                            }}
                          >
                            x{req.count}
                          </span>

                          <div
                            style={{
                              fontSize:
                                '0.8rem',

                              color:
                                'var(--tk-text-muted)',

                              fontWeight:
                                '400',

                              marginTop:
                                '2px'
                            }}
                          >
                            {precioUnidad > 0
                              ? formatRublos(
                                  precioUnidad *
                                    req.count
                                )
                              : '—'}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                {(!datosNivel?.itemRequirements ||
                  datosNivel
                    .itemRequirements
                    .length === 0) && (
                  <p
                    style={{
                      color:
                        'var(--tk-text-muted)',

                      fontSize:
                        '0.9rem'
                    }}
                  >
                    No se registran
                    materiales específicos.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}