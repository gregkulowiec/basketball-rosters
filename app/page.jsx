'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, RefreshCw, Trophy, Users, AlertCircle, Share2, Printer } from 'lucide-react';

export default function RosterApp() {
  const [data, setData] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_SHEETS_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not configured. Please set NEXT_PUBLIC_SHEETS_API_URL.");
      }

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch schedule and roster data.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load rosters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data?.info?.tournamentName || 'Basketball Rosters',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const allTeams = data?.teams || [];
  const grades = ['All', ...Array.from(new Set(allTeams.map(t => t.grade))).sort()];

  const filteredTeams = allTeams.filter(team => {
    const matchesGrade = selectedGrade === 'All' || team.grade === selectedGrade;
    if (!matchesGrade) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchesTeamName = team.name.toLowerCase().includes(query);
    const matchesPlayer = team.players.some(p => 
      p.name.toLowerCase().includes(query) || (p.number && p.number.toString().includes(query))
    );

    return matchesTeamName || matchesPlayer;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header Banner */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white shadow-lg shadow-orange-600/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                {data?.info?.tournamentName || "Club Basketball Rosters"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                {data?.info?.dates && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    {data.info.dates}
                  </span>
                )}
                {data?.info?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    {data.info.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print w-full sm:w-auto justify-end">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Copied Link!" : "Share"}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {data?.info?.notes && (
          <div className="mb-6 p-4 bg-orange-950/40 border border-orange-500/30 rounded-xl text-orange-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-orange-300">Director's Note: </span>
              {data.info.notes}
            </div>
          </div>
        )}

        {/* Search & Navigation Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 no-print">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search player name or jersey number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGrade === grade
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {grade === 'All' ? 'All Teams' : `${grade} Grade`}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
            <p className="text-sm font-medium">Loading tournament rosters...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-6 text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-red-200">Rosters Unavailable</h3>
            <p className="text-xs text-red-300/80 mt-1">{error}</p>
          </div>
        )}

        {/* Roster Cards Grid */}
        {!loading && !error && (
          filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <div 
                  key={team.id}
                  className="bg-slate-800/80 border border-slate-700/70 rounded-2xl overflow-hidden flex flex-col shadow-lg"
                >
                  <div className="bg-slate-700/60 px-5 py-3.5 border-b border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{team.name}</h3>
                      <span className="text-xs text-orange-400 font-medium">{team.grade} Grade Division</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-300 border border-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {team.players.length}
                    </div>
                  </div>

                  <div className="p-4 flex-1">
                    <div className="space-y-2">
                      {team.players.map((player, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 transition-all border border-slate-700/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                              {player.number ? `#${player.number}` : '—'}
                            </div>
                            <span className="text-sm font-semibold text-slate-200">{player.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-800">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No teams or players found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or grade filter.</p>
            </div>
          )
        )}
      </main>

      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500 mt-auto no-print">
        {data?.lastUpdated && <span>Last sync: {data.lastUpdated} • </span>}
        Club Basketball Roster Platform
      </footer>
    </div>
  );
}
