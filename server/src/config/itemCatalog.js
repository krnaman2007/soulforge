/**
 * SoulForge Curated Cosmetic Shop Catalog
 * Purely aesthetic, zero pay-to-win.
 * Types: AVATAR, THEME, SKIN, FRAME, TITLE, WEAPON, PET, BACKGROUND, EFFECT
 * Rarities: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
 */

const ITEM_CATALOG = [
  // ==========================================
  // AVATARS
  // ==========================================
  {
    code: 'avatar_apprentice',
    name: 'Apprentice Sorcerer',
    description: 'Robes of the novice spellcaster, ready to weave productive habits.',
    type: 'AVATAR',
    rarity: 'COMMON',
    price: 50,
    metadata: {
      assetId: 'avatar_apprentice',
      icon: 'sparkle',
      color: '#4F46E5'
    }
  },
  {
    code: 'avatar_warrior',
    name: 'Valiant Knight',
    description: 'Battle-forged armor worn by adventurers who conquer their daily tasks.',
    type: 'AVATAR',
    rarity: 'COMMON',
    price: 75,
    metadata: {
      assetId: 'avatar_warrior',
      icon: 'shield',
      color: '#DC2626'
    }
  },
  {
    code: 'avatar_rogue',
    name: 'Shadow Infiltrator',
    description: 'Silent and swift, executing tasks before deadlines can detect them.',
    type: 'AVATAR',
    rarity: 'UNCOMMON',
    price: 150,
    metadata: {
      assetId: 'avatar_rogue',
      icon: 'dagger',
      color: '#10B981'
    }
  },
  {
    code: 'avatar_paladin',
    name: 'Luminous Paladin',
    description: 'Radiating golden discipline and unwavering focus across all quests.',
    type: 'AVATAR',
    rarity: 'RARE',
    price: 300,
    metadata: {
      assetId: 'avatar_paladin',
      icon: 'sun',
      color: '#F59E0B'
    }
  },
  {
    code: 'avatar_cyberpunk',
    name: 'Neo-Tokyo Cyber Ronin',
    description: 'Augmented digital warrior traversing the high-tech frontiers of achievement.',
    type: 'AVATAR',
    rarity: 'EPIC',
    price: 600,
    metadata: {
      assetId: 'avatar_cyberpunk',
      icon: 'cpu',
      color: '#EC4899'
    }
  },
  {
    code: 'avatar_dragonlord',
    name: 'Ancient Dragon Lord',
    description: 'Mythical sovereign crowned with draconic majesty and eternal resolve.',
    type: 'AVATAR',
    rarity: 'LEGENDARY',
    price: 1200,
    metadata: {
      assetId: 'avatar_dragonlord',
      icon: 'flame',
      color: '#8B5CF6'
    }
  },

  // ==========================================
  // THEMES (Color Palettes & UI Modes)
  // ==========================================
  {
    code: 'theme_midnight',
    name: 'Midnight Sapphire',
    description: 'Deep royal blue dark mode with celestial accent lighting.',
    type: 'THEME',
    rarity: 'COMMON',
    price: 50,
    metadata: {
      assetId: 'theme_midnight',
      primaryColor: '#1E3A8A',
      accentColor: '#38BDF8',
      background: '#0F172A'
    }
  },
  {
    code: 'theme_forest',
    name: 'Emerald Grove',
    description: 'Calming botanical green sanctuary engineered for deep work sessions.',
    type: 'THEME',
    rarity: 'UNCOMMON',
    price: 100,
    metadata: {
      assetId: 'theme_forest',
      primaryColor: '#065F46',
      accentColor: '#34D399',
      background: '#064E3B'
    }
  },
  {
    code: 'theme_crimson',
    name: 'Blood Moon Berserker',
    description: 'High-intensity crimson theme for crushing tough deadlines.',
    type: 'THEME',
    rarity: 'RARE',
    price: 250,
    metadata: {
      assetId: 'theme_crimson',
      primaryColor: '#991B1B',
      accentColor: '#F87171',
      background: '#450A0A'
    }
  },
  {
    code: 'theme_synthwave',
    name: 'Neon Synthwave',
    description: 'Vibrant 80s retro-futurism with glowing magenta and cyan gradients.',
    type: 'THEME',
    rarity: 'EPIC',
    price: 500,
    metadata: {
      assetId: 'theme_synthwave',
      primaryColor: '#D946EF',
      accentColor: '#06B6D4',
      background: '#18002E'
    }
  },
  {
    code: 'theme_celestial',
    name: 'Cosmic Nebula',
    description: 'Astral starlight theme featuring deep violet and iridescent glow.',
    type: 'THEME',
    rarity: 'LEGENDARY',
    price: 1000,
    metadata: {
      assetId: 'theme_celestial',
      primaryColor: '#7C3AED',
      accentColor: '#A78BFA',
      background: '#090514'
    }
  },

  // ==========================================
  // FRAMES (Avatar Borders)
  // ==========================================
  {
    code: 'frame_iron',
    name: 'Reinforced Iron Border',
    description: 'Sturdy metallic frame symbolizing dependable consistency.',
    type: 'FRAME',
    rarity: 'COMMON',
    price: 50,
    metadata: {
      assetId: 'frame_iron',
      borderStyle: 'solid 2px #6B7280'
    }
  },
  {
    code: 'frame_silver',
    name: 'Polished Elven Silver',
    description: 'Intricately etched silver border awarded to adept scholars.',
    type: 'FRAME',
    rarity: 'UNCOMMON',
    price: 125,
    metadata: {
      assetId: 'frame_silver',
      borderStyle: 'solid 2px #94A3B8'
    }
  },
  {
    code: 'frame_gold',
    name: 'Gilded Imperial Triumph',
    description: 'Pure gold filigree celebrating royal achievements.',
    type: 'FRAME',
    rarity: 'RARE',
    price: 275,
    metadata: {
      assetId: 'frame_gold',
      borderStyle: 'solid 3px #FBBF24'
    }
  },
  {
    code: 'frame_arcane',
    name: 'Pulsing Arcane Sigil',
    description: 'Mystic runes circulating in rhythmic ultraviolet luminescence.',
    type: 'FRAME',
    rarity: 'EPIC',
    price: 550,
    metadata: {
      assetId: 'frame_arcane',
      borderStyle: 'solid 3px #A855F7',
      glow: true
    }
  },
  {
    code: 'frame_void',
    name: 'Event Horizon Graviton',
    description: 'Distorting dark matter singularity framing the legendary player.',
    type: 'FRAME',
    rarity: 'LEGENDARY',
    price: 1100,
    metadata: {
      assetId: 'frame_void',
      borderStyle: 'solid 3px #6366F1',
      animated: true
    }
  },

  // ==========================================
  // TITLES (Display Badges / Prefixes)
  // ==========================================
  {
    code: 'title_disciplined',
    name: 'Title: The Resilient',
    description: 'Honors adventurers who refuse to let setbacks break their streak.',
    type: 'TITLE',
    rarity: 'COMMON',
    price: 60,
    metadata: {
      displayTitle: 'The Resilient',
      badgeColor: '#10B981'
    }
  },
  {
    code: 'title_seeker',
    name: 'Title: Seeker of Truth',
    description: 'Reserved for intellectuals pursuing lifelong mastery.',
    type: 'TITLE',
    rarity: 'UNCOMMON',
    price: 140,
    metadata: {
      displayTitle: 'Seeker of Truth',
      badgeColor: '#3B82F6'
    }
  },
  {
    code: 'title_stormcaller',
    name: 'Title: Stormcaller',
    description: 'Proclaims your ability to summon unstoppable productivity bursts.',
    type: 'TITLE',
    rarity: 'RARE',
    price: 300,
    metadata: {
      displayTitle: 'Stormcaller',
      badgeColor: '#F59E0B'
    }
  },
  {
    code: 'title_immortal',
    name: 'Title: The Indomitable',
    description: 'Proof of unwavering fortitude across epic questlines.',
    type: 'TITLE',
    rarity: 'EPIC',
    price: 650,
    metadata: {
      displayTitle: 'The Indomitable',
      badgeColor: '#EC4899'
    }
  },
  {
    code: 'title_mythic',
    name: 'Title: Architect of Destiny',
    description: 'Supreme honor bestowed upon those who forge their own reality.',
    type: 'TITLE',
    rarity: 'LEGENDARY',
    price: 1500,
    metadata: {
      displayTitle: 'Architect of Destiny',
      badgeColor: '#8B5CF6'
    }
  },

  // ==========================================
  // WEAPONS (Equipped Cosmetic Armament)
  // ==========================================
  {
    code: 'weapon_iron_blade',
    name: 'Sturdy Iron Longsword',
    description: 'Reliable weapon for cleaving through daily backlogs.',
    type: 'WEAPON',
    rarity: 'COMMON',
    price: 75,
    metadata: {
      assetId: 'weapon_iron_blade',
      weaponType: 'SWORD'
    }
  },
  {
    code: 'weapon_arcane_wand',
    name: 'Glowstone Focus Wand',
    description: 'Focuses intent and transforms complex problems into clear tasks.',
    type: 'WEAPON',
    rarity: 'UNCOMMON',
    price: 160,
    metadata: {
      assetId: 'weapon_arcane_wand',
      weaponType: 'WAND'
    }
  },
  {
    code: 'weapon_shadow_daggers',
    name: 'Twin Shadowfang Daggers',
    description: 'Strikes tasks swiftly with surgical precision.',
    type: 'WEAPON',
    rarity: 'RARE',
    price: 320,
    metadata: {
      assetId: 'weapon_shadow_daggers',
      weaponType: 'DAGGERS'
    }
  },
  {
    code: 'weapon_sunforged_claymore',
    name: 'Sunforged Greatsword',
    description: 'Blazing with solar fire, vanquishing procrastination.',
    type: 'WEAPON',
    rarity: 'EPIC',
    price: 700,
    metadata: {
      assetId: 'weapon_sunforged_claymore',
      weaponType: 'GREATSWORD'
    }
  },
  {
    code: 'weapon_aegis_infinity',
    name: 'Infinity Relic of the Ancients',
    description: 'Artifact of boundless power radiating cosmic sovereignty.',
    type: 'WEAPON',
    rarity: 'LEGENDARY',
    price: 1400,
    metadata: {
      assetId: 'weapon_aegis_infinity',
      weaponType: 'RELIC'
    }
  },

  // ==========================================
  // PETS (Companions)
  // ==========================================
  {
    code: 'pet_fox',
    name: 'Spirit Ember Fox',
    description: 'Playful spirit companion that scampers beside you while you study.',
    type: 'PET',
    rarity: 'UNCOMMON',
    price: 180,
    metadata: {
      assetId: 'pet_fox',
      species: 'Fox',
      animation: 'idle_bounce'
    }
  },
  {
    code: 'pet_owl',
    name: 'Chrono Wisdom Owl',
    description: 'Wise avian companion that watches over focused Pomodoro timers.',
    type: 'PET',
    rarity: 'RARE',
    price: 350,
    metadata: {
      assetId: 'pet_owl',
      species: 'Owl',
      animation: 'perch_observe'
    }
  },
  {
    code: 'pet_dragonling',
    name: 'Nebula Dragonling',
    description: 'Baby celestial dragon curling around your character card.',
    type: 'PET',
    rarity: 'EPIC',
    price: 750,
    metadata: {
      assetId: 'pet_dragonling',
      species: 'Dragon',
      animation: 'hover_flame'
    }
  },
  {
    code: 'pet_phoenix',
    name: 'Eternal Solar Phoenix',
    description: 'Majestic bird of rebirth symbolizing unbroken streak recovery.',
    type: 'PET',
    rarity: 'LEGENDARY',
    price: 1600,
    metadata: {
      assetId: 'pet_phoenix',
      species: 'Phoenix',
      animation: 'soar_radiate'
    }
  },

  // ==========================================
  // SKINS (Armor / Attire Overlays)
  // ==========================================
  {
    code: 'skin_runic_armor',
    name: 'Carved Runic Plate Armor',
    description: 'Heavy protective plate engraved with runes of endurance.',
    type: 'SKIN',
    rarity: 'RARE',
    price: 300,
    metadata: {
      assetId: 'skin_runic_armor',
      slot: 'BODY'
    }
  },
  {
    code: 'skin_void_shroud',
    name: 'Shadow Voidwalker Shroud',
    description: 'Cloak that dissolves edges into shadowy particle mist.',
    type: 'SKIN',
    rarity: 'EPIC',
    price: 650,
    metadata: {
      assetId: 'skin_void_shroud',
      slot: 'CLOAK'
    }
  },
  {
    code: 'skin_astral_garb',
    name: 'Woven Starlight Regalia',
    description: 'Celestial fabric woven from the light of distant galaxies.',
    type: 'SKIN',
    rarity: 'LEGENDARY',
    price: 1300,
    metadata: {
      assetId: 'skin_astral_garb',
      slot: 'FULL_SET'
    }
  },

  // ==========================================
  // BACKGROUNDS (Profile Backdrops)
  // ==========================================
  {
    code: 'bg_citadel',
    name: 'Iron Citadel Skyline',
    description: 'Grand towers of the discipline fortress against sunrise.',
    type: 'BACKGROUND',
    rarity: 'COMMON',
    price: 80,
    metadata: {
      assetId: 'bg_citadel',
      backdropUrl: '/assets/bg/citadel.svg'
    }
  },
  {
    code: 'bg_whispering_woods',
    name: 'Misty Whispering Woods',
    description: 'Atmospheric enchanted forest background.',
    type: 'BACKGROUND',
    rarity: 'UNCOMMON',
    price: 160,
    metadata: {
      assetId: 'bg_whispering_woods',
      backdropUrl: '/assets/bg/woods.svg'
    }
  },
  {
    code: 'bg_astral_plane',
    name: 'Infinite Astral Realm',
    description: 'Panoramic cosmic expanse with orbiting celestial bodies.',
    type: 'BACKGROUND',
    rarity: 'EPIC',
    price: 600,
    metadata: {
      assetId: 'bg_astral_plane',
      backdropUrl: '/assets/bg/astral.svg'
    }
  },

  // ==========================================
  // EFFECTS (Auras / Particle Trails)
  // ==========================================
  {
    code: 'effect_ember_sparks',
    name: 'Floating Ember Sparks',
    description: 'Warm glowing fire embers drifting continuously around your avatar.',
    type: 'EFFECT',
    rarity: 'UNCOMMON',
    price: 150,
    metadata: {
      assetId: 'effect_ember_sparks',
      particleType: 'fire',
      particleColor: '#F97316'
    }
  },
  {
    code: 'effect_lightning_aura',
    name: 'Crackling Lightning Field',
    description: 'Arcs of static electricity bursting with high momentum energy.',
    type: 'EFFECT',
    rarity: 'RARE',
    price: 350,
    metadata: {
      assetId: 'effect_lightning_aura',
      particleType: 'lightning',
      particleColor: '#06B6D4'
    }
  },
  {
    code: 'effect_stardust',
    name: 'Celestial Stardust Cascade',
    description: 'Iridescent diamond stardust particles raining gently.',
    type: 'EFFECT',
    rarity: 'EPIC',
    price: 700,
    metadata: {
      assetId: 'effect_stardust',
      particleType: 'stardust',
      particleColor: '#A855F7'
    }
  }
];

module.exports = {
  ITEM_CATALOG
};
