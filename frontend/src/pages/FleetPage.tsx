import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Search, LayoutGrid, List, Gauge, Fuel, MapPin } from "lucide-react";

export const FleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const fetchFleet = () => {
    setLoading(true);
    api.getVehicles(categoryFilter, statusFilter, search)
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFleet();
  }, [categoryFilter, statusFilter]);

  const handleStatusUpdate = (vId: string, status: string, maintStatus?: string) => {
    api.updateVehicleStatus(vId, status, maintStatus)
      .then(() => {
        fetchFleet();
        if (selectedVehicle?.id === vId) {
          setSelectedVehicle({ ...selectedVehicle, status, maintenance_status: maintStatus || (status === "available" ? "good" : selectedVehicle.maintenance_status) });
        }
      });
  };

  const categories = ["SUV", "Sedan", "Luxury", "Electric", "Compact", "Truck"];

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Search & Filter Bar */}
      <div className="glass-card flex flex-col md:flex-row items-center justify-between gap-4 border-slate-800/80 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search make, model, registration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchFleet()}
            className="w-full bg-slate-900/90 border border-slate-700 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setCategoryFilter("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              categoryFilter === "" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === cat ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table View */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading fleet records...</div>
      ) : viewMode === "grid" ? (
        /* Vehicle Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="glass-card space-y-4 border-slate-800/80 hover:border-blue-500/40 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/50">
                    {v.registration_number}
                  </span>
                  <span className={`badge ${v.status === "available" ? "badge-available" : v.status === "rented" ? "badge-rented" : "badge-maintenance"}`}>
                    {v.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-100">{v.make} {v.model}</h4>
                  <p className="text-xs text-slate-400">{v.year} • {v.category} • {v.capacity} Passengers</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.odometer?.toLocaleString()} mi</span>
                  </div>
                </div>

                {/* Fuel Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Fuel className="w-3 h-3 text-slate-400" /> Fuel Level</span>
                    <span className="font-mono text-slate-200">{v.fuel_level}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${v.fuel_level > 50 ? "bg-emerald-400" : v.fuel_level > 25 ? "bg-amber-400" : "bg-rose-400"}`}
                      style={{ width: `${v.fuel_level}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-slate-100">${v.daily_rate}</span>
                  <span className="text-[11px] text-slate-400">/day</span>
                </div>
                <button
                  onClick={() => setSelectedVehicle(v)}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  Inspect Vehicle
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vehicles Table */
        <div className="glass-card overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Registration</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Daily Rate</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-blue-400 font-bold">{v.registration_number}</td>
                    <td className="p-3.5 font-semibold text-slate-100">
                      {v.make} {v.model} ({v.year})
                    </td>
                    <td className="p-3.5 text-slate-300">{v.category}</td>
                    <td className="p-3.5 font-bold text-slate-100">${v.daily_rate}/day</td>
                    <td className="p-3.5 text-slate-400">{v.location}</td>
                    <td className="p-3.5">
                      <span className={`badge ${v.status === "available" ? "badge-available" : v.status === "rented" ? "badge-rented" : "badge-maintenance"}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => setSelectedVehicle(v)}
                        className="btn-secondary py-1 px-2.5 text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicle Detail Drawer Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card max-w-lg w-full space-y-5 border-blue-500/40 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-100">{selectedVehicle.make} {selectedVehicle.model}</h3>
                <p className="text-xs text-blue-400 font-mono">{selectedVehicle.registration_number}</p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold text-slate-200">{selectedVehicle.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Daily Rate</span>
                <span className="font-bold text-emerald-400">${selectedVehicle.daily_rate}/day</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                <span className="font-semibold text-slate-200">{selectedVehicle.location}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Odometer</span>
                <span className="font-semibold text-slate-200">{selectedVehicle.odometer?.toLocaleString()} mi</span>
              </div>
            </div>

            {/* Quick Status Operations */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Operational Status Actions:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(selectedVehicle.id, "available", "good")}
                  className="btn-secondary py-2 px-3.5 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40"
                >
                  Mark Available
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedVehicle.id, "maintenance", "in_repair")}
                  className="btn-secondary py-2 px-3.5 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-950/40"
                >
                  Send to Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
