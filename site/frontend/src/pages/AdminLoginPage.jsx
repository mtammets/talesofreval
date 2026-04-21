import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import storyAdminService, {
  setStoredStoryAdminAuth,
} from '../features/events/storyAdminService';

const getLoginErrorMessage = (error) => {
  const status = error.response?.status;

  if (status === 401) {
    return error.response?.data?.message || 'Invalid admin password.';
  }

  if (status === 429) {
    return error.response?.data?.message || 'Too many login attempts. Please wait and try again.';
  }

  if (status === 502 || status === 503 || status === 504 || !error.response) {
    return 'Admin backend is unavailable. Start the backend and try again.';
  }

  return error.response?.data?.message || 'Login failed.';
};

function AdminLoginPage({ adminToken, setAdminToken, setEditControlsVisible }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const search = new URLSearchParams(location.search);
  const nextPath = location.state?.nextPath || search.get('next') || '/';

  useEffect(() => {
    if (adminToken) {
      navigate(nextPath, { replace: true });
    }
  }, [adminToken, navigate, nextPath]);

  const closeLogin = () => {
    navigate(nextPath, { replace: true });
  };

  const submitLogin = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      await storyAdminService.login(password);
      setStoredStoryAdminAuth('active');
      setAdminToken('active');
      setEditControlsVisible?.(true);
      setPassword('');
      toast.success('Edit mode is on.');
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="story-admin-login-page" onClick={closeLogin}>
      <div
        className="story-admin-login-card"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={submitLogin} className="story-admin-login-form">
          <label>
            Password
            <input
              type="password"
              value={password}
              placeholder="Enter password"
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
