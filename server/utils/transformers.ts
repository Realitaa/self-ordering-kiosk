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

export const transformOrder = (order: any) => {
  return {
    id: order.id,
    customer_id: order.customer_id,
    customer_name: order.customer_name,
    tenant_id: order.tenant_id,
    stall_name: order.stall_name,
    status: order.status,
    total_price: order.total_price,
    createdAt: order.created_at,
  };
};

export const transformOrderList = (orders: any[]) => {
  return orders.map((order) => transformOrder(order));
};

export const transformOrderItem = (item: any) => {
  return {
    id: item.id,
    order_id: item.order_id,
    menu_id: item.menu_id,
    menu_name: item.menu_name,
    qty: item.qty,
    price: item.price,
  };
};

export const transformOrderItemList = (items: any[]) => {
  return items.map((item) => transformOrderItem(item));
};

export const transformPayment = (payment: any) => {
  return {
    id: payment.id,
    order_id: payment.order_id,
    method: payment.method,
    amount: payment.amount,
    status: payment.status,
    paid_at: payment.paid_at,
    tenant_id: payment.tenant_id,
    customer_name: payment.customer_name,
  };
};

export const transformPaymentList = (payments: any[]) => {
  return payments.map((payment) => transformPayment(payment));
};
