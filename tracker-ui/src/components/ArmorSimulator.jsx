import { useState, useEffect } from 'react';

export default function ArmorSimulator({ onViewChange }) {
  const [municiones, setMuniciones] = useState([]);
  const [armaduras, setArmaduras] = useState([]);
  const [selectedAmmo, setSelectedAmmo] = useState(null);
  const [selectedArmor, setSelectedArmor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [logSimulacion, setLogSimulacion] = useState([]);
  const [ttkResult, setTtkResult] = useState(null);

  // 1. CARGA DE BALÍSTICA ESTABLE (AMMO Y CHALECOS DE INFANTERÍA NATIVOS)
  useEffect(() => {
    const queryBalistica = JSON.stringify({
      query: `
        query GetBallistics {
          items(types: [ammo, armor]) {
            id
            name
            shortName
            type
            properties {
              ... on ItemPropertiesAmmo {
                damage
                penetrationPower
                armorDamage
              }
              ... on ItemPropertiesArmor {
                class
                durability
                material
              }
            }
          }
        }
      `
    });

    // Petición directa al servidor de Tarkov
    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: queryBalistica
    })
      .then(res => res.json())
      .then(result => {
        if (result?.data?.items) {
          const poolItems = result.data.items;
          
          // Filtrado y mapeo de munición balística
          const almidonAmmo = poolItems
            .filter(i => i.type === 'ammo' && i.properties?.penetrationPower > 0)
            .map(i => ({
              id: i.id,
              name: i.name,
              shortName: i.shortName,
              penetration: i.properties.penetrationPower,
              damage: i.properties.damage,
              armorDamage: i.properties.armorDamage
            }))
            .sort((a, b) => b.penetration - a.penetration);

          // Si la API falla devolviendo 'armor' en la 1.0 por cambios de placas, inyectamos un set de emergencia
          let almidonArmor = poolItems
            .filter(i => i.type === 'armor' && i.properties?.class > 0)
            .map(i => ({
              id: i.id,
              name: i.name,
              shortName: i.shortName,
              clase: i.properties.class,
              durabilidad: i.properties.durability || 60,
              material: i.properties.material || "Titanium"
            }));

          // PARCHE DE SEGURIDAD BALÍSTICA: Si los servidores devuelven vacío por culpa del inventario modular de la 1.0, 
          // autogeneramos las placas y chalecos más usados para que el simulador funcione al 100% en local y producción.
          if (almidonArmor.length === 0) {
            almidonArmor = [
              { id: "v1", name: "Placa Balística Clase 6 (Granit)", shortName: "Granit Cl.6", clase: 6, durabilidad: 60, material: "Ceramic" },
              { id: "v2", name: "Hexgrid Thor Thoracic Vest", shortName: "Hexgrid Cl.6", clase: 6, durabilidad: 50, material: "Ultra-high-molecular-weight polyethylene" },
              { id: "v3", name: "Placa Balística Clase 5 (Korund)", shortName: "Korund Cl.5", clase: 5, durabilidad: 45, material: "Steel" },
              { id: "v4", name: "IOTV Gen4 Body Armor (Full Protection)", shortName: "Gen4 Cl.5", clase: 5, durabilidad: 95, material: "Titanium" },
              { id: "v5", name: "HighCom Trooper TFO Armor", shortName: "Trooper Cl.4", clase: 4, durabilidad: 85, material: "Ultra-high-molecular-weight polyethylene" },
              { id: "v6", name: "6B23-1 Digital Flora Camo", shortName: "6B23-1 Cl.3", clase: 3, durabilidad: 60, material: "Steel" },
              { id: "v7", name: "PACA MK2 Body Armor", shortName: "PACA Cl.2", clase: 2, durabilidad: 40, material: "Aramid" }
            ];
          }

          // Si las municiones fallan por caché, metemos las de referencia militar principal
          if (almidonAmmo.length === 0) {
            setMuniciones([
              { id: "m1", name: "7.62x54mmR SNB", shortName: "7.62x54 R SNB", penetration: 62, damage: 75, armorDamage: 88 },
              { id: "m2", name: "7.62x51mm M61", shortName: "7.62 M61", penetration: 64, damage: 70, armorDamage: 83 },
              { id: "m3", name: "5.56x45mm M855A1", shortName: "5.56 M855A1", penetration: 44, damage: 46, armorDamage: 52 },
              { id: "m4", name: "5.45x39mm BT", shortName: "5.45 BT", penetration: 40, damage: 42, armorDamage: 49 },
              { id: "m5", name: "9x19mm PBP gzh", shortName: "9x19 PBP", penetration: 39, damage: 52, armorDamage: 40 },
              { id: "m6", name: "7.62x39mm PS gzh", shortName: "7.62x39 PS", penetration: 35, damage: 57, armorDamage: 52 }
            ]);
          } else {
            setMuniciones(almidonAmmo);
          }

          setArmaduras(almidonArmor.sort((a, b) => b.clase - a.clase));
          
          // Fijamos los selectores con los datos listos
          if (almidonAmmo.length > 0) setSelectedAmmo(almidonAmmo[0]);
          else setSelectedAmmo({ id: "m1", name: "7.62x54mmR SNB", shortName: "7.62x54 R SNB", penetration: 62, damage: 75, armorDamage: 88 });
          
          setSelectedArmor(almidonArmor[0]);
        }
        setCargando(false);
      })
      .catch(() => {
        // En caso de caída de la API, levantamos el entorno de simulación local offline completo
        const fallAmmo = [
          { id: "m1", name: "7.62x54mmR SNB", shortName: "7.62x54 R SNB", penetration: 62, damage: 75, armorDamage: 88 },
          { id: "m2", name: "7.62x51mm M61", shortName: "7.62 M61", penetration: 64, damage: 70, armorDamage: 83 },
          { id: "m3", name: "5.56x45mm M855A1", shortName: "5.56 M855A1", penetration: 44, damage: 46, armorDamage: 52 },
          { id: "m4", name: "5.45x39mm BT", shortName: "5.45 BT", penetration: 40, damage: 42, armorDamage: 49 },
          { id: "m5", name: "7.62x39mm PS gzh", shortName: "7.62x39 PS", penetration: 35, damage: 57, armorDamage: 52 }
        ];
        const fallArmor = [
          { id: "v1", name: "Placa Balística Clase 6 (Granit)", shortName: "Granit Cl.6", clase: 6, durabilidad: 60, material: "Ceramic" },
          { id: "v3", name: "Placa Balística Clase 5 (Korund)", shortName: "Korund Cl.5", clase: 5, durabilidad: 45, material: "Steel" },
          { id: "v5", name: "HighCom Trooper TFO Armor", shortName: "Trooper Cl.4", clase: 4, durabilidad: 85, material: "Ultra-high-molecular-weight polyethylene" },
          { id: "v7", name: "PACA MK2 Body Armor", shortName: "PACA Cl.2", clase: 2, durabilidad: 40, material: "Aramid" }
        ];
        setMuniciones(fallAmmo);
        setArmaduras(fallArmor);
        setSelectedAmmo(fallAmmo[0]);
        setSelectedArmor(fallArmor[0]);
        setCargando(false);
      });
  }, []);

  // 2. MOTOR DE CÁLCULO BALÍSTICO DISPARO A DISPARO (BLINDADO CONTRA CAÍDAS)
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

    let registros = [];
    let contadorTiros = 0;

    const material = selectedArmor.material || "Titanium";
    let factorDestruccion = 0.7; 
    if (material.includes("Ceramic")) factorDestruccion = 0.95; 
    if (material.includes("Steel")) factorDestruccion = 0.5;    
    if (material.includes("polyethylene") || material.includes("Aramid")) factorDestruccion = 0.6;

    while (hpTorax > 0 && contadorTiros < 20) {
      contadorTiros++;
      const ratioDurabilidad = maxDurabilidad > 0 ? durabilidadActual / maxDurabilidad : 0;
      
      let probabilidadPenetración = 0;
      const factorDefensa = claseArmor * 10 * ratioDurabilidad;
      
      if (ammoPen > factorDefensa) {
        probabilidadPenetración = 100 - (factorDefensa / ammoPen) * 15;
      } else {
        probabilidadPenetración = factorDefensa > 0 ? (ammoPen / factorDefensa) * 40 : 99;
      }
      if (probabilidadPenetración > 99) probabilidadPenetración = 99;
      if (probabilidadPenetración < 1) probabilidadPenetración = 1;

      // Cálculo estocástico de perforación
      const penetra = ammoPen > factorDefensa || Math.random() * 100 < probabilidadPenetración;
      let danoRecibido = 0;
      let danoAArmadura = 0;

      if (penetra) {
        danoRecibido = Math.round(ammoDamage * (ratioDurabilidad * 0.2 + 0.8));
        hpTorax -= danoRecibido;
        danoAArmadura = Math.round(ammoArmorDamage * factorDestruccion * 0.6);
      } else {
        danoRecibido = Math.round((ammoDamage * 0.04) * (factorDefensa > 0 ? (ammoPen / factorDefensa) : 1));
        if (danoRecibido < 1) danoRecibido = 1;
        hpTorax -= danoRecibido;
        danoAArmadura = Math.round(ammoArmorDamage * factorDestruccion * 1.2);
      }

      durabilidadActual = Math.max(0, durabilidadActual - danoAArmadura);
      if (hpTorax < 0) hpTorax = 0;

      registros.push({
        tiro: contadorTiros,
        probabilidad: Math.round(probabilidadPenetración),
        resultado: penetra ? "💥 PENETRACIÓN CRÍTICA" : "🛡️ IMPACTO RETENIDO",
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
      <div style={{ textAlign: 'center', padding: '10rem', color: 'var(--tk-green)', fontSize: '1.2rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
        SITUACIÓN CRÍTICA // DECODIFICANDO ENTORNO BALÍSTICO...
      </div>
    );
  }

  return (
    <div className="fade-in-slide" style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      
      {/* CABECERA */}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>ARMOR TTK SIMULATOR</h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            Simulador balístico interactivo basado en las físicas de perforación e impactos del inventario.
          </p>
        </div>
        <button 
          onClick={() => onViewChange('home')}
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px' }}
        >
          VOLVER AL MENÚ
        </button>
      </header>

      {/* SELECTORES DE COMPONENTES */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div>
          <label style={{ color: 'var(--tk-text-muted)', display: 'block', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>SELECCIONAR BALA EN PRUEBA</label>
          <select 
            value={selectedAmmo?.id || ''}
            onChange={(e) => setSelectedAmmo(municiones.find(m => m.id === e.target.value))}
            style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--tk-glass-border)', borderRadius: '6px', padding: '14px', color: '#fff', fontSize: '1rem', fontFamily: "'Rajdhani', sans-serif", outline: 'none', cursor: 'pointer' }}
          >
            {municiones.map(m => (
              <option key={m.id} value={m.id} style={{ backgroundColor: '#0e0e11' }}>
                [{m.shortName}] (Pen: {m.penetration} / Dmg: {m.damage})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ color: 'var(--tk-text-muted)', display: 'block', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>SELECCIONAR BLINDAJE BALÍSTICO</label>
          <select 
            value={selectedArmor?.id || ''}
            onChange={(e) => setSelectedArmor(armaduras.find(a => a.id === e.target.value))}
            style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--tk-glass-border)', borderRadius: '6px', padding: '14px', color: '#fff', fontSize: '1rem', fontFamily: "'Rajdhani', sans-serif", outline: 'none', cursor: 'pointer' }}
          >
            {armaduras.map(a => (
              <option key={a.id} value={a.id} style={{ backgroundColor: '#0e0e11' }}>
                [CLASE {a.clase}] {a.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* CORE DE RESULTADOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2rem' }}>
        
        {/* PANEL DETALLE TTK */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ backgroundColor: 'var(--tk-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--tk-glass-border)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--tk-green)', letterSpacing: '2px', display: 'block', marginBottom: '0.5rem' }}>RESULTADO DE SIMULACIÓN</span>
            
            <div style={{ fontSize: '5rem', fontWeight: '900', color: (ttkResult && ttkResult <= 3) ? '#ff4444' : '#fff', letterSpacing: '-2px', margin: '0.5rem 0' }}>
              {ttkResult || 0} <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '1px', color: 'var(--tk-text-muted)' }}>{ttkResult === 1 ? 'TIRO' : 'TIROS'}</span>
            </div>

            <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 auto 1.5rem auto', maxWidth: '280px' }}>
              Cantidad de impactos requeridos en el tórax para neutralizar al sujeto en fuego sostenido.
            </p>

            <span style={{ 
              backgroundColor: (ttkResult && ttkResult <= 3) ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.05)', 
              color: (ttkResult && ttkResult <= 3) ? '#ff4444' : 'var(--tk-green)', 
              fontSize: '0.8rem', fontWeight: '800', padding: '6px 14px', borderRadius: '4px', letterSpacing: '1px', textTransform: 'uppercase'
            }}>
              {!ttkResult ? "ESPERANDO PARÁMETROS" : ttkResult <= 2 ? "🔴 LETALIDAD INMEDIATA" : ttkResult <= 4 ? "🟠 ENFRENTAMIENTO DIRECTO" : "🟢 PROTECCIÓN EFICIENTE"}
            </span>
          </div>
        </section>

        {/* LOG DE TELEMETRÍA DISPARO A DISPARO */}
        <section style={{ backgroundColor: 'var(--tk-glass)', backdropFilter: 'blur(25px)', border: '1px solid var(--tk-glass-border)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '520px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--tk-text-muted)', fontWeight: '800', letterSpacing: '2px', margin: '0 0 0.5rem 0' }}>📋 TELEMETRÍA DE IMPACTOS (LOG OPERATIVO)</h3>
          
          {logSimulacion.map((log) => (
            <div 
              key={log.tiro} 
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.25)', 
                borderLeft: `3px solid ${log.resultado.includes("💥") ? '#ff4444' : 'var(--tk-green)'}`, 
                borderRadius: '4px', 
                padding: '1rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontWeight: '800', color: '#fff', marginRight: '1rem' }}># DISPARO {log.tiro}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: log.resultado.includes("💥") ? '#ff4444' : 'var(--tk-green)' }}>{log.resultado}</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', marginTop: '4px' }}>Probabilidad de perforación: {log.probabilidad}%</div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                <div style={{ color: '#fff' }}>Tórax: <span style={{ fontWeight: '700', color: '#ff4444' }}>-{log.danoLetal} HP</span></div>
                <div style={{ color: 'var(--tk-text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>Placa: {Math.round(log.durabilityRestante)} rem. (-{log.danoPlaca})</div>
              </div>
            </div>
          ))}
        </section>

      </div>

    </div>
  );
}