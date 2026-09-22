import { MongoMemoryServer } from 'mongodb-memory-server';

let server;

export async function setup(project) {
  server = await MongoMemoryServer.create({
    binary: {
      version: '8.0.9',
    },
  });
  project.provide('mongoUri', server.getUri());
}

export async function teardown() {
  await server.stop();
}
