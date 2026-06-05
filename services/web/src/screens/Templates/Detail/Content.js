import React, { useState } from 'react';

import {
  PiChatCircleBold,
  PiCodeBold,
  PiDeviceMobileBold,
  PiEnvelopeBold,
  PiQuestionBold,
} from 'react-icons/pi';

import { usePage } from 'stores/page';

import ErrorMessage from 'components/ErrorMessage';
import Actions from 'components/form-fields/Actions';
import { useFields } from 'hooks/forms';
import { useRequest } from 'hooks/request';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { request } from 'utils/api';
import { notifySuccess } from 'utils/notify';

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

    notifySuccess({
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
        <Card className="gap-0 p-4">
          <ErrorMessage error={error} />
          {renderChannelSelector()}

          <div className="flex flex-col gap-2">
            <Label htmlFor={`template-${channel}`}>
              {CHANNEL_LABELS[channel]}
            </Label>
            <Textarea
              key={channel}
              id={`template-${channel}`}
              name={channel}
              value={fields[channel]}
              onChange={setField}
              rows={15}
            />
          </div>

          <div className="mt-4" />

          <div className="flex flex-wrap gap-4">
            <HelpModal
              trigger={
                <Button size="sm" variant="outline">
                  <PiQuestionBold />
                  Help
                </Button>
              }
            />

            <ParamsModal
              template={template}
              trigger={
                <Button variant="outline" size="sm">
                  <PiCodeBold />
                  Params
                </Button>
              }
            />
            <SendPreviewButton channel={channel} template={template} />
          </div>
        </Card>

        <Actions>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner className="text-current" />}
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
          <Tabs value={channel} onValueChange={setChannel}>
            <TabsList>
              {template.channels.map((channel) => {
                const Icon = CHANNEL_ICONS[channel];
                return (
                  <TabsTrigger key={channel} value={channel}>
                    <Icon />
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <div className="mt-4" />
        </React.Fragment>
      );
    }
  }

  return render();
}
