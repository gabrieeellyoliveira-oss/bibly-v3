import { createContext, useContext, useState, useRef, type ReactNode } from "react";

type SaveFn = () => Promise<void>;

interface EditModeContextValue {
  editMode: boolean;
  toggleEditMode: () => void;
  exitEditMode: () => void;
  /** Registra a função de save da página atual */
  registerSave: (fn: SaveFn) => void;
}

const EditModeContext = createContext<EditModeContextValue>({
  editMode: false,
  toggleEditMode: () => {},
  exitEditMode: () => {},
  registerSave: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const saveFnRef = useRef<SaveFn | null>(null);

  const registerSave = (fn: SaveFn) => { saveFnRef.current = fn; };

  const toggleEditMode = async () => {
    if (editMode) {
      // Saindo do modo editor → salvar primeiro
      if (saveFnRef.current) await saveFnRef.current();
    }
    setEditMode((v) => !v);
  };

  const exitEditMode = async () => {
    if (saveFnRef.current) await saveFnRef.current();
    setEditMode(false);
  };

  return (
    <EditModeContext.Provider value={{ editMode, toggleEditMode, exitEditMode, registerSave }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditModeContext() {
  return useContext(EditModeContext);
}
