const {parse, buildASTSchema} = require('graphql');

const resolvers = {
  Query: {
    // Status
    status: require('./query/status.js'),
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
    status: Status
    changes(cid: Int!, limit: Int): JSON
    dirty(limit: Int): JSON
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
  `type Status {
    id: String!
    mode: String!
    cid: Int!
    trees: [TreeStatus]!
  }`,
  `type TreeStatus {
    id: String!
    lastCommit: String
    dirty: Boolean!
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
].join('\n');

const schema = buildASTSchema(parse(typeDefs));

// Adapted from graphql-tools makeExecutableSchema
// For each resolver
for (const typeName of Object.keys(resolvers)) {
  // Get the type from the schema
  const type = schema.getType(typeName);
  // Ensure we have a type for the resolver in the schema
  if (!type && typeName !== '__schema') {
    throw new Error(`"${typeName}" defined in resolvers, but not in schema`);
  }
  // For each field in the resolver
  for (const fieldName of Object.keys(resolvers[typeName])) {
    // Add __ resolver fields to the type instead of the field (i.e. scalars)
    if (fieldName.startsWith('__')) {
      type[fieldName.substring(2)] = resolvers[typeName][fieldName];
      continue;
    }
    // Get all of the fields for this type
    const fields = type.getFields();
    // Ensure we have the field in the schema
    if (!fields[fieldName]) {
      throw new Error(`${typeName}.${fieldName} defined in resolvers, but not in schema`); // eslint-disable-line max-len
    }
    // Get the field and the resolver for the field
    const field = fields[fieldName];
    const fieldResolve = resolvers[typeName][fieldName];
    // If the resolver is a function, add it as the resovler
    if (typeof fieldResolve === 'function') {
      field.resolve = fieldResolve;
    } else {
    // Otherwise, the resolver is a type definition
      for (const propertyName of Object.keys(fieldResolve)) {
        field[propertyName] = fieldResolve[propertyName];
      }
    }
  }
}

module.exports = schema;
