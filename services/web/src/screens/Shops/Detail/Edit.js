import { useNavigate } from '@bedrockio/router';

import { usePage } from 'stores/page';

import Form from '../Form';
import Menu from './Menu';

export default function EditShop() {
  const { shop, reload } = usePage();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <Menu displayMode="edit" />
      <Form
        shop={shop}
        onSuccess={() => {
          reload();
          navigate(`/shops/${shop.id}`);
        }}
      />
    </div>
  );
}
