"use client";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "./Footer";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DoorOpenIcon, Newspaper, Tag } from "lucide-react";
import Sidebar from "./Sidebar";

export default function ClientWrapper({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const role = user?.role;
  const [navItems, setNavItems] = useState([]);

  const isArticleDetail = pathname.startsWith("/articles/");
  useEffect(() => {
    const items = [
      ...(role === "Admin"
        ? [
            {
              href: "/categories",
              label: "Categories",
              icon: <Tag className="h-4 w-4" />,
            },
            {
              href: "/articles",
              label: "Articles",
              icon: <Newspaper className="h-4 w-4" />,
            },
            {
              href: "",
              label: "Logout",
              icon: <DoorOpenIcon className="h-4 w-4" />,
            },
          ]
        : []),
    ];
    setNavItems(items);
  }, [role]);

  return (
    <>
      {role === "Admin" && !isArticleDetail && (
        <Sidebar navItems={navItems} pathname={pathname} />
      )}
      <div
        className={`flex flex-col min-h-screen ${
          role === "Admin" && !isArticleDetail ? "ml-64" : ""
        }`}
      >
        {user && <Header isArticleDetail={isArticleDetail} />}
        {children}
        {(!role || role !== "Admin" || isArticleDetail) && <Footer />}
      </div>
    </>
  );
}
