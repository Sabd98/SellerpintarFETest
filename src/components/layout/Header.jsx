import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu } from "../ui/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { LogoutModal } from "../modals/LogoutModal";
import { useLogout } from "@/hooks/useLogout";

export function Header({isArticleDetail}) {
  const { user } = useAuth();
  const { isLogoutModalOpen, setIsLogoutModalOpen, handleLogout } = useLogout();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, [role]);

  const [isInHero, setIsInHero] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.querySelector(".hero")?.offsetHeight || 0;
      setIsInHero(window.scrollY < heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMounted) return null;

  const isLogo = isInHero ? (
    <Image
      src="/LogoLight.png"
      alt="Logoipsum"
      width={120}
      height={30}
      className="text-lg font-bold"
    />
  ) : (
    <Image
      src="/Logo.png"
      alt="Logoipsum"
      width={120}
      height={30}
      className="text-lg font-bold"
    />
  );

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all ${
        isInHero
          ? "bg-transparent text-white"
          : "bg-gray-50 border-b  text-black shadow-sm"
      }`}
    >
      <nav
        className={`flex items-center justify-between h-16 px-4 ${
          role === "Admin" && !isArticleDetail ? "w-[1080px]" : "max-w-[1440px]"
        } `}
      >
        <div className="  flex items-center space-x-4">
          {role === "Admin" && !isArticleDetail ? (
            <h1 className="text-lg font-bold">
              {(() => {
                if (pathname === "/categories") return "Categories";
                if (pathname.includes("/edit")) return "Edit";
                if (pathname.includes("/profile")) return "Profile";
                const cleanPath = pathname.split("/")[1];
                return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
              })()}
            </h1>
          ) : (
            <Link
              href="/articles"
              className="flex items-center space-x-2 hover:underline"
            >
              {isLogo}
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <nav className="flex items-center">
          {role ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center gap-x-2 w-auto h-[40px]"
                  variant={isInHero ? "ghost" : "secondary"}
                  style={{
                    backgroundColor: isInHero ? "transparent" : "white",
                    color: isInHero ? "white" : "black",
                  }}
                >
                  <div className="inline-flex items-center justify-center w-8 h-8 text-md text-blue-900 bg-blue-200 rounded-full">
                    {user?.username.slice(0, 1).toUpperCase()}
                  </div>
                  <span>{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className=" text-black z-[1000]  bg-slate-50 rounded-lg"
                style={{
                  position: "absolute", // Ensure dropdown doesn't affect layout
                  top: "100%", // Position below the trigger button
                  left: "50%", // Align dropdown center with the button
                  transform: "translateX(-55%)", // Center alignment
                  width: "200px", // Explicitly set dropdown width
                  maxWidth: "200px", // Prevent dropdown from being too wide
                  overflow: "hidden", // Prevent content overflow
                }}
              >
                <DropdownMenuItem>
                  {role === "Admin" ? (
                    <Link
                      href="/admin/profile"
                      className="flex items-center px-2 py-2 text-sm   hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </Link>
                  ) : (
                    <Link
                      href="/user/profile"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </Link>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    onClick={() => {
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link href="/">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </nav>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}
