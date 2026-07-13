"use client"; // This MUST be the first line

export default function Error({ error, reset }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold">Something went wrong!</h2>
      <button onClick={() => reset()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Try again
      </button>
    </div>
  );
}
