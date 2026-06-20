import { useNavigate } from 'react-router-dom';
import API from '../../Api'; 

export function useLogout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('oral_scan_token'); 
    const refresh = localStorage.getItem('oral_scan_refresh_token');

    try {
      if (token) {
        await API.post('/auth/signOut', 
          { refreshtoken: refresh }, 
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Server update failed:", error);
    } finally {
      localStorage.clear(); 
      navigate('/signUp'); 
    }
  };
  return handleLogout;
}