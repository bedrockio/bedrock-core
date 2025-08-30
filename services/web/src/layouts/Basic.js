import ConnectionError from 'components/ConnectionError';

export default function BasicLayout({ children }) {
  return (
    <div
      style={{
        height: '100vh',
        background: 'light-dark(var(--mantine-color-brown-0), transparent)',
      }}>
      <ConnectionError />
      {children}
    </div>
  );
}
