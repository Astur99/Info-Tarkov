export const SEASON = {
  id: 'kord-breach',
  number: 1,
  name: 'KORD BREACH',
  gameMode: 'pvp-season'
};

export const GLOBAL_MODIFIERS = [
  {
    id: 'no-insurance',
    name: 'No Insurance',
    effect: 'Insurance is disabled for every Seasonal PMC.',
    icon: '/images/kord-breach/perks/no-insurance.webp',
    mandatory: true
  },
  {
    id: 'handyman',
    name: 'Handyman',
    effect: 'Crafting takes 50% less time and Crafting starts at level 51.',
    icon: '/images/kord-breach/perks/handyman.webp',
    mandatory: true
  },
  {
    id: 'seasoned-pmcs',
    name: 'Seasoned PMCs',
    effect: 'Seasonal characters earn 25% more raid experience.',
    icon: '/images/kord-breach/perks/seasoned-pmcs.webp',
    mandatory: true
  },
  {
    id: 'armor-shortage',
    name: 'Armor Shortage',
    effect: 'Traders across Tarkov are experiencing an armor shortage.',
    icon: '/images/kord-breach/perks/armor-shortage.webp',
    mandatory: true
  },
  {
    id: 'black-division',
    name: 'Black Division',
    effect: 'Black Division operatives can be encountered in specific locations.',
    icon: '/images/kord-breach/perks/black-division.webp',
    mandatory: true
  },
  {
    id: 'no-fir-hideout',
    name: 'No FiR for Hideout',
    effect: 'Hideout zones do not require Found in Raid status.',
    icon: '/images/kord-breach/perks/no-fir-hideout.webp',
    mandatory: true
  }
];

export const POSITIVE_MODIFIERS = [
  ['marathon-runner', 'Marathon Runner', -3, 'Arm and leg stamina is consumed 20% slower.'],
  ['bush-borne', 'Bushborne', -5, 'Walking through vegetation generates 75% less noise and movement slowdown.'],
  ['juice-time', 'Juice Time', -2, 'Drinking juice grants the Painkiller effect for 60 seconds.'],
  ['street-tax', 'Street Tax', -1, 'Once per week, some Scavs pay you protection money.'],
  ['tarkov-shooter', 'The Tarkov Shooter', -2, 'Bolt-action Rifles levels 100% faster and starts at level 25.'],
  ['diet', 'Diet', -2, 'All provisions consume 50% less resource.'],
  ['thrombophilia', 'Thrombophilia', -2, 'Bleeding chance is decreased by 25%.'],
  ['hypodipsia', 'Hypodipsia', -2, 'Hydration is consumed 20% slower.'],
  ['polyphagia', 'Polyphagia', -2, 'Energy is consumed 20% slower.'],
  ['sturdy-bones', 'Sturdy Bones', -3, 'Fracture chance is reduced by 25% and falling damage by 20%.'],
  ['average', 'Average', -12, 'All skills are set to level 25 but cannot progress further, excluding Crafting.'],
  ['kappa-protocol', 'Kappa Protocol', -12, 'Immediately receive the Secure container Kappa.'],
  ['prodigy', 'Prodigy', -5, 'Skill experience gain is increased by 30%.'],
  ['lucky', 'Lucky', -1, 'Audentes fortuna iuvat!'],
  ['safecracker', 'Safecracker', -5, 'Mechanical keys have a 25% chance not to lose durability.'],
  ['sailors-nostalgia', "Sailor's Nostalgia", -2, 'Canned fish grants Health Regeneration (+2) for 30 seconds.'],
  ['youth', 'Youth', -5, 'Energy drains 20% slower and arm and leg stamina is increased by 10.'],
  ['hercules', 'Hercules', -5, 'Strength and Endurance start at level 15.'],
  ['sprinter', 'Sprinter', -3, 'Running speed is increased by 5%.']
].map(([id, name, points, effect]) => ({
  id,
  name,
  points,
  effect,
  icon: `/images/kord-breach/perks/${id}.webp`,
  type: 'positive',
  verified: true
}));

export const NEGATIVE_MODIFIERS = [
  ['hemophilia', 'Hemophilia', 2, 'Bleeding chance is increased by 25%.'],
  ['osteoporosis', 'Osteoporosis', 3, 'Fracture chance is increased by 25% and falling damage by 20%.'],
  ['well-that-hurt', 'Well That Hurt!', 2, 'All medkit uses consume 25% more resource.'],
  ['incompetent', 'Incompetent', 10, 'Most skills level 25% slower and are capped at level 30.'],
  ['polydipsia', 'Polydipsia', 2, 'Hydration is consumed 15% faster.'],
  ['chronic-fatigue', 'Chronic Fatigue Syndrome', 2, 'Energy is consumed 20% faster.'],
  ['personality-vacuum', 'Personality Vacuum', 2, 'Charisma cannot increase and trader items cost 20% more.'],
  ['dr-jekyll', 'Dr. Jekyll', 1, 'Fresh Wound status cannot be removed before the raid ends.'],
  ['allergic', 'Allergic', 3, 'Become allergic to three random Provision or Medication items.'],
  ['broken-secure-container', 'Broken Secure Container', 6, 'The secure container only accepts restricted item categories.'],
  ['no-flea-market', 'No Flea Market', 10, 'Trading with players on the Flea Market is disabled.'],
  ['third-leg', 'Third Leg', 1, 'Movement speed is reduced by 1%, but Therapist prices are 5% cheaper.'],
  ['unlucky', 'Unlucky', 1, 'Bad luck can sometimes have dire consequences.'],
  ['exhaustion', 'Exhaustion', 5, 'Arm and leg stamina recover 20% slower and are reduced by 10.']
].map(([id, name, points, effect]) => ({
  id,
  name,
  points,
  effect,
  icon: `/images/kord-breach/perks/${id}.webp`,
  type: 'negative',
  verified: true
}));

export const DISCOVERED_MODIFIERS = [];

export const PERSONAL_MODIFIERS = [
  ...POSITIVE_MODIFIERS,
  ...NEGATIVE_MODIFIERS,
  ...DISCOVERED_MODIFIERS
];

export const calculateModifierBalance = (selectedIds = []) => {
  const selected = new Set(selectedIds);
  return PERSONAL_MODIFIERS.reduce(
    (total, modifier) => selected.has(modifier.id) && Number.isFinite(modifier.points)
      ? total + modifier.points
      : total,
    0
  );
};

export const BATTLE_PASS_DOCUMENTS = [
  { id: '6a317b9692cfdcddcb02a58e', name: 'PMC personnel files', maps: ['Reserve', 'Lighthouse', 'Icebreaker'] },
  { id: '6a31807f17005505b70d5827', name: 'Financial documents', maps: ['Customs', 'Streets of Tarkov', 'Interchange'] },
  { id: '6a3181f178450ec91c0ea1aa', name: 'Project documentation', maps: ['Factory', 'Reserve', 'Customs'] },
  { id: '6a31824878450ec91c0ea1ae', name: 'Blueprints and technical documentation', maps: ['Interchange', 'Factory', 'The Labyrinth'] },
  { id: '6a31828557705071410ca00e', name: 'Test documentation', maps: ['Shoreline', 'Woods', 'Icebreaker'] },
  { id: '6a3182b72fd891345e047eef', name: 'User documentation', maps: ['Ground Zero', 'Streets of Tarkov', 'The Lab'] },
  { id: '6a3182dc6cd8de21cf0a3a7d', name: 'Medical documents', maps: ['The Lab', 'Ground Zero', 'The Labyrinth'] },
  { id: '6a31830dde69ceafd805afa0', name: 'Technical documentation', maps: ['Shoreline', 'Woods', 'Lighthouse'] },
  { id: '6a3183258f113efdb7093622', name: 'Classified documents', maps: ['Expansion Hub'], wildcard: true }
];

const DOC = {
  pmc: '6a317b9692cfdcddcb02a58e',
  financial: '6a31807f17005505b70d5827',
  project: '6a3181f178450ec91c0ea1aa',
  blueprints: '6a31824878450ec91c0ea1ae',
  test: '6a31828557705071410ca00e',
  user: '6a3182b72fd891345e047eef',
  medical: '6a3182dc6cd8de21cf0a3a7d',
  technical: '6a31830dde69ceafd805afa0',
  classified: '6a3183258f113efdb7093622'
};

const req = (...entries) => entries.map(([documentId, count]) => ({ documentId, count }));

const ASSETS = {
  tarcoin: 'https://assets.tarkov.dev/69dd0de23dfe95d9e70b5ebb-512.webp',
  crate: 'https://assets.tarkov.dev/6a3567f687d90a0deb066c1b-512.webp',
  dogtagFerrum: 'https://assets.tarkov.dev/6a461aed7391ab085a093760-512.webp',
  dogtagGreen: 'https://assets.tarkov.dev/6a461bf82b2264dbe10d0ee6-512.webp',
  dogtagRed: 'https://assets.tarkov.dev/6a461c41ec88c6b9a509fb17-512.webp',
  sotr: 'https://assets.tarkov.dev/689b404db49f27df1c0873f6-512.webp',
  niceFrame: 'https://assets.tarkov.dev/68947ad3e4bf255d1b0ca75c-512.webp',
  knife: 'https://assets.tarkov.dev/6a39358c658f5889ba050ef3-512.webp',
  fcpc: 'https://assets.tarkov.dev/689479cb47e5acd1e10be986-512.webp',
  lv119: 'https://assets.tarkov.dev/689479eb30cc5ba7be00f5ff-512.webp',
  backpack: 'https://assets.tarkov.dev/68947a8ce4bf255d1b0ca759-512.webp',
  burnPoster: '/images/kord-breach/battle-pass/burn-poster.webp',
  seasonOneBackground: '/images/kord-breach/battle-pass/season-one-background.webp',
  orangeHawaii: '/images/kord-breach/battle-pass/orange-hawaii.webp',
  scorpionTarget: '/images/kord-breach/battle-pass/scorpion-target.webp',
  blackDivisionTarget: '/images/kord-breach/battle-pass/black-division-target.webp',
  wireframeBackground: '/images/kord-breach/battle-pass/wireframe-background.webp',
  pageThreePose: '/images/kord-breach/battle-pass/throat-pose.webp',
  bewareTheBearPoster: '/images/kord-breach/battle-pass/beware-the-bear-poster.webp',
  knyazev: '/images/kord-breach/battle-pass/knyazev.webp',
  oconnor: '/images/kord-breach/battle-pass/oconnor.webp',
  howaType20: '/images/kord-breach/battle-pass/howa-type-20.webp',
  scorpionUpper: '/images/kord-breach/battle-pass/scorpion-upper.webp',
  scorpionLower: '/images/kord-breach/battle-pass/scorpion-lower.webp',
  whiteAccentWalls: '/images/kord-breach/battle-pass/white-accent-walls.webp',
  arch: '/images/kord-breach/battle-pass/arch.webp',
  dome: '/images/kord-breach/battle-pass/dome.webp',
  severnayaBackground: '/images/kord-breach/battle-pass/severnaya-background.webp',
  anton: '/images/kord-breach/battle-pass/anton.webp',
  garrett: '/images/kord-breach/battle-pass/garrett.webp',
  knyazevAfterBattle: '/images/kord-breach/battle-pass/knyazev-after-battle.webp',
  oconnorAfterBattle: '/images/kord-breach/battle-pass/oconnor-after-battle.webp',
  qbz191: '/images/kord-breach/battle-pass/qbz-191.webp',
  nocturnalUpper: '/images/kord-breach/battle-pass/nocturnal-upper.webp',
  nocturnalLower: '/images/kord-breach/battle-pass/nocturnal-lower.webp',
  dogtagBitten: '/images/kord-breach/battle-pass/dogtag-bitten.webp'
};

const reward = (page, number, name, nameEs, type, requirements, imageLink = '', nameVerified = true) => ({
  id: `overview-bp-${String(number).padStart(3, '0')}`,
  page,
  position: ((number - 1) % 5) + 1,
  name,
  nameEs,
  type,
  requirements,
  imageLink,
  nameVerified,
  verifiedRequirements: Array.isArray(requirements)
});

// Dataset transcribed from the in-game KORD BREACH Battle Pass. Requirements
// that are no longer visible on completed pages deliberately remain null.
export const BATTLE_PASS_REWARDS = [
  reward(1, 1, 'Dogtag', 'Dogtag', 'dogtag', req(
    [DOC.financial, 1]
  ), ASSETS.dogtagFerrum),
  reward(1, 2, 'TarCoins (50)', 'TarCoins (50)', 'currency', req(
    [DOC.project, 2], [DOC.pmc, 1]
  ), ASSETS.tarcoin),
  reward(1, 3, 'Burn Poster', 'Póster BURN', 'hideout', req(
    [DOC.financial, 2], [DOC.blueprints, 1]
  ), ASSETS.burnPoster),
  reward(1, 4, 'Black Division Gear Crate', 'Caja de equipo de Black Division', 'container', req(
    [DOC.test, 2], [DOC.financial, 1]
  ), ASSETS.crate),
  reward(1, 5, 'Black Wood Ceiling', 'Techo de madera negra', 'hideout customization', req(
    [DOC.blueprints, 2], [DOC.project, 2], [DOC.medical, 1]
  ), ASSETS.seasonOneBackground),

  reward(2, 6, 'Gentex Ops-Core SOTR Respirator', 'Respirador Gentex Ops-Core SOTR', 'equipment', req(
    [DOC.medical, 2], [DOC.test, 2]
  ), ASSETS.sotr),
  reward(2, 7, 'Red Hawaii', 'Red Hawaii', 'clothing', req(
    [DOC.project, 3], [DOC.financial, 3], [DOC.medical, 1]
  ), ASSETS.orangeHawaii),
  reward(2, 8, 'Black Division Gear Crate', 'Caja de equipo de Black Division', 'container', req(
    [DOC.financial, 3]
  ), ASSETS.crate),
  reward(2, 9, 'Scorpion Target', 'Blanco de escorpión', 'hideout customization', req(
    [DOC.blueprints, 1], [DOC.pmc, 1], [DOC.test, 1]
  ), ASSETS.scorpionTarget),
  reward(2, 10, 'TarCoins (50)', 'TarCoins (50)', 'currency', req(
    [DOC.classified, 2], [DOC.project, 1]
  ), ASSETS.tarcoin),

  reward(3, 11, 'Mystery Ranch NICE Frame Load Sling', 'Mochila Mystery Ranch NICE Frame Load Sling', 'equipment', req(
    [DOC.blueprints, 2], [DOC.pmc, 1], [DOC.test, 1]
  ), ASSETS.niceFrame),
  reward(3, 12, 'Black Division Gear Crate', 'Caja de equipo de Black Division', 'container', req(
    [DOC.pmc, 2], [DOC.test, 2], [DOC.blueprints, 1]
  ), ASSETS.crate),
  reward(3, 13, 'Black Herringbone', 'Suelo Black Herringbone', 'hideout customization', req(
    [DOC.project, 2], [DOC.test, 2], [DOC.user, 2], [DOC.classified, 1]
  ), ASSETS.wireframeBackground),
  reward(3, 14, 'TarCoins (50)', 'TarCoins (50)', 'currency', req(
    [DOC.project, 2], [DOC.financial, 2], [DOC.pmc, 1]
  ), ASSETS.tarcoin),
  reward(3, 15, 'Heart', 'Corazón', 'pose', req(
    [DOC.medical, 2], [DOC.test, 1], [DOC.pmc, 1]
  ), ASSETS.pageThreePose),

  reward(4, 16, 'Dogtag', 'Dogtag', 'dogtag', req(
    [DOC.project, 2], [DOC.blueprints, 2], [DOC.test, 1]
  ), ASSETS.dogtagGreen),
  reward(4, 17, 'Microtech Jagdkommando Knife', 'Cuchillo Microtech Jagdkommando', 'weapon', req(
    [DOC.blueprints, 4], [DOC.classified, 3], [DOC.financial, 2], [DOC.pmc, 1]
  ), ASSETS.knife),
  reward(4, 18, 'TarCoins (50)', 'TarCoins (50)', 'currency', req(
    [DOC.classified, 3], [DOC.user, 2]
  ), ASSETS.tarcoin),
  reward(4, 19, 'Beware the Bear Poster', 'Póster Beware the Bear', 'hideout', req(
    [DOC.test, 2], [DOC.financial, 2], [DOC.blueprints, 1]
  ), ASSETS.bewareTheBearPoster),
  reward(4, 20, 'Black Division Gear Crate', 'Caja de equipo de Black Division', 'container', req(
    [DOC.technical, 2], [DOC.medical, 2], [DOC.pmc, 1]
  ), ASSETS.crate),

  reward(5, 21, 'Orange Hawaii', 'Orange Hawaii', 'clothing', req(
    [DOC.financial, 3], [DOC.technical, 2], [DOC.user, 2], [DOC.project, 2], [DOC.test, 1]
  ), ASSETS.orangeHawaii),
  reward(5, 22, 'TarCoins (50)', 'TarCoins (50)', 'currency', req(
    [DOC.blueprints, 4], [DOC.financial, 1], [DOC.project, 1], [DOC.pmc, 1]
  ), ASSETS.tarcoin),
  reward(5, 23, 'Black Division target', 'Blanco de Black Division', 'hideout', req(
    [DOC.pmc, 2], [DOC.medical, 2], [DOC.blueprints, 1]
  ), ASSETS.blackDivisionTarget),
  reward(5, 24, 'Black Division gear crate', 'Caja de equipo de Black Division', 'container', req(
    [DOC.test, 3], [DOC.technical, 2], [DOC.user, 1]
  ), ASSETS.crate),
  reward(5, 25, 'Ferro Concepts FCPC V5 Plate Carrier (Black Division)', 'Portaplacas Ferro Concepts FCPC V5 (Black Division)', 'equipment', req(
    [DOC.project, 3], [DOC.blueprints, 2], [DOC.user, 2]
  ), ASSETS.fcpc),

  reward(6, 26, 'Knyazev', 'Knyazev', 'appearance', req(
    [DOC.blueprints, 4], [DOC.technical, 4], [DOC.medical, 3], [DOC.test, 2]
  ), ASSETS.knyazev),
  reward(6, 27, "O'Connor", "O'Connor", 'appearance', req(
    [DOC.project, 4], [DOC.blueprints, 3], [DOC.pmc, 3], [DOC.technical, 2]
  ), ASSETS.oconnor),
  reward(6, 28, 'Howa Type 20 5.56x45 assault rifle', 'Fusil de asalto Howa Type 20 5.56x45', 'weapon', req(
    [DOC.financial, 6], [DOC.project, 2], [DOC.pmc, 2], [DOC.user, 1]
  ), ASSETS.howaType20),

  reward(7, 29, 'Dogtag', 'Dogtag', 'dogtag', req(
    [DOC.user, 5], [DOC.project, 3], [DOC.blueprints, 2]
  ), ASSETS.dogtagRed),
  reward(7, 30, 'TarCoins (50)', 'TarCoins (50)', 'currency', req(
    [DOC.technical, 4], [DOC.test, 3], [DOC.medical, 2]
  ), ASSETS.tarcoin),
  reward(7, 31, 'Scorpion Upper', 'Scorpion Upper', 'clothing', req(
    [DOC.pmc, 5], [DOC.financial, 3], [DOC.blueprints, 3], [DOC.technical, 2]
  ), ASSETS.scorpionUpper),
  reward(7, 32, 'Scorpion Lower', 'Scorpion Lower', 'clothing', req(
    [DOC.test, 5], [DOC.pmc, 3], [DOC.user, 3], [DOC.project, 2]
  ), ASSETS.scorpionLower),

  reward(8, 33, 'Black Division gear crate', 'Caja de equipo de Black Division', 'container', req(
    [DOC.technical, 2], [DOC.test, 2], [DOC.user, 2]
  ), ASSETS.crate),
  reward(8, 34, 'TarCoins (50)', 'TarCoins (50)', 'currency', req(
    [DOC.blueprints, 5], [DOC.financial, 4], [DOC.user, 4], [DOC.technical, 1]
  ), ASSETS.tarcoin),
  reward(8, 35, 'White Accent Walls', 'Paredes White Accent', 'hideout', req(
    [DOC.financial, 6], [DOC.pmc, 3], [DOC.technical, 2], [DOC.user, 2]
  ), ASSETS.whiteAccentWalls),
  reward(8, 36, 'Arch', 'Arch', 'pose', req(
    [DOC.user, 3], [DOC.medical, 2], [DOC.financial, 1]
  ), ASSETS.arch),
  reward(8, 37, 'Dome', 'Dome', 'pose', req(
    [DOC.pmc, 1], [DOC.blueprints, 2], [DOC.project, 1]
  ), ASSETS.dome),

  reward(9, 38, 'Spiritus Systems LV-119 Plate Carrier (Black Division V2)', 'Portaplacas Spiritus Systems LV-119 (Black Division V2)', 'equipment', req(
    [DOC.medical, 4], [DOC.user, 4], [DOC.blueprints, 2], [DOC.test, 2]
  ), ASSETS.lv119),
  reward(9, 39, 'TarCoins (50)', 'TarCoins (50)', 'currency', req(
    [DOC.medical, 3], [DOC.financial, 2], [DOC.project, 1]
  ), ASSETS.tarcoin),
  reward(9, 40, 'Tasmanian Tiger Modular Pack 45 Plus (MultiCam Black)', 'Mochila Tasmanian Tiger Modular Pack 45 Plus (MultiCam Black)', 'equipment', req(
    [DOC.test, 5], [DOC.financial, 2], [DOC.project, 2]
  ), ASSETS.backpack),
  reward(9, 41, 'Black Division gear crate', 'Caja de equipo de Black Division', 'container', req(
    [DOC.technical, 2], [DOC.test, 2], [DOC.user, 1]
  ), ASSETS.crate),
  reward(9, 42, 'Северная', 'Северная · fondo del menú', 'background', req(
    [DOC.technical, 6], [DOC.pmc, 4], [DOC.project, 4], [DOC.user, 2], [DOC.blueprints, 2]
  ), ASSETS.severnayaBackground),

  reward(10, 43, 'Anton', 'Anton', 'voice', req(
    [DOC.user, 6], [DOC.project, 5], [DOC.technical, 5], [DOC.medical, 2], [DOC.financial, 2]
  ), ASSETS.anton),
  reward(10, 44, 'Garrett', 'Garrett', 'voice', req(
    [DOC.pmc, 6], [DOC.medical, 5], [DOC.financial, 5], [DOC.user, 2], [DOC.project, 2]
  ), ASSETS.garrett),
  reward(10, 45, 'Black Division gear crate', 'Caja de equipo de Black Division', 'container', req(
    [DOC.pmc, 3], [DOC.project, 3], [DOC.technical, 1]
  ), ASSETS.crate),
  reward(10, 46, 'TarCoins (100)', 'TarCoins (100)', 'currency', req(
    [DOC.technical, 5], [DOC.blueprints, 4], [DOC.project, 2], [DOC.medical, 2]
  ), ASSETS.tarcoin),

  reward(11, 47, 'Dogtag', 'Dogtag', 'dogtag', req(
    [DOC.project, 4], [DOC.financial, 3], [DOC.user, 2], [DOC.pmc, 2]
  ), ASSETS.dogtagBitten),
  reward(11, 48, 'TarCoins (150)', 'TarCoins (150)', 'currency', req(
    [DOC.pmc, 5], [DOC.test, 5], [DOC.user, 3], [DOC.project, 3]
  ), ASSETS.tarcoin),
  reward(11, 49, 'Knyazev (After Battle)', 'Knyazev (After Battle)', 'appearance', req(
    [DOC.blueprints, 5], [DOC.project, 5], [DOC.test, 3], [DOC.technical, 3], [DOC.user, 3]
  ), ASSETS.knyazevAfterBattle),
  reward(11, 50, "O'Connor (After Battle)", "O'Connor (After Battle)", 'appearance', req(
    [DOC.user, 5], [DOC.medical, 5], [DOC.test, 3], [DOC.financial, 3], [DOC.blueprints, 3]
  ), ASSETS.oconnorAfterBattle),

  reward(12, 51, 'Norinco QBZ-191 5.8x42 assault rifle', 'Fusil de asalto Norinco QBZ-191 5.8x42', 'weapon', req(
    [DOC.financial, 29]
  ), ASSETS.qbz191),
  reward(12, 52, 'Nocturnal Upper', 'Nocturnal Upper', 'clothing', req(
    [DOC.project, 6], [DOC.medical, 5], [DOC.user, 5], [DOC.test, 4], [DOC.pmc, 3], [DOC.financial, 2]
  ), ASSETS.nocturnalUpper),
  reward(12, 53, 'Nocturnal Lower', 'Nocturnal Lower', 'clothing', req(
    [DOC.financial, 6], [DOC.test, 5], [DOC.medical, 5], [DOC.project, 4], [DOC.user, 3]
  ), ASSETS.nocturnalLower)
];

export const BATTLE_PASS_PAGES = Array.from({ length: 12 }, (_, index) => {
  const page = index + 1;
  return {
    page,
    rewards: BATTLE_PASS_REWARDS.filter((rewardItem) => rewardItem.page === page)
  };
});

export const BATTLE_PASS_SEARCH_TAGS = [
  { id: 'tarcoins', types: ['currency'] },
  { id: 'clothing', types: ['clothing', 'appearance', 'voice'] },
  { id: 'gear', types: ['equipment'] },
  { id: 'hideout', types: ['hideout', 'hideout customization', 'background', 'pose'] },
  { id: 'crates', types: ['container'] },
  { id: 'dogtags', types: ['dogtag'] },
  { id: 'weapons', types: ['weapon'] }
];

const BATTLE_PASS_SEARCH_ALIASES = {
  tarcoins: ['tarcoin', 'tarcoins', 'currency', 'moneda', 'monedas'],
  clothing: ['clothing', 'clothes', 'ropa', 'appearance', 'apariencia', 'voice', 'voz'],
  gear: ['gear', 'equipment', 'equipo', 'equipamiento', 'armor', 'armadura'],
  hideout: ['hideout', 'refugio', 'customization', 'personalizacion', 'background', 'fondo', 'ceiling', 'techo', 'floor', 'suelo', 'walls', 'paredes', 'pose'],
  crates: ['crate', 'crates', 'container', 'caja', 'cajas', 'contenedor'],
  dogtags: ['dogtag', 'dogtags', 'chapa', 'chapas'],
  weapons: ['weapon', 'weapons', 'arma', 'armas', 'rifle', 'fusil', 'knife', 'cuchillo']
};

const normalizeSearchText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

export const getBattlePassRewardTags = (reward) => BATTLE_PASS_SEARCH_TAGS
  .filter((tag) => tag.types.includes(reward.type))
  .map((tag) => tag.id);

export const searchBattlePassRewards = ({ query = '', tag = 'all' } = {}) => {
  const normalizedQuery = normalizeSearchText(query);

  return BATTLE_PASS_REWARDS.filter((rewardItem) => {
    const rewardTags = getBattlePassRewardTags(rewardItem);
    if (tag !== 'all' && !rewardTags.includes(tag)) return false;
    if (!normalizedQuery) return true;

    const aliases = rewardTags.flatMap((rewardTag) => BATTLE_PASS_SEARCH_ALIASES[rewardTag] || []);
    const searchable = normalizeSearchText([
      rewardItem.name,
      rewardItem.nameEs,
      rewardItem.type,
      rewardItem.id.replace('overview-', ''),
      ...rewardTags,
      ...aliases
    ].join(' '));

    return searchable.includes(normalizedQuery);
  });
};

const getRewardNumber = (rewardItem) => Number(rewardItem?.id?.match(/(\d+)$/)?.[1] || 0);

export const getBattlePassProgressRequirements = (rewardIds = []) => {
  const requested = new Set(rewardIds);
  const targets = BATTLE_PASS_REWARDS.filter((rewardItem) => requested.has(rewardItem.id));
  const furthestReward = targets.reduce(
    (furthest, rewardItem) => getRewardNumber(rewardItem) > getRewardNumber(furthest)
      ? rewardItem
      : furthest,
    null
  );

  if (!furthestReward) {
    return {
      furthestReward: null,
      totals: [],
      knownTotal: 0,
      unverifiedRewards: []
    };
  }

  const furthestNumber = getRewardNumber(furthestReward);
  const totals = new Map();
  const unverifiedRewards = [];

  BATTLE_PASS_REWARDS
    .filter((rewardItem) => getRewardNumber(rewardItem) <= furthestNumber)
    .forEach((rewardItem) => {
      if (!rewardItem.verifiedRequirements) {
        unverifiedRewards.push(rewardItem);
        return;
      }

      rewardItem.requirements.forEach(({ documentId, count }) => {
        totals.set(documentId, (totals.get(documentId) || 0) + count);
      });
    });

  const totalEntries = [...totals.entries()].map(([documentId, count]) => ({ documentId, count }));
  return {
    furthestReward,
    totals: totalEntries,
    knownTotal: totalEntries.reduce((total, entry) => total + entry.count, 0),
    unverifiedRewards
  };
};
