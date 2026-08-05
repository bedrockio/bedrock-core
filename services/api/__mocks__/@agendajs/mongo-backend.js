// Manual mock for the ESM @agendajs/mongo-backend package. See __mocks__/agenda.js
// — the mocked Agenda ignores the backend, so this only needs to construct and
// expose a no-op disconnect.
class MongoBackend {
  constructor(options) {
    this.options = options || {};
  }

  async connect() {}

  async disconnect() {}
}

module.exports = {
  MongoBackend,
};
