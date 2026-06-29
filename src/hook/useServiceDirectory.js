import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { isInPerson } from '../models/Service.js';

export function useServiceDirectory(services) {
  const [searchQuery, setSearchQuery]         = useState('');
  const [accessFilter, setAccessFilter]       = useState('All');  // All | In-Person | Helplines
  const [categoryFilter, setCategoryFilter]   = useState('All');  // All | category_id (number)

  // Fuzzy search configuration using Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(services, {
      keys: ['name', 'description', 'address', 'city'],
      threshold: 0.35,
    });
  }, [services]);

  const filteredServices = useMemo(() => {
    // 1. Keyword search
    let results = searchQuery.trim()
      ? fuse.search(searchQuery).map(r => r.item)
      : services;

    // 2. Access model, check if the service is in-person or online
    if (accessFilter === 'In-Person') {
      results = results.filter(isInPerson);
    } else if (accessFilter === 'No Fixed Location') {
      results = results.filter(s => !isInPerson(s));
    }

    // 3. Category based on category_id from DB
    if (categoryFilter !== 'All') {
      results = results.filter(s => s.category_id === categoryFilter);
    }

    return results;
  }, [searchQuery, accessFilter, categoryFilter, fuse, services]);

  return {
    searchQuery,        setSearchQuery,
    accessFilter,       setAccessFilter,
    categoryFilter,     setCategoryFilter,
    filteredServices
  };
}