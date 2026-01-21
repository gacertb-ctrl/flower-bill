import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getStaff, createStaff, deleteStaff } from '../api/settingsAPI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const UserManagementPage = () => {
    const { t } = useTranslation();
    const [staffList, setStaffList] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '' });

    const loadStaff = async () => {
        try {
            const data = await getStaff();
            setStaffList(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { loadStaff(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createStaff(newUser);
            setNewUser({ username: '', password: '' });
            loadStaff();
            alert('Staff created');
        } catch (e) { alert('Error creating staff'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this user?')) {
            await deleteStaff(id);
            loadStaff();
        }
    };

    return (
        <div className="container-fluid mt-5 pt-4">
            <h2>{t('user_management')}</h2>

            <div className="row">
                {/* Create User Form */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">{t('add_staff')}</div>
                        <div className="card-body">
                            <form onSubmit={handleCreate}>
                                <div className="mb-3">
                                    <label>{t('username')}</label>
                                    <input className="form-control" required value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label>{t('password')}</label>
                                    <input type="password" class="form-control" required value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                </div>
                                <button className="btn btn-success w-100">{t('create_user')}</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* User List */}
                <div className="col-md-8">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>{t('username')}</th>
                                <th>{t('role')}</th>
                                <th>{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(user => (
                                <tr key={user.user_id}>
                                    <td>{user.username}</td>
                                    <td><span className="badge bg-info">{user.role}</span></td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.user_id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;