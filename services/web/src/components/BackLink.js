import { useNavigate } from '@bedrockio/router';
import { ArrowLeft } from 'lucide-react';

export default function BackLink(props) {
  const { label = 'Back' } = props;

  const navigate = useNavigate();

  function onClick(evt) {
    evt.preventDefault();
    navigate.back();
  }

  return (
    <a
      href="#"
      onClick={onClick}
      className="text-foreground inline-flex items-center gap-1 no-underline hover:underline">
      <ArrowLeft className="size-4" />
      {label}
    </a>
  );
}
