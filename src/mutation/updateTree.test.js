const {expect} = require('chai');
const backend = require('memdown');
const uuid = require('uuid');
const Space = require('../Space.js');

let space;

describe('createTree', () => {
  beforeEach(async () => {
    space = new Space({
      name: 'test',
      prefix: uuid(),
      backend,
      mode: Space.CLIENT,
    });
  });

  it('should update a tree', async () => {
    await space.request({
      query: `mutation ($input: CreateTreeInput!) {
        x: createTree(input: $input) {
          errors {key message}
          tree {id name}
        }
      }`,
      variables: {
        input: {
          id: 'test',
          name: 'test',
        },
      },
    });

    let response = await space.request({
      query: `mutation ($input: UpdateTreeInput!) {
        x: updateTree(input: $input) {
          errors {key message}
          tree {id name root {id type}}
        }
      }`,
      variables: {
        input: {
          id: 'test',
          name: 'test',
          root: {
            id: '1234',
            type: 'Person',
          },
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    let data = response.data.x;
    expect(data).to.have.all.keys('errors', 'tree');
    expect(data.errors).to.deep.equal([]);
    expect(data.tree).to.deep.equal({
      id: 'test',
      name: 'test',
      root: {
        id: '1234',
        type: 'Person',
      },
    });

    response = await space.request({
      query: `mutation ($input: UpdateTreeInput!) {
        x: updateTree(input: $input) {
          errors {key message}
          tree {id name root {id type}}
        }
      }`,
      variables: {
        input: {
          id: 'test',
          name: 'test',
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    data = response.data.x;
    expect(data).to.have.all.keys('errors', 'tree');
    expect(data.errors).to.deep.equal([]);
    expect(data.tree).to.deep.equal({
      id: 'test',
      name: 'test',
      root: null,
    });
  });

  it('should error on invalid id', async () => {
    const response = await space.request({
      query: `mutation ($input: UpdateTreeInput!) {
        x: updateTree(input: $input) {
          errors {key message}
          tree {id name}
        }
      }`,
      variables: {
        input: {
          id: '$invalid',
          name: 'test',
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    const data = response.data.x;
    expect(data).to.have.all.keys('errors', 'tree');
    expect(data.errors.length).to.equal(1);
    const error = data.errors[0];
    expect(error.key).to.equal('id');
    expect(error.message).to.contain('match');
    expect(data.tree).to.equal(null);
  });

  it('should error on tree not found', async () => {
    const response = await space.request({
      query: `mutation ($input: UpdateTreeInput!) {
        x: updateTree(input: $input) {
          errors {key message}
          tree {id name}
        }
      }`,
      variables: {
        input: {
          id: 'test',
          name: 'test',
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    const data = response.data.x;
    expect(data).to.have.all.keys('errors', 'tree');
    expect(data.errors.length).to.equal(1);
    const error = data.errors[0];
    expect(error.key).to.equal('id');
    expect(error.message).to.contain('Not Found');
    expect(data.tree).to.equal(null);
  });
});
