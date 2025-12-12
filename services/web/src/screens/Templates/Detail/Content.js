import { useNavigate } from '@bedrockio/router';

import {
  Button,
  Group,
  Paper,
  SegmentedControl,
  Space,
  Textarea,
} from '@mantine/core';

import { startCase } from 'lodash';
import { useState } from 'react';

import {
  PiChatCircleBold,
  PiCodeBold,
  PiDeviceMobileBold,
  PiEnvelopeBold,
  PiQuestionBold,
} from 'react-icons/pi';

import { showSuccessNotification } from 'helpers/notifications';
import { usePage } from 'stores/page';

import ErrorMessage from 'components/ErrorMessage';
import ModalWrapper from 'components/ModalWrapper';
import Actions from 'components/form-fields/Actions';
import { useFields } from 'hooks/forms';
import { useLoader } from 'hooks/loader';
import { useRequest } from 'hooks/request';

import { request } from 'utils/api';

import HelpModal from './HelpModal';
import Form from '../Form';
// import HelpModal from './Detail/HelpModal';
// import SendPreviewButton from './Detail/SendPreviewButton';
import Menu from './Menu';
import ParamsModal from './ParamsModal';
import SendPreviewButton from './SendPreviewButton';

const channelOptions = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
];

const CHANNEL_ICONS = {
  email: PiEnvelopeBold,
  sms: PiChatCircleBold,
  push: PiDeviceMobileBold,
};

const CHANNEL_LABELS = {
  email: 'Email Body',
  sms: 'SMS Body',
  push: 'Push Body',
};

export default function Content() {
  const { template, reload } = usePage();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(template.channels[0] || 'email');

  const { fields, setField } = useFields(template);

  const { run, loading, error } = useRequest(async (body) => {
    await request({
      method: 'PATCH',
      path: `/1/templates/${template.id}`,
      body,
    });

    showSuccessNotification({
      message: 'Updated Content',
    });
  });

  function onSubmit(evt) {
    evt.preventDefault();
    run(fields);
  }

  return (
    <form onSubmit={onSubmit}>
      <Menu />
      <Paper p="md" withBorder>
        <ErrorMessage error={error} />
        <SegmentedControl
          value={channel}
          onChange={setChannel}
          data={template.channels.map((channel) => {
            const Icon = CHANNEL_ICONS[channel];
            return {
              value: channel,
              label: <Icon />,
            };
          })}
        />

        <Space h="md" />

        <Textarea
          key={channel}
          name={channel}
          label={CHANNEL_LABELS[channel]}
          value={fields[channel]}
          onChange={setField}
          rows={15}
          resize
        />

        <Space h="md" />

        <Group gap="md">
          <HelpModal
            trigger={
              <Button
                size="sm"
                variant="default"
                leftSection={<PiQuestionBold />}>
                Help
              </Button>
            }
          />

          <ParamsModal
            template={template}
            trigger={
              <Button variant="default" size="sm" leftSection={<PiCodeBold />}>
                Params
              </Button>
            }
          />
          <SendPreviewButton channel={channel} template={template} />
        </Group>
      </Paper>

      <Actions>
        <Button type="submit" loading={loading} disabled={loading}>
          Save
        </Button>
      </Actions>
    </form>
  );
}
