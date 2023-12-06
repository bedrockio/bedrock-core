import GoogleButton from './Google/SignInButton';
import AppleButton from './Apple/SignInButton';

export default function FederatedLogin(props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}>
      <GoogleButton small {...props} />
      <AppleButton small {...props} />
    </div>
  );
}
