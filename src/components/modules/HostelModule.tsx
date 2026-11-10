import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { HostelOccupancy } from '../../types';

export const HostelModule: React.FC = () => {
  const { hostelRooms, addHostelRoom, deleteHostelRoom, role } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New hostel room state
  const [newRoom, setNewRoom] = useState<{
    block: string;
    roomNo: string;
    type: HostelOccupancy['type'];
    capacity: number;
    occupied: number;
    warden: string;
    maintenanceStatus: HostelOccupancy['maintenanceStatus'];
  }>({
    block: 'Block A (Aryabhata)',
    roomNo: 'A-101',
    type: 'Double Sharing',
    capacity: 2,
    occupied: 0,
    warden: 'Major Robert Kelly',
    maintenanceStatus: 'Clean & Operational',
  });

  const filteredRooms = hostelRooms.filter((h) => {
    return (
      h.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.roomNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.warden.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.block.trim() || !newRoom.roomNo.trim()) return;

    const capacity = Number(newRoom.capacity) || 2;
    const occupied = Math.min(capacity, Number(newRoom.occupied) || 0);

    addHostelRoom({
      block: newRoom.block.trim(),
      roomNo: newRoom.roomNo.trim(),
      type: newRoom.type,
      capacity: capacity,
      occupied: occupied,
      warden: newRoom.warden.trim() || 'Residential Warden',
      maintenanceStatus: newRoom.maintenanceStatus,
      studentsAssigned: [],
    });

    setIsAddModalOpen(false);
    setNewRoom({
      block: 'Block A (Aryabhata)',
      roomNo: '',
      type: 'Double Sharing',
      capacity: 2,
      occupied: 0,
      warden: 'Major Robert Kelly',
      maintenanceStatus: 'Clean & Operational',
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Hostel & Residential Rooms</h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {hostelRooms.length} {hostelRooms.length === 1 ? 'Room' : 'Rooms'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hostel accommodation, room capacity, warden assignments, and maintenance logs.
          </p>
        </div>

        {role === 'Admin' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by block, room #, or warden..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* Hostel Rooms Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRooms.map((h) => {
            const occPct = Math.round((h.occupied / (h.capacity || 1)) * 100);
            return (
              <div
                key={`${h.block}-${h.roomNo}`}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {h.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        h.maintenanceStatus === 'Clean & Operational'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {h.maintenanceStatus}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-0.5">
                    {h.block} - Room {h.roomNo}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Capacity: {h.capacity} {h.capacity === 1 ? 'Bed' : 'Beds'}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Occupancy:</span>
                      <span className="font-semibold text-slate-800">
                        {h.occupied} / {h.capacity} ({occPct}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Warden:</span>
                      <span className="font-semibold text-slate-800">{h.warden}</span>
                    </div>
                  </div>
                </div>

                {role === 'Admin' && (
                  <div className="flex items-center justify-end pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => deleteHostelRoom(h.block, h.roomNo)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Room"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Clean Minimalist Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Hostel Rooms Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? 'No hostel rooms match your search term.'
              : 'There are currently no residential rooms recorded in the system.'}
          </p>
          {role === 'Admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Room</span>
            </button>
          )}
        </div>
      )}

      {/* Add Hostel Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Residential Room</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Block Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block A (Aryabhata)"
                    value={newRoom.block}
                    onChange={(e) => setNewRoom({ ...newRoom, block: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-102"
                    value={newRoom.roomNo}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNo: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Room Type
                  </label>
                  <select
                    value={newRoom.type}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        type: e.target.value as HostelOccupancy['type'],
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    <option value="Single Deluxe">Single Deluxe</option>
                    <option value="Double Sharing">Double Sharing</option>
                    <option value="Triple AC">Triple AC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Total Capacity (Beds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newRoom.capacity}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        capacity: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Occupied Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={newRoom.capacity}
                    value={newRoom.occupied}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        occupied: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Warden In-charge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Major Robert Kelly"
                    value={newRoom.warden}
                    onChange={(e) => setNewRoom({ ...newRoom, warden: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
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
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
