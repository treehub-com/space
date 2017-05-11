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

  it('should return the tree', async () => {
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

    const response = await space.request({
      query: `query ($id: String){
        x: tree(id: $id) {
          id
          name
        }
      }`,
      variables: {
        id: 'test',
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    const data = response.data.x;
    expect(data).to.deep.equal({id: 'test', name: 'test'});
  });

  it('should return nulll when tree not found', async () => {
    const response = await space.request({
      query: `query ($id: String){
        x: tree(id: $id) {
          id
          name
        }
      }`,
      variables: {
        id: 'test',
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    const data = response.data.x;
    expect(data).to.deep.equal(null);
  });

  it('should error on invalid id', async () => {
    const response = await space.request({
      query: `query ($id: String){
        x: tree(id: $id) {
          id
          name
        }
      }`,
      variables: {
        id: '$invalid',
      },
    });
    expect(response).to.have.all.keys('data', 'errors');
    expect(response.errors.length).to.equal(1);
    const error = response.errors[0];
    expect(error.message).to.contain('match');
    expect(response.data).to.have.all.keys('x');
    const data = response.data.x;
    expect(data).to.deep.equal(null);
  });
});
