const { request, createUpload, createUser } = require('../../utils/testing');
const { Upload } = require('../../models');

const file = __dirname + '/../__fixtures__/test.png';

describe('/1/uploads', () => {
  describe('POST /', () => {
    it('should be able to create upload', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/uploads', {}, { user, file });
      const [upload] = response.body.data;
      expect(response.status).toBe(200);
      expect(upload.mimeType).toBe('image/png');
      expect(upload.storageType).toBe('local');
      expect(upload.hash.length).toBe(64);
      expect(upload.rawUrl[0]).toBe('/');
      expect(upload.filename).toBe('test.png');
      expect(upload.owner).toBe(user.id);
    });

    it('should be able to handle multiple files', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/uploads',
        {},
        {
          user,
          file: [file, file],
        }
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data.length).toBe(2);
      expect(data[0].mimeType).toBe('image/png');
      expect(data[0].storageType).toBe('local');
      expect(data[0].hash.length).toBe(64);
      expect(data[0].rawUrl[0]).toBe('/');
      expect(data[0].filename).toBe('test.png');
      expect(data[0].owner).toBe(user.id);
      expect(data[1].mimeType).toBe('image/png');
      expect(data[1].storageType).toBe('local');
      expect(data[1].hash.length).toBe(64);
      expect(data[1].rawUrl[0]).toBe('/');
      expect(data[1].filename).toBe('test.png');
      expect(data[1].owner).toBe(user.id);
    });

    it('should error if no file passed', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/uploads', {}, { user });
      expect(response.status).toBe(400);
    });

    it('should be able to derive a mimeType if the file has one', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/uploads',
        {},
        {
          user,
          file: new Blob(['test'], {
            type: 'text/plain',
          }),
        }
      );
      expect(response.status).toBe(200);
      expect(response.body.data[0]).toMatchObject({
        mimeType: 'text/plain',
      });
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
      expect(response.status).toBe(403);
    });
  });

  describe('GET /:id', () => {
    it('should be able to access upload by id', async () => {
      const user = await createUser();
      const upload = await createUpload(user);
      const response = await request('GET', `/1/uploads/${upload.id}`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.filename).toBe('test.png');
    });
  });
});
