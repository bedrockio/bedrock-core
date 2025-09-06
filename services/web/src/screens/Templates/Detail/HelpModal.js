import { Alert, Text, Typography } from '@mantine/core';

import Code from 'components/Code';

export default function HelpModal() {
  return (
    <Typography>
      <h5>Link Helpers</h5>
      <Code>{Help.Link}</Code>

      <h5>Button Helpers</h5>
      <Code>{Help.Button}</Code>

      <h5>Image Helpers</h5>
      <Code>{Help.Image}</Code>

      <h5>Date/Time Helpers</h5>
      <Code>{Help.Date}</Code>

      <h5>Relative Time Helpers</h5>
      <Code>{Help.Relative}</Code>

      <h5>Metadata</h5>
      <Code>{Help.Metadata}</Code>

      <Alert color="yellow">
        <Text>
          Note that quotes are optional except when the value starts with{' '}
          <code>{'{{'}</code>
        </Text>
      </Alert>

      <h5>Conditional Rendering</h5>
      <Code>{Help.Conditional}</Code>

      <h5>Looping (Simple)</h5>
      <Code>{Help.LoopingSimple}</Code>

      <h5>Looping (List)</h5>
      <Code>{Help.LoopingList}</Code>

      <h5>Looping (Table)</h5>
      <Code>{Help.LoopingTable}</Code>
    </Typography>
  );
}

const Help = {
  Link: `
[Text](https://example.com)
{{link "Text" "/page"}}
{{link text="Text" url="/page"}}
{{link text="Text" url="/page/:id" id="12345"}}
`,
  Button: `
{{button "Text" "https://example.com/"}}
{{button "Text" "/page"}}
{{button text="Text" url="/page"}}
{{button text="Text" url="/page/:id" id="12345"}}
`,
  Image: `
{{image user.profileImage}}
{{image user.profileImage type=avatar}}
{{image user.profileImage width=150 height=150}}
{{image user.profileImage blur=50}}
{{imageUrl user.profileImage}}
`,
  Date: `
{{date startsAt}}
{{time startsAt}}
`,
  Relative: `
{{rtime startsAt}}
`,
  Metadata: `
---
subject: Subject here.
image: "{{imageUrl user.profileImage}}"
---
Body here.
`,
  Conditional: `
{{#if user}}
  Your name is {{user.name}}.
{{/if}}
`,
  LoopingSimple: `
{{#each users}}
  User {{number}}: {{name}}
{{/each}}
`,
  LoopingList: `
{{#each users}}
- User {{number}}:

  {{name}}

  {{email}}

{{/each}}
`,
  LoopingTable: `
{{#if users}}
Name | Email
---- | -----
{{#each users}}
  {{name}} | {{email}}
{{/each}}
{{/if}}
`,
};
