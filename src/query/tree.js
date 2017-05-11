module.exports = async (_, {id}, {space}) => {
  if (!/^[0-9a-z_][0-9a-z_-]*$/.test(id)) {
    throw new Error('id must match [0-9a-z_][0-9a-z_-]*');
  }
  return space.get(`tree:${id}`);
};
