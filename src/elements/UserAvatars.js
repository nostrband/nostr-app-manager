import React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { isPhone } from '../const';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  '&:hover, &:focus': {},
}));

const UserAvatars = ({ users }) => {
  const displayCount = 10;
  const extraCount =
    users.length > displayCount ? users.length - displayCount : 0;

  return (
    <div
      className="link"
      style={{ padding: '0 0 10px 10px', pointerEvents: 'none' }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <AvatarGroup max={displayCount}>
          {users.slice(0, displayCount).map((img, index) => (
            <StyledAvatar
              key={index}
              alt={`User ${index + 1}`}
              src={img.picture}
            />
          ))}
        </AvatarGroup>
        {extraCount > 0 && (
          <span style={{ margin: '0 0 0 5px' }}>
            {isPhone ? `+${extraCount}` : `and ${extraCount} more`}
          </span>
        )}
      </Stack>
    </div>
  );
};

export default UserAvatars;
