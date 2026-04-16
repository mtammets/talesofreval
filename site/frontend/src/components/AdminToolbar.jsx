import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import storyAdminService from '../features/events/storyAdminService';

function AdminToolbar({
  adminToken,
  setAdminToken,
  editControlsVisible,
  setEditControlsVisible,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!adminToken || location.pathname === '/login') {
    return null;
  }

  const logout = async () => {
    await storyAdminService.logout();
    setAdminToken('');
    setEditControlsVisible?.(false);
    toast.success('Admin mode disabled.');
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar__meta">
        <span className="admin-toolbar__eyebrow">Edit Mode</span>
      </div>
      <div className="admin-toolbar__actions">
        <button
          type="button"
          className="admin-toolbar__button admin-toolbar__button--secondary"
          onClick={() => setEditControlsVisible?.((current) => !current)}
        >
          {editControlsVisible ? 'Hide controls' : 'Show controls'}
        </button>
        <button type="button" className="admin-toolbar__button" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}

export default AdminToolbar;
