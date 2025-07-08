import { Card } from "./Card";

export const VaultPaused = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <Card variant="warning" className="mt-6">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-10 h-10 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-yellow-800">{title}</h3>
          <p className="text-sm text-yellow-700 mt-1">{description}</p>
        </div>
      </div>
    </Card>
  );
};
