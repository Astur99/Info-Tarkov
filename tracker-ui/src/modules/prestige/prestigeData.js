import prestige1Icon from '../../assets/prestiges/prestige_1.png';
import prestige2Icon from '../../assets/prestiges/prestige_2.png';
import prestige3Icon from '../../assets/prestiges/prestige_3.png';
import prestige4Icon from '../../assets/prestiges/prestige_4.png';
import prestige5Icon from '../../assets/prestiges/prestige_5.png';
import prestige6Icon from '../../assets/prestiges/prestige_6.png';

export const STORAGE_KEY = 'info_tarkov_prestige_checklist';

export const prestigeIcons = {
  1: prestige1Icon,
  2: prestige2Icon,
  3: prestige3Icon,
  4: prestige4Icon,
  5: prestige5Icon,
  6: prestige6Icon
};

export const prestigeLevels = [
  {
    id: 'prestige-1',
    level: 1,
    pmcLevel: 25,
    moneyKey: 'p1',
    groups: {
      quests: ['p1Quest1'],
      story: ['notRequired'],
      skills: ['notRequired'],
      hideout: ['intelligenceCenter1', 'security2', 'restSpace2']
    },
    rewards: ['p1Reward1', 'p1Reward2', 'p1Reward3', 'p1Reward4', 'p1Reward5']
  },
  {
    id: 'prestige-2',
    level: 2,
    pmcLevel: 30,
    moneyKey: 'p2',
    groups: {
      quests: ['p2Quest1'],
      story: ['tour'],
      skills: ['strength10', 'endurance10', 'charisma7'],
      hideout: ['intelligenceCenter1', 'security2', 'restSpace2']
    },
    rewards: ['p2Reward1', 'p2Reward2', 'p2Reward3', 'p2Reward4', 'p2Reward5']
  },
  {
    id: 'prestige-3',
    level: 3,
    pmcLevel: 35,
    moneyKey: 'p3',
    groups: {
      quests: ['p3Quest1'],
      story: ['tour', 'fallingSkies'],
      skills: ['strength10', 'endurance10', 'charisma7'],
      hideout: ['intelligenceCenter1', 'security2', 'restSpace2']
    },
    rewards: ['p3Reward1', 'p3Reward2', 'p3Reward3', 'p3Reward4', 'p3Reward5']
  },
  {
    id: 'prestige-4',
    level: 4,
    pmcLevel: 40,
    moneyKey: 'p4',
    groups: {
      quests: ['p4Quest1'],
      story: ['tour', 'ticketFromTarkov'],
      skills: ['strength15', 'endurance15', 'charisma12'],
      hideout: ['intelligenceCenter1', 'security2', 'restSpace2']
    },
    rewards: ['p4Reward1', 'p4Reward2', 'p4Reward3', 'p4Reward4', 'p4Reward5']
  },
  {
    id: 'prestige-5',
    level: 5,
    pmcLevel: 47,
    moneyKey: 'p5',
    groups: {
      quests: ['p5Quest1', 'collector'],
      story: ['tour', 'theyAreAlreadyHere', 'ticketFromTarkov'],
      skills: ['strength20', 'endurance20', 'charisma20'],
      hideout: ['intelligenceCenter2', 'security3', 'restSpace3']
    },
    rewards: ['p5Reward1', 'p5Reward2', 'p5Reward3', 'p5Reward4', 'p5Reward5']
  },
  {
    id: 'prestige-6',
    level: 6,
    pmcLevel: 47,
    moneyKey: 'p6',
    groups: {
      quests: ['p6Quest1', 'collector'],
      story: ['theTicket'],
      skills: ['strength20', 'endurance20', 'charisma20'],
      hideout: ['intelligenceCenter2', 'security3', 'restSpace3']
    },
    rewards: ['p6Reward1', 'p6Reward2', 'p6Reward3', 'p6Reward4', 'p6Reward5']
  }
];

export const requirementGroups = [
  { key: 'quests', labelKey: 'quests' },
  { key: 'story', labelKey: 'story' },
  { key: 'skills', labelKey: 'skills' },
  { key: 'hideout', labelKey: 'hideout' }
];
