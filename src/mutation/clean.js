module.exports = async (_, {cid, keys}, {space}) => {
  await space.clean(cid, keys);

  return space.CID;
};
