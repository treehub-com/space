module.exports = async (_, obj, {mode, name, request, space}) => {
  const response = {
    id: name,
    cid: space.CID,
    mode,
    trees: [],
  };

  const trees = await space.values({gt: 'tree:', lte: 'tree:\uffff'});

  const promises = [];

  for (const tree of trees) {
    promises.push(request({
      tree: tree.id,
      query: 'query {info {dirty lastCommit} }',
    }).then((res) => {
      const info = res.data.info;
      info.id = tree.id;
      return info;
    }));
  }

  response.trees = await Promise.all(promises);

  return response;
};
