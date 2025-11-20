import { Image } from '@mantine/core';

import { urlForUpload } from 'utils/uploads';

export default function UserImage(props) {
  const { user } = props;

  if (!user?.image) {
    return null;
  }

  return (
    <Image
      h={150}
      w="auto"
      mt="sm"
      radius="sm"
      src={urlForUpload(user.image)}
    />
  );
}
