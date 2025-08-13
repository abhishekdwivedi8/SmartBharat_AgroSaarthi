import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigationState = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Save current location to localStorage
    try {
      localStorage.setItem('lastVisitedPage', location.pathname + location.search);
      localStorage.setItem('lastVisitedTime', new Date().toISOString());
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }, [location]);

  const restoreLastPage = () => {
    try {
      const lastPage = localStorage.getItem('lastVisitedPage');
      const lastTime = localStorage.getItem('lastVisitedTime');
      
      if (lastPage && lastTime) {
        const timeDiff = Date.now() - new Date(lastTime).getTime();
        // Only restore if less than 24 hours ago
        if (timeDiff < 24 * 60 * 60 * 1000) {
          navigate(lastPage);
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to restore navigation state:', error);
    }
    return false;
  };

  const getLastVisitedPage = () => {
    try {
      return localStorage.getItem('lastVisitedPage') || '/';
    } catch {
      return '/';
    }
  };

  return {
    restoreLastPage,
    getLastVisitedPage
  };
};