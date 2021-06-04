const { setupDb, teardownDb, request, createUser } = require('../../utils/testing');
const { Upload } = require('../../models');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

const createUpload = (user = {}) => {
  return Upload.create({
    filename: 'logo.png',
    rawUrl: 'logo.png',
    hash: 'test',
    storageType: 'local',
    mimeType: 'image/png',
    ownerId: user.id || 'none',
  });
};

describe('/1/uploads', () => {
  describe('POST /', () => {
    it('should be able to create upload', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/uploads', {}, { user, file: __dirname + '/fixtures/logo.png' });
      const [upload] = response.body.data;
      expect(response.status).toBe(200);
      expect(upload.mimeType).toBe('image/png');
      expect(upload.storageType).toBe('local');
      expect(upload.hash.length).toBe(64);
      expect(upload.rawUrl[0]).toBe('/');
      expect(upload.filename).toBe('logo.png');
      expect(upload.ownerId).toBe(user.id);
    });

    it('should be able to handle multiple files', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/uploads',
        {},
        {
          user,
          file: [__dirname + '/fixtures/logo.png', __dirname + '/fixtures/logo.png'],
        }
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data.length).toBe(2);
      expect(data[0].mimeType).toBe('image/png');
      expect(data[0].storageType).toBe('local');
      expect(data[0].hash.length).toBe(64);
      expect(data[0].rawUrl[0]).toBe('/');
      expect(data[0].filename).toBe('logo.png');
      expect(data[0].ownerId).toBe(user.id);
      expect(data[1].mimeType).toBe('image/png');
      expect(data[1].storageType).toBe('local');
      expect(data[1].hash.length).toBe(64);
      expect(data[1].rawUrl[0]).toBe('/');
      expect(data[1].filename).toBe('logo.png');
      expect(data[1].ownerId).toBe(user.id);
    });
  });

  describe('DELETE /:upload', () => {
    it('should be able to delete upload', async () => {
      const user = await createUser();
      const upload = await createUpload(user);
      const response = await request('DELETE', `/1/uploads/${upload.id}`, {}, { user });
      expect(response.status).toBe(204);
      const dbUpload = await Upload.findByIdDeleted(upload.id);
      expect(dbUpload.deletedAt).toBeDefined();
    });

    it('should fail if you are not the owner', async () => {
      const user = await createUser();
      const upload = await createUpload();
      const response = await request('DELETE', `/1/uploads/${upload.id}`, {}, { user });
      expect(response.status).toBe(401);
    });
  });

  describe('GET /:hash', () => {
    it('should be able to access upload by hash', async () => {
      const user = await createUser();
      const upload = await createUpload(user);
      const response = await request('GET', `/1/uploads/${upload.hash}`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.filename).toBe('logo.png');
    });
  });
});
