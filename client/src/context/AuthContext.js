import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthStatus } from "../api/authAPI";

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => { },
  logout: () => { },
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const navigate = useNavigate();

  // 🔥 Check token + load user data on first page load
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        // No token stored → not authenticated
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        return;
      }

      try {
        const data = await checkAuthStatus(); // Backend verifies token and returns user
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          loading: false,
        });
      } catch (error) {
        // Token invalid → remove token + reset auth
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    };

    verifyUser();
  }, []);

  // 🔑 Login and set user in context
  const login = (token, refreshToken, user) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    setAuthState({
      isAuthenticated: true,
      user,
      loading: false,
    });
    navigate("/");
  };

  // 🚪 Logout user
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
    navigate("/login");
  };

  // 🔁 Redirect only when auth check is completed
  useEffect(() => {
    if (!authState.loading && !authState.isAuthenticated) {
      navigate("/login");
    }
  }, [authState.loading, authState.isAuthenticated, navigate]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        loading: authState.loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
