import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AppDocument } from '../types';

interface AppState {
  user: User | null;
  documents: AppDocument[];
  apiKey: string | null;
}

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  addDocument: (doc: AppDocument) => void;
  updateDocument: (docId: string, updates: Partial<AppDocument>) => void;
  setApiKey: (key: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    const savedUser = localStorage.getItem('docmgr_user');
    const savedDocs = localStorage.getItem('docmgr_documents');
    const savedKey = localStorage.getItem('docmgr_apikey');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      documents: savedDocs ? JSON.parse(savedDocs) : [],
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || savedKey || null,
    };
  });

  useEffect(() => {
    localStorage.setItem('docmgr_user', JSON.stringify(state.user));
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem('docmgr_documents', JSON.stringify(state.documents));
  }, [state.documents]);
  
  useEffect(() => {
    if (state.apiKey && state.apiKey !== import.meta.env.VITE_GEMINI_API_KEY) {
      localStorage.setItem('docmgr_apikey', state.apiKey);
    } else if (!state.apiKey) {
      localStorage.removeItem('docmgr_apikey');
    }
  }, [state.apiKey]);

  const login = (user: User) => setState(s => ({ ...s, user }));
  
  const logout = () => setState(s => ({ ...s, user: null }));

  const addDocument = (doc: AppDocument) => {
    setState(s => ({ ...s, documents: [doc, ...s.documents] }));
  };

  const updateDocument = (docId: string, updates: Partial<AppDocument>) => {
    setState(s => ({
      ...s,
      documents: s.documents.map(d => d.id === docId ? { ...d, ...updates } : d)
    }));
  };

  const setApiKey = (key: string | null) => setState(s => ({ ...s, apiKey: key }));

  return (
    <AppContext.Provider value={{ ...state, login, logout, addDocument, updateDocument, setApiKey }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
