import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../productionLink/productionLink';

const useDynamicFavicon = () => {
  const location = useLocation();

  useEffect(() => {
    const schoolName = localStorage.getItem('schoolName') || 'School ERP';
    const schoolLogo = localStorage.getItem('schoolLogo');
    const defaultLogo = '/favicon.png'; // Using the newly set default favicon

    // Update document title
    document.title = schoolName;

    // Update favicon
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = schoolLogo ? `${API_URL}${schoolLogo}` : defaultLogo;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = schoolLogo ? `${API_URL}${schoolLogo}` : defaultLogo;
      document.head.appendChild(newLink);
    }
  }, [location]); // Re-run when location changes, in case they log in/out
};

export default useDynamicFavicon;
