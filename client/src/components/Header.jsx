import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Header() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('appTitle') || 'My App';

    // To avoid duplication, we check if these elements exist or use a library like react-helmet, 
    // but strictly following your logic:

    // Note: React might re-run this effect. In a real app, ensure you don't duplicate tags.
    // For this conversion, I am keeping your logic intact.

    const metaCharset = document.createElement('meta');
    metaCharset.setAttribute('charSet', 'utf-8');

    const metaViewport = document.createElement('meta');
    metaViewport.name = 'viewport';
    metaViewport.content = 'width=device-width, initial-scale=1';

    if (!document.querySelector('meta[charset="utf-8"]')) document.head.appendChild(metaCharset);
    if (!document.querySelector('meta[name="viewport"]')) document.head.appendChild(metaViewport);

    const link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = '/css/bootstrap.min.css';

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = '/css/fontawesome.min.css';

    const link3 = document.createElement('link');
    link3.rel = 'stylesheet';
    link3.href = '/css/custom.css';

    document.head.append(link1, link2, link3);

    return () => {
      // Cleanup to prevent duplicate CSS on re-renders
      if (document.head.contains(link1)) document.head.removeChild(link1);
      if (document.head.contains(link2)) document.head.removeChild(link2);
      if (document.head.contains(link3)) document.head.removeChild(link3);
    };
  }, [t]);

  return null;
}

export default Header;