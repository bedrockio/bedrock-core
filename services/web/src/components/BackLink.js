import { NavLink } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function BackLink(props) {
  const { label = 'Back' } = props;

  const navigate = useNavigate();

  function onClick(evt) {
    evt.preventDefault();
    navigate.back();
  }

  return <NavLink onClick={onClick} label={`← ${label}`} p="0" />;
}
