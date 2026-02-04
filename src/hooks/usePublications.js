import { useState, useEffect } from 'react';
import { publicationService } from '../services/publicationService';

export const usePublications = (filters = {}) => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await publicationService.getAll(filters);
        setPublications(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load publications');
        console.error('Error fetching publications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [JSON.stringify(filters)]);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await publicationService.getAll(filters);
      setPublications(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  return { publications, loading, error, refetch };
};