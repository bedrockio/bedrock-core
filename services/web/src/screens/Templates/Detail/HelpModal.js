import Code from 'components/Code';
import ModalWrapper from 'components/ModalWrapper';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function HelpModal() {
  function render() {
    return (
      <Tabs defaultValue="markdown">
        <TabsList>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
          <TabsTrigger value="helpers">Helpers</TabsTrigger>
        </TabsList>
        <TabsContent value="markdown">{renderMarkdown()}</TabsContent>
        <TabsContent value="helpers">{renderHelpers()}</TabsContent>
      </Tabs>
    );
  }

  function renderMarkdown() {
    return (
      <div className="flex flex-col gap-2">
        <h5 className="font-semibold">Emphasis</h5>
        <Code>{Markdown.Emphasis}</Code>
        <h5 className="font-semibold">Lists</h5>
        <Code>{Markdown.Lists}</Code>
        <h5 className="font-semibold">Headings</h5>
        <Code>{Markdown.Headings}</Code>
        <h5 className="font-semibold">Line Break</h5>
        <Code>{Markdown.LineBreak}</Code>
      </div>
    );
  }

  function renderHelpers() {
    return (
      <div className="flex flex-col gap-2">
        <h5 className="font-semibold">Link Helpers</h5>
        <Code>{Helpers.Link}</Code>

        <h5 className="font-semibold">Button Helpers</h5>
        <Code>{Helpers.Button}</Code>

        <h5 className="font-semibold">Image Helpers</h5>
        <Code>{Helpers.Image}</Code>

        <h5 className="font-semibold">Date/Time Helpers</h5>
        <Code>{Helpers.Date}</Code>

        <h5 className="font-semibold">Relative Time Helpers</h5>
        <Code>{Helpers.Relative}</Code>

        <h5 className="font-semibold">Metadata</h5>
        <Code>{Helpers.Metadata}</Code>

        <Alert variant="warning">
          <AlertDescription>
            <p>
              Note that quotes are optional except when the value starts with{' '}
              <code>{'{{'}</code>
            </p>
          </AlertDescription>
        </Alert>

        <h5 className="font-semibold">Conditional Rendering</h5>
        <Code>{Helpers.Conditional}</Code>

        <h5 className="font-semibold">Looping (Simple)</h5>
        <Code>{Helpers.LoopingSimple}</Code>

        <h5 className="font-semibold">Looping (List)</h5>
        <Code>{Helpers.LoopingList}</Code>

        <h5 className="font-semibold">Looping (Table)</h5>
        <Code>{Helpers.LoopingTable}</Code>
      </div>
    );
  }

  return render();
}

const Markdown = {
  Headings: `
# An H1 heading
## An H2 heading
### An H3 heading
`,
  LineBreak: `
---
`,
  Emphasis: `
**bold text**
*italicized text*
`,
  Lists: `
1. First item
2. Second item
3. Third item

- First item
- Second item
- Third item
`,
};

const Helpers = {
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

function Wrapper(props) {
  const { trigger, ...rest } = props;
  return (
    <ModalWrapper title="Template Help" size="xl" trigger={trigger}>
      <HelpModal {...rest} />
    </ModalWrapper>
  );
}
export default Wrapper;
