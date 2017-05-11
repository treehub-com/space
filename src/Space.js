const {graphql} = require('graphql');
const Level = require('@treehub/level');
const schema = require('./schema.js');
const Trepo = require('trepo-core');

class Space {
  constructor({name, prefix, backend, mode}) {
    this.name = name;
    this.prefix = prefix;
    this.backend = backend;
    this.mode = mode;
    this._space = null;
    this._trees = {};
  }

  static get SERVER() {
    return Level.SERVER;
  }

  static get CLIENT() {
    return Level.CLIENT;
  }

  request({tree, scopes, query, variables, operationName}) {
    if (tree) {
      return this._treeRequest({tree, scopes, query, variables, operationName});
    } else {
      return this._spaceRequest({scopes, query, variables, operationName});
    }
  }

  /* Internal Functions */

  async _spaceRequest({scopes, query, variables, operationName}) {
    // TODO resolve scopes

    const space = await this._getSpace();

    return graphql(
      schema,
      query,
      {}, // root
      {
        space,
        deleteTree: this._deleteTree.bind(this),
      }, // ctx
      variables,
      operationName,
    );
  }

  async _treeRequest({tree, scopes, query, variables, operationName}) {
    // TODO verify access

    const trepo = await this._getTree(tree);

    return trepo.request({
      query,
      variables,
      operationName,
    });
  }

  async _getSpace() {
    if (this._space === null) {
      this._space = new Level({
        name: `${this.prefix}space`,
        backend: this.backend,
        mode: this.mode,
      });
      await this._space.open();
    }

    return this._space;
  }

  async _getTree(id) {
    if (this._trees[id] === undefined) {
      const space = await this._getSpace();
      const tree = await space.get(`tree:${id}`);
      if (tree === undefined) {
        const error = new Error('Tree Not Found');
        error.code = 404;
        throw error;
      }
      this._trees[id] = new Trepo(`${this.name}/${id}`, {
        name: `${this.prefix}${id}.tree`,
        db: this.backend,
      });
      await this._trees[id].start();
    }
    return this._trees[id];
  }

  async _deleteTree(id) {
    console.log(`deleting tree ${id}`);
    if (this._trees[id] !== undefined) {
      delete this._trees[id];
      // TODO Destroy trepo instance
    } else {
      // TODO Create trepo instance and call destroy
    }
  }
}

module.exports = Space;
