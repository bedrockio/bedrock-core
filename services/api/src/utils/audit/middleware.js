const context = require('context');
const auditModel = require('./audit-model');

function configMiddleware({ model: User }) {
  return (ctx, next) => {
    const store = new Map();
    store.set('userId', ctx.state.user);

    return context.run(store, next);
  };
}

module.exports = {
  action: (message, model) => {
    const x = x.directModifiedPaths();

    return async (ctx, next) => {
      await next.then();
    };
  },
  view: (message) => {
    return (ctx, next) => {
      return next;
    };
  },
};

/*
const { auditMiddleware } = require('audit')
auditMiddleware.action("message");
auditMiddleware.view("")
*/
