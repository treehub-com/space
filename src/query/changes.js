module.exports = (_, {cid, limit = 100}, {space}) => space.changes(cid, limit);
