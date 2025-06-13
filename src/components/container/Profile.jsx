"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-32">
        <section className="bg-white p-6 rounded-lg shadow-sm text-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-6">User Profile</h1>
            <div className="inline-flex items-center justify-center w-16 h-16 text-3xl font-semibold text-blue-900 bg-blue-200 rounded-full">
              {user?.username.slice(0, 1).toUpperCase()}
            </div>
          </div>

          <article className="space-y-4 mt-3 w-[20rem] mx-auto">
            <div className="flex justify-center bg-slate-200 p-4 rounded-lg ">
              <label className="block font-medium text-gray-700">
                Username:
              </label>
              <strong className="text-gray-900">
                &nbsp;&nbsp;&nbsp;&nbsp;{user.username}
              </strong>
            </div>

            <div className="flex justify-center bg-slate-200 p-4 rounded-lg">
              <label className="block font-medium text-gray-700">Role:</label>
              <strong className="text-gray-900">
                &nbsp;&nbsp;&nbsp;&nbsp;{user.role}
              </strong>
            </div>

            <div className="pt-3 border-t mt-3">
              <Button>
                <Link href="/articles">Back to home</Link>
              </Button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
