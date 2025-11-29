// Modal.jsx (Renamed locally as needed, but file name kept as provided)
import React from 'react';
import { useTranslation } from 'react-i18next';

function Modal({ id, title, children }) {
    const { t } = useTranslation();
    return (
        <div className="modal fade" id={id} tabIndex="-1" aria-labelledby={`${id}Label`} aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id={`${id}Label`}>{title}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label={t('close')} />
                    </div>
                    <div className="modal-body">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default Modal;