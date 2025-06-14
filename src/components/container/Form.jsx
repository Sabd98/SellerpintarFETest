"use client";
import {
  Bold,
  Italic,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { dummyArticles, dummyCategories } from "@/lib/dummyData";
import { toast } from "sonner";
import Link from "next/link";
import { ImagePlus } from "lucide-react";
import SelectTemplate from "../ui-templates/SelectTemplate";
import { Skeleton } from "../ui/skeleton";

const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z
    .union([z.instanceof(File), z.string().url("Invalid URL")])
    .optional(),
});

export default function ArticleForm() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [initialImageUrl, setInitialImageUrl] = useState("");

  const form = useForm({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
      imageUrl: undefined,
    },
  });
  const [article, setArticle] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [useDummyData, setUseDummyData] = useState(false);

  useEffect(() => {
    if (article) {
      setPreviewContent(article.content);
      form.reset({
        title: article.title,
        content: article.content,
        categoryId: article.categoryId,
        imageUrl: article.imageUrl,
      });
    }
  }, [article, form]);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const fetchArticle = async () => {
        setIsLoadingArticle(true);
        try {
          const response = await api.get(`/articles/${id}`);
          setArticle(response.data);
          setInitialImageUrl(response.data.imageUrl);
        } catch (error) {
          toast.error("Article Update Failed");
          const dummyArticle = dummyArticles.find((a) => a.id === id);
          if (dummyArticle) {
            setArticle(dummyArticle);
            setInitialImageUrl(dummyArticle.imageUrl);
            setUseDummyData(true);
          }
        } finally {
          setIsLoadingArticle(false);
        }
      };

      fetchArticle();
    }
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        const rawCategories = response.data?.data || response.data;

        const validCategories = Array.isArray(rawCategories)
          ? rawCategories.filter((cat) => cat.id && cat.name)
          : [];

        setCategories(validCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(dummyCategories);
        setUseDummyData(true);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = useCallback(
    async (values) => {
      setIsLoading(true);
      setFormErrors({});

      try {
        if (useDummyData) {
          const articleData = {
            id: isEditMode ? id : `dummy-${Date.now()}`,
            title: values.title,
            content: values.content,
            categoryId: values.categoryId,
            imageUrl:
              values.imageUrl instanceof File
                ? URL.createObjectURL(values.imageUrl)
                : values.imageUrl || "/placeholder-article.jpg",
            createdAt: isEditMode
              ? article.createdAt
              : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            categories: [
              categories.find((c) => c.id === values.categoryId)?.name ||
                "General",
            ],
          };

          alert(
            `Article ${
              isEditMode ? "updated" : "created"
            } locally:\n${JSON.stringify(articleData, null, 2)}`
          );
        } else {
          let uploadedImageUrl = null;
          if (values.imageUrl instanceof File) {
            const imageFormData = new FormData();
            imageFormData.append("image", values.imageUrl);
            try {
              const uploadResponse = await api.post("/upload", imageFormData);
              uploadedImageUrl =
                uploadResponse.data?.imageUrl || uploadResponse.data?.url;
              toast.success("Image uploaded successfully");
            } catch (error) {
              toast.error("Failed to upload image");
              return;
            }
          }

          const articleData = {
            title: String(values.title).trim(),
            content: String(values.content).trim(),
            categoryId: values.categoryId.replace(/['"{}]/g, ""),
            userId: user?.id,
            imageUrl:
              uploadedImageUrl ||
              (typeof values.imageUrl === "string" ? values.imageUrl : null),
          };

          if (isEditMode) {
            await api.put(`/articles/${id}`, articleData);
            toast.success("Article Edited Successfully");
          } else {
            await api.post("/articles", articleData);
            toast.success("Article Submitted");
          }
        }
        router.push("/articles");
      } catch (error) {
        toast.error("Error saving article:", error);
        if (error.response?.data?.errors) {
          setFormErrors(error.response.data.errors);
        } else {
          setFormErrors({
            general: "Failed to save article. Using demo mode.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isEditMode, id, useDummyData, user, categories, router]
  );

  const handlePreview = () => {
    setPreviewContent(form.getValues().content);
    setPreviewOpen(true);
  };

  if (isLoadingArticle) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <p>Loading article data...</p>
      </div>
    );
  }

  return (
    <main className="p-2 py-24 bg-gray-100 space-y-6">
      <div className="p-4 mx-10 rounded-lg space-y-3 border-0 border-slate-200 bg-gray-50">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/articles" className="hover:underline">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Article" : "Create New Article"}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {formErrors.general && (
              <div className="text-red-500 p-3 bg-red-50 rounded-md">
                {formErrors.general}
              </div>
            )}

            <div className=" gap-6">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => {
                  const fileInputRef = useRef(null);

                  const handleClick = () => {
                    fileInputRef.current?.click();
                  };

                  return (
                    <FormItem>
                      <FormLabel>Thumbnails</FormLabel>
                      <FormControl>
                        {!field.value && !initialImageUrl && (
                          <div
                            className="border-2 border-dashed border-gray-200 max-w-[300px] rounded-lg p-6 hover:border-gray-400 transition-colors cursor-pointer"
                            onClick={handleClick}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <>
                                <ImagePlus className="h-10 w-10 text-gray-400" />
                                <p className="text-sm text-gray-500">
                                  Click to select or drag an image
                                </p>
                                <p className="text-xs text-gray-400">
                                  Supported file types: PNG, JPG
                                </p>
                              </>
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    field.onChange(file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </FormControl>

                      {/* Preview Image */}
                      {(field.value || initialImageUrl) && (
                        <div className="mt-4 relative">
                          <div className="relative group w-[400px]">
                            <Suspense fallback={<Skeleton />}>
                              <img
                                src={
                                  field.value instanceof File
                                    ? URL.createObjectURL(field.value)
                                    : field.value || initialImageUrl
                                }
                                alt="Preview"
                                className="w-[400px] max-h-[200px] object-cover rounded-lg"
                              />
                            </Suspense>

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <div className="flex gap-2 absolute bottom-2 right-2">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => field.onChange(null)}
                                >
                                  Change
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => field.onChange(null)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <FormMessage />
                      {formErrors.imageUrl && (
                        <p className="text-red-500 text-sm">
                          {formErrors.imageUrl}
                        </p>
                      )}
                    </FormItem>
                  );
                }}
              />
            </div>
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm">{formErrors.title}</p>
                  )}
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <SelectTemplate
                    handleCategoryChange={field.onChange}
                    selectedCategory={field.value}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectTemplate>
                  <FormMessage />
                  {formErrors.categoryId && (
                    <p className="text-red-500 text-sm">
                      {formErrors.categoryId}
                    </p>
                  )}
                </FormItem>
              )}
            />
            {/* Content Field */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <div className="border rounded-md">
                      {/* Toolbar */}
                      <div className="flex items-center gap-2 p-2 border-b">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => field.onChange(field.value + "\n")}
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => field.onChange(`**${field.value}**`)}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => field.onChange(`*${field.value}*`)}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => field.onChange(field.value)}
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                        <div className="h-4 w-[1px] bg-gray-200 mx-2" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => field.onChange(field.value)}
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => field.onChange(field.value)}
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => field.onChange(field.value)}
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Content Area */}
                      <Textarea
                        {...field}
                        placeholder="Type a content..."
                        className="min-h-[300px] border-0 focus-visible:ring-0 resize-none"
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e);
                          setPreviewContent(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>

                  {/* Word Counter */}
                  <div className="text-sm text-gray-500 text-right">
                    {field.value?.split(/\s+/).filter(Boolean).length || 0}{" "}
                    Words
                  </div>

                  <FormMessage />
                  {formErrors.content && (
                    <p className="text-red-500 text-sm">{formErrors.content}</p>
                  )}
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-x-4">
              <Button type="button" variant="outline">
                <Link href="/articles">Cancel</Link>
              </Button>
              <Button type="button" variant="ghost" onClick={handlePreview}>
                Preview
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading
                  ? isEditMode
                    ? "Updating Article..."
                    : "Creating Article..."
                  : isEditMode
                  ? "Update Article"
                  : "Create Article"}
              </Button>
            </div>
          </form>
        </Form>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {form.watch("title") || "Untitled Article"}
              </DialogTitle>
            </DialogHeader>
            <div className="prose max-w-none mt-4">
              <div className="space-y-4">
                {/* Category badge */}
                <div className="flex gap-2">
                  <span className="px-3 py-1 text-blue-700 bg-blue-100 rounded-full text-sm">
                    {categories.find((c) => c.id === form.watch("categoryId"))
                      ?.name || "Uncategorized"}
                  </span>
                </div>

                {/* Preview image */}
                {(form.watch("imageUrl") || initialImageUrl) && (
                  <div className="relative w-full h-[300px]">
                    <img
                      src={
                        form.watch("imageUrl") instanceof File
                          ? URL.createObjectURL(form.watch("imageUrl"))
                          : form.watch("imageUrl") || initialImageUrl
                      }
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="mt-4">
                  {previewContent.split("\n").map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
