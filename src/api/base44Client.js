export const base44 = {
  entities: {
    Category: {
      filter: async () => [
        { id: 1, name: "Salary", type: "income" },
        { id: 2, name: "Freelance", type: "income" },
        { id: 3, name: "Utilities", type: "expense" },
        { id: 4, name: "Shopping", type: "expense" },
      ],
    },
    Account: {
      filter: async () => [
        { id: 1, name: "Main Checking", balance: 5000 },
      ],
    },
  },
};