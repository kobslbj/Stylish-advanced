import React, { createContext, useState, useMemo, ReactNode, useContext } from "react";

// 創建上下文
const LocalIdContext = createContext<{ localId: string | undefined; setLocalId: React.Dispatch<React.SetStateAction<string | undefined>> }>({
  localId: undefined,
  setLocalId: () => {},
});

export const LocalIdProvider: React.FC <{ children: ReactNode }> = ({ children }) => {
  const [localId, setLocalId] = useState<string | undefined>(undefined);

  const contextValue = useMemo(() => ({ localId, setLocalId }), [localId]);
  return (
    <LocalIdContext.Provider value={contextValue}>
      {children}
    </LocalIdContext.Provider>
  );
};

// 使用上下文的自定義hook
export const useLocalId = () => {
  const { localId } = useContext(LocalIdContext);
  console.log(localId);
  return localId;
};

// 使用上下文的自定義hook
export const useSetLocalId = () => {
  const { setLocalId } = useContext(LocalIdContext);
  return setLocalId;
};
