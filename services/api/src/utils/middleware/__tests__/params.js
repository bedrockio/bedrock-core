const mongoose = require('mongoose');
const { noop } = require('lodash');
const { createTestModel } = require('@bedrockio/model');
const { fetchByParam, fetchByParamWithSlug } = require('../params');
const { context, createUser, createUpload } = require('../../testing');
const { User, Upload } = require('../../../models');

describe('fetchByParam', () => {
  it('should fetch user and attach to state', async () => {
    const user = await createUser();
    const fn = fetchByParam(User);
    const ctx = context();
    await fn(user.id, ctx, noop);
    expect(ctx.state.user.id).toBe(user.id);
  });

  it('should throw a 404 on an invalid id', async () => {
    const fn = fetchByParam(User);
    const ctx = context();
    await expect(fn('foo', ctx, noop)).rejects.toThrow('Not Found');
  });

  it('should throw a 404 if document does not exist', async () => {
    const fn = fetchByParam(User);
    const ctx = context();
    await expect(fn(new mongoose.Types.ObjectId(), ctx, noop)).rejects.toThrow('Not Found');
  });

  it('should allow include in query', async () => {
    const user = await createUser();
    const upload = await createUpload(user);
    const fn = fetchByParam(Upload);
    const ctx = context();
    ctx.query = {
      include: 'owner',
    };
    await fn(upload.id, ctx, noop);
    expect(ctx.state.upload.owner.id).toBe(user.id);
  });

  describe('hasAccess', () => {
    it('should reject access', async () => {
      const user = await createUser();
      const upload = await createUpload(user);
      const fn = fetchByParam(Upload, {
        hasAccess: () => false,
      });
      const ctx = context();
      ctx.state.authUser = user;
      await expect(fn(upload.id, ctx, noop)).rejects.toThrow('Unauthorized');
    });

    it('should perform complex access check', async () => {
      let ctx;
      const user1 = await createUser();
      const user2 = await createUser();
      const upload = await createUpload(user1);
      const fn = fetchByParam(Upload, {
        hasAccess: async (ctx, doc) => {
          if (ctx.method === 'GET') {
            return true;
          } else {
            return doc.owner?.equals(ctx.state.authUser.id);
          }
        },
      });

      ctx = context();
      ctx.method = 'GET';
      ctx.state.authUser = user1;
      await expect(fn(upload.id, ctx, noop)).resolves.not.toThrow();

      ctx = context();
      ctx.method = 'GET';
      ctx.state.authUser = user2;
      await expect(fn(upload.id, ctx, noop)).resolves.not.toThrow();

      ctx = context();
      ctx.method = 'POST';
      ctx.state.authUser = user2;
      await expect(fn(upload.id, ctx, noop)).rejects.toThrow('Unauthorized');
    });
  });
});

describe('fetchByParamWithSlug', () => {
  const Post = createTestModel('Post', {
    slug: 'String',
  });

  it('should find the document by slug', async () => {
    const post = await Post.create({
      slug: 'new-post',
    });
    const fn = fetchByParamWithSlug(Post);
    const ctx = context();
    await fn('new-post', ctx, noop);
    expect(ctx.state.post.id).toBe(post.id);
  });

  it('should still find the document by id', async () => {
    const post = await Post.create({
      slug: 'new-post',
    });
    const fn = fetchByParamWithSlug(Post);
    const ctx = context();
    await fn(post.id, ctx, noop);
    expect(ctx.state.post.id).toBe(post.id);
  });
});
