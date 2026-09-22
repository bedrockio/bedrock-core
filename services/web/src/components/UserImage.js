import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { urlForUpload } from 'utils/uploads';

function getInitials(name) {
  if (!name) {
    return '';
  }
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function UserImage(props) {
  const { user } = props;

  if (!user?.image) {
    return null;
  }

  return (
    <Avatar className="mt-2 size-[150px] rounded-sm">
      <AvatarImage
        src={urlForUpload(user.image)}
        alt={user.name}
        className="object-cover"
      />
      <AvatarFallback className="rounded-sm">
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}
