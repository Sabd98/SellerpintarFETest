"use client";

import { useAuth } from "@/hooks/useAuth";
import AdminArticleList from "../(admin)/admin/articles/page";
import ArticleList from "../(user)/user/articles/page";

export default function ArticlesPage() {
  const { user } = useAuth();

  return user?.role === "Admin" ? <AdminArticleList /> : <ArticleList />;
}
