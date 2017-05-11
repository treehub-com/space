module.exports = async (_, {cid, changes}, {space}) => {
  await space.apply(cid, changes);

  return space.CID;
};
