import { createContext, useContext, useState, type ReactNode } from "react";

interface EditModeContextValue {
  editMode: boolean;
  toggleEditMode: () => void;
  exitEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextValue>({
  editMode: false,
  toggleEditMode: () => {},
  exitEditMode: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = () => setEditMode((v) => !v);
  const exitEditMode  = () => setEditMode(false);
  return (
    <EditModeContext.Provider value={{ editMode, toggleEditMode, exitEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditModeContext() {
  return useContext(EditModeContext);
}
