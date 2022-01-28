export const userPublic = {
  id: true,
  username: true,
};

export const partyPublic = {
  id: true,
  name: true,
  starts_at: true,
  ends_at: true,
  description: true,
  scope: true,
  latitude: true,
  longitude: true,
  creator_id: true,
  created_at: true,
  updated_at: true,
  creator: {
    select: userPublic,
  },
  participations: {
    select: {
      user: {
        select: userPublic,
      },
    },
  },
};
