import React from 'react';

import { useTheme } from 'stores';

export default function ThemedImage({ darkSrc, ligthSrc, ...props }) {
  const { renderedTheme } = useTheme();
  return <img src={renderedTheme === 'dark' ? darkSrc : ligthSrc} {...props} />;
}
