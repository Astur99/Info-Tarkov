import { useState, useEffect } from 'react';

const POOL_AMMO_LOCAL = [
  { id: 'm1', name: '7.62x54mmR SNB gzh', shortName: '7.62x54 R SNB', penetration: 62, damage: 75, armorDamage: 88 },
  { id: 'm2', name: '7.62x51mm M61', shortName: '7.62 M61', penetration: 64, damage: 70, armorDamage: 83 },
  { id: 'm3', name: '5.56x45mm M855A1', shortName: '5.56 M855A1', penetration: 44, damage: 46, armorDamage: 52 },
  { id: 'm4', name: '5.45x39mm BT gzh', shortName: '5.45 BT', penetration: 40, damage: 42, armorDamage: 49 },
  { id: 'm5', name: '9x19mm PBP gzh', shortName: '9x19 PBP', penetration: 39, damage: 52, armorDamage: 40 },
  { id: 'm6', name: '7.62x39mm PS gzh', shortName: '7.62 PS', penetration: 35, damage: 57, armorDamage: 52 }
];

const POOL_ARMOR_LOCAL = [
  { id: 'v1', name: 'Placa Balística Clase 6 (Granit GOST)', shortName: 'Granit Cl.6', clase: 6, durabilidad: 60, material: 'Ceramic' },
  { id: 'v2', name: 'Hexgrid Thor Thoracic Armor Vest', shortName: 'Hexgrid Cl.6', clase: 6, durabilidad: 50, material: 'Polyethylene' },
  { id: 'v3', name: 'Placa Balística Clase 5 (Korund-VM)', shortName: 'Korund Cl.5', clase: 5, durabilidad: 45, material: 'Steel' },
  { id: 'v4', name: 'IOTV Gen4 Body Armor', shortName: 'Gen4 Cl.5', clase: 5, durabilidad: 95, material: 'Titanium' },
  { id: 'v5', name: 'HighCom Trooper TFO Armor Vest', shortName: 'Trooper Cl.4', clase: 4, durabilidad: 85, material: 'Polyethylene' },
  { id: 'v6', name: '6B23-1 Armor', shortName: '6B23-1 Cl.3', clase: 3, durabilidad: 60, material: 'Steel' },
  { id: 'v7', name: 'PACA MK2 Body Armor', shortName: 'PACA Cl.2', clase: 2, durabilidad: 40, material: 'Aramid' }
];

const QUERY_BALISTICA = `
query GetBallistics {
  items(types: [ammo, armor, armorPlate, rig, helmet]) {
    id
    name
    shortName
    types

    properties {
      __typename

      ... on ItemPropertiesAmmo {
        damage
        penetrationPower
        armorDamage
      }

      ... on ItemPropertiesArmor {
        class
        durability
        armorType
        bluntThroughput
        zones

        material {
          id
          name
          destructibility
        }

        armorSlots {
          __typename

          ... on ItemArmorSlotLocked {
            name
            class
            durability
            armorType
            bluntThroughput

            material {
              id
              name
              destructibility
            }
          }

          ... on ItemArmorSlotOpen {
            name

            allowedPlates {
              id
              name
              shortName
              types

              properties {
                __typename

                ... on ItemPropertiesArmor {
                  class
                  durability
                  armorType
                  bluntThroughput
                  zones

                  material {
                    id
                    name
                    destructibility
                  }
                }
              }
            }
          }
        }
      }

      ... on ItemPropertiesChestRig {
        class
        durability
        armorType
        bluntThroughput
        zones

        material {
          id
          name
          destructibility
        }

        armorSlots {
          __typename

          ... on ItemArmorSlotLocked {
            name
            class
            durability
            armorType
            bluntThroughput

            material {
              id
              name
              destructibility
            }
          }

          ... on ItemArmorSlotOpen {
            name

            allowedPlates {
              id
              name
              shortName
              types

              properties {
                __typename

                ... on ItemPropertiesArmor {
                  class
                  durability
                  armorType
                  bluntThroughput
                  zones

                  material {
                    id
                    name
                    destructibility
                  }
                }
              }
            }
          }
        }
      }

      ... on ItemPropertiesHelmet {
        class
        durability
        armorType
        bluntThroughput

        material {
          id
          name
          destructibility
        }

        armorSlots {
          __typename

          ... on ItemArmorSlotLocked {
            name
            class
            durability
            armorType
            bluntThroughput

            material {
              id
              name
              destructibility
            }
          }

          ... on ItemArmorSlotOpen {
            name

            allowedPlates {
              id
              name
              shortName
              types

              properties {
                __typename

                ... on ItemPropertiesArmor {
                  class
                  durability
                  armorType
                  bluntThroughput
                  zones

                  material {
                    id
                    name
                    destructibility
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function materialToText(material) {
  if (!material) return 'Titanium';
  if (typeof material === 'string') return material;
  return material.name || material.id || 'Titanium';
}

function normalizeArmor(item, props, suffix = '') {
  if (!item || !props?.class) return null;

  return {
    id: suffix ? `${item.id}-${suffix}` : item.id,
    name: suffix ? `${item.name} (${suffix})` : item.name,
    shortName: item.shortName || item.name,
    clase: Number(props.class),
    durabilidad: Number(props.durability || 60),
    material: materialToText(props.material),
    materialData: props.material || null,
    armorType: props.armorType || 'unknown',
    zones: props.zones || []
  };
}

function extractArmor(item) {
  const props = item?.properties;
  if (!props) return [];

  const result = [];

  const baseArmor = normalizeArmor(item, props);
  if (baseArmor) result.push(baseArmor);

  if (Array.isArray(props.armorSlots)) {
    props.armorSlots.forEach((slot) => {
      if (!slot) return;

      if (slot.__typename === 'ItemArmorSlotLocked') {
        const lockedArmor = normalizeArmor(
          item,
          {
            class: slot.class,
            durability: slot.durability,
            material: slot.material,
            armorType: slot.armorType,
            zones: slot.zones
          },
          slot.name || 'locked-slot'
        );

        if (lockedArmor) result.push(lockedArmor);
      }

      if (slot.__typename === 'ItemArmorSlotOpen') {
        slot.allowedPlates?.forEach((plate) => {
          const plateArmor = normalizeArmor(
            plate,
            plate.properties,
            `plate-${slot.name || 'slot'}`
          );

          if (plateArmor) result.push(plateArmor);
        });
      }
    });
  }

  return result;
}

function dedupe(items) {
  const map = new Map();

  items.forEach((item) => {
    if (!item?.id) return;

    const existing = map.get(item.id);

    if (!existing || item.durabilidad > existing.durabilidad) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}

function getMaterialFactor(material, materialData) {
  if (typeof materialData?.destructibility === 'number') {
    return Math.min(1.15, Math.max(0.45, materialData.destructibility));
  }

  const normalized = normalizarTexto(material);

  if (normalized.includes('ceramic')) return 0.95;
  if (normalized.includes('steel')) return 0.5;
  if (normalized.includes('polyethylene')) return 0.6;
  if (normalized.includes('aramid')) return 0.6;
  if (normalized.includes('titanium')) return 0.65;
  if (normalized.includes('combined')) return 0.7;

  return 0.7;
}

export default function ArmorSimulator({ onViewChange }) {
  const [municiones, setMuniciones] = useState([]);
  const [armaduras, setArmaduras] = useState([]);
  const [selectedAmmo, setSelectedAmmo] = useState(null);
  const [selectedArmor, setSelectedArmor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [logSimulacion, setLogSimulacion] = useState([]);
  const [ttkResult, setTtkResult] = useState(null);
  const [busquedaAmmo, setBusquedaAmmo] = useState('');
  const [busquedaArmor, setBusquedaArmor] = useState('');

  const cargarFallback = () => {
    setMuniciones(POOL_AMMO_LOCAL);
    setArmaduras(POOL_ARMOR_LOCAL);
    setSelectedAmmo(POOL_AMMO_LOCAL[0]);
    setSelectedArmor(POOL_ARMOR_LOCAL[0]);
    setCargando(false);
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query: QUERY_BALISTICA
      }),
      signal: controller.signal
    })
      .then((res) => res.json())
      .then((result) => {
        const items = result?.data?.items;

        if (!Array.isArray(items)) {
          cargarFallback();
          return;
        }

        const ammo = items
          .filter(
            (i) =>
              i?.types?.includes('ammo') &&
              i?.properties?.__typename === 'ItemPropertiesAmmo' &&
              Number(i?.properties?.penetrationPower) > 0 &&
              Number(i?.properties?.damage) > 0
          )
          .map((i) => ({
            id: i.id,
            name: i.name,
            shortName: i.shortName || i.name,
            penetration: Number(i.properties.penetrationPower),
            damage: Number(i.properties.damage),
            armorDamage: Number(i.properties.armorDamage || 0)
          }))
          .sort((a, b) => b.penetration - a.penetration);

        const armor = dedupe(items.flatMap((item) => extractArmor(item)))
          .filter((a) => a.clase > 0 && a.durabilidad > 0)
          .sort((a, b) => {
            if (b.clase !== a.clase) return b.clase - a.clase;
            return b.durabilidad - a.durabilidad;
          });

        if (!ammo.length || !armor.length) {
          cargarFallback();
          return;
        }

        setMuniciones(ammo);
        setArmaduras(armor);
        setSelectedAmmo(ammo[0]);
        setSelectedArmor(armor[0]);
        setCargando(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        cargarFallback();
      });

    return () => controller.abort();
  }, []);

  const municionesFiltradas = municiones.filter((m) => {
    const q = normalizarTexto(busquedaAmmo);

    if (!q) return true;

    return (
      normalizarTexto(m.name).includes(q) ||
      normalizarTexto(m.shortName).includes(q) ||
      normalizarTexto(m.penetration).includes(q) ||
      normalizarTexto(m.damage).includes(q)
    );
  });

  const armadurasFiltradas = armaduras.filter((a) => {
    const q = normalizarTexto(busquedaArmor);

    if (!q) return true;

    return (
      normalizarTexto(a.name).includes(q) ||
      normalizarTexto(a.shortName).includes(q) ||
      normalizarTexto(a.material).includes(q) ||
      normalizarTexto(a.armorType).includes(q) ||
      normalizarTexto(a.clase).includes(q) ||
      normalizarTexto(`clase ${a.clase}`).includes(q)
    );
  });

  useEffect(() => {
    if (!selectedAmmo || !selectedArmor) {
      setLogSimulacion([]);
      setTtkResult(0);
      return;
    }

    let hpTorax = 85;
    let durabilidadActual = selectedArmor.durabilidad;

    const maxDurabilidad = selectedArmor.durabilidad;
    const claseArmor = selectedArmor.clase;

    const ammoPen = selectedAmmo.penetration;
    const ammoDamage = selectedAmmo.damage;
    const ammoArmorDamage = selectedAmmo.armorDamage;

    const registros = [];
    let contadorTiros = 0;

    const factorDestruccion = getMaterialFactor(
      selectedArmor.material,
      selectedArmor.materialData
    );

    while (hpTorax > 0 && contadorTiros < 20) {
      contadorTiros++;

      const ratioDurabilidad =
        maxDurabilidad > 0 ? durabilidadActual / maxDurabilidad : 0;

      const factorDefensa = claseArmor * 10 * ratioDurabilidad;

      let probabilidadPenetracion = 0;

      if (ammoPen > factorDefensa) {
        probabilidadPenetracion = 100 - (factorDefensa / ammoPen) * 15;
      } else {
        probabilidadPenetracion =
          factorDefensa > 0 ? (ammoPen / factorDefensa) * 40 : 99;
      }

      probabilidadPenetracion = Math.max(
        1,
        Math.min(99, probabilidadPenetracion)
      );

      const penetra =
        ammoPen > factorDefensa ||
        Math.random() * 100 < probabilidadPenetracion;

      let danoRecibido = 0;
      let danoAArmadura = 0;

      if (penetra) {
        danoRecibido = Math.round(
          ammoDamage * (ratioDurabilidad * 0.2 + 0.8)
        );

        hpTorax -= danoRecibido;

        danoAArmadura = Math.round(
          ammoArmorDamage * factorDestruccion * 0.6
        );
      } else {
        danoRecibido = Math.round(
          ammoDamage *
            0.04 *
            (factorDefensa > 0 ? ammoPen / factorDefensa : 1)
        );

        if (danoRecibido < 1) danoRecibido = 1;

        hpTorax -= danoRecibido;

        danoAArmadura = Math.round(
          ammoArmorDamage * factorDestruccion * 1.2
        );
      }

      durabilidadActual = Math.max(0, durabilidadActual - danoAArmadura);

      if (hpTorax < 0) hpTorax = 0;

      registros.push({
        tiro: contadorTiros,
        probabilidad: Math.round(probabilidadPenetracion),
        resultado: penetra
          ? '💥 PENETRACIÓN CRÍTICA'
          : '🛡️ IMPACTO RETENIDO',
        danoLetal: danoRecibido,
        danoPlaca: danoAArmadura,
        hpRestante: hpTorax,
        durabilidadRestante: durabilidadActual
      });
    }

    setLogSimulacion(registros);
    setTtkResult(contadorTiros);
  }, [selectedAmmo, selectedArmor]);

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
        CARGANDO ENTORNO BALÍSTICO...
      </div>
    );
  }

  return (
    <div
      className="fade-in-slide terminal-panel"
      style={{
        padding: '6rem 2rem 8rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <header
        style={{
          marginBottom: '3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
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
            ARMOR TTK SIMULATOR
          </h2>

          <p
            style={{
              color: 'var(--tk-text-muted)',
              fontSize: '1rem',
              marginTop: '0.3rem'
            }}
          >
            Simulador balístico interactivo basado en las físicas de perforación e impactos del inventario.
          </p>
        </div>

        <button
          onClick={() => onViewChange('home')}
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
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

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}
      >
        <div>
          <label
            style={{
              color: 'var(--tk-text-muted)',
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '700',
              letterSpacing: '1px',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}
          >
            BUSCAR BALA
          </label>

          <input
            type="text"
            value={busquedaAmmo}
            onChange={(e) => setBusquedaAmmo(e.target.value)}
            placeholder="Ej: M61, SNB, M855A1, 5.56, BP..."
            style={{
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--tk-glass-border)',
              borderRadius: '6px',
              padding: '14px',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: "'Rajdhani', sans-serif",
              outline: 'none',
              marginBottom: '0.8rem'
            }}
          />

          <select
            value={selectedAmmo?.id || ''}
            onChange={(e) =>
              setSelectedAmmo(municiones.find((m) => m.id === e.target.value))
            }
            style={{
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--tk-glass-border)',
              borderRadius: '6px',
              padding: '14px',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: "'Rajdhani', sans-serif",
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {municionesFiltradas.length > 0 ? (
              municionesFiltradas.map((m) => (
                <option key={m.id} value={m.id} style={{ backgroundColor: '#0e0e11' }}>
                  [{m.shortName}] Pen: {m.penetration} / Dmg: {m.damage}
                </option>
              ))
            ) : (
              <option value="" style={{ backgroundColor: '#0e0e11' }}>
                Sin resultados
              </option>
            )}
          </select>
        </div>

        <div>
          <label
            style={{
              color: 'var(--tk-text-muted)',
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '700',
              letterSpacing: '1px',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}
          >
            BUSCAR BLINDAJE
          </label>

          <input
            type="text"
            value={busquedaArmor}
            onChange={(e) => setBusquedaArmor(e.target.value)}
            placeholder="Ej: Slick, Gen4, clase 6, ceramic..."
            style={{
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--tk-glass-border)',
              borderRadius: '6px',
              padding: '14px',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: "'Rajdhani', sans-serif",
              outline: 'none',
              marginBottom: '0.8rem'
            }}
          />

          <select
            value={selectedArmor?.id || ''}
            onChange={(e) =>
              setSelectedArmor(armaduras.find((a) => a.id === e.target.value))
            }
            style={{
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--tk-glass-border)',
              borderRadius: '6px',
              padding: '14px',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: "'Rajdhani', sans-serif",
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {armadurasFiltradas.length > 0 ? (
              armadurasFiltradas.map((a) => (
                <option key={a.id} value={a.id} style={{ backgroundColor: '#0e0e11' }}>
                  [CLASE {a.clase}] {a.name} / {a.material}
                </option>
              ))
            ) : (
              <option value="" style={{ backgroundColor: '#0e0e11' }}>
                Sin resultados
              </option>
            )}
          </select>
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '2rem'
        }}
      >
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              backgroundColor: 'var(--tk-glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--tk-glass-border)',
              borderRadius: '12px',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                color: 'var(--tk-green)',
                letterSpacing: '2px',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              RESULTADO DE SIMULACIÓN
            </span>

            <div
              style={{
                fontSize: '5rem',
                fontWeight: '900',
                color: ttkResult && ttkResult <= 3 ? '#ff4444' : '#fff',
                letterSpacing: '-2px',
                margin: '0.5rem 0'
              }}
            >
              {ttkResult || 0}{' '}
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  color: 'var(--tk-text-muted)'
                }}
              >
                {ttkResult === 1 ? 'TIRO' : 'TIROS'}
              </span>
            </div>

            <p
              style={{
                color: 'var(--tk-text-muted)',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                margin: '0 auto 1.5rem auto',
                maxWidth: '280px'
              }}
            >
              Cantidad de impactos requeridos en el tórax para neutralizar al sujeto en fuego sostenido.
            </p>

            <span
              style={{
                backgroundColor:
                  ttkResult && ttkResult <= 3
                    ? 'rgba(255,68,68,0.1)'
                    : 'rgba(255,255,255,0.05)',
                color:
                  ttkResult && ttkResult <= 3
                    ? '#ff4444'
                    : 'var(--tk-green)',
                fontSize: '0.8rem',
                fontWeight: '800',
                padding: '6px 14px',
                borderRadius: '4px',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              {!ttkResult
                ? 'ESPERANDO PARÁMETROS'
                : ttkResult <= 2
                  ? '🔴 LETALIDAD INMEDIATA'
                  : ttkResult <= 4
                    ? '🟠 ENFRENTAMIENTO DIRECTO'
                    : '🟢 PROTECCIÓN EFICIENTE'}
            </span>

            {selectedArmor && (
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--tk-text-muted)',
                  fontSize: '0.85rem',
                  lineHeight: '1.6'
                }}
              >
                Blindaje:{' '}
                <strong style={{ color: '#fff' }}>
                  {selectedArmor.shortName}
                </strong>
                <br />
                Clase {selectedArmor.clase} / {selectedArmor.durabilidad} dur. / {selectedArmor.material}
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            backgroundColor: 'var(--tk-glass)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid var(--tk-glass-border)',
            borderRadius: '12px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxHeight: '520px',
            overflowY: 'auto'
          }}
        >
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--tk-text-muted)',
              fontWeight: '800',
              letterSpacing: '2px',
              margin: '0 0 0.5rem 0'
            }}
          >
            📋 TELEMETRÍA DE IMPACTOS (LOG OPERATIVO)
          </h3>

          {logSimulacion.map((log) => (
            <div
              key={log.tiro}
              style={{
                backgroundColor: 'rgba(0,0,0,0.25)',
                borderLeft: `3px solid ${
                  log.resultado.includes('💥') ? '#ff4444' : 'var(--tk-green)'
                }`,
                borderRadius: '4px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: '800',
                    color: '#fff',
                    marginRight: '1rem'
                  }}
                >
                  # DISPARO {log.tiro}
                </span>

                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: log.resultado.includes('💥')
                      ? '#ff4444'
                      : 'var(--tk-green)'
                  }}
                >
                  {log.resultado}
                </span>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--tk-text-muted)',
                    marginTop: '4px'
                  }}
                >
                  Probabilidad de perforación: {log.probabilidad}%
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                <div style={{ color: '#fff' }}>
                  Tórax:{' '}
                  <span style={{ fontWeight: '700', color: '#ff4444' }}>
                    -{log.danoLetal} HP
                  </span>
                </div>

                <div
                  style={{
                    color: 'var(--tk-text-muted)',
                    fontSize: '0.8rem',
                    marginTop: '2px'
                  }}
                >
                  Placa: {Math.round(log.durabilidadRestante)} rem. (-{log.danoPlaca})
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}