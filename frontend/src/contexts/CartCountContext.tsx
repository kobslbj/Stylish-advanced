import { createContext, useState, useMemo, ReactNode } from "react";

const storedCart = localStorage.getItem("cart");
const initialCount = storedCart ? JSON.parse(storedCart).length : 0;

const CartCountContext = createContext({
  count: initialCount,
  incrementCartCount: () => {},
  decrementCartCount: () => {},
});

const CartCountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(initialCount);

  const incrementCartCount = () => {
    setCount((prevCount: number) => prevCount + 1);
  };
  const decrementCartCount = () => {
    setCount((prevCount: number) => Math.max(0, prevCount - 1));
  };
  const contextValue = useMemo(() => ({ count, incrementCartCount, decrementCartCount }), [count]);

  return <CartCountContext.Provider value={contextValue}>{children}</CartCountContext.Provider>;
};

export { CartCountProvider, CartCountContext };
