import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getOrgSettings, updateOrgSettings, changePassword } from '../api/settingsAPI';
// You'll need to export UserContext/AuthContext from your context file to use this
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); // Assuming user object has { role: 'admin' }
    const isAdmin = user?.role === 'admin';

    const [orgData, setOrgData] = useState({ name: '', logo_url: '', address: '' });
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });

    useEffect(() => {
        if (isAdmin) {
            getOrgSettings().then(setOrgData).catch(console.error);
        }
    }, [isAdmin]);

    const handleOrgUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateOrgSettings(orgData);
            alert(t('settings_updated'));
        } catch (error) { alert('Failed to update'); }
    };

    const handlePwdChange = async (e) => {
        e.preventDefault();
        try {            
            const response = await changePassword(pwdData);
            alert(t('password_changed'));
            setPwdData({ currentPassword: '', newPassword: '' });
        } catch (error) { alert(error.response?.data?.error || 'Failed to change password'); }
    };

    return (
        <div className="container-fluid mt-5 pt-4">
            <h2>{t('settings')}</h2>

            <div className="row mt-4">
                {/* ADMIN ONLY: Organization Settings */}
                {/* 
                {isAdmin && (
                    <div className="col-md-6 mb-4">
                        <div className="card">
                            <div className="card-header bg-primary text-white">{t('organization_settings')}</div>
                            <div className="card-body">
                                <form onSubmit={handleOrgUpdate}>
                                    <div className="mb-3">
                                        <label>{t('company_name')}</label>
                                        <input className="form-control" value={orgData.name}
                                            onChange={e => setOrgData({ ...orgData, name: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label>{t('logo_url')}</label>
                                        <input className="form-control" value={orgData.logo_url}
                                            onChange={e => setOrgData({ ...orgData, logo_url: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label>{t('address')}</label>
                                        <textarea className="form-control" value={orgData.address}
                                            onChange={e => setOrgData({ ...orgData, address: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary">{t('save')}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                */}

                {/* ALL USERS: Change Password */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-secondary text-white">{t('update_password')}</div>
                        <div className="card-body">
                            <form onSubmit={handlePwdChange}>
                                <div className="mb-3">
                                    <label>{t('current_password')}</label>
                                    <input type="password" className="form-control" required
                                        value={pwdData.currentPassword}
                                        onChange={e => setPwdData({ ...pwdData, currentPassword: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label>{t('new_password')}</label>
                                    <input type="password" className="form-control" required
                                        value={pwdData.newPassword}
                                        onChange={e => setPwdData({ ...pwdData, newPassword: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-secondary">{t('update_password')}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;