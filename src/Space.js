const {graphql} = require('graphql');
const Level = require('@treehub/level');
const schema = require('./schema.js');
const Trepo = require('@trepo/core');

class Space {
  constructor({name, prefix, backend, mode}) {
    this.name = name;
    this.prefix = prefix;
    this.backend = backend;
    this.mode = mode;
    this._space = undefined;
    this._trees = {};
    this._requests = {};
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
        deleteTree: this._deleteTree.bind(this),
        mode: this.mode,
        name: this.name,
        request: this.request.bind(this),
        space,
      }, // ctx
      variables,
      operationName
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
    // If we haven't opened the space yet, attempt to load and return
    // While we are loading we queue other requests and resolve all
    // of then once the space is loaded
    if (this._space === undefined || this._space === null) {
      if (this._requests[''] === undefined) {
        this._requests[''] = [];
      }
      return new Promise((resolve, reject) => {
        this._requests[''].push({resolve, reject});

        if (this._space !== null) {
          this._space = null;
          const space = new Level({
            name: `${this.prefix}space`,
            backend: this.backend,
            mode: this.mode,
          });
          space.open()
            .then(() => {
              this._space = space;
              for (const promise of this._requests['']) {
                promise.resolve(this._space);
              }
              delete this._requests[''];
            })
            .catch((error) => {
              for (const promise of this._requests['']) {
                promise.reject(error);
              }
              delete this._requests[''];
            });
        }
      });
    }
    return this._space;
  }

  async _getTree(id) {
    // If we don't have a tree, attempt to load and return
    // While we are loading we queue other requests and resolve all
    // of then once the tree is loaded
    if (this._trees[id] === undefined || this._trees[id] === null) {
      if (this._requests[id] === undefined) {
        this._requests[id] = [];
      }

      return new Promise((resolve, reject) => {
        this._requests[id].push({resolve, reject});

        if (this._trees[id] !== null) {
          this._trees[id] = null;
          this._getSpace()
            .then((space) => space.get(`tree:${id}`))
            .then((tree) => {
              if (tree === undefined) {
                const error = new Error('Tree Not Found');
                error.code = 404;
                throw error;
              }
              const newTree = new Trepo(`${this.name}/${id}`, {
                name: `${this.prefix}${id}.tree`,
                db: this.backend,
              });

              return newTree.start()
                .then(() => {
                  this._trees[id] = newTree;
                  for (const promise of this._requests[id]) {
                    promise.resolve(this._trees[id]);
                  }
                  delete this._requests[id];
                });
            })
            .catch((error) => {
              delete this._trees[id];
              for (const promise of this._requests[id]) {
                promise.reject(error);
              }
              delete this._requests[id];
            });
        }
      });
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
