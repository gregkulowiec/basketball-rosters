'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, RefreshCw, Trophy, Users, AlertCircle, Share2, Printer, Star, Zap, User } from 'lucide-react';

export default function RosterApp() {
  const [data, setData] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
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

      // Bypass browser & server caching
      const cacheBusterUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;

      const res = await fetch(cacheBusterUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to fetch schedule and roster data.");
      const json = await res.json();
      setData(json);

      // Default to selecting the first team automatically
      if (json?.teams && json.teams.length > 0 && !activeTeamId) {
        setActiveTeamId(json.teams[0].id);
      }
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

  // Find currently selected team
  const selectedTeam = allTeams.find(t => t.id === activeTeamId) || allTeams[0];

  // Auto-switch team if search matches a player on a different team
  useEffect(() => {
    if (!searchQuery.trim() || !allTeams.length) return;
    const query = searchQuery.toLowerCase();
    
    // Check if player exists in current team first
    const matchInCurrent = selectedTeam?.players?.some(p => 
      p.name.toLowerCase().includes(query) || (p.number && p.number.toString().includes(query))
    );

    if (!matchInCurrent) {
      const foundTeam = allTeams.find(team => 
        team.players.some(p => p.name.toLowerCase().includes(query) || (p.number && p.number.toString().includes(query)))
      );
      if (foundTeam) {
        setActiveTeamId(foundTeam.id);
      }
    }
  }, [searchQuery]);

  // Filter players on the selected team based on search query
  const filteredPlayers = selectedTeam?.players?.filter(player => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return player.name.toLowerCase().includes(query) || (player.number && player.number.toString().includes(query));
  }) || [];

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans selection:bg-starz-red selection:text-white relative overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-starz-blue/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-1/2 right-10 w-[500px] h-[500px] bg-starz-red/10 rounded-full blur-[150px] pointer-events-none z-0" />
      
      {/* Top Metallic Stripe */}
      <div className="h-1.5 bg-gradient-to-r from-starz-red via-blue-500 to-starz-red z-40 relative no-print shadow-[0_0_15px_rgba(216,35,42,0.6)]" />

      {/* Main Glass Header */}
      <header className="bg-[#0a1120]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 shadow-2xl">
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 relative z-10 flex flex-col">
        
        {/* Notice Box */}
        {data?.info?.notes && (
          <div className="mb-6 p-4 bg-gradient-to-r from-slate-900/90 to-[#111c35]/90 border-l-4 border-l-starz-red border border-slate-800 rounded-r-2xl text-slate-200 text-xs sm:text-sm flex items-start gap-3.5 shadow-2xl backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-starz-red shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-starz-red uppercase tracking-widest text-[11px] block mb-0.5">DIRECTOR ANNOUNCEMENT</span>
              <p className="text-slate-300 font-medium leading-relaxed">{data.info.notes}</p>
            </div>
          </div>
        )}

        {/* TEAM SELECTION BUTTONS BAR */}
        {!loading && !error && allTeams.length > 0 && (
          <div className="mb-6 no-print">
            <label className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase block mb-3">
              SELECT TEAM TO VIEW ROSTER:
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
              {allTeams.map((team) => {
                const isSelected = selectedTeam?.id === team.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => {
                      setActiveTeamId(team.id);
                      setSearchQuery('');
                    }}
                    className={`px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2.5 shadow-md active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-starz-red to-red-700 text-white shadow-lg shadow-starz-red/35 border-2 border-red-400/60 scale-105 z-10'
                        : 'bg-[#0e172a]/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Trophy className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-starz-blue'}`} />
                    {team.name}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {team.players.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="relative mb-8 no-print">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search any player name or jersey number across teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e172a]/90 border border-slate-800 focus:border-starz-blue rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-starz-blue/20 transition-all shadow-inner font-medium"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-starz-red animate-spin" />
              <Star className="w-6 h-6 fill-starz-blue text-starz-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm font-black tracking-widest uppercase text-slate-300">LOADING ROSTER CARDS...</p>
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

        {/* FOCUSED TEAM ROSTER VIEW */}
        {!loading && !error && selectedTeam && (
          <div className="flex-1 flex flex-col">
            
            {/* Team Banner Header */}
            <div className="bg-gradient-to-r from-[#0c1836] via-[#0a1224] to-[#121f40] border border-slate-800 rounded-3xl p-6 mb-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-starz-blue/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <span className="text-xs font-black tracking-widest text-starz-red uppercase bg-starz-red/10 px-3 py-1 rounded-full border border-starz-red/20 inline-block mb-2">
                  OFFICIAL WEEKEND ROSTER
                </span>
                <h2 className="text-3xl sm:text-4xl font-black italic text-white tracking-wide uppercase">
                  {selectedTeam.name}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 bg-[#060a12] px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
                <Users className="w-5 h-5 text-starz-red" />
                <span className="text-sm font-black text-white tracking-wide">
                  {filteredPlayers.length} {filteredPlayers.length === 1 ? 'PLAYER' : 'PLAYERS'} ON ROSTER
                </span>
              </div>
            </div>

            {/* PLAYER CARDS GRID */}
            {filteredPlayers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPlayers.map((player, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-b from-[#0f1b33] to-[#0a1120] border border-slate-800/90 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-starz-blue hover:shadow-starz-blue/20 hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Background Metallic Jersey Watermark */}
                    <div className="absolute -right-4 -bottom-6 text-7xl font-black italic text-slate-800/15 pointer-events-none select-none group-hover:text-starz-blue/10 transition-colors">
                      {player.number ? `#${player.number}` : 'MCW'}
                    </div>

                    {/* Top Badge & Jersey # */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-starz-red via-red-600 to-red-800 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-starz-red/30 border border-red-400/40 group-hover:scale-110 transition-transform">
                        {player.number ? `#${player.number}` : '—'}
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#060a12] text-[10px] font-black tracking-widest text-starz-blue uppercase border border-slate-800">
                        STARZ ATHLETE
                      </span>
                    </div>

                    {/* Player Name Box */}
                    <div className="mt-auto relative z-10">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-starz-red" /> ROSTER ATHLETE
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black italic text-white tracking-wide uppercase leading-tight group-hover:text-starz-blue transition-colors">
                        {player.name}
                      </h3>
                    </div>

                    {/* Bottom Card Border Glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-starz-blue/50 to-transparent group-hover:via-starz-red transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#0c1629]/50 rounded-3xl border border-slate-800 backdrop-blur-md">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-black text-slate-300 uppercase tracking-wider">NO PLAYERS MATCH YOUR SEARCH</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Clear your search query to view all players on this team.</p>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#04070d] border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 mt-auto no-print relative z-10">
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
