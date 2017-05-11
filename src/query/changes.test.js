const {expect} = require('chai');
const backend = require('memdown');
const uuid = require('uuid');
const Space = require('../Space.js');

let space;

describe('changes', () => {
  beforeEach(async () => {
    space = new Space({
      name: 'test',
      prefix: uuid(),
      backend,
      mode: Space.SERVER,
    });
  });

  it('should return changes', async () => {
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
      query: `query ($cid: Int!){
        x: changes(cid: $cid)
      }`,
      variables: {
        cid: 0,
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    const data = response.data.x;
    expect(data).to.deep.equal({
      cid: 1,
      changes: [
        ['tree:test', {id: 'test', name: 'test'}],
      ],
    });
  });
});
