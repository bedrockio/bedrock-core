let mock;

function OpenAI() {
  return {
    chat: {
      completions: {
        create() {
          return mock;
        },
      },
    },
  };
}

function setResponse(data) {
  mock = data;
}

OpenAI.setResponse = setResponse;

export default OpenAI;
