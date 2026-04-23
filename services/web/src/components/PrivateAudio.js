// Component for use with private audio uploads.

import { useEffect, useState } from 'react';

import { request } from 'utils/api';

export default function PrivateAudio(props) {
  const { upload, ref, ...rest } = props;
  const uploadId = upload?.id || upload;
  const [src, setSrc] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await request({
        method: 'GET',
        path: `/1/uploads/${uploadId}/url`,
      });
      setSrc(data);
    })();
  }, [uploadId]);

  return <audio {...rest} ref={ref} src={src} />;
}
