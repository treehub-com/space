const {expect} = require('chai');
const backend = require('memdown');
const uuid = require('uuid');
const Space = require('../Space.js');

let space;

describe('status', () => {
  beforeEach(async () => {
    space = new Space({
      name: 'test',
      prefix: uuid(),
      backend,
      mode: Space.SERVER,
    });
  });

  it('should return the status', async () => {
    await space.request({
      query: `mutation ($input: CreateTreeInput!) {
        x: createTree(input: $input) {
          errors {key message}
          tree {id name}
        }
      }`,
      variables: {
        input: {
          id: 'test-tree',
          name: 'test',
        },
      },
    });

    const response = await space.request({
      query: `query {
        status {
          id
          cid
          mode
          trees {id dirty lastCommit}
        }
      }`,
    });

    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('status');
    const data = response.data.status;
    expect(data).to.deep.equal({
      id: 'test',
      cid: 1,
      mode: Space.SERVER,
      trees: [{
        id: 'test-tree',
        dirty: false,
        lastCommit: null,
      }],
    });
  });
});
