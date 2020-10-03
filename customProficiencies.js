const DICT = require("./_data/dictionary");
const character = require("./_data/customs.json");

const data = { character: character.data };
console.log(data);

const getCharacterValueByAbilityAndType = (data, ability, type) => {
  return data.character.characterValues.find(
    cv =>
      cv.valueTypeId &&
      cv.valueTypeId === "1472902489" &&
      cv.typeId &&
      cv.typeId === type &&
      cv.valueId &&
      parseInt(cv.valueId) === ability.id &&
      cv.value
  );
};

const getSavingThrowProficiency = (ability, data) => {
  let value =
    data.character.modifiers.class.find(
      mod => mod.subType === ability.long + "-saving-throws" && mod.type === "proficiency"
    ) !== undefined
      ? 1
      : 0;

  // check for a custom saving throw proficiency set by the user, not coming from race/class
  const OVERIDE = 38;
  const MISC_BONUS = 39;
  const MAGIC_BONUS = 40;
  const PROFICIENCY_LEVEL = 41;

  let profiencyMod = getCharacterValueByAbilityAndType(data, ability, PROFICIENCY_LEVEL);

  const customSettings = {
    override: getCharacterValueByAbilityAndType(data, ability, OVERIDE),
    misc: getCharacterValueByAbilityAndType(data, ability, MISC_BONUS),
    magic: getCharacterValueByAbilityAndType(data, ability, MAGIC_BONUS),
    proficient: profiencyMod,
    proficiencyModifer:
      profiencyMod !== undefined
        ? DICT.character.customSkillProficiencies.find(
            customProficiency => customProficiency.value === profiencyMod.value
          ).proficient
        : 1,
  };
  let customValue = customSettings.override.value ? customSettings.override.value : 
  return customSettings;
};

DICT.character.abilities.forEach(ability => {
  console.log(ability);
  console.log("Ability: " + ability.long);
  console.log(getSavingThrowProficiency(ability, data));
});

const EntityTypeIds = [{ id: 1472902489, name: "Ability Score" }];

const Charactervalues = {
  typeIDs: [],
};

const proficiencyLevels = [
  { value: 1, name: "Not proficient" },
  { value: 2, name: "Half proficient" },
  { value: 3, name: "Proficient" },
  { value: 4, name: "Expertise" },
];

const proficiencies = [
  [
    {
      id: 1,
      name: "Armor",
      type: "existing",
      proficiencies: [
        {
          id: 3,
          name: "Studded Leather",
        },
        {
          id: 6,
          name: "Scale Mail",
        },
        {
          id: 8,
          name: "Shield",
        },
        {
          id: 9,
          name: "Padded",
        },
        {
          id: 10,
          name: "Leather",
        },
        {
          id: 11,
          name: "Hide",
        },
        {
          id: 12,
          name: "Chain Shirt",
        },
        {
          id: 13,
          name: "Breastplate",
        },
        {
          id: 14,
          name: "Half Plate",
        },
        {
          id: 15,
          name: "Ring Mail",
        },
        {
          id: 16,
          name: "Chain Mail",
        },
        {
          id: 17,
          name: "Splint",
        },
        {
          id: 18,
          name: "Plate",
        },
        {
          id: 19,
          name: "Spiked Armor",
        },
        {
          id: 20,
          name: "Pride Silk Outfit",
        },
      ],
    },
    {
      id: 2,
      name: "Weapon",
      type: "existing",
      proficiencies: [
        {
          id: 1,
          name: "Crossbow, Hand",
        },
        {
          id: 2,
          name: "Glaive",
        },
        {
          id: 3,
          name: "Dagger",
        },
        {
          id: 4,
          name: "Longsword",
        },
        {
          id: 5,
          name: "Club",
        },
        {
          id: 6,
          name: "Greatclub",
        },
        {
          id: 7,
          name: "Handaxe",
        },
        {
          id: 8,
          name: "Javelin",
        },
        {
          id: 10,
          name: "Light Hammer",
        },
        {
          id: 11,
          name: "Mace",
        },
        {
          id: 12,
          name: "Quarterstaff",
        },
        {
          id: 13,
          name: "Sickle",
        },
        {
          id: 14,
          name: "Spear",
        },
        {
          id: 15,
          name: "Crossbow, Light",
        },
        {
          id: 16,
          name: "Dart",
        },
        {
          id: 17,
          name: "Shortbow",
        },
        {
          id: 18,
          name: "Sling",
        },
        {
          id: 19,
          name: "Battleaxe",
        },
        {
          id: 20,
          name: "Flail",
        },
        {
          id: 21,
          name: "Greataxe",
        },
        {
          id: 22,
          name: "Greatsword",
        },
        {
          id: 23,
          name: "Halberd",
        },
        {
          id: 24,
          name: "Lance",
        },
        {
          id: 25,
          name: "Maul",
        },
        {
          id: 26,
          name: "Morningstar",
        },
        {
          id: 27,
          name: "Pike",
        },
        {
          id: 28,
          name: "Rapier",
        },
        {
          id: 29,
          name: "Scimitar",
        },
        {
          id: 30,
          name: "Shortsword",
        },
        {
          id: 31,
          name: "Trident",
        },
        {
          id: 32,
          name: "War Pick",
        },
        {
          id: 33,
          name: "Warhammer",
        },
        {
          id: 34,
          name: "Whip",
        },
        {
          id: 35,
          name: "Blowgun",
        },
        {
          id: 36,
          name: "Crossbow, Heavy",
        },
        {
          id: 37,
          name: "Longbow",
        },
        {
          id: 38,
          name: "Net",
        },
        {
          id: 40,
          name: "Boomerang",
        },
        {
          id: 41,
          name: "Yklwa",
        },
        {
          id: 42,
          name: "Pistol",
        },
        {
          id: 43,
          name: "Musket",
        },
        {
          id: 44,
          name: "Pistol, Automatic",
        },
        {
          id: 45,
          name: "Revolver",
        },
        {
          id: 46,
          name: "Rifle, Hunting",
        },
        {
          id: 47,
          name: "Rifle, Automatic",
        },
        {
          id: 48,
          name: "Shotgun",
        },
        {
          id: 49,
          name: "Laser Pistol",
        },
        {
          id: 50,
          name: "Antimatter Rifle",
        },
        {
          id: 51,
          name: "Laser Rifle",
        },
        {
          id: 52,
          name: "Palm Pistol",
        },
        {
          id: 53,
          name: "Pepperbox",
        },
        {
          id: 54,
          name: "Pistol (Exandria)",
        },
        {
          id: 55,
          name: "Blunderbuss",
        },
        {
          id: 56,
          name: "Bad News",
        },
        {
          id: 57,
          name: "Hand Mortar",
        },
        {
          id: 58,
          name: "Musket (Exandria)",
        },
        {
          id: 59,
          name: "Double-Bladed Scimitar",
        },
      ],
    },
    {
      id: 3,
      name: "Tool",
      type: "existing",
      proficiencies: [
        {
          id: 102,
          name: "Alchemist's Supplies",
        },
        {
          id: 103,
          name: "Brewer's Supplies",
        },
        {
          id: 104,
          name: "Calligrapher's Supplies",
        },
        {
          id: 105,
          name: "Carpenter's Tools",
        },
        {
          id: 106,
          name: "Cartographer's Tools",
        },
        {
          id: 107,
          name: "Cobbler's Tools",
        },
        {
          id: 108,
          name: "Cook's Utensils",
        },
        {
          id: 109,
          name: "Glassblower's Tools",
        },
        {
          id: 110,
          name: "Jeweler's Tools",
        },
        {
          id: 111,
          name: "Leatherworker's Tools",
        },
        {
          id: 112,
          name: "Mason's Tools",
        },
        {
          id: 113,
          name: "Painter's Supplies",
        },
        {
          id: 114,
          name: "Potter's Tools",
        },
        {
          id: 115,
          name: "Smith's Tools",
        },
        {
          id: 116,
          name: "Tinker's Tools",
        },
        {
          id: 117,
          name: "Weaver's Tools",
        },
        {
          id: 118,
          name: "Woodcarver's Tools",
        },
        {
          id: 119,
          name: "Disguise Kit",
        },
        {
          id: 120,
          name: "Forgery Kit",
        },
        {
          id: 121,
          name: "Dice Set",
        },
        {
          id: 122,
          name: "Playing Card Set",
        },
        {
          id: 123,
          name: "Herbalism Kit",
        },
        {
          id: 124,
          name: "Navigator's Tools",
        },
        {
          id: 125,
          name: "Poisoner's Kit",
        },
        {
          id: 126,
          name: "Thieves' Tools",
        },
        {
          id: 127,
          name: "Bagpipes",
        },
        {
          id: 128,
          name: "Drum",
        },
        {
          id: 129,
          name: "Dulcimer",
        },
        {
          id: 130,
          name: "Flute",
        },
        {
          id: 131,
          name: "Lute",
        },
        {
          id: 132,
          name: "Horn",
        },
        {
          id: 133,
          name: "Pan Flute",
        },
        {
          id: 134,
          name: "Shawm",
        },
        {
          id: 135,
          name: "Lyre",
        },
        {
          id: 136,
          name: "Viol",
        },
        {
          id: 189,
          name: "Three-Dragon Ante Set",
        },
        {
          id: 190,
          name: "Dragonchess Set",
        },
        {
          id: 232,
          name: "Birdpipes",
        },
        {
          id: 233,
          name: "Glaur",
        },
        {
          id: 234,
          name: "Hand Drum",
        },
        {
          id: 235,
          name: "Longhorn",
        },
        {
          id: 236,
          name: "Songhorn",
        },
        {
          id: 237,
          name: "Tantan",
        },
        {
          id: 238,
          name: "Thelarr",
        },
        {
          id: 239,
          name: "Tocken",
        },
        {
          id: 240,
          name: "Wargong",
        },
        {
          id: 241,
          name: "Yarting",
        },
        {
          id: 242,
          name: "Zulkoon",
        },
        {
          id: 301,
          name: "Whistle-Stick",
        },
      ],
    },
    {
      id: 4,
      name: "Language",
      type: "existing",
      proficiencies: [
        {
          id: 1,
          name: "Common",
        },
        {
          id: 2,
          name: "Dwarvish",
        },
        {
          id: 3,
          name: "Elvish",
        },
        {
          id: 4,
          name: "Giant",
        },
        {
          id: 5,
          name: "Gnomish",
        },
        {
          id: 6,
          name: "Goblin",
        },
        {
          id: 7,
          name: "Halfling",
        },
        {
          id: 8,
          name: "Orc",
        },
        {
          id: 9,
          name: "Abyssal",
        },
        {
          id: 10,
          name: "Celestial",
        },
        {
          id: 11,
          name: "Draconic",
        },
        {
          id: 12,
          name: "Deep Speech",
        },
        {
          id: 13,
          name: "Infernal",
        },
        {
          id: 14,
          name: "Primordial",
        },
        {
          id: 15,
          name: "Sylvan",
        },
        {
          id: 16,
          name: "Undercommon",
        },
        {
          id: 18,
          name: "Telepathy",
        },
        {
          id: 19,
          name: "Aquan",
        },
        {
          id: 20,
          name: "Auran",
        },
        {
          id: 21,
          name: "Ignan",
        },
        {
          id: 22,
          name: "Terran",
        },
        {
          id: 23,
          name: "Druidic",
        },
        {
          id: 24,
          name: "Giant Eagle",
        },
        {
          id: 25,
          name: "Giant Elk",
        },
        {
          id: 26,
          name: "Giant Owl",
        },
        {
          id: 27,
          name: "Gnoll",
        },
        {
          id: 28,
          name: "Otyugh",
        },
        {
          id: 29,
          name: "Sahuagin",
        },
        {
          id: 30,
          name: "Sphinx",
        },
        {
          id: 31,
          name: "Winter Wolf",
        },
        {
          id: 32,
          name: "Worg",
        },
        {
          id: 33,
          name: "Blink Dog",
        },
        {
          id: 34,
          name: "Yeti",
        },
        {
          id: 35,
          name: "All",
        },
        {
          id: 36,
          name: "Aarakocra",
        },
        {
          id: 37,
          name: "Slaad",
        },
        {
          id: 38,
          name: "Bullywug",
        },
        {
          id: 39,
          name: "Gith",
        },
        {
          id: 40,
          name: "Grell",
        },
        {
          id: 41,
          name: "Hook Horror",
        },
        {
          id: 42,
          name: "Modron",
        },
        {
          id: 43,
          name: "Thri-kreen",
        },
        {
          id: 44,
          name: "Troglodyte",
        },
        {
          id: 45,
          name: "Umber Hulk",
        },
        {
          id: 46,
          name: "Thieves' Cant",
        },
        {
          id: 47,
          name: "Grung",
        },
        {
          id: 48,
          name: "Tlincalli",
        },
        {
          id: 49,
          name: "Vegepygmy",
        },
        {
          id: 50,
          name: "Yikaria",
        },
        {
          id: 51,
          name: "Bothii",
        },
        {
          id: 52,
          name: "Ixitxachitl",
        },
        {
          id: 53,
          name: "Thayan",
        },
        {
          id: 54,
          name: "Netherese",
        },
        {
          id: 55,
          name: "Ice Toad",
        },
        {
          id: 56,
          name: "Olman",
        },
        {
          id: 57,
          name: "Quori",
        },
        {
          id: 58,
          name: "Minotaur",
        },
        {
          id: 59,
          name: "Loxodon",
        },
        {
          id: 60,
          name: "Kraul",
        },
        {
          id: 61,
          name: "Vedalken",
        },
        {
          id: 62,
          name: "Daelkyr",
        },
        {
          id: 64,
          name: "Riedran",
        },
        {
          id: 66,
          name: "Zemnian",
        },
        {
          id: 67,
          name: "Marquesian",
        },
        {
          id: 68,
          name: "Naush",
        },
        {
          id: 69,
          name: "Leonin",
        },
      ],
    },
    {
      id: 5,
      name: "Tool",
      type: "custom",
      proficiencies: [],
    },
    {
      id: 6,
      name: "Language",
      type: "custom",
      proficiencies: [],
    },
  ],
];
