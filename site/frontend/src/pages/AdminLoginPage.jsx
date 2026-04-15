import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import storyAdminService, {
  getStoredStoryAdminAuth,
  setStoredStoryAdminAuth,
} from '../features/events/storyAdminService';
import { encodeBasicToken } from '../features/events/storyAdminUtils';

function AdminLoginPage({ adminToken, setAdminToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const search = new URLSearchParams(location.search);
  const nextPath = location.state?.nextPath || search.get('next') || '/';

  useEffect(() => {
    const storedToken = adminToken || getStoredStoryAdminAuth();

    if (storedToken) {
      navigate(nextPath, { replace: true });
    }
  }, [adminToken, navigate, nextPath]);

  const closeLogin = () => {
    navigate(nextPath, { replace: true });
  };

  const submitLogin = async (event) => {
    event.preventDefault();

    const token = encodeBasicToken(username.trim(), password);
    setIsSubmitting(true);

    try {
      await storyAdminService.listStoryEvents(token);
      setStoredStoryAdminAuth(token);
      setAdminToken(token);
      setPassword('');
      toast.success('Edit mode enabled.');
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed.');
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
        <h1>Login</h1>
        <form onSubmit={submitLogin} className="story-admin-login-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
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
