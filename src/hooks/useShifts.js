import { useState, useEffect } from 'react';
import { shiftService } from '../services/shiftService';

export const useShifts = (startDate, endDate) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!startDate || !endDate) return;

    let isSubscribed = true;

    const unsubscribe = shiftService.subscribeToShifts(
      startDate,
      endDate,
      data => {
        if (isSubscribed) {
          setShifts(data);
          setLoading(false);
          setError(null);
        }
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [startDate, endDate]);

  const addShift = async shiftData => {
    const result = await shiftService.addShift(shiftData);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const updateShift = async (id, shiftData) => {
    const result = await shiftService.updateShift(id, shiftData);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const deleteShift = async id => {
    const result = await shiftService.deleteShift(id);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const swapShifts = async (
    shift1Id,
    shift2Id,
    employee1Data,
    employee2Data
  ) => {
    const result = await shiftService.swapShifts(
      shift1Id,
      shift2Id,
      employee1Data,
      employee2Data
    );
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  return {
    shifts,
    loading,
    error,
    addShift,
    updateShift,
    deleteShift,
    swapShifts,
  };
};
