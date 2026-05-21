import { useCallback, useEffect, useMemo, useState } from 'react';
import { readDefaultPlayableMode } from '../../lib/gameModePreferences';
import { fetchTarkovPlayerProfile } from './pmcApi';

const MODE_STORAGE_KEY = 'info_tarkov_pmc_profile_mode';
const HISTORY_STORAGE_KEY = 'info_tarkov_pmc_profile_history';

const ACHIEVEMENT_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'legendary', label: 'Legendarios' },
  { id: 'rare', label: 'Raros' },
  { id: 'common', label: 'Comunes' }
];

const ACHIEVEMENT_SORTS = [
  { id: 'date', label: 'Fecha' },
  { id: 'rarity', label: 'Rareza' },
  { id: 'name', label: 'Nombre' }
];

const EQUIPMENT_SLOT_LABELS = {
  FirstPrimaryWeapon: 'Arma principal',
  SecondPrimaryWeapon: 'Arma secundaria',
  Holster: 'Pistola',
  Scabbard: 'Melee',
  SecuredContainer: 'Contenedor',
  ArmBand: 'Armband',
  Headwear: 'Casco',
  FaceCover: 'Face cover',
  ArmorVest: 'Armadura',
  TacticalVest: 'Rig',
  Backpack: 'Mochila',
  Eyewear: 'Gafas'
};

const panelStyle = {
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)'
};

const buttonBaseStyle = {
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '900',
  fontFamily: "'Rajdhani', sans-serif",
  letterSpacing: '1px'
};

const tableHeadStyle = {
  color: 'var(--tk-text-muted)',
  textAlign: 'left',
  fontSize: '0.82rem',
  textTransform: 'uppercase',
  padding: '0.45rem 0.55rem',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  position: 'sticky',
  top: 0,
  zIndex: 1,
  background: '#141416'
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat('es-ES').format(parsed);
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatPercent = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '-';
  return `${parsed.toFixed(parsed < 10 ? 2 : 1)}%`;
};

const formatSyncAge = (value) => {
  if (!value) return 'Sin fecha publica';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha publica';
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `Actualizado hace ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 48) return `Actualizado hace ${diffHours} h`;
  return `Actualizado hace ${Math.round(diffHours / 24)} dias`;
};

const formatSkillName = (value) => {
  if (!value) return 'Skill';
  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatSkillLevel = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '-';
  return Math.min(51, parsed).toFixed(2);
};

const getExportImageUrl = (src) => {
  if (!src) return '';
  try {
    const url = new URL(src, window.location.origin);
    if (url.hostname === 'assets.tarkov.dev' || url.hostname === 'static.tarkov.dev') {
      return `/api/image-proxy?url=${encodeURIComponent(url.href)}`;
    }
    return url.href;
  } catch {
    return src;
  }
};

const loadExportImage = (src) => new Promise((resolve) => {
  if (!src) {
    resolve(null);
    return;
  }
  const image = new Image();
  const timeout = window.setTimeout(() => resolve(null), 2500);
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    window.clearTimeout(timeout);
    resolve(image);
  };
  image.onerror = () => {
    window.clearTimeout(timeout);
    resolve(null);
  };
  image.src = src;
});

const drawRoundedRect = (ctx, x, y, width, height, radius = 10) => {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.stroke();
};

const drawClampedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) => {
  const words = String(text || '-').split(/\s+/);
  const lines = [];
  let currentLine = '';
  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
      return;
    }
    lines.push(currentLine);
    currentLine = word;
  });
  if (currentLine) lines.push(currentLine);

  lines.slice(0, maxLines).forEach((line, index) => {
    const finalLine = index === maxLines - 1 && lines.length > maxLines ? `${line.replace(/\s+\S+$/, '')}...` : line;
    ctx.fillText(finalLine, x, y + index * lineHeight);
  });
};

const drawStatIcon = (ctx, icon, x, y) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(187,211,169,0.82)';
  ctx.fillStyle = 'rgba(187,211,169,0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, 30, 30, 8);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#9fb48f';
  ctx.fillStyle = '#9fb48f';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (icon === 'shield') {
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 7);
    ctx.lineTo(x + 22, y + 10);
    ctx.lineTo(x + 20, y + 21);
    ctx.lineTo(x + 15, y + 24);
    ctx.lineTo(x + 10, y + 21);
    ctx.lineTo(x + 8, y + 10);
    ctx.closePath();
    ctx.stroke();
  } else if (icon === 'xp') {
    [0, 1, 2].forEach((bar) => {
      ctx.fillRect(x + 8 + bar * 5, y + 20 - bar * 4, 3, 5 + bar * 4);
    });
  } else if (icon === 'raid') {
    ctx.beginPath();
    ctx.arc(x + 15, y + 15, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 7);
    ctx.lineTo(x + 15, y + 23);
    ctx.moveTo(x + 7, y + 15);
    ctx.lineTo(x + 23, y + 15);
    ctx.stroke();
  } else if (icon === 'extract') {
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 18);
    ctx.lineTo(x + 15, y + 24);
    ctx.lineTo(x + 23, y + 8);
    ctx.stroke();
  } else if (icon === 'percent') {
    ctx.font = '900 16px Rajdhani, Arial';
    ctx.fillText('%', x + 10, y + 20);
  } else if (icon === 'kill') {
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 21);
    ctx.lineTo(x + 21, y + 9);
    ctx.moveTo(x + 10, y + 9);
    ctx.lineTo(x + 22, y + 21);
    ctx.stroke();
  } else if (icon === 'target') {
    ctx.beginPath();
    ctx.arc(x + 15, y + 15, 8, 0, Math.PI * 2);
    ctx.arc(x + 15, y + 15, 3, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 7);
    ctx.lineTo(x + 17.5, y + 13);
    ctx.lineTo(x + 24, y + 13);
    ctx.lineTo(x + 19, y + 17);
    ctx.lineTo(x + 21, y + 24);
    ctx.lineTo(x + 15, y + 20);
    ctx.lineTo(x + 9, y + 24);
    ctx.lineTo(x + 11, y + 17);
    ctx.lineTo(x + 6, y + 13);
    ctx.lineTo(x + 12.5, y + 13);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
};

const readSearchHistory = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    return [];
  }
};

const writeSearchHistory = (entries) => {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, 6)));
};

const getProfileUsername = (userProfile, session) =>
  userProfile?.tarkov_username ||
  userProfile?.username ||
  session?.user?.user_metadata?.tarkov_username ||
  session?.user?.user_metadata?.username ||
  '';

export default function PmcProfileModule({ onViewChange, session, userProfile }) {
  const [activeMode, setActiveMode] = useState(() => localStorage.getItem(MODE_STORAGE_KEY) || readDefaultPlayableMode());
  const [remoteProfile, setRemoteProfile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState(readSearchHistory);
  const [achievementFilter, setAchievementFilter] = useState('all');
  const [achievementSort, setAchievementSort] = useState('date');
  const [achievementSearch, setAchievementSearch] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const tarkovUsername = getProfileUsername(userProfile, session);
  const [searchedUsername, setSearchedUsername] = useState(tarkovUsername);
  const [searchInput, setSearchInput] = useState(tarkovUsername);
  const profileUsername = searchedUsername || tarkovUsername;

  const loadProfile = useCallback(async (signal) => {
    if (!profileUsername) {
      setRemoteProfile(null);
      setStatus('missing-user');
      setError('');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const nextProfile = await fetchTarkovPlayerProfile({
        username: profileUsername,
        mode: activeMode,
        signal
      });
      setRemoteProfile(nextProfile);
      if (nextProfile?.nickname) {
        setSearchHistory((currentHistory) => {
          const nextHistory = [
            { username: nextProfile.nickname, mode: activeMode, accountId: nextProfile.accountId },
            ...currentHistory.filter((entry) => entry.username.toLowerCase() !== nextProfile.nickname.toLowerCase() || entry.mode !== activeMode)
          ].slice(0, 6);
          writeSearchHistory(nextHistory);
          return nextHistory;
        });
      }
      setStatus('ready');
    } catch (profileError) {
      if (profileError.name === 'AbortError') return;
      console.error(profileError);
      setRemoteProfile(null);
      setStatus('error');
      setError(profileError.message || 'No se pudo cargar el perfil de PMC.');
    }
  }, [activeMode, profileUsername]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const cleanSearch = searchInput.trim() || tarkovUsername;
    if (!cleanSearch) {
      setError('Introduce un usuario de Tarkov para buscar.');
      setStatus('error');
      return;
    }

    setSearchedUsername(cleanSearch);
  };

  const handleResetToLinkedUser = () => {
    if (!tarkovUsername) return;
    setSearchInput(tarkovUsername);
    setSearchedUsername(tarkovUsername);
  };

  const handleHistorySelect = (username) => {
    setSearchInput(username);
    setSearchedUsername(username);
  };

  const handleCopyAccountId = async () => {
    if (!remoteProfile?.accountId) return;
    await navigator.clipboard.writeText(remoteProfile.accountId);
    setCopyStatus('Account ID copiado');
    window.setTimeout(() => setCopyStatus(''), 1600);
  };

  const handleExportCard = async () => {
    if (!remoteProfile) return;
    const achievements = remoteProfile.allAchievements || remoteProfile.recentAchievements || [];
    const rareAchievements = remoteProfile.rareAchievements || [];
    const skills = remoteProfile.skillsSummary || [];
    const equipment = remoteProfile.equipmentItems || [];
    const favorites = remoteProfile.favoriteItems || [];
    const imageSources = [
      ...rareAchievements.slice(0, 3).map((achievement) => achievement.imageLink),
      ...achievements.slice(0, 8).map((achievement) => achievement.imageLink),
      ...skills.slice(0, 8).map((skill) => skill.imageLink),
      ...equipment.slice(0, 4).map((item) => item.iconLink || item.gridImageLink || item.baseImageLink),
      ...favorites.slice(0, 4).map((item) => item.iconLink || item.gridImageLink || item.baseImageLink)
    ].filter(Boolean);
    const loadedImages = new Map();
    await Promise.all([...new Set(imageSources)].map(async (src) => {
      loadedImages.set(src, await loadExportImage(getExportImageUrl(src)));
    }));

    const canvas = document.createElement('canvas');
    const scale = 2;
    const width = 1080;
    const height = 1480;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = '#090b0c';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(187,211,169,0.035)';
    ctx.fillRect(0, 0, width, 260);
    ctx.fillStyle = 'rgba(255,255,255,0.018)';
    for (let x = 0; x < width; x += 48) ctx.fillRect(x, 0, 1, height);
    for (let y = 0; y < height; y += 48) ctx.fillRect(0, y, width, 1);

    ctx.fillStyle = '#121514';
    ctx.strokeStyle = 'rgba(187,211,169,0.35)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 28, 28, width - 56, height - 56, 18);

    ctx.strokeStyle = 'rgba(187,211,169,0.35)';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#9fb48f';
    ctx.font = '800 20px Rajdhani, Arial';
    ctx.fillText(`${activeMode} / INFOTARKOV PMC DOSSIER`, 62, 74);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 62px Rajdhani, Arial';
    ctx.fillText(remoteProfile.nickname || profileUsername || 'PMC', 62, 146);
    ctx.fillStyle = '#9fb48f';
    ctx.font = '900 86px Rajdhani, Arial';
    ctx.fillText(remoteProfile.level ? `L${remoteProfile.level}` : 'L--', 840, 146);
    ctx.fillStyle = '#ffcf66';
    ctx.font = '900 22px Rajdhani, Arial';
    ctx.fillText(rareAchievements[0] ? `TOP LOGRO: ${rareAchievements[0].name}` : 'TOP LOGRO: -', 62, 190);
    ctx.fillStyle = '#8d8f8c';
    ctx.font = '800 18px Rajdhani, Arial';
    ctx.fillText(`Sincronizado: ${formatDateTime(remoteProfile.updatedAt)} · Account ID: ${remoteProfile.accountId || '-'}`, 62, 226);

    const statRows = [
      ['Faccion', remoteProfile.faction || '-', 'shield'],
      ['XP', formatNumber(remoteProfile.experience), 'xp'],
      ['Raids', formatNumber(remoteProfile.raids), 'raid'],
      ['Extracted', formatNumber(remoteProfile.survivedRaids), 'extract'],
      ['SR', remoteProfile.survivalRate !== null && remoteProfile.survivalRate !== undefined ? `${remoteProfile.survivalRate}%` : '-', 'percent'],
      ['Kills', formatNumber(remoteProfile.kills), 'kill'],
      ['PMC kills', formatNumber(remoteProfile.killedPmcs), 'target'],
      ['Logros', formatNumber(remoteProfile.achievementsCount), 'star']
    ];
    statRows.forEach(([label, value, icon], index) => {
      const x = 62 + (index % 4) * 245;
      const y = 292 + Math.floor(index / 4) * 92;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      drawRoundedRect(ctx, x, y, 220, 66, 10);
      drawStatIcon(ctx, icon, x + 12, y + 18);
      ctx.fillStyle = '#8d8f8c';
      ctx.font = '800 15px Rajdhani, Arial';
      ctx.fillText(label.toUpperCase(), x + 54, y + 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 25px Rajdhani, Arial';
      drawClampedText(ctx, String(value), x + 54, y + 52, 150, 25, 1);
    });

    const drawSectionTitle = (title, y) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px Rajdhani, Arial';
      ctx.fillText(title.toUpperCase(), 62, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(62, y + 16);
      ctx.lineTo(width - 62, y + 16);
      ctx.stroke();
    };

    const drawItemCard = (item, x, y, cardWidth) => {
      const src = item?.iconLink || item?.gridImageLink || item?.baseImageLink;
      const image = loadedImages.get(src);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      drawRoundedRect(ctx, x, y, cardWidth, 76, 10);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x + 12, y + 14, 48, 48);
      if (image) {
        ctx.drawImage(image, x + 12, y + 14, 48, 48);
      } else {
        ctx.fillStyle = 'rgba(187,211,169,0.12)';
        ctx.fillRect(x + 12, y + 14, 48, 48);
        ctx.fillStyle = '#9fb48f';
        ctx.font = '900 16px Rajdhani, Arial';
        ctx.fillText(String(item?.shortName || item?.name || '?').slice(0, 2).toUpperCase(), x + 25, y + 44);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 18px Rajdhani, Arial';
      drawClampedText(ctx, item?.shortName || item?.name || '-', x + 72, y + 30, cardWidth - 86, 18, 1);
      ctx.fillStyle = '#8d8f8c';
      ctx.font = '800 15px Rajdhani, Arial';
      drawClampedText(ctx, item?.name || '-', x + 72, y + 52, cardWidth - 86, 16, 2);
    };

    drawSectionTitle('Equipo tactico', 515);
    equipment.slice(0, 4).forEach((item, index) => drawItemCard(item, 62 + (index % 2) * 490, 548 + Math.floor(index / 2) * 88, 455));

    drawSectionTitle('Favoritos', 760);
    favorites.slice(0, 4).forEach((item, index) => drawItemCard(item, 62 + (index % 2) * 490, 793 + Math.floor(index / 2) * 88, 455));

    drawSectionTitle('Logros destacados', 1005);
    const featuredAchievements = (rareAchievements.length ? rareAchievements : achievements).slice(0, 6);
    featuredAchievements.forEach((achievement, index) => {
      const x = 62 + (index % 2) * 490;
      const y = 1038 + Math.floor(index / 2) * 68;
      const image = loadedImages.get(achievement.imageLink);
      ctx.fillStyle = 'rgba(255,207,102,0.045)';
      ctx.strokeStyle = 'rgba(255,207,102,0.18)';
      drawRoundedRect(ctx, x, y, 455, 56, 10);
      if (image) {
        ctx.drawImage(image, x + 12, y + 10, 36, 36);
      } else {
        ctx.fillStyle = 'rgba(255,207,102,0.12)';
        ctx.beginPath();
        ctx.arc(x + 30, y + 28, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcf66';
        ctx.font = '900 18px Rajdhani, Arial';
        ctx.fillText('★', x + 24, y + 34);
      }
      ctx.fillStyle = '#ffcf66';
      ctx.font = '900 13px Rajdhani, Arial';
      ctx.fillText(`${achievement.rarityLabel || achievement.rarity || 'Logro'} · ${formatPercent(achievement.playersCompletedPercent)}`, x + 60, y + 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 17px Rajdhani, Arial';
      drawClampedText(ctx, achievement.name, x + 60, y + 42, 370, 17, 1);
    });

    drawSectionTitle('Skills farmeadas', 1260);
    skills.slice(0, 8).forEach((skill, index) => {
      const x = 62 + (index % 4) * 245;
      const y = 1293 + Math.floor(index / 4) * 64;
      const image = loadedImages.get(skill.imageLink);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      drawRoundedRect(ctx, x, y, 220, 48, 9);
      if (image) {
        ctx.drawImage(image, x + 10, y + 8, 32, 32);
      } else {
        ctx.fillStyle = 'rgba(187,211,169,0.12)';
        ctx.fillRect(x + 10, y + 8, 32, 32);
        ctx.fillStyle = '#9fb48f';
        ctx.font = '900 12px Rajdhani, Arial';
        ctx.fillText(String(skill.name || skill.id || '?').slice(0, 2).toUpperCase(), x + 17, y + 28);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px Rajdhani, Arial';
      drawClampedText(ctx, skill.name || formatSkillName(skill.id), x + 52, y + 22, 112, 16, 1);
      ctx.fillStyle = '#9fb48f';
      ctx.font = '900 17px Rajdhani, Arial';
      ctx.fillText(`L${formatSkillLevel(skill.level)}`, x + 164, y + 31);
    });

    ctx.fillStyle = '#ffcf66';
    ctx.font = '900 18px Rajdhani, Arial';
    ctx.fillText('INFOTARKOV.COM', 62, 1420);
    ctx.fillStyle = '#8d8f8c';
    ctx.fillText(formatSyncAge(remoteProfile.updatedAt), 820, 1420);

    const link = document.createElement('a');
    link.download = `infotarkov-${remoteProfile.nickname || profileUsername || 'pmc'}-${activeMode}.png`;
    try {
      link.href = canvas.toDataURL('image/png');
    } catch {
      ctx.fillStyle = '#090b0c';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 42px Rajdhani, Arial';
      ctx.fillText(remoteProfile.nickname || profileUsername || 'PMC', 62, 120);
      ctx.fillStyle = '#9fb48f';
      ctx.font = '900 24px Rajdhani, Arial';
      ctx.fillText('No se pudieron incrustar imagenes externas en esta exportacion.', 62, 170);
      link.href = canvas.toDataURL('image/png');
    }
    link.click();
  };

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, activeMode);
    const controller = new AbortController();
    const loadTimer = window.setTimeout(() => {
      loadProfile(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(loadTimer);
      controller.abort();
    };
  }, [activeMode, loadProfile]);

  const stats = useMemo(() => [
    { label: 'Nivel', value: remoteProfile?.level ? `L${remoteProfile.level}` : '-' },
    { label: 'Facción', value: remoteProfile?.faction || '-' },
    { label: 'XP', value: formatNumber(remoteProfile?.experience) },
    { label: 'Tiempo', value: remoteProfile?.totalInGameTime || '-' },
    {
      label: 'Raids',
      value: formatNumber(remoteProfile?.raids),
      pairLabel: 'Extracted',
      pairValue: formatNumber(remoteProfile?.survivedRaids),
      wide: true
    },
    { label: 'SR', value: remoteProfile?.survivalRate !== null && remoteProfile?.survivalRate !== undefined ? `${remoteProfile.survivalRate}%` : '-' },
    { label: 'Kills', value: formatNumber(remoteProfile?.kills) },
    { label: 'PMC kills', value: formatNumber(remoteProfile?.killedPmcs) },
    { label: 'Cuenta', value: remoteProfile?.memberCategory || '-', wide: true },
    { label: 'Logros', value: formatNumber(remoteProfile?.achievementsCount) },
    { label: 'Actividad', value: formatDateTime(remoteProfile?.lastActiveAt), wide: true }
  ], [remoteProfile]);

  const topKeys = remoteProfile?.topLevelKeys?.length ? remoteProfile.topLevelKeys.join(', ') : 'Sin campos extra detectados';
  const skillText = remoteProfile?.skillsSummary?.length
    ? remoteProfile.skillsSummary.map((skill) => `${skill.id}: L${formatNumber(skill.level)}`).join(' · ')
    : 'Sin skills detectadas';
  const allAchievements = useMemo(
    () => remoteProfile?.allAchievements || remoteProfile?.recentAchievements || [],
    [remoteProfile]
  );
  const rareAchievements = remoteProfile?.rareAchievements || [];
  const equipmentItems = remoteProfile?.equipmentItems || [];
  const favoriteItems = remoteProfile?.favoriteItems || [];
  const filteredAchievements = useMemo(() => {
    const query = achievementSearch.trim().toLowerCase();
    return [...allAchievements]
      .filter((achievement) => achievementFilter === 'all' || achievement.rarity === achievementFilter)
      .filter((achievement) => !query || achievement.name.toLowerCase().includes(query))
      .sort((a, b) => {
        if (achievementSort === 'name') return a.name.localeCompare(b.name);
        if (achievementSort === 'rarity') {
          const rarityScore = { legendary: 3, rare: 2, common: 1 };
          const rarityDiff = (rarityScore[b.rarity] || 0) - (rarityScore[a.rarity] || 0);
          if (rarityDiff !== 0) return rarityDiff;
          return (a.playersCompletedPercent ?? 999) - (b.playersCompletedPercent ?? 999);
        }
        return (b.completedAt || 0) - (a.completedAt || 0);
      });
  }, [achievementFilter, achievementSearch, achievementSort, allAchievements]);

  return (
    <div className="fade-in-slide terminal-panel" style={{ minHeight: '100vh', background: '#0a0a0c', padding: '5.25rem 2rem 6rem', fontFamily: "'Rajdhani', sans-serif" }}>
      <main style={{ width: 'min(1280px, 100%)', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '1.2rem', marginBottom: '1rem' }}>
          <div>
            <p style={{ color: 'var(--tk-green)', margin: '0 0 0.35rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Identidad operativa
            </p>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '2.55rem', textTransform: 'uppercase' }}>Perfil de PMC</h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '860px', lineHeight: 1.5, margin: '0.45rem 0 0' }}>
              Perfil conectado a los JSON públicos de players.tarkov.dev. Solo aparecen jugadores ya vistos en tarkov.dev/players y el índice público se actualiza una vez al día.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <ModeSwitch activeMode={activeMode} setActiveMode={setActiveMode} />
            <button
              type="button"
              onClick={() => {
                const controller = new AbortController();
                loadProfile(controller.signal);
              }}
              disabled={status === 'loading'}
              style={{
                ...buttonBaseStyle,
                backgroundColor: 'rgba(26,176,21,0.08)',
                color: 'var(--tk-green)',
                border: '1px solid rgba(26,176,21,0.28)',
                padding: '0.8rem 1.05rem',
                opacity: status === 'loading' ? 0.65 : 1
              }}
            >
              REFRESCAR
            </button>
            <button type="button" onClick={() => onViewChange('home')} style={{ ...buttonBaseStyle, backgroundColor: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.05rem', whiteSpace: 'nowrap' }}>
              VOLVER AL MENU
            </button>
          </div>
        </header>

        <SearchBar
          error={error}
          handleResetToLinkedUser={handleResetToLinkedUser}
          handleSearchSubmit={handleSearchSubmit}
          onHistorySelect={handleHistorySelect}
          profileUsername={profileUsername}
          searchHistory={searchHistory}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          status={status}
          tarkovUsername={tarkovUsername}
        />

        <section style={{ display: 'grid', gap: '1rem' }}>
          <ProfileSummary
            activeMode={activeMode}
            profileUsername={profileUsername}
            remoteProfile={remoteProfile}
            stats={stats}
            status={status}
            topAchievement={rareAchievements[0]}
          />

          <ProfileActions
            copyStatus={copyStatus}
            handleCopyAccountId={handleCopyAccountId}
            handleExportCard={handleExportCard}
            remoteProfile={remoteProfile}
          />

          <SyncStatus remoteProfile={remoteProfile} status={status} />

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            <TacticalEquipmentPanel items={equipmentItems} />
            <ItemPanel title="Favoritos" empty="Sin favoritos visibles" items={favoriteItems} />
          </section>

          <AchievementsHub
            achievementFilter={achievementFilter}
            achievementSearch={achievementSearch}
            achievementSort={achievementSort}
            achievements={filteredAchievements}
            allCount={allAchievements.length}
            rareAchievements={rareAchievements}
            setAchievementFilter={setAchievementFilter}
            setAchievementSearch={setAchievementSearch}
            setAchievementSort={setAchievementSort}
          />

          <SkillsPanel skills={remoteProfile?.skillsSummary || []} />

          <DataPanel remoteProfile={remoteProfile} skillText={skillText} topKeys={topKeys} />
        </section>
      </main>
    </div>
  );
}

function ModeSwitch({ activeMode, setActiveMode }) {
  return (
    <div style={{ display: 'flex', gap: '6px', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.32)' }}>
      {['PVP', 'PVE'].map((mode) => {
        const active = activeMode === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setActiveMode(mode)}
            style={{
              ...buttonBaseStyle,
              minWidth: '76px',
              border: active ? '1px solid rgba(187, 211, 169, 0.55)' : '1px solid rgba(255,255,255,0.06)',
              backgroundColor: active ? 'rgba(187, 211, 169, 0.85)' : 'rgba(255,255,255,0.03)',
              color: active ? '#11180f' : '#d7d7d7',
              padding: '9px 12px'
            }}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}

function SearchBar({ error, handleResetToLinkedUser, handleSearchSubmit, onHistorySelect, profileUsername, searchHistory, searchInput, setSearchInput, status, tarkovUsername }) {
  return (
    <section style={{ ...panelStyle, padding: '0.85rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
      <div>
        <p style={{ color: 'var(--tk-text-muted)', margin: 0, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Usuario enlazado
        </p>
        <strong style={{ color: '#fff', display: 'block', fontSize: '1.25rem', textTransform: 'uppercase' }}>{tarkovUsername || 'Sin configurar'}</strong>
      </div>

      <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.6rem', alignItems: 'center' }}>
        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar otro PMC..."
          spellCheck="false"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: '#fff',
            padding: '0.75rem 0.9rem',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '800'
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            ...buttonBaseStyle,
            backgroundColor: 'rgba(26,176,21,0.08)',
            color: 'var(--tk-green)',
            border: '1px solid rgba(26,176,21,0.28)',
            padding: '0.75rem 1rem',
            opacity: status === 'loading' ? 0.65 : 1
          }}
        >
          BUSCAR
        </button>
      </form>

      {tarkovUsername && (
        <button
          type="button"
          onClick={handleResetToLinkedUser}
          disabled={status === 'loading' || profileUsername === tarkovUsername}
          style={{
            ...buttonBaseStyle,
            backgroundColor: 'rgba(255,255,255,0.04)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '0.75rem 1rem',
            opacity: status === 'loading' || profileUsername === tarkovUsername ? 0.55 : 1,
            whiteSpace: 'nowrap'
          }}
        >
          MI PERFIL
        </button>
      )}

      <a
        href="https://tarkov.dev/players"
        target="_blank"
        rel="noreferrer"
        style={{
          ...buttonBaseStyle,
          textAlign: 'center',
          textDecoration: 'none',
          backgroundColor: 'rgba(255,255,255,0.04)',
          color: 'var(--tk-green)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '0.75rem 1rem',
          whiteSpace: 'nowrap'
        }}
      >
        TARKOV.DEV
      </a>

      {error && (
        <div style={{ gridColumn: '1 / -1', border: '1px solid rgba(255,207,102,0.35)', background: 'rgba(255,207,102,0.06)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#ffcf66', fontWeight: '800' }}>
          {error}
        </div>
      )}

      {searchHistory.length > 0 && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--tk-text-muted)', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '1px' }}>Historial</span>
          {searchHistory.map((entry) => (
            <button
              key={`${entry.mode}-${entry.username}`}
              type="button"
              onClick={() => onHistorySelect(entry.username)}
              style={{
                ...buttonBaseStyle,
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#d7d7d7',
                padding: '0.35rem 0.55rem',
                fontSize: '0.82rem'
              }}
            >
              {entry.username} · {entry.mode}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function ProfileActions({ copyStatus, handleCopyAccountId, handleExportCard, remoteProfile }) {
  return (
    <article style={{ ...panelStyle, padding: '0.85rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem', alignItems: 'center' }}>
      <button type="button" onClick={handleCopyAccountId} disabled={!remoteProfile?.accountId} style={{ ...actionButtonStyle, opacity: remoteProfile?.accountId ? 1 : 0.55 }}>
        {copyStatus || 'Copiar AccID'}
      </button>
      <button type="button" onClick={handleExportCard} disabled={!remoteProfile} style={{ ...actionButtonStyle, opacity: remoteProfile ? 1 : 0.55 }}>
        Exportar tarjeta
      </button>
    </article>
  );
}

const actionButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: 'rgba(255,255,255,0.04)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '0.72rem 0.9rem'
};

function SyncStatus({ remoteProfile, status }) {
  return (
    <article style={{ ...panelStyle, padding: '0.9rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
      <InfoLine label="Estado" value={status === 'ready' ? 'Sincronizado' : status === 'loading' ? 'Consultando' : 'En espera'} />
      <InfoLine label="Indice publico" value={formatSyncAge(remoteProfile?.updatedAt)} />
      <InfoLine label="Lectura local" value={formatDateTime(remoteProfile?.fetchedAt)} />
      <InfoLine label="Account ID" value={remoteProfile?.accountId || '-'} />
    </article>
  );
}

function InfoLine({ label, value }) {
  return (
    <div>
      <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.78rem' }}>{label}</span>
      <strong style={{ color: '#fff', display: 'block', marginTop: '0.12rem', overflowWrap: 'anywhere' }}>{value}</strong>
    </div>
  );
}

function ProfileSummary({ activeMode, profileUsername, remoteProfile, stats, status, topAchievement }) {
  return (
    <article style={{ ...panelStyle, padding: '1rem 1rem 0.9rem', borderColor: 'rgba(187, 211, 169, 0.18)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 0.55fr) minmax(0, 1.45fr)', gap: '1rem', alignItems: 'stretch' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: '0.9rem', alignItems: 'center', minWidth: 0 }}>
          <div style={{ width: 64, height: 64, borderRadius: '8px', border: '1px solid rgba(187,211,169,0.25)', background: 'linear-gradient(145deg, rgba(187,211,169,0.16), rgba(0,0,0,0.35))', display: 'grid', placeItems: 'center', color: 'var(--tk-green)', fontWeight: '900', fontSize: '1.6rem' }}>
            {remoteProfile?.level ? `L${remoteProfile.level}` : '--'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'var(--tk-green)', margin: 0, fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>{activeMode} / tarkov.dev</p>
            <h2 style={{ color: '#fff', margin: '0.05rem 0', fontSize: '2rem', textTransform: 'uppercase', overflowWrap: 'anywhere' }}>
              {remoteProfile?.nickname || profileUsername || 'PMC'}
            </h2>
            <p style={{ color: status === 'ready' ? 'var(--tk-green)' : '#ffcf66', margin: 0, fontWeight: '900', textTransform: 'uppercase' }}>
              {status === 'ready' && `Sincronizado · ${formatDateTime(remoteProfile?.fetchedAt)}`}
              {status === 'loading' && 'Consultando perfil...'}
              {status === 'missing-user' && 'Configura o busca un usuario'}
              {status === 'error' && 'No se pudo sincronizar'}
              {status === 'idle' && 'Preparando sincronización'}
            </p>
            {topAchievement && (
              <div style={{ marginTop: '0.55rem', display: 'inline-flex', maxWidth: '100%', alignItems: 'center', gap: '0.45rem', border: '1px solid rgba(255,207,102,0.22)', background: 'rgba(255,207,102,0.07)', borderRadius: '8px', padding: '0.38rem 0.55rem' }}>
                <span style={{ color: '#ffcf66', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Top logro</span>
                <strong style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{topAchievement.name}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.45rem',
          minWidth: 0,
          alignContent: 'center',
          alignItems: 'stretch'
        }}>
          {stats.map((stat) => (
            <StatPill key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </article>
  );
}

function StatPill({ label, value, pairLabel, pairValue, wide = false }) {
  return (
    <div style={{
      flex: wide ? '1 1 190px' : '1 1 118px',
      minWidth: wide ? '170px' : '108px',
      minHeight: '64px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))',
      border: '1px solid rgba(255,255,255,0.075)',
      borderRadius: '8px',
      padding: '0.65rem 0.75rem',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.035)'
    }}>
      {pairLabel ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', alignItems: 'center' }}>
          <StatValue label={label} value={value} />
          <StatValue label={pairLabel} value={pairValue} />
        </div>
      ) : (
        <StatValue label={label} value={value} />
      )}
    </div>
  );
}

function StatValue({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '900', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
      <strong style={{ color: '#fff', display: 'block', fontSize: '1.15rem', marginTop: '0.14rem', overflowWrap: 'anywhere', lineHeight: 1.05 }}>{value}</strong>
    </div>
  );
}

function TacticalEquipmentPanel({ items }) {
  const tacticalItems = items.map((item) => ({
    ...item,
    tacticalLabel: EQUIPMENT_SLOT_LABELS[item.slotId] || item.slotId || 'Equipo'
  }));

  return (
    <article style={{ ...panelStyle, padding: '1rem' }}>
      <h3 style={{ color: '#fff', margin: '0 0 0.75rem', textTransform: 'uppercase' }}>Equipo táctico</h3>
      {tacticalItems.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
          {tacticalItems.map((item) => (
            <div key={`${item.id || item.templateId}-${item.slotId}`} style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '0.7rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.7rem' }}>
              <div style={{ width: 50, height: 50, borderRadius: '6px', background: 'rgba(0,0,0,0.35)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
                {item.iconLink ? <img src={item.iconLink} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: 'var(--tk-green)', fontWeight: '900' }}>?</span>}
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ color: 'var(--tk-green)', display: 'block', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.78rem' }}>{item.tacticalLabel}</span>
                <strong style={{ color: '#fff', display: 'block', overflowWrap: 'anywhere', lineHeight: 1.1 }}>{item.shortName || item.name}</strong>
                <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '800', lineHeight: 1.1, marginTop: '0.2rem' }}>{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>Sin equipo visible</p>
      )}
    </article>
  );
}

function ItemPanel({ title, empty, items }) {
  return (
    <article style={{ ...panelStyle, padding: '1rem' }}>
      <h3 style={{ color: '#fff', margin: '0 0 0.75rem', textTransform: 'uppercase' }}>{title}</h3>
      {items.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.65rem' }}>
          {items.map((item) => (
            <ItemCard key={`${title}-${item.id || item.templateId}`} item={item} />
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>{empty}</p>
      )}
    </article>
  );
}

function ItemCard({ item }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '0.65rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.62rem' }}>
      <div style={{ width: 48, height: 48, borderRadius: '6px', background: 'rgba(0,0,0,0.35)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
        {item.iconLink ? <img src={item.iconLink} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: 'var(--tk-green)', fontWeight: '900' }}>?</span>}
      </div>
      <div style={{ minWidth: 0 }}>
        <strong style={{ color: '#fff', display: 'block', lineHeight: 1.1, overflowWrap: 'anywhere' }}>{item.shortName || item.name}</strong>
        <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '800', lineHeight: 1.1, marginTop: '0.2rem' }}>{item.slotId || item.name}</span>
      </div>
    </div>
  );
}

function AchievementsHub({
  achievementFilter,
  achievementSearch,
  achievementSort,
  achievements,
  allCount,
  rareAchievements,
  setAchievementFilter,
  setAchievementSearch,
  setAchievementSort
}) {
  return (
    <article style={{ ...panelStyle, padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        <div>
          <h3 style={{ color: '#fff', margin: 0, textTransform: 'uppercase' }}>Logros del perfil</h3>
          <p style={{ color: 'var(--tk-text-muted)', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
            {formatNumber(achievements.length)} visibles de {formatNumber(allCount)} completados. Los destacados muestran los más exclusivos del perfil.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {ACHIEVEMENT_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setAchievementFilter(filter.id)}
              style={{
                ...buttonBaseStyle,
                border: achievementFilter === filter.id ? '1px solid rgba(187, 211, 169, 0.55)' : '1px solid rgba(255,255,255,0.08)',
                background: achievementFilter === filter.id ? 'rgba(187,211,169,0.16)' : 'rgba(255,255,255,0.035)',
                color: achievementFilter === filter.id ? 'var(--tk-green)' : '#d7d7d7',
                padding: '0.45rem 0.65rem'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <AchievementShowcase achievements={rareAchievements} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 180px', gap: '0.65rem', margin: '0.95rem 0' }}>
        <input
          type="text"
          value={achievementSearch}
          onChange={(event) => setAchievementSearch(event.target.value)}
          placeholder="Buscar logro..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: '#fff',
            padding: '0.75rem 0.9rem',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '800'
          }}
        />
        <select
          value={achievementSort}
          onChange={(event) => setAchievementSort(event.target.value)}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: '#fff',
            padding: '0.75rem 0.9rem',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '900'
          }}
        >
          {ACHIEVEMENT_SORTS.map((sort) => <option key={sort.id} value={sort.id}>{sort.label}</option>)}
        </select>
      </div>

      <AchievementTable achievements={achievements} empty="Sin logros con estos filtros" contained />
    </article>
  );
}

function AchievementShowcase({ achievements }) {
  const showcase = achievements.slice(0, 3);
  if (!showcase.length) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
      {showcase.map((achievement) => (
        <div key={`showcase-${achievement.id}`} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: '0.75rem', alignItems: 'center', background: 'linear-gradient(135deg, rgba(255,207,102,0.08), rgba(255,255,255,0.025))', border: '1px solid rgba(255,207,102,0.16)', borderRadius: '8px', padding: '0.8rem' }}>
          <div style={{ width: 54, height: 54, borderRadius: '8px', background: 'rgba(0,0,0,0.35)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
            {achievement.imageLink ? <img src={achievement.imageLink} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#ffcf66', fontWeight: '900' }}>A</span>}
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ color: '#ffcf66', display: 'block', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.78rem' }}>
              {achievement.rarityLabel} · {formatPercent(achievement.playersCompletedPercent)}
            </span>
            <strong style={{ color: '#fff', display: 'block', overflowWrap: 'anywhere', lineHeight: 1.1 }}>{achievement.name}</strong>
            <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '800', marginTop: '0.25rem' }}>{formatDateTime(achievement.completedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AchievementTable({ title, achievements, empty, contained = false }) {
  return (
    <article style={title ? { ...panelStyle, padding: '1rem' } : {}}>
      {title && <h3 style={{ color: '#fff', margin: '0 0 0.75rem', textTransform: 'uppercase' }}>{title}</h3>}
      {achievements.length ? (
        <div style={{ overflowX: 'auto', overflowY: contained ? 'auto' : 'visible', maxHeight: contained ? '560px' : 'none', paddingRight: contained ? '0.2rem' : 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
            <thead>
              <tr>
                {['Logro', 'Rareza', 'Jugadores', 'Completado'].map((header) => (
                  <th key={header} style={{ color: 'var(--tk-text-muted)', textAlign: 'left', fontSize: '0.82rem', textTransform: 'uppercase', padding: '0.45rem 0.55rem', borderBottom: '1px solid rgba(255,255,255,0.08)', position: contained ? 'sticky' : 'static', top: 0, zIndex: 1, background: '#141416' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {achievements.map((achievement) => (
                <AchievementRow key={`${title}-${achievement.id}`} achievement={achievement} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>{empty}</p>
      )}
    </article>
  );
}

function AchievementRow({ achievement }) {
  return (
    <tr>
      <td style={{ padding: '0.52rem 0.55rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: '0.55rem', alignItems: 'center' }}>
          <div style={{ width: 34, height: 34, borderRadius: '6px', background: 'rgba(0,0,0,0.35)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
            {achievement.imageLink ? <img src={achievement.imageLink} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--tk-green)', fontWeight: '900' }}>A</span>}
          </div>
          <strong style={{ color: '#fff', display: 'block', overflowWrap: 'anywhere', lineHeight: 1.1 }}>{achievement.name}</strong>
        </div>
      </td>
      <td style={{ color: 'var(--tk-green)', fontWeight: '900', padding: '0.52rem 0.55rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{achievement.rarityLabel}</td>
      <td style={{ color: 'var(--tk-text-muted)', fontWeight: '800', padding: '0.52rem 0.55rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{formatPercent(achievement.playersCompletedPercent)}</td>
      <td style={{ color: 'var(--tk-text-muted)', fontWeight: '800', padding: '0.52rem 0.55rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{formatDateTime(achievement.completedAt)}</td>
    </tr>
  );
}

function SkillsPanel({ skills }) {
  if (!skills.length) return null;

  return (
    <article style={{ ...panelStyle, padding: '1rem' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h3 style={{ color: '#fff', margin: 0, textTransform: 'uppercase' }}>Habilidades farmeadas</h3>
        <p style={{ color: 'var(--tk-text-muted)', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
          {formatNumber(skills.length)} skills detectadas en el perfil publico. Ordenadas por progreso.
        </p>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
          <thead>
            <tr>
              <th style={tableHeadStyle}>Skill</th>
              <th style={tableHeadStyle}>Nivel</th>
              <th style={tableHeadStyle}>Ultimo acceso</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={`${skill.id}-${skill.lastAccess || skill.progress}`}>
                <td style={{ padding: '0.58rem 0.55rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '38px 1fr', gap: '0.65rem', alignItems: 'center' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(187,211,169,0.16)',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'var(--tk-green)',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        overflow: 'hidden'
                      }}
                    >
                      {skill.imageLink ? (
                        <img src={skill.imageLink} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        String(skill.name || skill.id || '?').slice(0, 2)
                      )}
                    </div>
                    <strong style={{ color: '#fff', overflowWrap: 'anywhere' }}>{formatSkillName(skill.name || skill.id)}</strong>
                  </div>
                </td>
                <td style={{ color: 'var(--tk-green)', fontWeight: '900', padding: '0.58rem 0.55rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {formatSkillLevel(skill.level)}
                </td>
                <td style={{ color: 'var(--tk-text-muted)', fontWeight: '800', padding: '0.58rem 0.55rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {formatDateTime(skill.lastAccess)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function DataPanel({ remoteProfile, skillText, topKeys }) {
  return (
    <article style={{ ...panelStyle, padding: '1rem' }}>
      <h3 style={{ color: '#fff', margin: '0 0 0.75rem', textTransform: 'uppercase' }}>Datos disponibles</h3>
      <p style={{ color: 'var(--tk-text-muted)', margin: 0, lineHeight: 1.55 }}>
        Tarkov.dev protege la búsqueda directa con Turnstile, pero publica perfiles ya consultados como JSON estático. Info Tarkov cruza ese perfil con catálogos de items/logros para mostrar una ficha más útil.
      </p>
      {remoteProfile?.updatedAt && (
        <p style={{ color: 'var(--tk-text-muted)', margin: '0.8rem 0 0', lineHeight: 1.35 }}>
          Última actualización pública: {formatDateTime(remoteProfile.updatedAt)}
        </p>
      )}
      <p style={{ color: 'var(--tk-green)', margin: '0.8rem 0 0', fontWeight: '900', lineHeight: 1.35 }}>
        Skills principales: {skillText}
      </p>
      <p style={{ color: 'var(--tk-green)', margin: '0.55rem 0 0', fontWeight: '900', lineHeight: 1.35 }}>
        Campos detectados: {topKeys}
      </p>
    </article>
  );
}
