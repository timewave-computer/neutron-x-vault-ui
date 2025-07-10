"use client";
import React, { useState } from "react";
import { Card } from "@/components";
import { WithdrawRequest } from "@/hooks";
import { cn, formatNumberString } from "@/lib";
import { VaultConfig } from "@/context";

interface WithdrawRequestsTableProps {
  withdrawRequests: WithdrawRequest[];
  vaultConfig: VaultConfig;
}

export const WithdrawRequestsTable: React.FC<WithdrawRequestsTableProps> = ({
  vaultConfig,
  withdrawRequests,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!withdrawRequests || withdrawRequests.length === 0) {
    return null;
  }

  // Sort requests by block number (newest first)
  const sortedRequests = [...withdrawRequests].sort(
    (a, b) => b.block_number - a.block_number,
  );

  const {
    cosmos: { explorerUrl: cosmosExplorerUrl, clearingQueueAddress },
    symbol: vaultSymbol,
    displayDecimals,
  } = vaultConfig;
  return (
    <div className="mt-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-accent-purple hover:text-accent-purple-hover underline"
      >
        {isExpanded ? "Hide" : "View"} all withdraw requests (
        {withdrawRequests.length})
      </button>

      {isExpanded && (
        <Card variant="secondary" className="mt-2 overflow-x-auto">
          <div className="p-4">
            <div>
              <div className="text-2xl font-beast text-accent-purple mb-2">
                Withdraw Requests
              </div>
              <p className="text-sm font-light text-gray-500 mb-2">
                Clearing Contract:{" "}
                <a
                  href={`${cosmosExplorerUrl}/contracts/${clearingQueueAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline "
                >
                  {clearingQueueAddress}
                </a>{" "}
              </p>
              <p className="mt-4">
                Withdraw requests are monitored and completed through the
                clearing contract.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="text-accent-purple font-medium mb-2">
                    <th className="text-left py-2 pr-3 ">ID</th>
                    <th className="text-left py-2 px-3  ">Amounts</th>
                    <th className="text-left py-2 px-3  ">Block #</th>
                    <th className="text-left py-2 pl-3 ">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-100 last:border-b-0 text-gray-600"
                    >
                      <td className="py-2 pr-3">{request.id}</td>
                      <td className="py-2 px-3">
                        {formatNumberString(
                          request.convertedAssetAmount,
                          vaultSymbol,
                          {
                            displayDecimals: displayDecimals,
                          },
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        <a
                          href={`${cosmosExplorerUrl}/blocks/${request.block_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {request.block_number}
                        </a>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium min-w-20 justify-center",
                            request.isCompleted
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : request.isError
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-300",
                          )}
                        >
                          {request.isCompleted
                            ? "Completed"
                            : request.isError
                              ? "Error"
                              : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
