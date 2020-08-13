const prompts = require('prompts');

async function prompt(arg) {
  const answers = await prompts(arg, {
    onCancel: () => {
      process.exit(1);
    }
  });
  if (!Array.isArray(arg)) {
    return Object.values(answers)[0];
  } else {
    return answers;
  }
}

prompt.override = prompts.override;

module.exports = prompt;
