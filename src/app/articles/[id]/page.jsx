"use client";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Image from "next/image";
import CardTemplate from "@/components/ui-templates/CardTemplate";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { isValidUrl } from "@/utils/validUrl";

export default function ArticleDetail() {
  const params = useParams();
  const { id } = params;

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  const getArticle = useCallback(async (id) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  }, []);

  const getRelatedArticles = useCallback(
    async (currentArticleId, categoryId) => {
      const response = await api.get("/articles", {
        params: {
          categoryId,
          limit: 4,
        },
      });
      return response.data.data
        .filter(
          (article) =>
            article.id !== currentArticleId &&
            article.category?.id === categoryId
        )
        .slice(0, 3);
    },
    []
  );

  useEffect(() => {
    let mounted = true;
    getArticle(id)
      .then((data) => {
        if (mounted) {
          setArticle(data);
          getRelatedArticles(id, data.category.id).then(setRelatedArticles);
        }
      })
      .catch(() => notFound());
    return () => {
      mounted = false;
    };
  }, [id, getArticle, getRelatedArticles]);
  if (!article) return <div>Loading...</div>;

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-bold text-gray-900">The Journal</h1>
          <Button asChild variant="ghost">
            <Link href="/articles">Back to Articles</Link>
          </Button>
        </div>

        <section className="gap-8">
          <div className="lg:col-span-2 space-y-6">
            <article className="bg-white p-8 rounded-xl shadow-sm">
              <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>
                  {new Date(article.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>•</span>
                <span>{article.user?.username}</span>
              </div>
              <h1 className="text-4xl font-bold text-center mb-6">
                {article.title}
              </h1>
              {isValidUrl(article.imageUrl) && (
                <Suspense fallback={<Skeleton />}>
                  <Image
                    src={article.imageUrl}
                    alt="Article Images"
                    className="w-full inset-0 mb-6"
                    width={400}
                    height={340}
                  />
                </Suspense>
              )}

              <div className="prose max-w-none inset-12 text-justify">
                {article.content}
              </div>
            </article>
          </div>
        </section>
        <h2 className="text-2xl font-semibold my-6">Other Articles</h2>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {relatedArticles.length > 0 ? (
            relatedArticles.map((article) => (
              <CardTemplate key={article.id} article={article} />
            ))
          ) : (
            <p className="text-gray-500">No related articles found</p>
          )}
        </section>
      </div>
    </main>
  );
}
