const getIndexerVars = () => {
  const INDEXER_URL = process.env.INDEXER_API_URL as string;
  if (!INDEXER_URL) {
    throw new Error("INDEXER_API_URL is not set");
  }
  const INDEXER_API_KEY = process.env.INDEXER_API_KEY;
  if (!INDEXER_API_KEY) {
    throw new Error("INDEXER_API_KEY is not set");
  }

  return {
    INDEXER_API_KEY,
    INDEXER_URL,
  };
};

export const fetchFromIndexer = async (
  vaultAddress: string,
  suffix: string,
) => {
  const { INDEXER_URL, INDEXER_API_KEY } = getIndexerVars();
  const url = `${INDEXER_URL}/v1/vault/${vaultAddress}/${suffix}`;

  const response = await fetch(url, {
    headers: {
      "X-Api-Key": INDEXER_API_KEY as string,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch from indexer: ${url}`);
  }
  const data = await response.json();
  return data;
};
