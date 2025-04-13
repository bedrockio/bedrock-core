import { CodeHighlight } from '@mantine/code-highlight';

import '@mantine/code-highlight/styles.css';

export default function Code({ children, language }) {
  return (
    <CodeHighlight
      language={language}
      code={children}
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === 'dark'
            ? theme.colors.dark[7]
            : theme.colors.gray[0],
        padding: theme.spacing.md,
        borderRadius: theme.radius.sm,
        overflowX: 'auto',
      })}
    />
  );
}
