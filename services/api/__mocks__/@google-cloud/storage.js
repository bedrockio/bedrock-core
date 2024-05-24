let storedFiles = [];

class Storage {
  bucket(name) {
    return new Bucket(name);
  }
}

class Bucket {
  async upload(filepath, options) {
    const file = new File(filepath, options);
    await file.save();
  }

  file(filepath) {
    return new File(filepath);
  }
}

class File {
  constructor(filepath, options = {}) {
    this.contentType = options.contentType;
    this.destination = options.destination;
    this.filepath = filepath;
    this.isPublic = false;
  }

  async save() {
    storedFiles.push(this);
  }

  makePublic() {
    this.isPublic = true;
  }

  getSignedUrl() {
    return ['PrivateUrl'];
  }

  publicUrl() {
    return 'PublicUrl';
  }
}

afterEach(() => {
  storedFiles = [];
});

function assertFileStored(options) {
  expect(storedFiles).toEqual(expect.arrayContaining([expect.objectContaining(options)]));
}

module.exports = {
  Storage,
  assertFileStored,
};
