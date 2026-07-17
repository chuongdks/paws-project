import { useState, useEffect } from 'react';
import api from '../api/axiosConfig.js';
import { CATEGORIES as FALLBACK_CATEGORIES, PAWS_TAGS as FALLBACK_TAG_NAMES } from '../models/Service.js';

// Tags that a regular admin can assign from the form
const ADMIN_ONLY_TAG_NAMES = ['Verified by PAWS', 'Needs verification'];

// Only used if categories.php/tags.php are unreachable — keeps the Add/Edit
// form usable offline, same as service.json does for the services list itself.
// Fake sequential ids here are fine since offline mode has nowhere real to send them anyway.
const FALLBACK_TAGS = FALLBACK_TAG_NAMES.map((name, i) => ({ id: i + 1, name, slug: name }));

// Owns the categories + tags lists used by the FilterBar pills and the Add/Edit
// service form. Falls back to the static lists in Service.js if the API is unreachable.
export function useTaxonomy() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [tags, setTags]             = useState(FALLBACK_TAGS);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          api.get('/categories.php'),
          api.get('/tags.php'),
        ]);
        if (cancelled) return;

        const catJson = catRes.data;
        const tagJson = tagRes.data;
        if (!catJson.success) throw new Error(catJson.message || 'categories.php returned success: false');
        if (!tagJson.success) throw new Error(tagJson.message || 'tags.php returned success: false');

        setCategories(catJson.data);
        setTags(tagJson.data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load categories/tags from the API, falling back to local lists\n Full Error:', err);
        setCategories(FALLBACK_CATEGORIES);
        setTags(FALLBACK_TAGS);
        setError('Could not reach the live directory — showing sample categories and tags instead.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Tags a regular user/admin can pick from the Add/Edit form (excludes system-managed ones)
  const assignableTags = tags.filter(t => !ADMIN_ONLY_TAG_NAMES.includes(t.name));

  return { categories, tags, assignableTags, loading, error };
}
