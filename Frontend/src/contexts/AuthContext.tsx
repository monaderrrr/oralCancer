import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import API from "../Api";
import {
  connectSocket,
  disconnectSocket,
} from "../socket/SocketManager";

export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  _id?: string;
  email: string;
  status?: string;
  role?: UserRole;
  fullName?: string;
  isEmailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  isDoctor: boolean;
  isPatient: boolean;
  isAdmin: boolean;

  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    role: UserRole,
    fullName: string
  ) => Promise<void>;

  logout: () => void;
  sendVerificationEmail: (email: string) => Promise<void>;
  setAuthData: (user: User, accessToken?: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("oral_scan_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("oral_scan_token")
  );

  const [isLoading, setIsLoading] = useState(false);

  const setAuthData = (userData: User, accessToken?: string, refreshToken?: string) => {
    setUser(userData);
    localStorage.setItem("oral_scan_user", JSON.stringify(userData));

    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem("oral_scan_token", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("oral_scan_refresh_token", refreshToken);
    }
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (user?._id && token) {
      connectSocket(); 
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);
  

  /* ================= VALIDATE USER ================= */
useEffect(() => {
  const validateUser = async () => {
    try {
      const res = await API.get("/auth/me");
      if (res.data && res.data.user) {
        const userData = res.data.user;
        
        setUser(userData);
        localStorage.setItem("oral_scan_user", JSON.stringify(userData));
      }
    } catch (err) {
      console.error("Validation failed", err);
    }
  };

  if (token) validateUser();
}, [token]);

  // ================= LOGIN =================
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await API.post("/auth/signIn", { email, password });

      const { user: loggedUser, accessToken, refreshToken } = res.data;

      setUser(loggedUser);
      setToken(accessToken);

      localStorage.setItem("oral_scan_user", JSON.stringify(loggedUser));
      localStorage.setItem("oral_scan_token", accessToken);
      localStorage.setItem("oral_scan_refresh_token", refreshToken);

      if (loggedUser?._id) {
        connectSocket();
      }

      return loggedUser;
    } catch (err: any) {
      const status = err?.response?.status;
      const needsVerification = err?.response?.data?.needsVerification;
      const role = err?.response?.data?.role || "patient";

      if (status === 403 && needsVerification) {
        alert("Email not verified. OTP sent again.");
        window.location.href = `/verify-code?email=${encodeURIComponent(
          email
        )}&flow=login&role=${encodeURIComponent(role)}`;
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ================= REGISTER =================
  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    role: UserRole,
    fullName: string
  ) => {
    await API.post("/auth/signUp", {
      email,
      password,
      confirmPassword,
      role,
      fullName,
    });

    alert("Account created! Please verify your email.");
  };

  // ================= VERIFY EMAIL =================
  const sendVerificationEmail = async (email: string) => {
    await API.post("/auth/verify-email", { email });
    alert("Verification email sent!");
  };

  // ================= LOGOUT =================
const logout = async () => {
  try {
    const accessToken = token;
    const refreshToken = localStorage.getItem("oral_scan_refresh_token");

    if (accessToken && refreshToken) {
      await API.post(
        "/auth/signOut",
        { refreshtoken: refreshToken }, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }
  } catch (err) {
    console.error("Logout error", err);
    } finally {
      disconnectSocket(); 

      localStorage.removeItem("oral_scan_user");
      localStorage.removeItem("oral_scan_token");
      localStorage.removeItem("oral_scan_refresh_token");

      setUser(null);
      setToken(null);

      window.location.href = "/login";
    }
  };

  // ================= HELPERS =================
  const isAuthenticated = !!token;

  const isDoctor = user?.role === "doctor";
  const isPatient = user?.role === "patient";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,

        isDoctor,
        isPatient,
        isAdmin,

        login,
        register,
        logout,
        sendVerificationEmail,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ================= HOOK =================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}