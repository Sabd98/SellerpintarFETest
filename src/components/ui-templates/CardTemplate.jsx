import React, { Suspense } from "react";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { isValidUrl } from "@/utils/validUrl";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

export default function CardTemplate({ article }) {
  return (
    <Card
      //   key={article.id}
      className="hover:shadow-lg transition-shadow overflow-hidden"
    >
      <CardContent className="p-0">
        <div className="relative aspect-[16/9]">
          <Suspense fallback={<Skeleton />}>
            {isValidUrl(article.imageUrl) && (
              <Image
                src={article.imageUrl}
                alt="Article Images"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            )}
          </Suspense>
        </div>

        <article className="p-4">
          <p className="text-sm text-gray-500 my-2">
            {new Date(article.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <h2 className="text-xl font-semibold mb-2">
            <Link
              href={`/articles/${article.id}`}
              className="font-medium hover:text-primary"
            >
              {article.title}
            </Link>
          </h2>
          <p className="text-gray-600 line-clamp-3 mb-4">{article.content}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-blue-700 bg-blue-300 rounded-full text-sm">
              {article.category?.name}
            </span>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}
