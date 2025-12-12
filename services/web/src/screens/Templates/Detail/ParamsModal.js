import { Paper } from '@mantine/core';

import ModalWrapper from 'components/ModalWrapper';
import { useLoader } from 'hooks/loader';

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
    <Paper p="md">
      <pre style={{ fontSize: '12px', overflow: 'auto' }}>
        {JSON.stringify(params, null, 2)}
      </pre>
    </Paper>
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
