import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getOrgSettings, updateOrgSettings, changePassword } from '../api/settingsAPI';
import { getWhatsAppStatus, connectWhatsApp, disconnectWhatsApp } from '../api/whatsappAPI';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); // Assuming user object has { role: 'admin' }
    const isAdmin = user?.role === 'admin';

    const [orgData, setOrgData] = useState({ name: '', logo_url: '', address: '' });
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });
    const [waStatus, setWaStatus] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [loadingWa, setLoadingWa] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            getOrgSettings().then(setOrgData).catch(console.error);
        }
        
        // Fetch WA status on load
        fetchWaStatus();
    }, [isAdmin]);

    const fetchWaStatus = async () => {
        try {
            const status = await getWhatsAppStatus();
            setWaStatus(status.instance?.state);
        } catch (error) {
            console.error(error);
        }
    };

    const handleWaConnect = async () => {
        setLoadingWa(true);
        try {
            const res = await connectWhatsApp();
            if (res.base64) {
                setQrCode(res.base64);
                // Start polling status since user needs to scan
                const interval = setInterval(async () => {
                    const st = await getWhatsAppStatus();
                    if (st.instance?.state === 'open') {
                        setWaStatus('open');
                        setQrCode(null);
                        clearInterval(interval);
                    }
                }, 3000);
            }
        } catch (error) {
            alert('Failed to connect WhatsApp');
        } finally {
            setLoadingWa(false);
        }
    };

    const handleWaDisconnect = async () => {
        if (!window.confirm("Are you sure you want to disconnect WhatsApp?")) return;
        setLoadingWa(true);
        try {
            await disconnectWhatsApp();
            setWaStatus('close');
        } catch (error) {
            alert('Failed to disconnect WhatsApp');
        } finally {
            setLoadingWa(false);
        }
    };

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
                {/* ALL USERS: Change Password */}
                <div className="col-md-6 mb-4">
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

                {/* WhatsApp Connection */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-success text-white">WhatsApp Integration</div>
                        <div className="card-body text-center">
                            {waStatus === 'open' ? (
                                <div>
                                    <h4 className="text-success mb-3">WhatsApp is Connected</h4>
                                    <button onClick={handleWaDisconnect} disabled={loadingWa} className="btn btn-danger">
                                        {loadingWa ? 'Disconnecting...' : 'Disconnect'}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-warning mb-3">WhatsApp is Not Connected</h4>
                                    {!qrCode ? (
                                        <button onClick={handleWaConnect} disabled={loadingWa} className="btn btn-primary">
                                            {loadingWa ? 'Connecting...' : 'Connect WhatsApp'}
                                        </button>
                                    ) : (
                                        <div>
                                            <p className="text-muted">Scan this QR Code with your WhatsApp app.</p>
                                            <img src={qrCode} alt="WhatsApp QR Code" className="img-fluid" style={{ maxWidth: '250px' }} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;