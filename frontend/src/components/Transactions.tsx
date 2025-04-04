import { useEffect, useState } from "react";
import { fetchTransactions } from "../services/api";

interface Transaction {
  Id: string;
  type: string;
  TotalAmt: number;
  TxnDate: { $date: string };
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions().then((data: { purchases: Transaction[]; deposits: Transaction[] }) => {
      setTransactions([...data.purchases, ...data.deposits]);
    });
  }, []);

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Transactions</h2>
      <table className="w-full border-collapse border border-gray-200 shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Type</th>
            <th className="p-3 border">Amount</th>
            <th className="p-3 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.Id} className="odd:bg-gray-50 even:bg-white text-center">
              <td className="p-3 border">{txn.Id}</td>
              <td className="p-3 border">{txn.type}</td>
              <td className="p-3 border">${txn.TotalAmt.toFixed(2)}</td>
              <td className="p-3 border">{new Date(txn.TxnDate.$date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
