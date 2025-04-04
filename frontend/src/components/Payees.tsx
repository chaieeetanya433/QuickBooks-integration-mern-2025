import { useEffect, useState } from "react";
import { fetchPayees } from "../services/api";

interface Payee {
  Id: string;
  DisplayName?: string;
  type: string;
}

const Payees = () => {
  const [payees, setPayees] = useState<Payee[]>([]);

  useEffect(() => {
    fetchPayees().then((data: { vendors: Payee[]; customers: Payee[] }) => {
      setPayees([...data.vendors, ...data.customers]); // Merge vendors & customers
    });
  }, []);

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Payees</h2>
      <table className="w-full border-collapse border border-gray-200 shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Type</th>
          </tr>
        </thead>
        <tbody>
          {payees.map((payee) => (
            <tr key={payee.Id} className="odd:bg-gray-50 even:bg-white text-center">
              <td className="p-3 border">{payee.DisplayName || "Unnamed"}</td>
              <td className="p-3 border">{payee.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payees;
