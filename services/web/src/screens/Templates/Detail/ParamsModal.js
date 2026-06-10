import ModalWrapper from 'components/ModalWrapper';
import { useLoader } from 'hooks/loader';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

import { request } from 'utils/api';

function ParamsModal(props) {
  const { template } = props;

  const { params } = useLoader(async () => {
    const { data } = await request({
      method: 'GET',
      path: `/1/templates/${template.id}/params`,
    });
    return {
      params: data,
    };
  });

  return (
    <Card className="gap-4 p-4">
      <Alert variant="warning">
        <AlertDescription>
          Note that this is dummy data for template creation and not what will
          actually be sent.
        </AlertDescription>
      </Alert>
      <pre style={{ fontSize: '12px', overflow: 'auto' }}>
        {JSON.stringify(params, null, 2)}
      </pre>
    </Card>
  );
}

function Wrapper(props) {
  const { trigger, ...rest } = props;
  return (
    <ModalWrapper title="Template Parameters" size="xl" trigger={trigger}>
      <ParamsModal {...rest} />
    </ModalWrapper>
  );
}
export default Wrapper;
