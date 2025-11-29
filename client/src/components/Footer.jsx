import React from 'react';
import { useTranslation } from 'react-i18next';

function Footer() {
    const { t } = useTranslation();
    return (
        <footer>
            {/* Scripts usually belong in index.html, but keeping them here as per your original file */}
            <script src="/js/jquery-3.6.1.min.js"></script>
            <div className="container">
                <span className="text-muted">
                    &copy; {new Date().getFullYear()} {t('appTitle') || "MyApp"}. {t('footer.rights')}.
                </span>
            </div>
            <script src="/js/custom.js"></script>
        </footer>
    );
}

export default Footer;