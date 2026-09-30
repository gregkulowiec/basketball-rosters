'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Trophy, Users, AlertCircle, Star, Zap, User } from 'lucide-react';

export default function RosterApp() {
  const [data, setData] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const allTeams = data?.teams || [];

  // Find currently selected team
  const selectedTeam = allTeams.find(t => t.id === activeTeamId) || allTeams[0];

  // Auto-switch team if search matches a player on a different team
  useEffect(() => {
    if (!searchQuery.trim() || !allTeams.length) return;
    const query = searchQuery.toLowerCase();
    
    const matchInCurrent = selectedTeam?.players?.some(p => 
      p.name.toLowerCase().includes(query) || 
      (p.number && p.number.toString().includes(query)) ||
      (p.school && p.school.toLowerCase().includes(query)) ||
      (p.position && p.position.toLowerCase().includes(query))
    );

    if (!matchInCurrent) {
      const foundTeam = allTeams.find(team => 
        team.players.some(p => 
          p.name.toLowerCase().includes(query) || 
          (p.number && p.number.toString().includes(query)) ||
          (p.school && p.school.toLowerCase().includes(query)) ||
          (p.position && p.position.toLowerCase().includes(query))
        )
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
    return (
      player.name.toLowerCase().includes(query) || 
      (player.number && player.number.toString().includes(query)) ||
      (player.school && player.school.toLowerCase().includes(query)) ||
      (player.position && player.position.toLowerCase().includes(query))
    );
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-starz-red selection:text-white relative">
      
      {/* Top Accent Stripe */}
      <div className="h-1.5 bg-gradient-to-r from-starz-red via-starz-blue to-starz-red z-40 relative no-print shadow-md" />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            {/* Club Logo */}
            <div className="relative group shrink-0">
              <img 
                src="/logo.png" 
                alt="MCW Starz Logo" 
                className="w-14 h-14 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-14 h-14 rounded-2xl bg-starz-navy text-white items-center justify-center font-black text-xl border border-slate-200 shadow-sm">
                STARZ
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-[0.2em] text-starz-red uppercase bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-starz-red" /> MCW STARZ BASKETBALL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight text-starz-navy mt-0.5 uppercase">
                {data?.info?.tournamentName || "TOURNAMENT ROSTERS"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600 mt-0.5 font-semibold">
                {data?.info?.dates && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-starz-blue" />
                    {data.info.dates}
                  </span>
                )}
                {data?.info?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-starz-red" />
                    {data.info.location}
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 relative z-10 flex flex-col">
        
        {/* Director Announcement */}
        {data?.info?.notes && (
          <div className="mb-6 p-4 bg-red-50/80 border-l-4 border-l-starz-red border border-red-200/80 rounded-r-2xl text-slate-800 text-xs sm:text-sm flex items-start gap-3.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-starz-red shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-starz-red uppercase tracking-widest text-[11px] block mb-0.5">DIRECTOR ANNOUNCEMENT</span>
              <p className="text-slate-700 font-semibold leading-relaxed">{data.info.notes}</p>
            </div>
          </div>
        )}

        {/* TEAM BUTTONS BAR */}
        {!loading && !error && allTeams.length > 0 && (
          <div className="mb-6 no-print">
            <label className="text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase block mb-3">
              SELECT TEAM TO VIEW ROSTER:
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {allTeams.map((team) => {
                const isSelected = selectedTeam?.id === team.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => {
                      setActiveTeamId(team.id);
                      setSearchQuery('');
                    }}
                    className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2.5 active:scale-95 ${
                      isSelected
                        ? 'bg-starz-red text-white shadow-lg shadow-starz-red/25 border-2 border-red-600 scale-105 z-10'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'
                    }`}
                  >
                    <Trophy className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-starz-blue'}`} />
                    {team.name}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'
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
            placeholder="Search player name, number, position, or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 focus:border-starz-blue rounded-2xl pl-12 pr-4 py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-starz-blue/15 transition-all shadow-sm font-semibold"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-starz-red animate-spin" />
              <Star className="w-6 h-6 fill-starz-blue text-starz-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm font-black tracking-widest uppercase text-slate-600">LOADING ROSTER CARDS...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-md mx-auto my-12 shadow-sm">
            <AlertCircle className="w-12 h-12 text-starz-red mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">ROSTER FEED OFFLINE</h3>
            <p className="text-xs text-slate-600 mt-1 font-semibold">{error}</p>
          </div>
        )}

        {/* FOCUSED TEAM ROSTER VIEW */}
        {!loading && !error && selectedTeam && (
          <div className="flex-1 flex flex-col">
            
            {/* Team Banner Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-starz-blue/5 rounded-full blur-3xl pointer-events-none" />
              <div>
                <span className="text-xs font-black tracking-widest text-starz-red uppercase bg-red-50 px-3 py-1 rounded-full border border-red-200 inline-block mb-2">
                  OFFICIAL WEEKEND ROSTER
                </span>
                <h2 className="text-3xl sm:text-4xl font-black italic text-starz-navy tracking-wide uppercase">
                  {selectedTeam.name}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                <Users className="w-5 h-5 text-starz-red" />
                <span className="text-sm font-black text-slate-800 tracking-wide">
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
                    className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:border-starz-blue hover:shadow-md hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden min-h-[190px]"
                  >
                    {/* Background Jersey Watermark */}
                    {player.number && (
                      <div className="absolute -right-2 -bottom-4 text-7xl font-black italic text-slate-100 pointer-events-none select-none group-hover:text-blue-50 transition-colors z-0">
                        #{player.number}
                      </div>
                    )}

                    {/* Top Row: Jersey Badge (Left) & Player Photo (Right) */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      {/* Jersey Number Badge */}
                      {player.number ? (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-starz-red to-red-700 text-white font-black text-xl flex items-center justify-center shadow-md shadow-starz-red/20 border border-red-500 group-hover:scale-105 transition-transform">
                          #{player.number}
                        </div>
                      ) : (
                        <div />
                      )}

                      {/* Top Right Photo */}
                      {player.photoUrl ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-100 group-hover:border-starz-blue transition-colors">
                          <img 
                            src={player.photoUrl} 
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Player Info Box */}
                    <div className="mt-auto relative z-10">
                      <h3 className="text-2xl sm:text-3xl font-black italic text-starz-navy tracking-wide uppercase leading-tight group-hover:text-starz-blue transition-colors">
                        {player.name}
                      </h3>

                      {/* Position & School Details */}
                      {(player.position || player.school) && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {player.position && (
                            <span className="text-starz-red bg-red-50 px-2 py-0.5 rounded border border-red-100">
                              {player.position}
                            </span>
                          )}
                          {player.school && (
                            <span className="text-slate-600">
                              {player.school}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Card Accent Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-starz-blue/30 to-transparent group-hover:via-starz-red transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-black text-slate-700 uppercase tracking-wider">NO PLAYERS MATCH YOUR SEARCH</h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Clear your search query to view all players on this team.</p>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500 mt-auto no-print relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-3.5 h-3.5 fill-starz-red text-starz-red" />
          <span className="font-black text-slate-700 uppercase tracking-[0.2em] text-[11px]">MCW STARZ BASKETBALL PLATFORM</span>
          <Star className="w-3.5 h-3.5 fill-starz-blue text-starz-blue" />
        </div>
        {data?.lastUpdated && <span className="font-semibold text-slate-500">LIVE SYNC TIMESTAMP: {data.lastUpdated}</span>}
      </footer>
    </div>
  );
}
