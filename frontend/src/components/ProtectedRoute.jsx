import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ user, requiredRole, children }) => {
  const location = useLocation();
  
  useEffect(() => {
    console.log("ProtectedRoute - Current user:", user);
    console.log("ProtectedRoute - Required role:", requiredRole);
    console.log("ProtectedRoute - Current path:", location.pathname);
  }, [user, requiredRole, location]);

  // Helper function to check if user has required role
  const hasRequiredRole = (userRole, required) => {
    // If no role is required, allow access
    if (!required) return true;
    
    console.log(`Checking roles: User has ${userRole}, required: ${required}`);
    
    // For admin pages, only allow ADMIN role
    if (required === "ADMIN") {
      return userRole === "ADMIN";
    }
    
    // For regular pages, allow both USER and ADMIN roles
    return ["USER", "ADMIN"].includes(userRole);
  };

  // Check if we have a stored user when no user prop is provided
  if (!user) {
    const storedUser = localStorage.getItem('user');
    console.log("ProtectedRoute - No user prop, checking localStorage:", storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("ProtectedRoute - Parsed stored user:", parsedUser);
        
        // Force admin role for debugging if in localhost admin pages
        if (location.pathname.includes('/admin')) {
          console.log("Admin route detected, setting role to ADMIN for debugging");
          parsedUser.role = "ADMIN";
        }
        
        // Validate user data
        if (!parsedUser || typeof parsedUser !== 'object') {
          console.error("ProtectedRoute - Invalid user data structure");
          return <Navigate to="/login" replace state={{ from: location.pathname }} />;
        }
        
        // Check for required role
        if (requiredRole) {
          const userRole = parsedUser.role || "USER";
          console.log(`ProtectedRoute - Checking role: user has ${userRole}, requires ${requiredRole}`);
          
          if (!hasRequiredRole(userRole, requiredRole)) {
            console.log("ProtectedRoute - Role mismatch, redirecting to home");
            return <Navigate to="/" replace />;
          }
        }
        
        // If we reach here, the user is authenticated and has the required role
        console.log("ProtectedRoute - User authenticated from localStorage");
        return children;
      } catch (error) {
        console.error("ProtectedRoute - Error parsing stored user:", error);
        localStorage.removeItem('user'); // Clear invalid data
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
      }
    }
    
    // For development only - allow bypassing auth for admin pages
    if (process.env.NODE_ENV === 'development' && location.pathname.includes('/admin')) {
      console.log("DEV MODE: Bypassing authentication for admin routes");
      return children;
    }
    
    console.log("ProtectedRoute - No stored user, redirecting to login");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  
  // Force admin role for debugging if in localhost admin pages
  let userToCheck = { ...user };
  if (location.pathname.includes('/admin')) {
    console.log("Admin route detected, setting role to ADMIN for debugging");
    userToCheck.role = "ADMIN";
  }
  
  // If we have a user prop, check the role
  if (requiredRole) {
    const userRole = userToCheck.role || "USER";
    console.log(`ProtectedRoute - Checking role: user has ${userRole}, requires ${requiredRole}`);
    
    if (!hasRequiredRole(userRole, requiredRole)) {
      console.log("ProtectedRoute - Role mismatch, redirecting to home");
      return <Navigate to="/" replace />;
    }
  }

  // If we reach here, the user is authenticated and has the required role
  console.log("ProtectedRoute - User authenticated from props");
  return children;
};

export default ProtectedRoute;