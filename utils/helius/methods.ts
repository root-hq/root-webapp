
export const getRecentPrioritizationFees = async (
    marketAddress: String
) => {
  const response = await fetch(process.env.RPC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getPriorityFeeEstimate",
      params: [{
        "accountKeys": [marketAddress],
        "options": {
            "includeAllPriorityFeeLevels": true,
        }
      }]
    }),
  });
  const data = await response.json();
  console.log("Fee: ", data);
};
