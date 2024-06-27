process.env.UPLOADS_STORE = 'gcs';

const fs = require('fs');
const { request, createUpload, createUser } = require('../../utils/testing');
const { assertFileStored } = require('@google-cloud/storage');

const file = __dirname + '/../__fixtures__/test.png';

let createReadStream = fs.createReadStream;

function mockReadStream() {
  fs.createReadStream = (url) => {
    return url;
  };
}

function unmockReadStream() {
  fs.createReadStream = createReadStream;
}

describe('/1/uploads', () => {
  describe('GET /:id/raw', () => {
    it('should redirect for a public GCS file', async () => {
      const user = await createUser();
      const upload = await createUpload({
        storageType: 'gcs',
      });
      const response = await request('GET', `/1/uploads/${upload.id}/raw`, {}, { user });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('PublicUrl');
    });

    it('should serve a private GCS file', async () => {
      mockReadStream();
      const user = await createUser();
      const upload = await createUpload({
        private: true,
        storageType: 'gcs',
        owner: user,
      });

      const response = await request('GET', `/1/uploads/${upload.id}/raw`, {}, { user });

      expect(response.status).toBe(200);
      expect(response.body.toString()).toBe('PrivateUrl');
      unmockReadStream();
    });

    it('should include correct headers', async () => {
      mockReadStream();
      const user = await createUser();
      const upload = await createUpload({
        private: true,
        storageType: 'gcs',
        owner: user,
      });

      const response = await request('GET', `/1/uploads/${upload.id}/raw`, {}, { user });
      expect(response.headers['content-type']).toBe('image/png');

      unmockReadStream();
    });
  });

  describe('POST /', () => {
    it('should store mimetype on file', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/uploads', {}, { user, file });
      expect(response.status).toBe(200);
      assertFileStored({
        contentType: 'image/png',
      });
    });
  });
});
