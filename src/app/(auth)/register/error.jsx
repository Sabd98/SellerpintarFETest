"use client";

export default function Error({ error, reset }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Registration Error</h2>
      <p className="text-gray-600 mb-8">{error.message}</p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
