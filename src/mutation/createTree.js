module.exports = async (_, {input}, {space}) => {
  const {id, name} = input;
  const response = {
    errors: [],
    tree: null,
  };

  if (!/^[0-9a-z_][0-9a-z_-]*$/.test(id)) {
    response.errors.push({
      key: 'id',
      message: 'id must match [0-9a-z_][0-9a-z_-]*',
    });
    return response;
  }

  const existingTree = await space.get(`tree:${id}`);
  if (existingTree !== undefined) {
    response.errors.push({
      key: 'id',
      message: 'Tree exists',
    });
    return response;
  }

  response.tree = {id, name};
  await space.put(`tree:${id}`, response.tree);

  return response;
};
