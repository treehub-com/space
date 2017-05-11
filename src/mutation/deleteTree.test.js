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

  it('should delete a tree', async () => {
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
      query: `mutation ($input: DeleteTreeInput!) {
        x: deleteTree(input: $input) {
          errors {key message}
        }
      }`,
      variables: {
        input: {
          id: 'test',
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    let data = response.data.x;
    expect(data).to.have.all.keys('errors');
    expect(data.errors).to.deep.equal([]);
  });

  it('should error on invalid id', async () => {
    const response = await space.request({
      query: `mutation ($input: DeleteTreeInput!) {
        x: deleteTree(input: $input) {
          errors {key message}
        }
      }`,
      variables: {
        input: {
          id: '$invalid',
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    const data = response.data.x;
    expect(data).to.have.all.keys('errors');
    expect(data.errors.length).to.equal(1);
    const error = data.errors[0];
    expect(error.key).to.equal('id');
    expect(error.message).to.contain('match');
  });

  it('should error on tree not found', async () => {
    const response = await space.request({
      query: `mutation ($input: DeleteTreeInput!) {
        x: deleteTree(input: $input) {
          errors {key message}
        }
      }`,
      variables: {
        input: {
          id: 'test',
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    const data = response.data.x;
    expect(data).to.have.all.keys('errors');
    expect(data.errors.length).to.equal(1);
    const error = data.errors[0];
    expect(error.key).to.equal('id');
    expect(error.message).to.contain('Not Found');
  });
});
