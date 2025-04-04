import React, { useState, useEffect, createContext, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../constants/PAGE_URL";

/**
 * Interface for the authentication context value
 */
interface AuthContextType {
  userId: string | null;
}

/**
 * Authentication context for managing user session state across the application
 */
const AuthContext = createContext<AuthContextType>({ userId: null });

/**
 * Custom hook to access the authentication context
 * @returns {AuthContextType} The authentication context value
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Protected Route Component
 * Handles authentication state and protects routes from unauthorized access
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * 
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <MySecureComponent />
 * </ProtectedRoute>
 * ```
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for managing loading and authentication status
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get current location for redirect after login
  const location = useLocation();

  useEffect(() => {
    /**
     * Validates the user's authentication status with the server
     * Sets authentication state and user ID if validated
     */
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/validate`, {
          withCredentials: true,
        });

        if (response.data.authenticated && response.data.user) {
          setIsAuthenticated(true);
          setUserId(response.data.user.id);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error de autenticación:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (loading) return <div>Cargando...</div>;

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content within the auth context provider
  return (
    <AuthContext.Provider value={{ userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export default ProtectedRoute;