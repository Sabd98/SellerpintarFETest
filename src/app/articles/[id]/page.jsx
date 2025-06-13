import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Image from "next/image";
import CardTemplate from "@/components/ui-templates/CardTemplate";

export const ArticleService = {
  async getArticle(id) {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  async getRelatedArticles(currentArticleId, categoryId) {
    const response = await api.get("/articles", {
      params: {
        categoryId,
        limit: 4,
      },
    });

    return response.data.data
      .filter(
        (article) =>
          article.id !== currentArticleId && article.category?.id === categoryId
      )
      .slice(0, 3);
  },
};

export default async function ArticleDetail({ params }) {
  const { id } = params;
  try {
    const article = await ArticleService.getArticle(id);
    const relatedArticles = await ArticleService.getRelatedArticles(
      params.id,
      article.category.id
    );

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
                <Image
                  src={article.imageUrl}
                  alt="Article Images"
                  className="w-full inset-0 mb-6"
                  width={400}
                  height={340}
                />
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
                <CardTemplate key={article.id} article={article}/>
              ))
            ) : (
              <p className="text-gray-500">No related articles found</p>
            )}
          </section>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Article detail error:", error);
    notFound();
  }
}
