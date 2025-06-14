"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { dummyCategories } from "@/lib/dummyData";
import PaginationTemplate from "@/components/ui-templates/PaginationTemplate";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
});

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [total, setTotal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: selectedCategory?.name || "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories", {
          params: {
            search: debouncedSearch,
            page: currentPage,
            limit: 10,
            searchFields: "name",
          },
        });
        const rawCategories = response.data?.data || response.data;
        setTotal(response.data?.totalData);
        setCategories(rawCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(dummyCategories);
      }
    };
    fetchCategories();
  }, [debouncedSearch, currentPage]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category is Deleted");
    } catch (error) {
      toast.error("Failed Deleting Category");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const onSubmit = useCallback(
    async (values) => {
      try {
        await api.post("/categories", values);
        setOpenCreateDialog(false);
        form.reset();
        toast.success("Category is Created");
      } catch (error) {
        setOpenCreateDialog(true);
        toast.error("Create category failed:", error);
      }
    },
    [form, setOpenCreateDialog]
  );


  useEffect(() => {
    if (selectedCategory) {
      form.reset({ name: selectedCategory.name });
    }
  }, [selectedCategory, form]);

  const handleOpenEditDialog = (category) => {
    setSelectedCategory(category);
    form.reset({ name: category.name });
    setOpenEditDialog(true);
  };


  const handleEdit = useCallback(
    async (values) => {
      if (!selectedCategory) return;

      try {
        const response = await api.put(
          `/categories/${selectedCategory.id}`,
          values
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === selectedCategory.id ? response.data : c))
        );
        toast.success("Edit Success");

        setOpenEditDialog(false);
      } catch (error) {
        setOpenEditDialog(true);
        toast.error("Error updating category:", error);
      }
    },
    [selectedCategory, form, setOpenEditDialog, setCategories]
  );



  return (
    <main className="py-24  bg-gray-100">
      <div className="py-4 mx-10 rounded-lg space-y-3 border-2 border-slate-200 bg-gray-50">
        <h2 className="ml-3 font-medium">Total Category: {total}</h2>
        {/* Search and Filter */}
        <section className="flex gap-1 justify-between p-4 border-t">
          <Input
            placeholder="Search categories..."
            className="max-w-sm bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            onClick={() => {
              setOpenCreateDialog(true);
            }}
          >
            + Add Category
          </Button>
        </section>

        {/* Categories Table */}
        <section className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Category Name</TableHead>
                <TableHead className="text-center">Created At</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-center font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <nav className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(category)}
                      >
                        <span className="text-blue-500 hover:underline">
                          Edit
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCategory(category);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <span className="text-red-500 hover:underline">
                          Delete
                        </span>
                      </Button>
                    </nav>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {categories.length > 0 && (
            <PaginationTemplate
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              total={total}
              dataLength={10}
            />
          )}
        </section>
      </div>

      <AlertDialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Category</AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...form.register("name")}
              placeholder="Enter category name"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">
                Create Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category and remove it from all
              associated categories. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedCategory && handleDelete(selectedCategory.id)
              }
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <AlertDialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Category</AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
            <Input
              {...form.register("name")}
              defaultValue={selectedCategory?.name}
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">Save Changes</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
