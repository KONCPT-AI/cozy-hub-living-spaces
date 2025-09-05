// import { createContext, useContext, useState, ReactNode } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"; 

// interface AuthContextType {
//   user: any;
//   token: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   register: (data: any) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [token, setToken] = useState<string | null>(
//     sessionStorage.getItem("token")
//   );

//   // Login function
//   const login = async (email: string, password: string) => {
//     try {
//       const res = await axios.post(`${API_BASE_URL}/api/common/login`, {
//         email,
//         password,
//       });

//       const { token, user } = res.data;

//       setUser(user);
//       setToken(token);

//       // sessionStorage me save
//       sessionStorage.setItem("token", token);
//       sessionStorage.setItem("user", JSON.stringify(user));

//       toast.success("Login successful!");
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || "Login failed");
//     }
//   };

//   // Register function
//   const register = async (data: any) => {
//     try {
//       await axios.post(`${API_BASE_URL}/api/user/register`, data);
//       toast.success("Registration successful!");
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || "Registration failed");
//     }
//   };

//   //  Logout
//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     sessionStorage.removeItem("token");
//     sessionStorage.removeItem("user");
//     toast.info("Logged out!");
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "react-toastify";

interface BaseUser {
  id:string;
  token:string;
  role:string;
}

export interface NormalUser extends BaseUser{
  role:"user";
  fullName:string;
  userType:string;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
}

export type User = NormalUser | AdminUser;

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      sessionStorage.setItem("user", JSON.stringify(newUser));
    } else {
      sessionStorage.removeItem("user");
    }
  };

   //  Logout
   const logout = () => {
    setUser(null);
    // sessionStorage.removeItem("token");
    // sessionStorage.removeItem("role");
    // sessionStorage.removeItem("fullName");
    // sessionStorage.removeItem("userType");
    // sessionStorage.removeItem("email");
    // sessionStorage.removeItem("userId");
    sessionStorage.clear();
    toast.info("Logged out!");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );

 

};

export const useAuth = () => useContext(AuthContext);
