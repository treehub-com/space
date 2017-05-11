module.exports = async (_, {cid, changes}, {space}) => {
  await space.change(cid, changes);

  return space.CID;
};
