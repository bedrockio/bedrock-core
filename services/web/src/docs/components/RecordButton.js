import { Icon } from 'semantic';

import { Confirm } from 'components';
import { useClass } from 'helpers/bem';

import { useDocs } from '../utils/context';

export default function RecordButton() {
  const { recording, setRecording } = useDocs();
  if (recording) {
    return (
      <Icon
        link
        name="circle"
        className={useClass('record-button', 'active')}
        onClick={() => {
          setRecording(false);
        }}
      />
    );
  } else {
    return (
      <Confirm
        size="small"
        confirmButton="Enable"
        header="Record Mode"
        content="Turn on record mode. Requests performed will be recorded to documentation."
        trigger={
          <Icon link name="circle" className={useClass('record-button')} />
        }
        onConfirm={() => {
          setRecording(true);
        }}
      />
    );
  }
}
