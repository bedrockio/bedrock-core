import { createContext, useContext } from 'react';

export const RichTextEditorContext = createContext();

export function useRichTextEditor() {
  return useContext(RichTextEditorContext);
}
