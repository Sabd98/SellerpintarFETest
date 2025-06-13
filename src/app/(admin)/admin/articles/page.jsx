"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { dummyCategories, dummyArticles } from "@/lib/dummyData";
import { isValidUrl } from "@/utils/validUrl";
import PaginationTemplate from "@/components/ui-templates/PaginationTemplate";
import SelectTemplate from "@/components/ui-templates/SelectTemplate";

export default function AdminArticleList() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(null);

  const [selectedArticle, setSelectedArticle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const getCategoryValue = (category) => {
    return typeof category === "string" ? category : category.id;
  };

  const getCategoryName = (category) => {
    return typeof category === "string" ? category : category.name;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let articlesData = [];
        try {
          const articlesResponse = await api.get("/articles", {
            params: {
              search: debouncedSearch,
              category:
                selectedCategory === "all" ? undefined : selectedCategory,
              page: currentPage,
              limit: 10,
              searchFields: "title,content,category.name",
            },
          });
          setTotal(articlesResponse.data?.total);
          articlesData = articlesResponse.data?.data || [];
          if (debouncedSearch) {
            articlesData = articlesData.filter(
              (article) =>
                article.title
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase()) ||
                article.content
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase()) ||
                article.category.name
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase())
            );
          }
        } catch (error) {
          console.error("Articles fetch failed:", error);
          articlesData = dummyArticles;
        }

        let categoriesData = [];
        try {
          const categoriesResponse = await api.get("/categories");
          const rawCategories =
            categoriesResponse.data?.data || categoriesResponse.data;

          categoriesData = Array.isArray(rawCategories)
            ? rawCategories
                .map((item) => {
                  if (typeof item === "string") {
                    return item.trim();
                  } else {
                    const id = String(item.id || "").trim();
                    const name = String(item.name || "Unnamed Category").trim();
                    return id ? { id, name } : null;
                  }
                })
                .filter(Boolean)
            : dummyCategories;
        } catch (categoriesError) {
          console.error("Categories Fetch failed:", categoriesError);
          categoriesData = dummyCategories;
        }

        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (globalError) {
        console.error("Unexpected error:", globalError);
        setArticles(dummyArticles);
        setCategories(dummyCategories);
      }
    };

    fetchData();
  }, [debouncedSearch, selectedCategory, currentPage]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/articles/${id}`);
      setArticles(articles.filter((article) => article.id !== id));
      toast.success("Delete Article Success");
    } catch (error) {
      toast.error("Delete Article Failed");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <main className="py-24 bg-gray-100">
      <div className="py-4 mx-10 rounded-lg space-y-3 border-2 border-slate-200 bg-gray-50">
        <h2 className="ml-3 font-medium">Total Article: {total}</h2>
        {/* Search and Filter */}
        <section className="flex justify-between items-center mb-4 pt-4 px-4 border-t">
          <div className="flex gap-4">
            <SelectTemplate
              handleCategoryChange={handleCategoryChange}
              selectedCategory={selectedCategory}
            >
              {categories.map((category) => {
                const value = getCategoryValue(category);
                const name = getCategoryName(category);
                return (
                  <SelectItem key={value} value={value}>
                    {name}
                  </SelectItem>
                );
              })}
            </SelectTemplate>
            <Input
              placeholder="Search articles..."
              className="max-w-sm bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/create">
              <Button>+ Add Article</Button>
            </Link>
          </div>
        </section>

        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="text-center">Thumbnail</TableHead>
              <TableHead className="text-center">Title</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">Created At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="flex justify-center items-center">
                  {isValidUrl(article.imageUrl) && (
                    <div className="w-[80px] h-[80px] relative">
                      <Image
                        src={article.imageUrl}
                        alt={article.title || "Article thumbnail"}
                        fill
                        className="rounded object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {article.title}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{article.category.name}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {new Date(article.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <nav className="flex items-center justify-center gap-1">
                    <Link
                      href={`/articles/${article.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-md"
                    >
                      <span className="text-blue-500 hover:underline">
                        Preview
                      </span>
                    </Link>
                    <Link
                      href={`/edit/${article.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-md"
                    >
                      <span className="text-blue-500 hover:underline">
                        Edit
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedArticle(article);
                        setOpenDeleteDialog(true);
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-md"
                    >
                      <span className="text-red-500 hover:underline">
                        Delete
                      </span>
                    </button>
                  </nav>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {articles.length > 0 && (
          <PaginationTemplate
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            total={total}
            dataLength={10}
          />
        )}

        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Article</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the article and remove it from all
                associated article. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedArticle && handleDelete(selectedArticle.id)
                }
              >
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
