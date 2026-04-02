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

export const transformMenu = (menu: any) => {
  return {
    id: menu.id,
    tenant_id: menu.tenant_id,
    name: menu.name,
    price: menu.price,
    stock: menu.stock,
    createdAt: menu.created_at,
  };
};

export const transformMenuList = (menus: any[]) => {
  return menus.map((menu) => transformMenu(menu));
};
