module.exports = async (_, obj, {mode, name, space, trees}) => {
  const response = {
    id: name,
    cid: space.CID,
    mode,
    trees: [],
  };

  const promises = [];

  for (const id of Object.keys(trees)) {
    promises.push(trees[id].request({
      query: 'query {info {dirty lastCommit} }',
    }).then((res) => {
      const info = res.data.info;
      info.id = id;
      return info;
    }));
  }

  response.trees = await Promise.all(promises);

  return response;
};
