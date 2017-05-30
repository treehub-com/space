const {expect} = require('chai');
const backend = require('memdown');
const uuid = require('uuid');
const Space = require('./Space.js');

let space;

describe('space', () => {
  beforeEach(async () => {
    space = new Space({
      name: 'test-space',
      prefix: uuid(),
      backend,
      mode: Space.CLIENT,
    });
  });

  it('should create a tree and call Trepo', async () => {
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
      tree: 'test-tree',
      query: `query {
        info {
          repo
          lastCommit
          dirty
        }
      }`,
    });

    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('info');
    const data = response.data.info;
    expect(data).to.deep.equal({
      repo: 'test-space/test-tree',
      lastCommit: null,
      dirty: false,
    });
  });

  it('should error on tree not found', async () => {
    try {
      await space.request({
        tree: 'test-tree',
        query: `query {
          info {
            repo
            lastCommit
            dirty
          }
        }`,
      });
      throw new Error('should have errored');
    } catch (error) {
      expect(error.code).to.equal(404);
    }

    // Ensure we cleanup properly from our deferred open code
    try {
      await space.request({
        tree: 'test-tree',
        query: `query {
          info {
            repo
            lastCommit
            dirty
          }
        }`,
      });
      throw new Error('should have errored');
    } catch (error) {
      expect(error.code).to.equal(404);
    }
  });

  it('should handle simultaneous initial calls properly', async () => {
    const responses = await Promise.all([
      space.request({
        query: `query {
          status {
            id
            cid
            mode
            trees {id dirty lastCommit}
          }
        }`,
      }),
      space.request({
        query: `query {
          status {
            id
            cid
            mode
            trees {id dirty lastCommit}
          }
        }`,
      }),
    ]);

    expect(responses[0].errors).to.equal(undefined);
    expect(responses[1].errors).to.equal(undefined);
  });
});
