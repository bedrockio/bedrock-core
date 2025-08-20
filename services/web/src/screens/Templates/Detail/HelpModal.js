import { Stack, Alert, Text } from '@mantine/core';

import Code from 'components/Code';

export default function HelpModal() {
  return (
    <Stack spacing="md">
      <h4 style={{ marginTop: '0' }}>Link Helpers</h4>
      <Code>{`
[Text](https://example.com)
{{link "Text" "/page"}}
{{link text="Text" url="/page"}}
{{link text="Text" url="/page/:id" id="12345"}}
`}</Code>

      <h4>Button Helpers</h4>
      <Code>{`
{{button "Text" "https://example.com/"}}
{{button "Text" "/page"}}
{{button text="Text" url="/page"}}
{{button text="Text" url="/page/:id" id="12345"}}
`}</Code>

      <h4>Image Helpers</h4>
      <Code>{`
{{image user.profileImage}}
{{image user.profileImage type=avatar}}
{{image user.profileImage width=150 height=150}}
{{image user.profileImage blur=50}}
{{imageUrl user.profileImage}}
`}</Code>

      <h4>Date/Time Helpers</h4>
      <Code>{`
{{date startsAt}}
{{time startsAt}}
`}</Code>

      <h4>Relative Time Helpers</h4>
      <Code>{`
{{rtime startsAt}}
`}</Code>

      <h4>Metadata</h4>
      <Code>{`
---
subject: Subject here.
image: "{{imageUrl user.profileImage}}"
---
Body here.
`}</Code>

      <Alert color="yellow">
        <Text>
          Note that quotes are optional except when the value starts with{' '}
          <code>{'{{'}</code>
        </Text>
      </Alert>

      <h4>Conditional Rendering</h4>
      <Code>{`
{{#if user}}
  Your name is {{user.name}}.
{{/if}}
`}</Code>

      <h4>Looping (Simple)</h4>
      <Code>{`
{{#each users}}
  User {{number}}: {{name}}
{{/each}}
`}</Code>

      <h4>Looping (List)</h4>
      <Code>{`
{{#each users}}
- User {{number}}:

  {{name}}

  {{email}}

{{/each}}
`}</Code>

      <h4>Looping (Table)</h4>
      <Code>{`
{{#if users}}
Name | Email
---- | -----
{{#each users}}
  {{name}} | {{email}}
{{/each}}
{{/if}}
`}</Code>
    </Stack>
  );
}
