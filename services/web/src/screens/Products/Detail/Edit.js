import { useNavigate } from '@bedrockio/router';

import { usePage } from 'stores/page';

import Form from '../Form';
import Menu from './Menu';

export default function EditProduct() {
  const { product, reload } = usePage();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <Menu displayMode="edit" />
      <Form
        product={product}
        onSuccess={() => {
          reload();
          navigate(`/products/${product.id}`);
        }}
      />
    </div>
  );
}
