import {
  Button,
  Group,
  Paper,
  SegmentedControl,
  Space,
  Textarea,
} from '@mantine/core';

import React, { useState } from 'react';

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
import Actions from 'components/form-fields/Actions';
import { useFields } from 'hooks/forms';
import { useRequest } from 'hooks/request';

import { request } from 'utils/api';

import HelpModal from './HelpModal';
import Menu from './Menu';
import ParamsModal from './ParamsModal';
import SendPreviewButton from './SendPreviewButton';

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
  const { template, update } = usePage();

  const [channel, setChannel] = useState(template.channels[0] || 'email');

  const { fields, setField } = useFields(template);

  const { run, loading, error } = useRequest(async (body) => {
    const { data } = await request({
      method: 'PATCH',
      path: `/1/templates/${template.id}`,
      body,
    });

    update({
      template: data,
    });

    showSuccessNotification({
      message: 'Updated Content',
    });
  });

  function onSubmit(evt) {
    evt.preventDefault();
    run(fields);
  }

  function render() {
    return (
      <form onSubmit={onSubmit}>
        <Menu />
        <Paper p="md" withBorder>
          <ErrorMessage error={error} />
          {renderChannelSelector()}

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
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<PiCodeBold />}>
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

  function renderChannelSelector() {
    if (template.channels.length > 1) {
      return (
        <React.Fragment>
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
        </React.Fragment>
      );
    }
  }

  return render();
}
