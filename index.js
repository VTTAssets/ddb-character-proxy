const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

/**
 * CONFIG
 */
const CONFIG = {
  urls: {
    characterUrl: characterId => `https://character-service.dndbeyond.com/character/v3/character/${characterId}`,
    alwaysPreparedSpells: (classId, classLevel) =>
      `https://character-service.dndbeyond.com/character/v4/game-data/always-prepared-spells?classId=${classId}&classLevel=${classLevel}`,
  },
  cache: {
    expiration: 24, // expiration in hours
  },
};

const CACHE = [];

const isValidSpellData = data => {
  return data.success === true;
};

const isExpired = timestamp => {
  return (new Date().valueOf() - timestamp) / (1000 * 60 * 60 * CONFIG.cache.expiration) >= 1;
};

const checkCache = classId => {
  return CACHE.find(cache => cache.classId === classId && !isExpired(cache.lastUpdate));
};

const addToCache = (classId, data) => {
  const index = CACHE.find(cache => cache.classId === classId);
  if (index) {
    console.log("Removing expired entry from cache");
    CACHE = CACHE.filter(cache => cache.classId !== classId);
  }
  console.log("Adding to the Cache (Class ID: " + classId + "): " + data.length + " spells.");
  CACHE.push({
    classId: classId,
    lastUpdate: new Date().valueOf(),
    data: data,
  });
};

const filterByLevel = (data, spellLevelAccess) => {
  const filteredSpellList = data.filter(spell => {
    return spell.definition.level <= spellLevelAccess;
  });
  return filteredSpellList;
};

const retrieveAlwaysPreparedSpells = (classId, spellLevelAccess) => {
  console.log("Retrieving always prepared spells for " + classId + " at spell level access " + spellLevelAccess);
  return new Promise((resolve, reject) => {
    const cache = checkCache(classId);
    if (cache !== undefined) {
      const filteredSpells = filterByLevel(cache.data, spellLevelAccess);
      console.log(
        `Adding ${filteredSpells.length}/${cache.data.length} lvl${spellLevelAccess} spells FROM CACHE to character`
      );
      return resolve(filteredSpells);
    }

    const url = CONFIG.urls.alwaysPreparedSpells(classId, 20);
    fetch(url)
      .then(res => res.json())
      .then(json => {
        console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidSpellData(json)) {
          addToCache(classId, json.data);
          const filteredSpells = filterByLevel(json.data, spellLevelAccess);
          console.log(`Adding ${filteredSpells.length}/${json.data.length} lvl${spellLevelAccess} spells to character`);
          resolve(filteredSpells);
        } else {
          console.log("Received no valid spell data, instead:" + json.message);
          reject(json.message);
        }
      })

      .catch(error => reject(error));
  });
};

const getCasterLevel = (cls, isMultiClassing) => {
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

const getSpellLevelAccess = (cls, casterLevel) => {
  const spellSlots = cls.definition.spellRules.levelSpellSlots[casterLevel];
  const spellLevelAccess = spellSlots.reduce((count, numSpellSlots) => (numSpellSlots > 0 ? count + 1 : count), 0);
  return spellLevelAccess;
};

const getClassIds = data => {
  const isMultiClassing = data.classes.length > 1;
  return data.classes.map(characterClass => {
    return {
      characterClassId: characterClass.id,
      name:
        characterClass.subclassDefinition && characterClass.subclassDefinition.name
          ? characterClass.definition.name + `(${characterClass.subclassDefinition.name})`
          : characterClass.definition.name,
      id:
        characterClass.subclassDefinition && characterClass.subclassDefinition.id
          ? characterClass.subclassDefinition.id
          : characterClass.definition.id,
      level: getCasterLevel(characterClass, isMultiClassing),
      spellLevelAccess: getSpellLevelAccess(characterClass, getCasterLevel(characterClass)),
      spells: [],
    };
  });
};

const retrieveAllAlwaysPreparedSpells = classInfo => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      classInfo.map(classInfo => retrieveAlwaysPreparedSpells(classInfo.id, classInfo.spellLevelAccess))
    )
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

const retrieveCharacterInfo = data => {
  return new Promise((resolve, reject) => {
    const classInfo = getClassIds(data);
    console.log("CLASS INFORMATION:");
    console.log(classInfo);
    console.log("---");
    retrieveAllAlwaysPreparedSpells(classInfo).then(classInfo => {
      // add the always prepared spells to the class' spell list
      data.classSpells = data.classSpells.map(classSpells => {
        // find always prepared spells in the results
        const alwaysPreparedSpells = classInfo.find(
          classInfo => classInfo.characterClassId === classSpells.characterClassId
        );

        if (alwaysPreparedSpells) {
          alwaysPreparedSpells.spells.forEach(spell => {
            if (classSpells.spells.find(s => s.definition.name === spell.definition.name) === undefined) {
              console.log("Adding new always prepared spell: " + spell.definition.name);
              classSpells.spells.push(spell);
            } else {
              console.log("Already in list: " + spell.definition.name);
            }
          });
        }
        return classSpells;
      });
      resolve(data);
    });
  });
};

const isValidCharacterData = data => {
  return data && data.success === true;
};

const checkStatus = res => {
  if (res.ok) {
    // res.status >= 200 && res.status < 300
    return res;
  } else {
    throw res.statusText;
  }
};

const retrieveCharacterData = characterId => {
  return new Promise((resolve, reject) => {
    const characterUrl = CONFIG.urls.characterUrl(characterId);
    fetch(characterUrl)
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        if (isValidCharacterData(json)) {
          resolve(json.data);
        } else {
          reject(json.message);
        }
      })
      .catch(error => {
        console.log(`retrieveCharacterData(${characterId}): ${error}`);
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

  retrieveCharacterData(characterId)
    .then(result => retrieveCharacterInfo(result))
    .then(data => {
      console.log("Data to send: ");
      //require("fs").writeFileSync(__dirname + "/_data/" + characterId + ".json", JSON.stringify(data, null, 3));
      console.log(data);
      return res.status(200).json({ success: true, message: "Character successfully received.", data: data });
    })
    .catch(error => {
      console.log(error);
      console.log("Data to send:");
      console.log({ success: false, message: "Character must be set to public in order to be accessible." });
      if (error === "Forbidden") {
        return res.json({ success: false, message: "Character must be set to public in order to be accessible." });
      }
      return res.json({ success: false, message: "Unkown error during character loading: " + error });
    });
});

app.options("/alwaysPreparedSpells", cors(), (req, res) => res.status(200).send());
app.post("/alwaysPreparedSpells", cors(), express.json(), (req, res) => {
  console.log(req.body);
  retrieveAllAlwaysPreparedSpells(req.body)
    .then(data => {
      console.log("Data to send: ");
      console.log(data);
      return res
        .status(200)
        .json({ success: true, message: "Always prepared spells successfully received.", data: data });
    })
    .catch(error => {
      console.log(error);
      console.log("Data to send:");
      if (error === "Forbidden") {
        return res.json({ success: false, message: "Character must be set to public in order to be accessible." });
      }
      return res.json({ success: false, message: "Unkown error during character loading: " + error });
    });
});

app.listen(port, () => {
  console.log(`DDB Character API started on :${port}`);
});
