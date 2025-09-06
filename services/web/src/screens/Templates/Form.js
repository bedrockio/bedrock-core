import {
  Button,
  Fieldset,
  Grid,
  Group,
  MultiSelect,
  Paper,
  SegmentedControl,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';

import {
  PiChatCircleFill,
  PiCodeFill,
  PiDeviceMobileFill,
  PiEnvelopeFill,
  PiQuestionFill,
} from 'react-icons/pi';

import ErrorMessage from 'components/ErrorMessage';
import ModalWrapper from 'components/ModalWrapper';

import { request, useRequest } from 'utils/api';

import HelpModal from './Detail/HelpModal';
import SendPreviewButton from './Detail/SendPreviewButton';

const channelOptions = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
];

const CHANNEL_ICONS = {
  email: PiEnvelopeFill,
  sms: PiChatCircleFill,
  push: PiDeviceMobileFill,
};

export default function TemplateForm({ template, onSuccess = () => {} }) {
  const isUpdate = !!template;

  const [params, setParams] = useState(null);
  const [paramsError, setParamsError] = useState(null);
  const [currentChannel, setCurrentChannel] = useState('');

  const form = useForm({
    initialValues: template || {
      name: '',
      channels: [],
      email: '',
      sms: '',
      push: '',
    },
  });

  // Set initial channel when form loads or channels change
  useEffect(() => {
    if (form.values.channels?.length > 0 && !currentChannel) {
      setCurrentChannel(form.values.channels[0]);
    }
  }, [form.values.channels, currentChannel]);

  // Load params for existing template
  useEffect(() => {
    if (isUpdate && template?.id) {
      loadParams();
    }
  }, [isUpdate, template?.id]);

  async function loadParams() {
    try {
      setParamsError(null);
      const { data } = await request({
        method: 'GET',
        path: `/1/templates/${template.id}/params`,
      });
      setParams(data);
    } catch (error) {
      setParamsError(error);
    }
  }

  const editRequest = useRequest({
    ...(isUpdate
      ? {
          method: 'PATCH',
          path: `/1/templates/${template.id}`,
        }
      : {
          method: 'POST',
          path: '/1/templates',
        }),
    onSuccess: ({ data }) => {
      showNotification({
        title: isUpdate
          ? `${data.name} was successfully updated.`
          : `${data.name} was successfully created.`,
        color: 'green',
      });
      setTimeout(() => {
        onSuccess(data);
      }, 200);
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        editRequest.request({ body: values }),
      )}>
      <Stack>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset legend="Template Details" variant="unstyled">
              <Stack gap="xs">
                <TextInput
                  required
                  label="Name"
                  {...form.getInputProps('name')}
                />
                <MultiSelect
                  label="Channels"
                  data={channelOptions}
                  {...form.getInputProps('channels')}
                  onChange={(value) => {
                    form.setFieldValue('channels', value);
                    if (value.length > 0 && !value.includes(currentChannel)) {
                      setCurrentChannel(value[0]);
                    }
                  }}
                />
              </Stack>
            </Fieldset>
          </Grid.Col>
        </Grid>

        {/* Template Body Editing Section */}
        {isUpdate && form.values.channels?.length > 0 && (
          <>
            <Fieldset legend="Content" variant="unstyled">
              <SegmentedControl
                value={currentChannel}
                onChange={setCurrentChannel}
                data={form.values.channels.map((channel) => {
                  const Icon = CHANNEL_ICONS[channel];
                  return {
                    value: channel,
                    label: <Icon />,
                  };
                })}
              />
              <Textarea
                label={`${currentChannel?.charAt(0).toUpperCase() + currentChannel?.slice(1)} Body`}
                placeholder="Enter your template content here..."
                minRows={20}
                styles={{
                  input: {
                    fontFamily:
                      'Menlo, Monaco, Courier, "Courier New", monospace',
                    fontSize: '14px',
                  },
                }}
                {...form.getInputProps(currentChannel)}
              />

              <Group gap="md">
                <ModalWrapper
                  title="Template Help"
                  size="lg"
                  trigger={
                    <Button
                      size="sm"
                      variant="default"
                      leftSection={<PiQuestionFill />}>
                      Help
                    </Button>
                  }
                  component={<HelpModal />}
                />

                {params && (
                  <ModalWrapper
                    title="Template Parameters"
                    size="lg"
                    trigger={
                      <Button
                        variant="default"
                        size="sm"
                        leftSection={<PiCodeFill />}>
                        Params
                      </Button>
                    }
                    component={
                      <Paper p="md">
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                          {JSON.stringify(params, null, 2)}
                        </pre>
                      </Paper>
                    }
                  />
                )}

                <SendPreviewButton
                  channel={currentChannel}
                  template={template}
                />
              </Group>
            </Fieldset>
          </>
        )}

        <ErrorMessage error={editRequest.error || paramsError} mb="md" />

        <Group mt="md" gap="md" justify="space-between">
          <Button
            type="submit"
            loading={editRequest.loading}
            disabled={editRequest.loading}>
            {isUpdate ? 'Update' : 'Create New'} Template
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
