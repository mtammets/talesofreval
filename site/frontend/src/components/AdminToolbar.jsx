import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';

function AdminToolbar({
  adminToken,
  setAdminToken,
  storyControlsVisible,
  setStoryControlsVisible,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!adminToken || location.pathname === '/login') {
    return null;
  }

  const logout = () => {
    setStoredStoryAdminAuth('');
    setAdminToken('');
    toast.success('Admin mode disabled.');
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar__meta">
        <strong>Edit mode</strong>
        <span>Inline editing is available where supported.</span>
      </div>
      <div className="admin-toolbar__actions">
        {location.pathname !== '/story' ? (
          <Link to="/story" className="admin-toolbar__link">
            Open editable section
          </Link>
        ) : null}
        {location.pathname === '/story' ? (
          <button
            type="button"
            className="admin-toolbar__button"
            onClick={() => setStoryControlsVisible?.((current) => !current)}
          >
            {storyControlsVisible ? 'Hide controls' : 'Show controls'}
          </button>
        ) : null}
        <button type="button" className="admin-toolbar__button" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}

export default AdminToolbar;
