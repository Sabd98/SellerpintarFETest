'"use client";'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useLogout } from "@/hooks/useLogout";
import { LogoutModal } from "../modals/LogoutModal";

export default function Sidebar({ pathname, navItems, }) {
  const { isLogoutModalOpen, setIsLogoutModalOpen, handleLogout } = useLogout();
  const handleNavItemClick = (item) => {
    if (item.label === "Logout") {
      setIsLogoutModalOpen(true);
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-blue-500 text-white fixed left-0 top-0">
      <div className="flex flex-col space-y-2 pt-6">
        <Image
          src="/LogoLight.png"
          alt="Logoipsum"
          width={120}
          height={30}
          className="text-lg font-bold mb-4 ml-4"
        />
        {/* <h1 className="text-lg font-bold mb-4 ml-4">Logoipsum</h1> */}
        {navItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant={pathname === item.href ? "secondary" : "ghost"}
            onClick={() => handleNavItemClick(item)}
            className="justify-start mx-2"
          >
            <Link href={item.href}>
              <div className="flex items-center gap-2">
                {item.icon} {item.label}
              </div>
            </Link>
          </Button>
        ))}
      </div>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
}
