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
