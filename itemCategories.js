let data = require("./_data/duplicate-items.json");
data = data.data;
const foundryTypes = ["weapon", "equipment", "consumable", "tool", "loot", "class", "spell", "feat", "backpack"];
const descriptions = data.inventory.map(item => ({
  name: item.definition.name,
  type: item.definition.type,
  tags: item.definition.tags,
  itemType: [item.definition.type.toLowerCase(), ...item.definition.tags.map(t => t.toLowerCase())]
    .map(type => {
      return foundryTypes.find(t => t.indexOf(type) !== -1 || type.indexOf(t) !== -1);
    })
    .reduce((type, currentType) => (currentType !== undefined && type === undefined ? currentType : type), undefined),
}));

console.log(descriptions);
