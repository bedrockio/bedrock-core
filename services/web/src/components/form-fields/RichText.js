import { InputLabel, InputWrapper } from '@mantine/core';
import RichTextEditor from 'components/RichTextEditor';

/**
 * RichTextField renders a rich text editor with an optional label.
 * @param {object} props
 * @param {string} [props.label] - The label for the field.
 * @param {string} [props.value] - The markdown value.
 * @param {object} [props.rest] - Additional props for the editor.
 */
function RichTextField(props) {
  const { label, value, scroll = true, forwardRef, ...rest } = props;
  return (
    <InputWrapper>
      {label && <InputLabel>{label}</InputLabel>}
      <RichTextEditor
        scroll={scroll}
        ref={forwardRef}
        markdown={value || ''}
        {...rest}
        toolbar
      />
    </InputWrapper>
  );
}

export default RichTextField;
