const {expect} = require('chai');
const backend = require('memdown');
const uuid = require('uuid');
const Space = require('./Space.js');

let space;

describe('dirty', () => {
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
  });
});
