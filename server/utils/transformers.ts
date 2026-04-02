export const transformUser = (user: any) => {
  return {
    id: user.id,
    fullname: user.fullname,
    username: user.username,
    email: user.email,
    role: user.role,
    pfp_id: user.pfp_id,
    joinedAt: user.created_at,
  };
};

export const transformUserList = (users: any[]) => {
  return users.map((user) => transformUser(user));
};

export const transformStall = (stall: any) => {
  return {
    id: stall.id,
    name: stall.name,
    owner_id: stall.owner_id,
  };
};

export const transformStallList = (stalls: any[]) => {
  return stalls.map((stall) => transformStall(stall));
};
