export default function () {
  return {
    blockStyleFn(contentBlock) {
      const data = contentBlock.getData();
      const alignment = data.get('alignment') || 'default';
      return `block--${alignment}`;
    },
  };
}
