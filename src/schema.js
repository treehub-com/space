const {makeExecutableSchema} = require('graphql-tools');

const resolvers = {
  Query: {
    // Sync
    changes: require('./query/changes.js'),
    dirty: require('./query/dirty.js'),
    // Tree
    tree: require('./query/tree.js'),
    trees: require('./query/trees.js'),
  },
  Mutation: {
    // Sync
    apply: require('./mutation/apply.js'),
    change: require('./mutation/change.js'),
    clean: require('./mutation/clean.js'),
    // Tree
    createTree: require('./mutation/createTree.js'),
    updateTree: require('./mutation/updateTree.js'),
    deleteTree: require('./mutation/deleteTree.js'),
  },
  // Types
  Tree: require('./type/Tree.js'),
  TreeRoot: require('./type/TreeRoot.js'),
  // Scalars
  JSON: require('./scalar/JSON.js'),
};

const typeDefs = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    changes(cid: Int!): JSON
    dirty(num: Int): JSON
    tree(id: String): Tree
    trees: [Tree!]!
  }`,
  // Mutations
  `type Mutation {
    apply(cid: Int!, changes: JSON!): Int!
    change(cid: Int!, changes: JSON!): Int!
    clean(cid: Int!, keys: JSON!): Int!
    createTree(input: CreateTreeInput!): CreateTreeOutput!
    updateTree(input: UpdateTreeInput!): UpdateTreeOutput!
    deleteTree(input: DeleteTreeInput!): DeleteTreeOutput!
  }`,
  // Types
  `type Error {
    # The input field of the error, if any
    key: String
    # The error message, suitable for display
    message: String!
  }`,
  `type Tree {
    id: String!
    name: String!
    root: TreeRoot
  }`,
  `type TreeRoot {
    id: String!
    type: String!
  }`,
  // Inputs/Outputs
  `input DeleteTreeInput {
    id: String!
  }`,
  `type DeleteTreeOutput {
    errors: [Error!]
  }`,
  `input CreateTreeInput {
    id: String!
    name: String!
  }`,
  `type CreateTreeOutput {
    errors: [Error!]
    tree: Tree
  }`,
  `input UpdateTreeInput {
    id: String!
    name: String!
    root: UpdateTreeRootInput
  }`,
  `input UpdateTreeRootInput {
    id: String!
    type: String!
  }`,
  `type UpdateTreeOutput {
    errors: [Error!]
    tree: Tree
  }`,
  // Scalars
  `scalar JSON`,
];

module.exports = makeExecutableSchema({typeDefs, resolvers});
