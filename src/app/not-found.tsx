import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-6xl font-beast text-accent-purple mb-4">404</h1>
        <h2 className="text-2xl font-beast text-primary mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-accent-purple px-8 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-accent-purple-hover"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
