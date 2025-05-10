import ConnectionError from 'components/ConnectionError';

export default function BasicLayout({ children }) {
  return (
    <div
      style={{
        height: '100vh',
      }}>
      <ConnectionError />
      {children}
    </div>
  );
}
