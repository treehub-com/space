const {expect} = require('chai');
const backend = require('memdown');
const uuid = require('uuid');
const Space = require('../Space.js');

let space;

describe('apply', () => {
  beforeEach(async () => {
    space = new Space({
      name: 'test',
      prefix: uuid(),
      backend,
      mode: Space.CLIENT,
    });
  });

  it('should return cid', async () => {
    const response = await space.request({
      query: `mutation ($cid: Int!, $changes: JSON!) {
        x: apply(cid: $cid, changes: $changes)
      }`,
      variables: {
        cid: 1,
        changes: [
          ['tree:test', {id: 'test', name: 'test'}],
        ],
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('x');
    const data = response.data.x;
    expect(data).to.deep.equal(1);
  });
});
