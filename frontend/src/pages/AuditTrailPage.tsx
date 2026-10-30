import React, { useState, useEffect } from 'react';
import { Download, Search, RefreshCw, FileText } from 'lucide-react';
import type { IncidentLogEntry } from '../types';
import { fetchIncidentLogs } from '../services/api';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<IncidentLogEntry[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadLogs = async () => {
    const list = await fetchIncidentLogs();
    setLogs(list);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSev = filterSeverity === 'ALL' || log.severity === filterSeverity;
    const matchesSearch = 
      log.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detectedReason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'OrderID', 'Service', 'Severity', 'TriggerEvent', 'DetectedReason', 'ActionTaken', 'Actor', 'Outcome'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.orderId,
      l.service,
      l.severity,
      `"${l.triggerEvent.replace(/"/g, '""')}"`,
      `"${l.detectedReason.replace(/"/g, '""')}"`,
      `"${l.actionTaken.replace(/"/g, '""')}"`,
      l.actor,
      `"${l.outcome.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orderflow_sentinel_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `orderflow_sentinel_incident_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 p-6 rounded-2xl bg-[#222222] border border-[#3B82F6]/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
              <span className="text-xs uppercase font-mono tracking-widest text-[#60A5FA]">
                Incident History & Compliance Ledger
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F9F6F0] mt-1">
              Live Incident Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-[#F9F6F0]/70 mt-1 max-w-2xl">
              Chronological ledger tracking anomalies, AI diagnosis rationales, automated guardrail interventions, and final resolutions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#FFFFFF] bg-[#3B82F6] hover:bg-[#2563EB] transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={exportJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F9F6F0] bg-[#2A2A2A] hover:bg-[#333333] border border-[#444444] transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#60A5FA]" /> JSON Post-Mortem
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 p-4 rounded-xl bg-[#222222] border border-[#3B82F6]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#F9F6F0]/50 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Service, Reason..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] focus:border-[#3B82F6] text-xs text-[#F9F6F0] outline-none"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'WARNING', 'RESOLVED', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-[#3B82F6] text-[#FFFFFF] font-bold'
                  : 'bg-[#1A1A1A] text-[#F9F6F0]/70 border border-[#333333] hover:border-[#3B82F6]/40'
              }`}
            >
              {sev}
            </button>
          ))}
          <button
            onClick={loadLogs}
            title="Refresh Logs"
            className="p-2 rounded-lg bg-[#1A1A1A] border border-[#333333] hover:border-[#3B82F6] text-[#60A5FA] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Incident Log Table */}
      <div className="overflow-hidden rounded-2xl bg-[#222222] border border-[#3B82F6]/25 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F9F6F0]/80">
            <thead className="bg-[#1A1A1A] text-[11px] uppercase tracking-wider text-[#60A5FA] border-b border-[#3B82F6]/20 font-mono">
              <tr>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Target Service</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Trigger & Grounded Reason</th>
                <th className="py-3.5 px-4">Action Taken</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Resolution Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D2D]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#282828] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#F9F6F0]/60 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#60A5FA] whitespace-nowrap">
                      {log.orderId}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#F9F6F0]/70 whitespace-nowrap">
                      {log.service}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        log.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : log.severity === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-[#F9F6F0] truncate">{log.triggerEvent}</p>
                      <p className="text-[11px] text-[#F9F6F0]/60 line-clamp-1">{log.detectedReason}</p>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#F9F6F0]/80">
                      {log.actionTaken}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-[#60A5FA] whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-300 text-[11px] whitespace-nowrap">
                      {log.outcome}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#F9F6F0]/50 text-xs">
                    No incident records matching the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
