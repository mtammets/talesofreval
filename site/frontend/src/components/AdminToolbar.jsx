import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import storyAdminService from '../features/events/storyAdminService';

function AdminToolbar({
  adminToken,
  setAdminToken,
  editControlsVisible,
  setEditControlsVisible,
  onOpenFreeTourCalendar,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [toolbarExpanded, setToolbarExpanded] = useState(false);

  if (!adminToken || location.pathname === '/login') {
    return null;
  }

  const logout = async () => {
    await storyAdminService.logout();
    setAdminToken('');
    setEditControlsVisible?.(false);
    toast.success('Editing is off.');
    navigate('/', { replace: true });
  };

  return (
    <div className={`admin-toolbar ${toolbarExpanded ? 'admin-toolbar--expanded' : 'admin-toolbar--collapsed'}`}>
      <button
        type="button"
        className="admin-toolbar__toggle"
        aria-expanded={toolbarExpanded}
        aria-label={toolbarExpanded ? 'Minimize edit mode panel' : 'Open edit mode panel'}
        onClick={() => setToolbarExpanded((current) => !current)}
      >
        <span className="admin-toolbar__eyebrow">Edit Mode</span>
        <span className="admin-toolbar__toggle-icon" aria-hidden="true">
          {toolbarExpanded ? '-' : '+'}
        </span>
      </button>
      <div className="admin-toolbar__meta">
        <span className="admin-toolbar__eyebrow">Edit Mode</span>
      </div>
      <div className="admin-toolbar__actions">
        <button
          type="button"
          className="admin-toolbar__button admin-toolbar__button--secondary"
          onClick={() => onOpenFreeTourCalendar?.()}
        >
          Free tour calendar
        </button>
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
