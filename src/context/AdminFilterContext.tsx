'use client';

import React, { createContext, useContext, useState } from 'react';

interface AdminFilterContextType {
  serviceFilter: string;
  setServiceFilter: (value: string) => void;
}

const AdminFilterContext = createContext<AdminFilterContextType>({
  serviceFilter: 'Hotel',
  setServiceFilter: () => {},
});

export function AdminFilterProvider({ children }: { children: React.ReactNode }) {
  const [serviceFilter, setServiceFilter] = useState('Hotel');

  return (
    <AdminFilterContext.Provider value={{ serviceFilter, setServiceFilter }}>
      {children}
    </AdminFilterContext.Provider>
  );
}

export function useAdminFilter() {
  return useContext(AdminFilterContext);
}
