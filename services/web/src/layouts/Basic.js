import ConnectionError from 'components/ConnectionError';

export default function BasicLayout({ children }) {
  return (
    <div className="auth-ground relative flex min-h-screen flex-col">
      <ConnectionError />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="flex w-full max-w-[420px] flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
