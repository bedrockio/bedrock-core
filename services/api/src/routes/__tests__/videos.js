const { setupDb, teardownDb, request, createUser } = require('../../utils/testing');
const { Video } = require('../../models');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/videos', () => {
  describe('POST /search', () => {
    it('should list out videos', async () => {
      const user = await createUser();

      const video1 = await Video.create({
        name: 'test 1',
        description: 'Some description',
      });

      const video2 = await Video.create({
        name: 'test 2',
        description: 'Some description',
      });

      const response = await request('POST', '/1/videos/search', {}, { user });

      expect(response.status).toBe(200);
      const body = response.body;
      expect(body.data[1].name).toBe(video1.name);
      expect(body.data[0].name).toBe(video2.name);
      expect(body.meta.total).toBe(2);
    });
  });

  describe('GET /:video', () => {
    it('should be able to access video', async () => {
      const user = await createUser();
      const video = await Video.create({
        name: 'new video',
      });
      const response = await request('GET', `/1/videos/${video.id}`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(video.name);
    });
  });

  describe('POST /', () => {
    it('should be able to create video', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/videos',
        {
          name: 'video name',
        },
        { user }
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data.name).toBe('video name');
    });
  });

  describe('DELETE /:video', () => {
    it('should be able to delete video', async () => {
      const user = await createUser();
      let video = await Video.create({
        name: 'test 1',
        description: 'Some description',
      });
      const response = await request('DELETE', `/1/videos/${video.id}`, {}, { user });
      expect(response.status).toBe(204);
      video = await Video.findByIdDeleted(video.id);
      expect(video.deletedAt).toBeDefined();
    });
  });

  describe('PATCH /:video', () => {
    it('should be able to update video', async () => {
      const user = await createUser();
      let video = await Video.create({
        name: 'video name',
        description: 'Some description',
      });
      video.name = 'new name';
      const response = await request('PATCH', `/1/videos/${video.id}`, video.toJSON(), { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('new name');
      video = await Video.findById(video.id);
      expect(video.name).toEqual('new name');
    });
  });
});
