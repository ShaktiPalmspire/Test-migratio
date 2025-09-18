import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

export const useSelectedObjects = () => {
  const { loadSelectedObjects, saveSelectedObjects } = useUser();
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);

  // Load selectedObjects from database on mount
  useEffect(() => {
    const loaded = loadSelectedObjects();
    if (loaded.length > 0) {
      setSelectedObjects(loaded);
    }
  }, [loadSelectedObjects]);

  // Save to localStorage immediately for UI updates
  const updateSelectedObjects = (newObjects: string[]) => {
    setSelectedObjects(newObjects);
    localStorage.setItem('selectedObjects_last', JSON.stringify(newObjects));
  };

  // Save to database (call this when user changes selection)
  const saveToDatabase = async (objects: string[]) => {
    if (objects.length > 0) {
      await saveSelectedObjects(objects);
    }
  };

  return {
    selectedObjects,
    setSelectedObjects: updateSelectedObjects,
    saveToDatabase,
  };
};
