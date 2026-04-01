import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Shield,
  Scale,
  Users,
  Star,
  Briefcase,
  BadgeInfo,
} from 'lucide-react';
import { PartyBadge } from '../components/UIComponents';
import { CANDIDATE_PROFILES, findCandidateProfile } from '../data/candidateProfiles';
import { findDirectoryCandidate, loadCandidateDirectory } from '../data/candidateDirectory';
import { PARTY_COLORS } from '../data/electionData';
import { getBrowserPublicProfile } from '../data/publicProfileEnrichment';
import PartySymbolIcon from '../components/PartySymbolIcon';
import ShareBar from '../components/ShareBar';
import RelatedCandidates from '../components/RelatedCandidates';
import ExploreCTA from '../components/ExploreCTA';
import { loadCandidateDirectory as loadDirectory } from '../data/candidateDirectory';

function formatList(values) {
  if (!values?.length) {
    return 'Not available';
  }

  return values.join(', ');
}

function buildSourceLinks(candidate, enrichment) {
  const links = [];
  const seen = new Set();

  const addLink = (link) => {
    if (!link?.url || seen.has(link.url)) {
      return;
    }

    seen.add(link.url);
    links.push(link);
  };

  if (candidate.source?.url) {
    addLink({
      label: candidate.source.label || 'Election record',
      type: 'election-record',
      url: candidate.source.url,
    });
  }

  if (candidate.source?.detailUrl) {
    addLink({
      label: 'Candidate affidavit',
      type: 'affidavit-detail',
      url: candidate.source.detailUrl,
    });
  }

  (enrichment?.publicLinks || []).forEach(addLink);

  return links;
}

function TimelineItem({ year, event, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-400/20 flex-shrink-0" />
        {!isLast && <div className="w-0.5 flex-1 bg-slate-700 mt-1" />}
      </div>
      <div className="pb-6">
        <span className="text-xs font-bold text-amber-400">{year}</span>
        <p className="text-sm text-slate-300 mt-0.5">{event}</p>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color = 'slate' }) {
  const colorMap = {
    green: 'from-green-500/10 border-green-500/20 text-green-400',
    red: 'from-red-500/10 border-red-500/20 text-red-400',
    amber: 'from-amber-500/10 border-amber-500/20 text-amber-400',
    blue: 'from-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/10 border-purple-500/20 text-purple-400',
    slate: 'from-slate-500/10 border-slate-500/20 text-slate-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} to-transparent border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="opacity-70" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function NotFoundState({ navigate }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Candidate Not Found</h2>
      <p className="text-slate-400 mb-6">The candidate profile you are looking for is not available in the loaded directory.</p>
      <button onClick={() => navigate('/candidates')} className="px-6 py-3 bg-amber-500 text-slate-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors">
        Back to Candidates
      </button>
    </div>
  );
}

function GenericCandidateProfile({ candidate, enrichment, enrichmentLoading, navigate }) {
  const partyColor = PARTY_COLORS[candidate.party] || '#6b7280';
  const sourceLinks = buildSourceLinks(candidate, enrichment);
  const profilePhoto = enrichment?.photo || candidate.photo;
  const profileSummary = enrichment?.summary || candidate.bio;
  const profileDescription = enrichment?.description || candidate.designation;
  const hasPublicProfile = Boolean(enrichment?.found);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/candidates')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Candidates
      </button>

      <div className="relative rounded-2xl overflow-hidden border border-slate-700/50">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${partyColor}15 0%, ${partyColor}05 50%, #0f172a 100%)` }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: partyColor, filter: 'blur(80px)' }} />

        <div className="relative p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden ring-4 shadow-2xl flex-shrink-0" style={{ ringColor: `${partyColor}40` }}>
              <img src={profilePhoto} alt={candidate.name} className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=6b7280&color=fff&size=256`; }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <PartyBadge party={candidate.party} size="md" />
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50">
                  {candidate.year} election
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  candidate.status === 'Won' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  candidate.status === 'Lost' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {candidate.status}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${hasPublicProfile ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-slate-700/50 text-slate-300 border-slate-600/50'}`}>
                  {hasPublicProfile ? 'Public profile found' : 'Disclosure-first record'}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">{candidate.name}</h1>
              <p className="text-lg font-medium mb-4" style={{ color: partyColor }}>{profileDescription}</p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {candidate.constituency}{candidate.district ? `, ${candidate.district}` : ''}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {candidate.year} Assembly election</span>
                <span className="flex items-center gap-1.5"><GraduationCap size={14} /> {candidate.education || 'Not disclosed'}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <p>{enrichmentLoading ? 'Checking Wikipedia and Wikidata for an additional public profile...' : enrichment?.sourceNote || 'Election disclosure data is shown below when no additional public profile is available.'}</p>
                {enrichment?.photoSourceLabel && <p className="text-xs text-slate-500">Image source: {enrichment.photoSourceLabel}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={Scale} label="Criminal Cases" value={candidate.criminalCasesText || 'Not available'} color={candidate.criminalCases > 0 ? 'red' : 'green'} />
        <StatBox icon={Briefcase} label="Assets" value={candidate.assetsText || 'Not available'} color="amber" />
        <StatBox icon={Shield} label="Liabilities" value={candidate.liabilitiesText || 'Not available'} color="purple" />
        <StatBox icon={Award} label="Ticket" value={candidate.party} color="blue" />
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Star size={18} className="text-amber-400" /> About This Record
        </h2>
        <p className="text-slate-300 leading-relaxed">{profileSummary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BadgeInfo size={18} className="text-amber-400" /> Location And Ballot Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Year</span>
              <span className="text-slate-200">{candidate.year}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Constituency</span>
              <span className="text-slate-200">{candidate.constituency}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">District</span>
              <span className="text-slate-200">{candidate.district || 'Not mapped'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Reserved</span>
              <span className="text-slate-200">{candidate.reserved || 'General'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">State</span>
              <span className="text-slate-200">Tamil Nadu</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Party</span>
              <span className="text-slate-200">{candidate.party}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Status</span>
              <span className={`text-right font-medium ${candidate.status === 'Won' ? 'text-emerald-400' : candidate.status === 'Lost' ? 'text-red-400' : 'text-slate-200'}`}>{candidate.status}</span>
            </div>
            {candidate.votes && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Votes received</span>
                <span className="text-slate-200 text-right">{candidate.votes.toLocaleString()}{candidate.voteShare ? ` (${candidate.voteShare}%)` : ''}</span>
              </div>
            )}
            {candidate.margin && candidate.status === 'Won' && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Victory margin</span>
                <span className="text-emerald-300 text-right">{candidate.margin.toLocaleString()} votes</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Scale size={18} className="text-amber-400" /> Election Disclosures
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Declared criminal record</span>
              <span className={`${candidate.criminalCases > 0 ? 'text-red-300' : 'text-emerald-300'} text-right`}>{candidate.criminalCasesText || 'Not available'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Education</span>
              <span className="text-slate-200 text-right">{candidate.education || 'Not disclosed'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Declared assets</span>
              <span className="text-slate-200 text-right">{candidate.assetsText || 'Not disclosed'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Declared liabilities</span>
              <span className="text-slate-200 text-right">{candidate.liabilitiesText || 'Not disclosed'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-amber-400" /> Affidavit Identity Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Age</span>
              <span className="text-slate-200 text-right">{candidate.ageText || 'Awaiting affidavit detail sync'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400">Self profession</span>
              <span className="text-slate-200 text-right max-w-[65%]">{candidate.selfProfession || 'Awaiting affidavit detail sync'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400">Spouse profession</span>
              <span className="text-slate-200 text-right max-w-[65%]">{candidate.spouseProfession || 'Not disclosed'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400">Voter enrollment</span>
              <span className="text-slate-200 text-right max-w-[65%]">{candidate.voterEnrollment || 'Awaiting affidavit detail sync'}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-amber-400" /> Public Profile Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Birth date</span>
              <span className="text-slate-200 text-right">{enrichment?.birthDate || 'Not available'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Gender</span>
              <span className="text-slate-200 text-right">{enrichment?.gender || 'Not available'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Residence</span>
              <span className="text-slate-200 text-right">{enrichment?.residence || 'Not available'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Birthplace</span>
              <span className="text-slate-200 text-right">{enrichment?.birthplace || 'Not available'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400">Occupation</span>
              <span className="text-slate-200 text-right max-w-[65%]">{formatList(enrichment?.occupations)}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400">Positions held</span>
              <span className="text-slate-200 text-right max-w-[65%]">{formatList(enrichment?.positionsHeld)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ExternalLink size={18} className="text-amber-400" /> Sources And References
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            This page combines election-record disclosures with other public web sources only when the match is confident. Development or performance claims are intentionally not auto-generated without a verifiable source.
          </p>
          <div className="flex flex-wrap gap-3">
            {sourceLinks.length > 0 ? sourceLinks.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-600/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:border-amber-400/40 hover:text-amber-300 transition-colors">
                {link.label}
                <ExternalLink size={14} />
              </a>
            )) : <p className="text-sm text-slate-500">No external source links are available for this record yet.</p>}
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {candidate.tags?.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ShareBar title={`${candidate.name} — ${candidate.party} candidate from ${candidate.constituency} | TN Election Dashboard`} />

      <RelatedCandidatesFetcher current={candidate} />

      <ExploreCTA exclude={['/candidates']} maxItems={4} title="Keep Exploring" />
    </div>
  );
}

function RelatedCandidatesFetcher({ current }) {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    loadDirectory().then(d => setEntries(d.entries || []));
  }, []);
  if (!entries.length) return null;
  return <RelatedCandidates current={current} allEntries={entries} />;
}

function CuratedCandidateProfile({ candidate, enrichment, navigate }) {
  const partyColor = PARTY_COLORS[candidate.party] || '#6b7280';
  const wins = candidate.electoralHistory?.filter((entry) => entry.result === 'Won').length || 0;
  const losses = candidate.electoralHistory?.filter((entry) => entry.result === 'Lost').length || 0;
  const profilePhoto = enrichment?.photo || candidate.photo;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/candidates')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Candidates
      </button>

      <div className="relative rounded-2xl overflow-hidden border border-slate-700/50">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${partyColor}15 0%, ${partyColor}05 50%, #0f172a 100%)` }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: partyColor, filter: 'blur(80px)' }} />

        <div className="relative p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden ring-4 shadow-2xl" style={{ ringColor: `${partyColor}40` }}>
                <img src={profilePhoto} alt={candidate.name} className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=6b7280&color=fff&size=256`; }} />
              </div>
              {candidate.tags?.length > 0 && (
                <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-900 shadow-lg">
                  {candidate.tags[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <PartyBadge party={candidate.party} size="md" />
                {candidate.criminalCases > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                    {candidate.criminalCases} Criminal Cases
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">{candidate.name}</h1>
              <p className="text-slate-400 text-sm mb-3">{candidate.fullName}</p>
              <p className="text-lg font-medium mb-4" style={{ color: partyColor }}>{candidate.designation}</p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {candidate.constituency}, {candidate.district}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> Age {candidate.age} (Born {new Date(candidate.dob).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })})</span>
                <span className="flex items-center gap-1.5"><GraduationCap size={14} /> {candidate.education}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={Award} label="Elections Won" value={`${wins} / ${wins + losses}`} color="green" />
        <StatBox icon={Scale} label="Criminal Cases" value={candidate.criminalCases} color={candidate.criminalCases > 0 ? 'red' : 'green'} />
        <StatBox icon={Briefcase} label="Assets" value={candidate.assets?.declared || 'N/A'} color="amber" />
        <StatBox icon={Users} label="Gender" value={candidate.gender} color="blue" />
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Star size={18} className="text-amber-400" /> About
        </h2>
        <p className="text-slate-300 leading-relaxed">{candidate.bio}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Calendar size={18} className="text-amber-400" /> Political Career
          </h2>
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {candidate.career?.map((item, index) => (
              <TimelineItem key={index} year={item.year} event={item.event} isLast={index === candidate.career.length - 1} />
            ))}
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Award size={18} className="text-amber-400" /> Electoral History
          </h2>
          {candidate.electoralHistory?.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {candidate.electoralHistory.map((entry, index) => (
                <div key={index} className={`rounded-lg p-3 border ${entry.result === 'Won' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white">{entry.year}</span>
                      <span className="text-xs text-slate-400 ml-2">{entry.constituency}</span>
                    </div>
                    {entry.result === 'Won' ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm font-bold">
                        <TrendingUp size={14} /> Won
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 text-sm font-bold">
                        <TrendingDown size={14} /> Lost
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Margin: <span className={entry.margin > 0 ? 'text-green-400' : 'text-red-400'}>{entry.margin > 0 ? '+' : ''}{entry.margin?.toLocaleString()}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <Shield size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">First-time contestant</p>
              <p className="text-xs text-slate-600 mt-1">No previous electoral history</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {candidate.achievements?.length > 0 && (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <TrendingUp size={18} /> Key Achievements
            </h2>
            <ul className="space-y-2">
              {candidate.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {candidate.controversies?.length > 0 && (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Controversies
            </h2>
            <ul className="space-y-2">
              {candidate.controversies.map((controversy, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">!</span>
                  {controversy}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {candidate.family && Object.keys(candidate.family).length > 0 && (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-amber-400" /> Family
            </h2>
            <div className="space-y-3">
              {Object.entries(candidate.family).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ').replace(/-/g, ' ')}</span>
                  <span className="text-slate-200 text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-400" /> Profile Tags
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {candidate.tags?.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50">
                {tag}
              </span>
            ))}
          </div>
          {candidate.socialMedia && Object.keys(candidate.socialMedia).length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Social Media</h3>
              <div className="space-y-2">
                {Object.entries(candidate.socialMedia).map(([platform, handle]) => (
                  <div key={platform} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 capitalize">{platform}:</span>
                    <span className="text-blue-400">{handle}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Other Key Candidates</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CANDIDATE_PROFILES.filter((profile) => profile.id !== candidate.id).slice(0, 12).map((profile) => {
            const partyColor = PARTY_COLORS[profile.party] || '#6b7280';
            return (
              <Link key={profile.id} to={`/candidate/${profile.id}`} className="group flex flex-col items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-slate-600 hover:bg-slate-800 transition-all">
                <div className="w-12 h-12 rounded-full overflow-hidden mb-2 ring-2 transition-all group-hover:ring-4" style={{ ringColor: `${partyColor}40` }}>
                  <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-semibold text-white text-center truncate w-full">{profile.name}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-0.5"><PartySymbolIcon party={profile.party} size={10} color={PARTY_COLORS[profile.party] || '#6b7280'} /> {profile.party}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const curatedCandidate = findCandidateProfile(id);
  const [directoryCandidate, setDirectoryCandidate] = useState(null);
  const [candidateEnrichment, setCandidateEnrichment] = useState(null);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [loading, setLoading] = useState(!curatedCandidate);

  useEffect(() => {
    if (curatedCandidate) {
      return undefined;
    }

    let active = true;
    setLoading(true);

    loadCandidateDirectory()
      .then((data) => {
        if (active) {
          setDirectoryCandidate(findDirectoryCandidate(data.entries, id));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [curatedCandidate, id]);

  useEffect(() => {
    const activeCandidate = curatedCandidate || directoryCandidate;

    if (!activeCandidate) {
      setCandidateEnrichment(null);
      setEnrichmentLoading(false);
      return undefined;
    }

    let active = true;
    setCandidateEnrichment(null);
    setEnrichmentLoading(true);

    const loadEnrichment = async () => {
      if (directoryCandidate?.id) {
        try {
          const response = await fetch(`/api/candidates/${directoryCandidate.id}/enrichment`);
          if (!response.ok) {
            throw new Error(`Failed to load enrichment: ${response.status}`);
          }

          const data = await response.json();
          if (active && data?.photo) {
            setCandidateEnrichment(data);
            return;
          }

          if (active && data?.found) {
            setCandidateEnrichment(data);
          }

          if (data?.photo || data?.found === false) {
            return;
          }
        } catch (_error) {
          // Fall through to browser-side lookup.
        }
      }

      const browserData = await getBrowserPublicProfile(activeCandidate);
      if (active) {
        setCandidateEnrichment(browserData);
      }
    };

    loadEnrichment()
      .finally(() => {
        if (active) {
          setEnrichmentLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [curatedCandidate, directoryCandidate?.id]);

  if (curatedCandidate) {
    return <CuratedCandidateProfile candidate={curatedCandidate} enrichment={candidateEnrichment} navigate={navigate} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        Loading candidate profile...
      </div>
    );
  }

  if (!directoryCandidate) {
    return <NotFoundState navigate={navigate} />;
  }

  return <GenericCandidateProfile candidate={directoryCandidate} enrichment={candidateEnrichment} enrichmentLoading={enrichmentLoading} navigate={navigate} />;
}
