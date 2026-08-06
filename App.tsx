```tsx
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8000/api";

export default function CQ777App() {
  const [view, setView] = useState<'login' | 'dashboard' | 'admin'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // Deposit state
  const [method, setMethod] = useState('bKash');
  const [amount, setAmount] = useState('');
  const [senderNum, setSenderNum] = useState('');
  const [trxId, setTrxId] = useState('');
  
  // Admin state
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [pendingTx, setPendingTx] = useState<any>({ deposits: [], withdrawals: [] });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { phone, password });
      setUser(res.data);
      setView('dashboard');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/wallet/deposit`, {
        user_id: user.user_id,
        method,
        amount: parseFloat(amount),
        sender_number: senderNum,
        trx_id: trxId
      });
      alert("Deposit request submitted! Awaiting admin approval.");
      setAmount(''); setSenderNum(''); setTrxId('');
    } catch (err: any) {
      alert("Deposit failed");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/login`, { username: adminUser, password: adminPass });
      const txRes = await axios.get(`${API_URL}/admin/transactions`);
      setPendingTx(txRes.data);
      setView('admin');
    } catch (err) {
      alert("Invalid Admin Credentials. Default password is: cq777admin2026");
    }
  };

  const processTx = async (txType: string, id: string, action: string) => {
    await axios.post(`${API_URL}/admin/approve?tx_type=${txType}&tx_id=${id}&action=${action}`);
    const txRes = await axios.get(`${API_URL}/admin/transactions`);
    setPendingTx(txRes.data);
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-amber-400 tracking-wider">CQ777</h1>
            <p className="text-slate-400 text-sm mt-1">bKash & Nagad Gaming Platform</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Phone Number</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" required 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400" />
            </div>
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 font-bold py-3 rounded-lg text-slate-950 transition">
              Login to CQ777
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-2">Admin Portal Access</p>
            <form onSubmit={handleAdminLogin} className="flex gap-2">
              <input type="text" placeholder="Admin User" value={adminUser} onChange={e => setAdminUser(e.target.value)} 
                className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
              <input type="password" placeholder="Admin Password" value={adminPass} onChange={e => setAdminPass(e.target.value)} 
                className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
              <button type="submit" className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-xs font-bold">Admin</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-amber-400">CQ777 Admin Dashboard</h1>
            <button onClick={() => setView('login')} className="bg-rose-600 px-4 py-2 rounded-lg text-sm font-bold">Logout</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Deposits */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-lg font-semibold mb-4 text-pink-400">Pending Deposits</h2>
              {pendingTx.deposits.length === 0 ? <p className="text-slate-500 text-sm">No pending deposits</p> :
                pendingTx.deposits.map((tx: any) => (
                  <div key={tx._id} className="bg-slate-800 p-4 rounded-lg mb-3 text-sm">
                    <p><b>Method:</b> {tx.method} ({tx.amount} BDT)</p>
                    <p><b>Sender:</b> {tx.sender_number}</p>
                    <p><b>TrxID:</b> <span className="text-amber-400 font-mono">{tx.trx_id}</span></p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => processTx('deposit', tx._id, 'approve')} className="bg-emerald-600 px-3 py-1 rounded text-xs font-bold">Approve</button>
                      <button onClick={() => processTx('deposit', tx._id, 'reject')} className="bg-rose-600 px-3 py-1 rounded text-xs font-bold">Reject</button>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Pending Withdrawals */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-lg font-semibold mb-4 text-orange-400">Pending Withdrawals</h2>
              {pendingTx.withdrawals.length === 0 ? <p className="text-slate-500 text-sm">No pending withdrawals</p> :
                pendingTx.withdrawals.map((tx: any) => (
                  <div key={tx._id} className="bg-slate-800 p-4 rounded-lg mb-3 text-sm">
                    <p><b>Method:</b> {tx.method} ({tx.amount} BDT)</p>
                    <p><b>Receiver:</b> {tx.receiver_number}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => processTx('withdrawal', tx._id, 'approve')} className="bg-emerald-600 px-3 py-1 rounded text-xs font-bold">Approve Payout</button>
                      <button onClick={() => processTx('withdrawal', tx._id, 'reject')} className="bg-rose-600 px-3 py-1 rounded text-xs font-bold">Reject</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* User Header */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-black text-amber-400">CQ777</h1>
            <p className="text-xs text-slate-400">{user.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="text-lg font-bold text-emerald-400">৳ {user.balance} BDT</p>
          </div>
        </div>

        {/* Deposit Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl mb-6">
          <h2 className="text-lg font-semibold mb-3 text-pink-400">bKash & Nagad Deposit</h2>
          <form onSubmit={handleDeposit} className="space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setMethod('bKash')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${method === 'bKash' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'}`}>bKash</button>
              <button type="button" onClick={() => setMethod('Nagad')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${method === 'Nagad' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Nagad</button>
            </div>
            <p className="text-xs text-slate-400">Send money to merchant: <b className="text-white">01700000000</b> ({method})</p>
            <input type="number" placeholder="Amount (BDT)" value={amount} onChange={e => setAmount(e.target.value)} required 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
            <input type="text" placeholder="Sender Number (01XXXXXXXXX)" value={senderNum} onChange={e => setSenderNum(e.target.value)} required 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
            <input type="text" placeholder="Transaction ID (TrxID)" value={trxId} onChange={e => setTrxId(e.target.value)} required 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2 rounded-lg text-sm transition">
              Submit Deposit
            </button>
          </form>
        </div>

        {/* Game Lobby Preview */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-center">
          <h2 className="text-lg font-semibold mb-2 text-amber-400">CQ777 Mini Games</h2>u
          <p className="text-xs text-slate-400 mb-4">Color Prediction & Lucky Spin Wheel ready for live betting.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <span className="text-2xl">🎨</span>
              <p className="font-bold text-sm mt-1">Color Prediction</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <span className="text-2xl">🎡</span>
              <p className="font-bold text-sm mt-1">Lucky Spin</p>
            </div>
          </div>
        </div>

        <button onClick={() => setView('login')} className="w-full mt-6 bg-slate-800 text-slate-400 py-2 rounded-lg text-xs">Logout</button>
      </div>
    </div>
  );
}
```
