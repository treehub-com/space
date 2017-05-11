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

  it('should return trees', async () => {
    let response = await space.request({
      query: `query {
        x: trees {
          id
          name
        }
      }`,
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    let data = response.data.x;
    expect(data).to.deep.equal([]);

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

    await space.request({
      query: `mutation ($input: CreateTreeInput!) {
        x: createTree(input: $input) {
          errors {key message}
          tree {id name}
        }
      }`,
      variables: {
        input: {
          id: 'two',
          name: 'two',
        },
      },
    });

    response = await space.request({
      query: `query {
        x: trees {
          id
          name
        }
      }`,
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    data = response.data.x;
    expect(data).to.deep.equal([
      {id: 'test', name: 'test'},
      {id: 'two', name: 'two'},
    ]);
  });
});
