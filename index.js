const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const CONFIG = require("./config");
const Cache = require("./cache");
const filterModifiers = require("./filterModifiers");

const CACHE = new Cache();

const isValidData = data => {
  return data.success === true;
};

const filterByLevel = (data, spellLevelAccess) => {
  const filteredSpellList = data.filter(spell => {
    return spell.definition.level <= spellLevelAccess;
  });
  return filteredSpellList;
};

const extractAlwaysPreparedSpells = classInfo => {
  return new Promise((resolve, reject) => {
    const { name, id, spellLevelAccess } = classInfo;
    console.log(`Retrieving always prepared spells for ${name} (${id}) at spell level ${spellLevelAccess}`);

    const cache = CACHE.exists(id);
    if (cache !== undefined) {
      const filteredSpells = filterByLevel(cache.data, spellLevelAccess);
      console.log(
        `Adding ${filteredSpells.length} of ${cache.data.length} lvl${spellLevelAccess} spells FROM CACHE to character`
      );
      return resolve(filteredSpells);
    }

    const url = CONFIG.urls.alwaysPreparedSpells(id, 20);
    fetch(url)
      .then(res => res.json())
      .then(json => {
        console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidData(json)) {
          CACHE.add(id, json.data);
          const filteredSpells = filterByLevel(json.data, spellLevelAccess);
          console.log(
            `Adding ${filteredSpells.length} of ${json.data.length} spells available to a lvl${spellLevelAccess} caster...`
          );
          resolve(filteredSpells);
        } else {
          console.log("Received no valid spell data, instead:" + json.message);
          reject(json.message);
        }
      })

      .catch(error => {
        console.log("Error retrieving spells");
        console.log(error);
        reject(error);
      });
  });
};

const extractCasterLevel = (cls, isMultiClassing) => {
  let casterLevel = 0;
  if (isMultiClassing) {
    // get the casting level if the character is a multiclassed spellcaster
    if (cls.definition.spellRules && cls.definition.spellRules.multiClassSpellSlotDivisor) {
      casterLevel = Math.floor(cls.level / cls.definition.spellRules.multiClassSpellSlotDivisor);
    }
  } else {
    casterLevel = cls.level;
  }

  return casterLevel;
};

const extractSpellLevelAccess = (cls, casterLevel) => {
  const spellSlots = cls.definition.spellRules.levelSpellSlots[casterLevel];
  const spellLevelAccess = spellSlots.reduce((count, numSpellSlots) => (numSpellSlots > 0 ? count + 1 : count), 0);
  return spellLevelAccess;
};

const extractClassIds = data => {
  const isMultiClassing = data.classes.length > 1;
  return data.classes.map(characterClass => {
    return {
      characterClassId: characterClass.id,
      name:
        characterClass.subclassDefinition && characterClass.subclassDefinition.name
          ? characterClass.definition.name + ` (${characterClass.subclassDefinition.name})`
          : characterClass.definition.name,
      id:
        characterClass.subclassDefinition && characterClass.subclassDefinition.id
          ? characterClass.subclassDefinition.id
          : characterClass.definition.id,
      level: extractCasterLevel(characterClass, isMultiClassing),
      spellLevelAccess: extractSpellLevelAccess(characterClass, extractCasterLevel(characterClass)),
      spells: [],
    };
  });
};

const loadAlwaysPreparedSpells = classInfo => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(classInfo.map(classInfo => extractAlwaysPreparedSpells(classInfo)))
      .then(results => {
        // combining all resolved results
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            classInfo[index].spells = result.value;
          }
        });
        resolve(classInfo);
      })
      .catch(error => reject(error));
  });
};

const insertAlwaysPreparedSpells = data => {
  console.log("[ ALWAYS PREPARED SPELLS ========================================= ]");
  return new Promise((resolve, reject) => {
    const classInfo = extractClassIds(data);
    console.log("CLASS INFORMATION:");
    console.log(classInfo);
    loadAlwaysPreparedSpells(classInfo).then(classInfo => {
      // add the always prepared spells to the class' spell list
      data.classSpells = data.classSpells.map(classSpells => {
        // find always prepared spells in the results
        const alwaysPreparedSpells = classInfo.find(
          classInfo => classInfo.characterClassId === classSpells.characterClassId
        );

        if (alwaysPreparedSpells) {
          alwaysPreparedSpells.spells.forEach(spell => {
            if (classSpells.spells.find(s => s.definition.name === spell.definition.name) === undefined) {
              console.log(" + Adding spell to character: " + spell.definition.name);
              classSpells.spells.push(spell);
            }
          });
        }
        return classSpells;
      });
      resolve(data);
    });
  });
};

const checkStatus = res => {
  if (res.ok) {
    // res.status >= 200 && res.status < 300
    return res;
  } else {
    throw res.statusText;
  }
};

const loadCharacterData = characterId => {
  return new Promise((resolve, reject) => {
    const characterUrl = CONFIG.urls.characterUrl(characterId);
    fetch(characterUrl)
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        if (isValidData(json)) {
          resolve(json.data);
        } else {
          reject(json.message);
        }
      })
      .catch(error => {
        console.log(`getCharacterData(${characterId}): ${error}`);
        reject(error);
      });
  });
};

const app = express();
const port = 3000;

app.get("/:characterId", cors(), (req, res) => {
  let characterId = 0;
  try {
    characterId = parseInt(req.params.characterId);
  } catch (exception) {
    return res.json({ message: "Invalid query" });
  }

  loadCharacterData(characterId)
    .then(data => {
      console.log(`Name: ${data.name}, URL: https://character-service.dndbeyond.com/character/v3/character/${data.id}`);
      return Promise.resolve(data);
    })
    .then(result => insertAlwaysPreparedSpells(result))
    .then(data => {
      data = filterModifiers(data);
      console.log("================================================================");
      console.log("");
      return res.status(200).json({ success: true, message: "Character successfully received.", data: data });
    })
    .catch(error => {
      console.log(error);
      if (error === "Forbidden") {
        return res.json({ success: false, message: "Character must be set to public in order to be accessible." });
      }
      return res.json({ success: false, message: "Unkown error during character loading: " + error });
    });
});

app.options("/alwaysPreparedSpells", cors(), (req, res) => res.status(200).send());
app.post("/alwaysPreparedSpells", cors(), express.json(), (req, res) => {
  console.log(req.body);
  loadAlwaysPreparedSpells(req.body)
    .then(data => {
      return res
        .status(200)
        .json({ success: true, message: "Always prepared spells successfully received.", data: data });
    })
    .catch(error => {
      console.log(error);
      if (error === "Forbidden") {
        return res.json({ success: false, message: "Character must be set to public in order to be accessible." });
      }
      return res.json({ success: false, message: "Unkown error during character loading: " + error });
    });
});

app.listen(port, () => {
  console.log(`DDB Character API started on :${port}`);
});
