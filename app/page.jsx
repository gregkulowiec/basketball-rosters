'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, RefreshCw, Trophy, Users, AlertCircle, Share2, Printer, Star, ChevronRight, Zap } from 'lucide-react';

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
      const baseUrl = process.env.NEXT_PUBLIC_SHEETS_API_URL;

      if (!baseUrl) {
        throw new Error("API URL is not configured. Please set NEXT_PUBLIC_SHEETS_API_URL.");
      }

      // Append a timestamp to bypass browser and server caching
      const cacheBusterUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;

      const res = await fetch(cacheBusterUrl, { cache: 'no-store' });
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-starz-red selection:text-white relative overflow-x-hidden">
      
      {/* Background Ambient Lighting Effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-starz-blue/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-10 w-[400px] h-[400px] bg-starz-red/10 rounded-full blur-[140px] pointer-events-none z-0" />
      
      {/* Top Metallic Accent Stripe */}
      <div className="h-1.5 bg-gradient-to-r from-starz-red via-blue-500 to-starz-red z-40 relative no-print shadow-[0_0_15px_rgba(216,35,42,0.6)]" />

      {/* Main Glassmorphism Header */}
      <header className="bg-[#0b1222]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-starz-red to-starz-blue rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative p-3 bg-[#0d172a] rounded-2xl text-white border border-slate-700/50 flex items-center justify-center shrink-0">
                <Star className="w-7 h-7 fill-starz-red text-starz-red drop-shadow-[0_0_8px_rgba(216,35,42,0.8)]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-[0.2em] text-starz-red uppercase bg-starz-red/10 px-2.5 py-0.5 rounded-full border border-starz-red/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-starz-red" /> MCW STARZ BASKETBALL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white mt-1 uppercase">
                {data?.info?.tournamentName || "TOURNAMENT ROSTERS"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400 mt-1 font-medium">
                {data?.info?.dates && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-starz-blue" />
                    {data.info.dates}
                  </span>
                )}
                {data?.info?.location && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-starz-red" />
                    {data.info.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 no-print w-full md:w-auto justify-end">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 bg-gradient-to-r from-starz-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-starz-blue/25 hover:shadow-starz-blue/40 flex items-center gap-2 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "COPIED LINK!" : "SHARE HUB"}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-black uppercase tracking-wider rounded-xl border border-slate-700/80 transition-all flex items-center gap-2 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              PRINT
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700/80 transition-all disabled:opacity-50 active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-starz-red' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        
        {/* Notice Box */}
        {data?.info?.notes && (
          <div className="mb-8 p-4 bg-gradient-to-r from-slate-900/90 to-[#111c35]/90 border-l-4 border-l-starz-red border border-slate-800 rounded-r-2xl text-slate-200 text-xs sm:text-sm flex items-start gap-3.5 shadow-2xl backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-starz-red shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-starz-red uppercase tracking-widest text-[11px] block mb-0.5">DIRECTOR ANNOUNCEMENT</span>
              <p className="text-slate-300 font-medium leading-relaxed">{data.info.notes}</p>
            </div>
          </div>
        )}

        {/* Search & Athletic Tab Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10 no-print">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search player name or jersey #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1628]/90 border border-slate-800 focus:border-starz-blue rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-starz-blue/20 transition-all shadow-inner font-medium"
            />
          </div>

          {/* Division Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  selectedGrade === grade
                    ? 'bg-gradient-to-r from-starz-red to-red-700 text-white shadow-lg shadow-starz-red/35 border border-red-400/40 scale-105'
                    : 'bg-[#0d1628]/90 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {grade === 'All' ? 'ALL TEAMS' : `${grade} DIVISION`}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-starz-red animate-spin" />
              <Star className="w-6 h-6 fill-starz-blue text-starz-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm font-black tracking-widest uppercase text-slate-300">SYNCING LIVE ROSTERS...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-950/30 border border-red-600/40 rounded-3xl p-8 text-center max-w-md mx-auto my-12 shadow-2xl backdrop-blur-md">
            <AlertCircle className="w-12 h-12 text-starz-red mx-auto mb-3" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">ROSTER FEED OFFLINE</h3>
            <p className="text-xs text-slate-300 mt-1 font-medium">{error}</p>
          </div>
        )}

        {/* Pro Athlete Cards Grid */}
        {!loading && !error && (
          filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeams.map((team) => (
                <div 
                  key={team.id}
                  className="bg-gradient-to-b from-[#0d1628] to-[#090e1a] border border-slate-800/90 rounded-3xl overflow-hidden flex flex-col shadow-2xl hover:border-starz-blue/60 transition-all duration-300 group hover:-translate-y-1"
                >
                  {/* Card Team Header */}
                  <div className="bg-gradient-to-r from-[#0e1b38] via-[#091122] to-[#121c33] px-6 py-5 border-b border-slate-800/80 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-starz-blue/15 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-starz-red uppercase bg-starz-red/10 px-2 py-0.5 rounded border border-starz-red/20 inline-block mb-1">
                        {team.grade} DIVISION
                      </span>
                      <h3 className="font-black italic text-white text-xl tracking-wide uppercase group-hover:text-starz-blue transition-colors">
                        {team.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#050912] px-3.5 py-1.5 rounded-full text-xs font-black text-slate-200 border border-slate-800 shadow-inner">
                      <Users className="w-3.5 h-3.5 text-starz-red" />
                      {team.players.length}
                    </div>
                  </div>

                  {/* Player Roster List */}
                  <div className="p-5 flex-1 space-y-2.5">
                    {team.players.map((player, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#080d18]/90 hover:bg-[#101b30] transition-all duration-200 border border-slate-800/60 hover:border-starz-blue/40 shadow-sm group/player"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Jersey Number Box */}
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-starz-red to-red-800 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-starz-red/20 border border-red-400/30 group-hover/player:scale-110 transition-transform">
                            {player.number ? `#${player.number}` : '—'}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-100 group-hover/player:text-white transition-colors block">
                              {player.name}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                              PLAYER
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover/player:text-starz-blue group-hover/player:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>

                  {/* Card Bottom Accent Line */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-starz-blue/40 to-transparent group-hover:via-starz-red/80 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-[#0d1628]/40 rounded-3xl border border-slate-800/80 backdrop-blur-md">
              <Users className="w-14 h-14 text-slate-600 mx-auto mb-4" />
              <h3 className="text-base font-black text-slate-300 uppercase tracking-widest">NO TEAMS OR PLAYERS MATCH YOUR SEARCH</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Try resetting your search query or grade filter.</p>
            </div>
          )
        )}
      </main>

      {/* Pro Sports Footer */}
      <footer className="bg-[#050810] border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 mt-auto no-print relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-3.5 h-3.5 fill-starz-red text-starz-red" />
          <span className="font-black text-slate-400 uppercase tracking-[0.2em] text-[11px]">MCW STARZ BASKETBALL PLATFORM</span>
          <Star className="w-3.5 h-3.5 fill-starz-blue text-starz-blue" />
        </div>
        {data?.lastUpdated && <span className="font-medium text-slate-600">LIVE SYNC TIMESTAMP: {data.lastUpdated}</span>}
      </footer>
    </div>
  );
}
