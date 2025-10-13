

// import { createContext, useContext, useState, useEffect } from 'react';
// import { toast } from "react-toastify";

// // Base User 
// interface BaseUser {
//   id: string;
//   token: string;
//   role: string;
//   userType: string;
//   fullName?: string;
//   profileImage?: string;
// }

// // Normal User 
// export interface NormalUser extends BaseUser { role: "user"; fullName: string; userType: string; }

// // Admin User 
// export interface AdminUser extends BaseUser { role: "super-admin" | "admin"; userType: string; permission?: { [key: string]: { read?: boolean; write?: boolean } }; pages?: (string | { id: string | number; name?: string })[]; properties?: number[]; }

// export type User = NormalUser | AdminUser;
// // Auth Context type

// interface AuthContextType { user: User | null; setUser: (user: User | null) => void; isLoading: boolean; logout: () => void; hasPermission: (pageNameOrId: string | number, type: "read" | "write") => boolean; }

// // Create context 
// const AuthContext = createContext<AuthContextType>({
//   user: null, setUser: () => { }, isLoading: true, logout: () => { }, hasPermission: () => false, // default fallback 
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUserState] = useState<User | null>(null); const [isLoading, setIsLoading] = useState(true); // Load user from  sessionStorage 
//   useEffect(() => { const storedUser = sessionStorage.getItem("user"); if (storedUser) { setUserState(JSON.parse(storedUser)); } setIsLoading(false); }, []);

//   // Set user & store in session
//   const setUser = (newUser: User | null) => { setUserState(newUser); if (newUser) { sessionStorage.setItem("user", JSON.stringify(newUser)); } else { sessionStorage.removeItem("user"); } };

//   // Logout const 
//   const logout = () => { setUser(null); sessionStorage.clear(); toast.info("Logged out!"); };

//   // RBAC helper 
//  const hasPermission = (pageNameOrId: string | number, type: "read" | "write") => {
//   if (!user) return false;

//   // Super-admin bypass
//   if (user.role === "super-admin") return true;

//   if (user.role === "admin" && user.pages && user.permission) {
//     let pageId: string | number | null = null;

//     // If numeric ID
//     if (typeof pageNameOrId === "number" || /^\d+$/.test(pageNameOrId.toString())) {
//       pageId = pageNameOrId;
//     } else {
//       // If name, find matching page object
//       const page = user.pages.find(p => {
//         if (typeof p === "string") return p === pageNameOrId; // fallback
//         return p.name === pageNameOrId;
//       });
//       if (!page) return false;
//       pageId = typeof page === "object" ? page.id : user.pages.indexOf(page) + 1;
//     }

//     return !!user.permission[pageId]?.[type];
//   }

//   return false;
// };



//   return (
//   <AuthContext.Provider value={{ user, setUser, isLoading, logout, hasPermission }}> {children} </AuthContext.Provider>);
// }; export const useAuth = () => useContext(AuthContext)



import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "react-toastify";

export interface BaseUser {
  id: string;
  token: string;
  role: string;
  userType: string;
  fullName?: string;
  profileImage?: string;
}

export interface NormalUser extends BaseUser { role: "user"; fullName: string; userType: string; }
export interface AdminUser extends BaseUser { role: "super-admin" | "admin"; userType: string; permission?: { [key: string]: { read?: boolean; write?: boolean } }; pages?: (string | { id: string | number; name?: string })[]; properties?: number[]; }

export type User = NormalUser | AdminUser;

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserProfile: (profileData: Partial<User>) => void;
  isLoading: boolean;
  logout: () => void;
  hasPermission: (pageNameOrId: string | number, type: "read" | "write") => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  updateUserProfile: () => {},
  isLoading: true,
  logout: () => {},
  hasPermission: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) setUserState(JSON.parse(storedUser));
    setIsLoading(false);
  }, []);

  // Set user (full replace)
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) sessionStorage.setItem("user", JSON.stringify(newUser));
    else sessionStorage.removeItem("user");
  };

  // Update only profile fields
  const updateUserProfile = (profileData: Partial<User>) => {
    setUserState(prev => {
      const updated = { ...prev, ...profileData } as User;
      sessionStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  // Logout
  const logout = () => {
    setUser(null);
    sessionStorage.clear();
    toast.info("Logged out!");
  };

  // RBAC helper
  const hasPermission = (pageNameOrId: string | number, type: "read" | "write") => {
    if (!user) return false;
    if (user.role === "super-admin") return true;
    if (user.role === "admin" && user.pages && user.permission) {
      let pageId: string | number | null = null;

      if (typeof pageNameOrId === "number" || /^\d+$/.test(pageNameOrId.toString())) {
        pageId = pageNameOrId;
      } else {
        const page = user.pages.find(p => (typeof p === "string" ? p === pageNameOrId : p.name === pageNameOrId));
        if (!page) return false;
        pageId = typeof page === "object" ? page.id : user.pages.indexOf(page) + 1;
      }
      return !!user.permission[pageId]?.[type];
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUserProfile, isLoading, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

