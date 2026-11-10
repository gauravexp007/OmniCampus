import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  Plus,
  Trash2,
  Download,
  X,
  CreditCard,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { FinancialTransaction } from '../../types';
import { ConfettiButton } from '../ui/ConfettiButton';

export const FinanceModule: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, role } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New transaction state
  const [newTx, setNewTx] = useState<{
    studentName: string;
    enrollmentNo: string;
    category: FinancialTransaction['category'];
    amount: number;
    paymentMethod: FinancialTransaction['paymentMethod'];
    status: FinancialTransaction['status'];
  }>({
    studentName: '',
    enrollmentNo: '',
    category: 'Tuition Fee',
    amount: 5000,
    paymentMethod: 'Stripe Gateway',
    status: 'Settled',
  });

  const categories: FinancialTransaction['category'][] = [
    'Tuition Fee',
    'Hostel Fee',
    'Laboratory & Library',
    'Examination Fee',
    'Scholarship Grant',
  ];

  const paymentMethods: FinancialTransaction['paymentMethod'][] = [
    'Stripe Gateway',
    'Bank Wire',
    'Campus SmartCard',
    'Scholarship Deduction',
  ];

  const filteredTransactions = transactions.filter((t) => {
    const matchesQuery =
      t.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const totalRealized = transactions
    .filter((t) => t.status === 'Settled')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.studentName.trim() || !newTx.enrollmentNo.trim()) return;

    addTransaction({
      invoiceNo: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: newTx.studentName.trim(),
      enrollmentNo: newTx.enrollmentNo.trim().toUpperCase(),
      category: newTx.category,
      amount: Number(newTx.amount) || 0,
      paymentMethod: newTx.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      status: newTx.status,
    });

    setIsAddModalOpen(false);
    setNewTx({
      studentName: '',
      enrollmentNo: '',
      category: 'Tuition Fee',
      amount: 5000,
      paymentMethod: 'Stripe Gateway',
      status: 'Settled',
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Finance & Fee Invoices</h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {transactions.length} {transactions.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage tuition fees, hostel deposits, grant disbursements, and ledger transactions.
          </p>
        </div>

        {role === 'Admin' && (
          <ConfettiButton
            variant="brand"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            enableClickCelebration={false}
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </ConfettiButton>
        )}
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Total Realized Revenue</span>
          <p className="text-xl font-bold text-brand mt-1">
            ${totalRealized.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Settled invoices</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Total Transactions</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{transactions.length}</p>
          <span className="text-[10px] text-slate-400">Recorded receipts</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Pending Invoices</span>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {transactions.filter((t) => t.status === 'Processing').length}
          </p>
          <span className="text-[10px] text-slate-400">Awaiting payment</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice #, student name, or enrollment #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  {role === 'Admin' && <th className="px-4 py-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] font-semibold text-brand">
                      {tx.invoiceNo}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{tx.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.enrollmentNo}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{tx.category}</td>
                    <td className="px-4 py-3 text-slate-600">{tx.paymentMethod}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{tx.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tx.status === 'Settled'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.status === 'Processing'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    {role === 'Admin' && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Clean Minimalist Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Financial Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || selectedCategory !== 'All'
              ? 'No transactions match your search filters.'
              : 'There are currently no fee invoices or payment transactions recorded.'}
          </p>
          {role === 'Admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Invoice</span>
            </button>
          )}
        </div>
      )}

      {/* Create Invoice Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Create Fee Invoice</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aria Chen"
                    value={newTx.studentName}
                    onChange={(e) => setNewTx({ ...newTx, studentName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Enrollment ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OMNI-2024-CS-001"
                    value={newTx.enrollmentNo}
                    onChange={(e) => setNewTx({ ...newTx, enrollmentNo: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTx.category}
                    onChange={(e) =>
                      setNewTx({
                        ...newTx,
                        category: e.target.value as FinancialTransaction['category'],
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newTx.paymentMethod}
                    onChange={(e) =>
                      setNewTx({
                        ...newTx,
                        paymentMethod: e.target.value as FinancialTransaction['paymentMethod'],
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newTx.status}
                    onChange={(e) =>
                      setNewTx({
                        ...newTx,
                        status: e.target.value as FinancialTransaction['status'],
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    <option value="Settled">Settled (Paid)</option>
                    <option value="Processing">Processing (Pending)</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <ConfettiButton
                  type="submit"
                  variant="brand"
                  size="md"
                  enableClickCelebration={true}
                >
                  Create Invoice
                </ConfettiButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
