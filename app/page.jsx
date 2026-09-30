'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, RefreshCw, Trophy, Users, AlertCircle, Share2, Printer, Star } from 'lucide-react';

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
        title: data?.info?.tournamentName || 'MCW Starz Rosters',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-starz-red selection:text-white">
      {/* Top Brand Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-starz-red via-starz-blue to-starz-red no-print" />

      {/* Main Header Banner */}
      <header className="bg-starz-navy border-b border-starz-blue/30 sticky top-0 z-30 shadow-xl shadow-black/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-starz-red rounded-xl text-white shadow-lg shadow-starz-red/40 border border-red-400/30 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-starz-red uppercase bg-red-950/60 px-2 py-0.5 rounded border border-starz-red/30">
                  MCW STARZ BASKETBALL
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white mt-0.5">
                {data?.info?.tournamentName || "Tournament Rosters"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                {data?.info?.dates && (
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-starz-blue" />
                    {data.info.dates}
                  </span>
                )}
                {data?.info?.location && (
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-starz-red" />
                    {data.info.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print w-full sm:w-auto justify-end">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 bg-starz-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-starz-blue/30 flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Copied Link!" : "Share"}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Notice Box */}
        {data?.info?.notes && (
          <div className="mb-6 p-4 bg-starz-navy/80 border-l-4 border-l-starz-red border border-starz-blue/30 rounded-r-xl text-slate-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-starz-red shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider text-xs block mb-0.5">Director's Update</span>
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
              className="w-full bg-slate-900 border border-slate-800 focus:border-starz-blue rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-starz-blue/40 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedGrade === grade
                    ? 'bg-starz-red text-white shadow-lg shadow-starz-red/30 border border-red-400/30'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {grade === 'All' ? 'All Teams' : `${grade} Division`}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin text-starz-red mb-3" />
            <p className="text-sm font-bold tracking-wider uppercase text-slate-300">Loading Starz Rosters...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-950/40 border border-red-600/40 rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-starz-red mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Rosters Unavailable</h3>
            <p className="text-xs text-slate-300 mt-1">{error}</p>
          </div>
        )}

        {/* Roster Cards Grid */}
        {!loading && !error && (
          filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <div 
                  key={team.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl hover:border-starz-blue/50 transition-all group"
                >
                  {/* Card Team Header */}
                  <div className="bg-gradient-to-r from-starz-navy to-slate-900 px-5 py-4 border-b border-slate-800 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-starz-blue/10 rounded-full blur-xl pointer-events-none" />
                    <div>
                      <h3 className="font-black text-white text-lg tracking-wide uppercase group-hover:text-starz-red transition-colors">
                        {team.name}
                      </h3>
                      <span className="text-xs font-semibold text-starz-blue uppercase tracking-widest block mt-0.5">
                        {team.grade} Division
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full text-xs font-black text-white border border-slate-800 shadow-inner">
                      <Users className="w-3.5 h-3.5 text-starz-red" />
                      {team.players.length}
                    </div>
                  </div>

                  {/* Player Roster List */}
                  <div className="p-4 flex-1 bg-slate-950/40">
                    <div className="space-y-2">
                      {team.players.map((player, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 transition-all border border-slate-800/80 hover:border-starz-blue/40"
                        >
                          <div className="flex items-center gap-3">
                            {/* Jersey Number Box */}
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-starz-blue to-starz-navy text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md border border-blue-400/20">
                              {player.number ? `#${player.number}` : '—'}
                            </div>
                            <span className="text-sm font-bold text-slate-100">{player.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">No Teams or Players Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or grade filter.</p>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 mt-auto no-print">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-3.5 h-3.5 fill-starz-red text-starz-red" />
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">MCW Starz Basketball Roster Hub</span>
          <Star className="w-3.5 h-3.5 fill-starz-blue text-starz-blue" />
        </div>
        {data?.lastUpdated && <span>Last sync: {data.lastUpdated}</span>}
      </footer>
    </div>
  );
}
