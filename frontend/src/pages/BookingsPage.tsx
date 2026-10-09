import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { CalendarCheck, Plus, Search, Car, DollarSign, CheckCircle2 } from "lucide-react";

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New booking form state
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [startDate, setStartDate] = useState("2026-10-15");
  const [endDate, setEndDate] = useState("2026-10-18");
  const [calcResult, setCalcResult] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    api.getBookings(statusFilter)
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchBookings();
    api.getVehicles("available")
      .then(setVehicles)
      .catch(console.error);
    api.getCustomers()
      .then(setCustomers)
      .catch(console.error);
  }, [statusFilter]);

  // Recalculate estimated price when vehicle or dates change
  useEffect(() => {
    if (selectedVehicleId && startDate && endDate) {
      const veh = vehicles.find((v) => v.id === selectedVehicleId);
      if (veh) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
        const base = veh.daily_rate * days;
        const tax = base * 0.12;
        const deposit = 200;
        setCalcResult({
          days,
          daily_rate: veh.daily_rate,
          base,
          tax,
          deposit,
          total: base + tax + deposit
        });
      }
    }
  }, [selectedVehicleId, startDate, endDate, vehicles]);

  const handleCreateBooking = () => {
    if (!selectedCustomerId || !selectedVehicleId) return;
    setCreating(true);

    api.createBooking({
      customer_id: selectedCustomerId,
      vehicle_id: selectedVehicleId,
      start_date: startDate,
      end_date: endDate
    })
      .then(() => {
        setCreating(false);
        setShowCreateModal(false);
        fetchBookings();
      })
      .catch((err) => {
        console.error(err);
        setCreating(false);
      });
  };

  const filteredBookings = bookings.filter((b) =>
    search ? b.reference.toLowerCase().includes(search.toLowerCase()) || b.customer_name?.toLowerCase().includes(search.toLowerCase()) || b.vehicle_name?.toLowerCase().includes(search.toLowerCase()) : true
  );

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const activeCount = bookings.filter((b) => b.status === "active" || b.status === "confirmed").length;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Top Stat Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Reservations</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{bookings.length} Bookings</h3>
            <p className="text-xs text-blue-400 mt-1 font-semibold">SQLite Persisted</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Rentals</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{activeCount} Active</h3>
            <p className="text-xs text-emerald-400 mt-1 font-semibold">Vehicles On Road</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Booking Value</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">${totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-indigo-400 mt-1 font-semibold">Includes Taxes & Deposits</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Fleet Utilization</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">78.4%</h3>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Optimal Capacity</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Car className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Controls & Filters */}
      <div className="glass-card flex flex-col md:flex-row items-center justify-between gap-4 border-slate-800/80 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search booking ref, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {["", "confirmed", "active", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {st === "" ? "All Statuses" : st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary py-2.5 px-5 text-xs font-bold shadow-lg shadow-blue-500/25 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Bookings Data Table */}
      <div className="glass-card overflow-hidden border-slate-800/80 shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading reservation records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Dates</th>
                  <th className="p-3.5 text-right">Total Price</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-blue-400 font-bold">{b.reference}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{b.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{b.customer_email}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{b.vehicle_name}</div>
                      <div className="text-[10px] text-slate-400">{b.vehicle_category}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-300 font-medium">{b.start_date} ➔ {b.end_date}</div>
                    </td>
                    <td className="p-3.5 text-right font-black text-slate-100">${b.total_price}</td>
                    <td className="p-3.5 text-right">
                      <span className={`badge ${
                        b.status === "confirmed" || b.status === "active" ? "badge-available" : b.status === "completed" ? "badge-rented" : "badge-urgent"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card max-w-xl w-full space-y-5 border-blue-500/40 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg text-slate-100">Create New Rental Booking</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Vehicle Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Available Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} ({v.category}) - ${v.daily_rate}/day</option>
                  ))}
                </select>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Calculator Breakdown */}
              {calcResult && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Duration & Rate:</span>
                    <span>{calcResult.days} days @ ${calcResult.daily_rate}/day</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Base Subtotal:</span>
                    <span>${calcResult.base}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tax (12%):</span>
                    <span>${calcResult.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Security Deposit:</span>
                    <span>${calcResult.deposit}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-emerald-400 pt-2 border-t border-slate-800">
                    <span>Total Estimated Quote:</span>
                    <span>${calcResult.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBooking}
                disabled={creating || !selectedCustomerId || !selectedVehicleId}
                className="btn-primary py-2 px-5 text-xs font-bold disabled:opacity-50"
              >
                {creating ? "Confirming Booking..." : "Confirm & Save Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
