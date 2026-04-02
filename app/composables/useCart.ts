export type CartItem = {
  menuId: number;
  name: string;
  price: number;
  qty: number;
};

export type Cart = {
  stallId: number | null;
  stallName: string;
  items: CartItem[];
};

export const useCart = () => {
  const cart = useState<Cart>("cart", () => ({
    stallId: null,
    stallName: "",
    items: [],
  }));

  const cartCount = computed(() =>
    cart.value.items.reduce((sum, item) => sum + item.qty, 0),
  );

  const cartTotal = computed(() =>
    cart.value.items.reduce((sum, item) => sum + item.price * item.qty, 0),
  );

  const setStall = (stallId: number, stallName: string) => {
    if (cart.value.stallId !== null && cart.value.stallId !== stallId) {
      // Different stall — clear cart
      cart.value = { stallId, stallName, items: [] };
    } else {
      cart.value.stallId = stallId;
      cart.value.stallName = stallName;
    }
  };

  const addItem = (menuId: number, name: string, price: number) => {
    const existing = cart.value.items.find((i) => i.menuId === menuId);
    if (existing) {
      existing.qty++;
    } else {
      cart.value.items.push({ menuId, name, price, qty: 1 });
    }
  };

  const removeItem = (menuId: number) => {
    const existing = cart.value.items.find((i) => i.menuId === menuId);
    if (existing) {
      existing.qty--;
      if (existing.qty <= 0) {
        cart.value.items = cart.value.items.filter((i) => i.menuId !== menuId);
      }
    }
  };

  const getItemQty = (menuId: number) => {
    return cart.value.items.find((i) => i.menuId === menuId)?.qty ?? 0;
  };

  const clearCart = () => {
    cart.value = { stallId: null, stallName: "", items: [] };
  };

  return {
    cart,
    cartCount,
    cartTotal,
    setStall,
    addItem,
    removeItem,
    getItemQty,
    clearCart,
  };
};
