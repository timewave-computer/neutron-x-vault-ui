"use client";
import React, { useState } from "react";
import { Card } from "@/components";
import { WithdrawRequest } from "@/hooks";

interface WithdrawRequestsTableProps {
  withdrawRequests: WithdrawRequest[];
  vaultSymbol: string;
}

export const WithdrawRequestsTable: React.FC<WithdrawRequestsTableProps> = ({
  withdrawRequests,
  vaultSymbol,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!withdrawRequests || withdrawRequests.length === 0) {
    return null;
  }

  // Sort requests by block number (newest first)
  const sortedRequests = [...withdrawRequests].sort(
    (a, b) => b.block_number - a.block_number,
  );

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-accent-purple hover:text-accent-purple-hover underline"
      >
        {isExpanded ? "Hide" : "View"} all withdraw requests (
        {withdrawRequests.length})
      </button>

      {isExpanded && (
        <Card variant="secondary" className="mt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">
                    Block #
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="py-2 px-3">
                      {request.convertedAssetAmount} {vaultSymbol}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {request.block_number}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          request.isCompleted
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.isCompleted ? "Completed" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
