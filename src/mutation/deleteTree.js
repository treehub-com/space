module.exports = async (_, {input}, {space, deleteTree}) => {
  const {id} = input;
  const response = {
    errors: [],
  };
  if (!/^[0-9a-z_][0-9a-z_-]*$/.test(id)) {
    response.errors.push({
      key: 'id',
      message: 'id must match [0-9a-z_][0-9a-z_-]*',
    });
    return response;
  }
  const existingTree = await space.get(`tree:${id}`);
  if (existingTree === undefined) {
    response.errors.push({
      key: 'id',
      message: 'Tree Not Found',
    });
    return response;
  }

  await space.del(`tree:${id}`);
  await deleteTree(id);

  return response;
};
