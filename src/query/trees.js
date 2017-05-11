module.exports = (_, args, {space}) => {
  return space.values({gt: 'tree:', lte: 'tree:\uffff'});
};
