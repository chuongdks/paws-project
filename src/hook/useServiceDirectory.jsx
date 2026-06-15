import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

export function useServiceDirectory(services) {
  const [searchQuery, setSearchQuery]               = useState('');
  const [categoryFilter, setCategoryFilter]         = useState('All');          // All, In-Person, Virtual/Helpline
  const [inclusivityFilter, setInclusivityFilter]   = useState('All');    // All, Youth Focus, Senior Focus, Family/Ally Focus

  // Fuzzy search configuration using Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(services, {
      keys: ['Name', 'Description', 'Location'],
      threshold: 0.35,
    });
  }, [services]);

  const filteredServices = useMemo(() => {
    // 1. Keyword search
    let results = searchQuery.trim()
      ? fuse.search(searchQuery).map(r => r.item)
      : services;

    // 2. Access model filter — driven by whether a Location string exists
    if (categoryFilter === 'In-Person') {
      results = results.filter(s => s.Location?.trim());
    } else if (categoryFilter === 'Virtual/Helpline') {
      results = results.filter(s => !s.Location?.trim());
    }

    // 3. Demographic/focus filter — driven by the explicit tags array
    if (inclusivityFilter !== 'All') {
      results = results.filter(s => s.tags?.includes(inclusivityFilter));
    }

    return results;
  }, [searchQuery, categoryFilter, inclusivityFilter, fuse]);

  return {
    searchQuery,        setSearchQuery,
    categoryFilter,     setCategoryFilter,
    inclusivityFilter,  setInclusivityFilter,
    filteredServices
  };
}