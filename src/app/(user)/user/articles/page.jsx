"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";
import { SelectItem } from "@/components/ui/select";
import CardTemplate from "@/components/ui-templates/CardTemplate";
import PaginationTemplate from "@/components/ui-templates/PaginationTemplate";
import { dummyArticles, dummyCategories } from "@/lib/dummyData";
import SelectTemplate from "@/components/ui-templates/SelectTemplate";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
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
              limit: 9,
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
        } catch (articlesError) {
          console.error("Articles fetch failed:", articlesError);
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
          console.error("Categories fetch failed:", categoriesError);
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


  return (
    <main className="min-h-screen">
      <div className=" mx-auto ">
        <div className="gap-8">
          <section className="hero relative min-h-[400px] flex items-center justify-center bg-blue-600/90">
            <div className="absolute inset-0 -z-10">
              <img
                src="/3db22360cc9442cb78dec9c16d45821461792f80.jpg"
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="container max-w-4xl px-4 text-center">
              <span className="text-sm font-medium text-gray-300 mb-2 block">
                Blog Genzet
              </span>
              <h1 className="text-4xl font-bold text-white mb-4">
                The Journal : Design Resources, Interviews, and Industry News
              </h1>
              <p className="text-lg text-white mb-8">
                Your daily dose of design insights!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto placeholder-white">
                <SelectTemplate handleCategoryChange={handleCategoryChange} selectedCategory={selectedCategory}>
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
                  value={search}
                  onChange={handleSearch}
                  className="bg-white backdrop-blur-sm border-blue-300/20 placeholder-slate-50 focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </section>

          <section className="flex-1 m-4">
            <span className="font-500">
              Showing: {Math.min(currentPage * 9, total)} of {total} Articles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {articles.map((article) => (
                <CardTemplate key={article.id} article={article} />
              ))}
            </div>
            {articles.length > 0 && (
              <PaginationTemplate
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                total={total}
                dataLength={9}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
