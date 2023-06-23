import { useTheme } from 'stores/theme';

export default function ThemedImage({ darkSrc, ligthSrc, ...props }) {
  const { renderedTheme } = useTheme();
  return <img src={renderedTheme === 'dark' ? darkSrc : ligthSrc} {...props} />;
}
