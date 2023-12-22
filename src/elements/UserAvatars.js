import React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { isPhone } from '../const';
import { useProfileImageSource } from '../hooks/useProfileImageSource';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
}));

const UserAvatar = ({ user }) => {
  const { url, viewRef } = useProfileImageSource({
    pubkey: user.pubkey,
    originalImage: user.profile.picture,
  });

  return (
    <StyledAvatar
      ref={viewRef}
      key={user.pubkey}
      alt={`${user.profile?.display_name || user.profile?.name}`}
      title={`${user.profile?.display_name || user.profile?.name}`}
      src={url}
    />
  );
};

const UserAvatars = ({ users }) => {
  const displayCount = isPhone ? 3 : 10;
  const extraCount =
    users.length > displayCount ? users.length - displayCount : 0;

  return (
    <div className="link" style={{ pointerEvents: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {users.length > 0 && (
          <span className="text-muted" style={{ margin: '0 0 0 0' }}>
            Used by
          </span>
        )}
        <AvatarGroup max={displayCount}>
          {users.slice(0, displayCount).map((user) => (
            <UserAvatar key={user.pubkey} user={user} />
          ))}
        </AvatarGroup>
        {extraCount > 0 && (
          <span className="text-muted" style={{ margin: '0 0 0 5px' }}>
            {isPhone ? `+${extraCount}` : `and ${extraCount} more`}
          </span>
        )}
      </Stack>
    </div>
  );
};

export default UserAvatars;
