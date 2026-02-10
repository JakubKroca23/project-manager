'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TimelinePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setProjectCount(count);
      }
      setIsLoading(false);
    };
    fetchCount();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="mb-6">
        <h1>Timeline</h1>
        <p>Vizuální přehled projektů v čase</p>
      </header>

      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">Timeline vizualizace se připravuje...</p>
        <p className="text-sm text-gray-400 mt-2">
          {isLoading ? 'Ověřuji připojení k databázi...' : `V databázi je ${projectCount} projektů.`}
        </p>
      </div>
    </div>
  );
}
