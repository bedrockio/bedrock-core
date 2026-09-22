// Component for use with private uploads.

import { useEffect, useState } from 'react';

import Thumbnail from 'components/Thumbnail';

import { request } from 'utils/api';

import { ExternalLink } from './Link';

export default function PrivateImage(props) {
  const { upload, ...rest } = props;
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

  return (
    <ExternalLink href={src}>
      <Thumbnail {...rest} src={src} />
    </ExternalLink>
  );
}
