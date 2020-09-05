/**
 * UTILITY
 * Returns a string representation of friendlyTypename and friendlySubtypeName for an obj[]
 * @param {object[]} arr array of objects
 */
const extractInfo = arr => {
  return arr.map(e => `${e.friendlyTypeName} (${e.friendlySubtypeName})`);
};

/**
 * Extracts basic character information
 * @param {object} data Character JSON
 * returns information about the classes this character chose, including
 * - {string} name
 * - {number} level
 * - {boolean} isStartingClass
 * - {object[]} modifiers (empty, will be filled later)
 * }
 */
const getClassInfo = data => {
  return data.classes.map(cls => {
    return {
      name:
        cls.subclassDefinition && cls.subclassDefinition.name
          ? `${cls.definition.name} (${cls.subclassDefinition.name})`
          : cls.definition.name,
      level: cls.level,
      isStartingClass: cls.isStartingClass,
      modifiers: [],
    };
  });
};

/**
 * Gets all class features up to a certain class level
 * @param {obj} cls character.classes[] entry
 * @param {*} classLevel level requirement up to which the class features should be extracted
 */
const getClassFeatures = (cls, classLevel = 20) => {
  if (
    cls.subclassDefinition &&
    cls.subclassDefinition.classFeatures &&
    Array.isArray(cls.subclassDefinition.classFeatures)
  ) {
    return cls.classFeatures
      .concat(cls.subclassDefinition.classFeatures)
      .filter(classFeature => classFeature.requiredLevel <= classLevel)
      .sort((a, b) => a.requiredLevel - b.requiredLevel);
  }
};

/**
 * Checks if a given class is the starting class of this character
 * @param {object} data character data
 * @param {string} className name of the class to check
 * @returns {boolean} true of the class is a starting class, false otherwise
 */
const isStartingClass = (data, className) => {
  return data.classes.find(cls => cls.definition.name === className && cls.isStartingClass);
};

/**
 * Gets all class modifiers for a given character
 * This filters out all modifiers that do not have an entry in the class features passed in
 * For multiclassing characters, it checks if the given class is the starting class or a multiclass,
 *    then the `.availableToMulticlass` is queried if this modifier is enabled or not
 * @param {obj} cls character.classes[] entry
 * @param {*} classLevel level requirement up to which the class features should be extracted
 */
const getClassModifiers = (data, classFeatures, isStartingClass = false) => {
  const modifiers = data.modifiers.class.filter(classModifier => {
    // check the class from which this modifier came
    const componentId = classModifier.componentId;
    const feature = classFeatures.find(feature => feature.id === componentId);
    if (feature !== undefined) {
      const isFeatureAvailable = classModifier.availableToMulticlass ? true : isStartingClass;
      console.log(
        `${isFeatureAvailable ? "[  AVAIL]" : "[UNAVAIL]"} Modifier found: ${classModifier.friendlyTypeName} (${
          classModifier.friendlySubtypeName
        })`
      );
      return isFeatureAvailable;
    }
    return false;
  });

  return modifiers;
};

/**
 * Filters the modifiers with the utility functions above
 * @param {object} data character data
 * @returns {[object[]]} an array containing an array of filtered modifiers, grouped by class
 */
const filterModifiers = (data, classInfo) => {
  // get the classFeatures for all classes
  //const classInfo = getClassInfo(data);

  data.classes.forEach((cls, index) => {
    const features = getClassFeatures(cls, cls.level);
    classInfo[index].modifiers = getClassModifiers(data, features, isStartingClass(data, cls.definition.name));
    //console.log(features);
    //return modifiers;
  });
  return classInfo;
};

/**
 * =============================================================
 * MAIN
 * =============================================================
 * Get the class information for this character
 */
const main = data => {
  let classInfo = getClassInfo(data);
  console.log("Player's overview:" + data.name);
  classInfo = filterModifiers(data, classInfo);
  data.modifiers.class = [];

  classInfo.forEach(cls => {
    console.log(`${cls.isStartingClass ? "Starting Class" : "Multiclass"}: [lvl${cls.level}] ${cls.name} `);
    console.log(
      extractInfo(cls.modifiers)
        .map(s => `    ${s}`)
        .join("\n")
    );
    data.modifiers.class = data.modifiers.class.concat(cls.modifiers);
    console.log("---");
  });
  return data;
};

module.exports = main;