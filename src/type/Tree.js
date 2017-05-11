module.exports = {
  id: (tree) => tree.id,
  name: (tree) => tree.name,
  root: (tree) => tree.root || null,
};
