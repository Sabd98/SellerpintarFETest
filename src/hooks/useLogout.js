import { useState } from "react";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("refreshToken");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    window.location.href = "/";
  };

  return {
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    handleLogout,
  };
};
