"use client";

import ArticleForm from "@/components/container/Form";

export default function ArticleEdit({params}) {
  const { id } = params;

  return (
    <>
      <ArticleForm id={id} />
    </>
  );
}