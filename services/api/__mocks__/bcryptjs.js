// Real bcrypt at the production cost of 12 takes ~200ms per hash or compare,
// which dominates the auth tests. 4 is the minimum cost bcrypt accepts.

const { default: bcrypt } = await vi.importActual('bcryptjs');

function genSalt() {
  return bcrypt.genSalt(4);
}

export default { ...bcrypt, genSalt };
