import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import servicesData from '../data/service.json';

export function useServiceDirectory() {
  const [searchQuery, setSearchQuery]               = useState('');
  const [categoryFilter, setCategoryFilter]         = useState('All');          // All, In-Person, Virtual/Helpline
  const [inclusivityFilter, setInclusivityFilter]   = useState('All');    // All, Youth Focus, Senior Focus, Family/Ally Focus

  // Fuzzy search configuration using Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(servicesData, {
      keys: ['Name', 'Description', 'Location'],
      threshold: 0.35,
    });
  }, []);

  const filteredServices = useMemo(() => {
    let results = servicesData;

    // 1. Keyword search filter
    if (searchQuery.trim() !== '') {
      results = fuse.search(searchQuery).map(res => res.item);
    }

    // 2. Category parsing (Physical site layout checking)
    if (categoryFilter === 'In-Person') {
      results = results.filter(s => s.Location && s.Location.trim() !== "");
    } else if (categoryFilter === 'Virtual/Helpline') {
      results = results.filter(s => !s.Location || s.Location.trim() === "");
    }

    // 3. Inclusivity tag lookup parsing descriptions
    if (inclusivityFilter === 'Youth Focus') {
      results = results.filter(s => 
        s.Description.toLowerCase().includes('youth') || 
        s.Description.toLowerCase().includes('children') || 
        s.Name.toLowerCase().includes('youth')
      );
    } else if (inclusivityFilter === 'Senior Focus') {
      results = results.filter(s => 
        s.Description.toLowerCase().includes('senior') || 
        s.Description.toLowerCase().includes('50+')
      );
    } else if (inclusivityFilter === 'Family/Ally Focus') {
      results = results.filter(s => 
        s.Description.toLowerCase().includes('allies') || 
        s.Description.toLowerCase().includes('caregivers') || 
        s.Description.toLowerCase().includes('foster')
      );
    }

    return results;
  }, [searchQuery, categoryFilter, inclusivityFilter, fuse]);

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    inclusivityFilter,
    setInclusivityFilter,
    filteredServices
  };
}