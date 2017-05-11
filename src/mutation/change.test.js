const {expect} = require('chai');
const backend = require('memdown');
const uuid = require('uuid');
const Space = require('../Space.js');

let space;

describe('change', () => {
  beforeEach(async () => {
    space = new Space({
      name: 'test',
      prefix: uuid(),
      backend,
      mode: Space.SERVER,
    });
  });

  it('should return cid', async () => {
    const response = await space.request({
      query: `mutation ($cid: Int!, $changes: JSON!) {
        x: change(cid: $cid, changes: $changes)
      }`,
      variables: {
        cid: 0,
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
