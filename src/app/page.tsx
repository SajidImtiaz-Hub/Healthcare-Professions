"use client";
import React, { useState, useEffect, useRef } from "react";
import { NetworkGraph } from "./NetworkGraph";

function getSubgraph(graphData: any, selectedId: string) {
  if (!graphData || !graphData.nodes || !graphData.links || !selectedId) return { nodes: [], links: [] };
  const selectedNode = graphData.nodes.find((n: any) => n.id === selectedId);
  if (!selectedNode) return { nodes: [], links: [] };

  // 1-hop neighbors
  const directLinks = graphData.links.filter((l: any) => l.source === selectedId || l.target === selectedId);
  const neighborIds = new Set([
    ...directLinks.map((l: any) => l.source),
    ...directLinks.map((l: any) => l.target)
  ]);
  neighborIds.delete(selectedId);

  // 2-hop neighbors (via any path)
  const twoHopLinks = graphData.links.filter((l: any) => neighborIds.has(l.source) || neighborIds.has(l.target));
  const twoHopNeighborIds = new Set([
    ...twoHopLinks.map((l: any) => l.source),
    ...twoHopLinks.map((l: any) => l.target)
  ]);
  twoHopNeighborIds.delete(selectedId);

  // All researcher ids within 2 hops
  const allResearcherIds = new Set([
    selectedId,
    ...[...neighborIds, ...twoHopNeighborIds].filter((id: any) => {
      const node = graphData.nodes.find((n: any) => n.id === id);
      return node && node.type === 'Researcher';
    })
  ]);

  // Collect all links that connect any two of these researchers (direct or via a path node)
  const relevantLinks = graphData.links.filter((l: any) =>
    (allResearcherIds.has(l.source) && allResearcherIds.has(l.target)) ||
    (allResearcherIds.has(l.source) && !allResearcherIds.has(l.target)) ||
    (allResearcherIds.has(l.target) && !allResearcherIds.has(l.source))
  );

  // Collect all nodes on these links
  const relevantNodeIds = new Set([
    ...Array.from(allResearcherIds),
    ...relevantLinks.map((l: any) => l.source),
    ...relevantLinks.map((l: any) => l.target)
  ]);
  const nodes = graphData.nodes.filter((n: any) => relevantNodeIds.has(n.id));
  const links = relevantLinks;

  return { nodes, links };
}

export default function Home() {
  const [graphData, setGraphData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [defaultId, setDefaultId] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");
  const graphRef = useRef<any>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<any>(null);
  const [expandedLink, setExpandedLink] = useState<any>(null);
  const [hoveredNodeTooltip, setHoveredNodeTooltip] = useState<{ x: number, y: number, name: string, label: string } | null>(null);

  // Wrapper to log all setSelectedId calls
  const setSelectedIdWithLog = (val: string, context: string) => {
    setSelectedId(val);
    console.log(`[DEBUG] setSelectedId called from ${context}:`, val);
  };

  // Debug: log every time hoveredNodeId is set
  const setHoveredNodeIdWithLog = (id: string | null) => {
    setHoveredNodeId(id);
    console.log(`[DEBUG] setHoveredNodeId called:`, id);
  };

  useEffect(() => {
    fetch("/graph-data.json")
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
        // Default to first Researcher node if available
        const defaultNode = data.nodes.find((n: any) => n.type === "Researcher");
        if (defaultNode) {
          setSelectedIdWithLog(defaultNode.id, "initial load");
          setDefaultId(defaultNode.id);
        }
      });
  }, []);

  useEffect(() => {
    console.log("[DEBUG] selectedId:", selectedId);
  }, [selectedId]);
  useEffect(() => {
    console.log("[DEBUG] search:", search);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!graphData) return;
    setSearchError("");
    // Search by name (case-insensitive)
    const found = graphData.nodes.find((n: any) =>
      n.type === "Researcher" &&
      n.name && n.name.toLowerCase().includes(search.toLowerCase())
    );
    if (found) {
      setSelectedIdWithLog(found.id, "search submit");
      setSearchError("");
      setTimeout(() => {
        graphRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else {
      setSearchError("No HCP found with that name.");
    }
  };

  const handleClear = () => {
    setSearch("");
    setSearchError("");
    if (defaultId) setSelectedIdWithLog(defaultId, "clear");
  };

  // Only show subgraph for selected node (never hovered node)
  const { nodes, links } = getSubgraph(graphData, selectedId);
  const selectedNode = nodes.find((n: any) => n.id === selectedId);

  // Debug: log both IDs on every render
  useEffect(() => {
    console.log(`[DEBUG] RENDER: selectedId=`, selectedId, 'hoveredNodeId=', hoveredNodeId);
  }, [selectedId, hoveredNodeId]);

  // Publications, education, work for selected/hovered node
  function getNodeDetails(node: any) {
    if (!node) return { education: [], work: [], publications: [] };
    return {
      education: node.education || [],
      work: node.work || [],
      publications: node.publications || []
    };
  }
  const nodeDetails = getNodeDetails(selectedNode);

  // Connection summary for hovered link
  function getConnectionSummary(link: any) {
    if (!link) return '';
    // Example: if link.label === 'AUTHORED', count co-authored publications
    if (link.label === 'AUTHORED') {
      return 'Co-authored publication';
    }
    return link.label;
  }

  // Connection details for expanded link
  function getConnectionDetails(link: any) {
    if (!link) return null;
    // Example: show both node names and link label
    const source = nodes.find((n: any) => n.id === link.source);
    const target = nodes.find((n: any) => n.id === link.target);
    return {
      source: source?.name || source?.label || source?.id,
      target: target?.name || target?.label || target?.id,
      label: link.label
    };
  }
  const connectionDetails = getConnectionDetails(expandedLink);

  // Debug: log nodes and links passed to NetworkGraph
  useEffect(() => {
    console.log("[DEBUG] nodes:", nodes);
    console.log("[DEBUG] links:", links);
  }, [nodes, links]);

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-sm rounded-b-3xl px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Emily Carter" className="w-16 h-16 rounded-full object-cover border-4 border-blue-200" />
          <div>
            <div className="font-bold text-lg text-gray-900">Emily Carter</div>
            <div className="text-gray-500 text-sm">Cardiologist at NHOG</div>
          </div>
        </div>
        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-center">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-xs text-gray-400">My Peers</div>
              <div className="font-bold text-blue-900 text-lg">232</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Following</div>
              <div className="font-bold text-blue-900 text-lg">124</div>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full shadow transition">Create web</button>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show connections</span>
            <input type="checkbox" className="toggle toggle-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show my connections on map</span>
            <input type="checkbox" className="toggle toggle-sm" checked readOnly />
          </div>
        </div>
      </header>
      {/* Search and Filter Bar */}
      <div className="w-full flex items-center justify-between px-8 py-4 gap-4 bg-transparent">
        <form className="flex-1 flex items-center bg-white rounded-full shadow px-4 py-2 max-w-2xl">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Search by name"
            className="flex-1 bg-transparent outline-none text-gray-700"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="ml-2 text-blue-600 font-semibold"
          >
            Search
          </button>
          {search && (
            <button type="button" className="ml-2 text-gray-400 hover:text-blue-600" onClick={handleClear} title="Clear search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </form>
        <div className="relative flex items-center gap-2">
          <button className="bg-white rounded-full shadow px-4 py-2 text-gray-500 font-medium flex items-center gap-2 border border-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            Filter
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>
      {searchError && <div className="text-red-500 text-sm text-center mb-2">{searchError}</div>}
      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 px-8 pb-8">
        {/* Profile Card */}
        <section className="w-full lg:w-1/3 xl:w-1/4 bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center mb-6 lg:mb-0">
          <div className="w-full flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt={selectedNode?.name || 'Profile'} className="w-32 h-32 rounded-full border-4 border-blue-200 shadow object-cover" />
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">{selectedNode?.name || selectedNode?.label}</div>
            <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">{selectedNode?.type}</div>
            {/* Education */}
            <div className="w-full mt-2">
              <div className="font-semibold text-gray-700 mb-1">Education</div>
              {nodeDetails.education.length > 0 ? nodeDetails.education.map((edu: any, i: number) => (
                <div key={i} className="bg-blue-50 rounded-xl p-3 mb-2 flex flex-col">
                  <div className="font-bold text-blue-800 text-sm">{edu.degree || edu.school || edu}</div>
                  <div className="text-xs text-gray-500">{edu.period || edu.field || ''}</div>
                </div>
              )) : <div className="text-xs text-gray-400">No education data</div>}
            </div>
            {/* Work */}
            <div className="w-full mt-2">
              <div className="font-semibold text-gray-700 mb-1">Work Experience</div>
              {nodeDetails.work.length > 0 ? nodeDetails.work.map((job: any, i: number) => (
                <div key={i} className="bg-blue-50 rounded-xl p-3 mb-2 flex flex-col">
                  <div className="font-bold text-blue-800 text-sm">{job.title || job.organization || job}</div>
                  <div className="text-xs text-gray-500">{job.period || ''}</div>
                </div>
              )) : <div className="text-xs text-gray-400">No work data</div>}
            </div>
            {/* Publications */}
            <div className="w-full mt-2">
              <div className="font-semibold text-gray-700 mb-1">Publications</div>
              {nodeDetails.publications.length > 0 ? nodeDetails.publications.map((pub: any, i: number) => (
                <div key={i} className="bg-blue-50 rounded-xl p-3 mb-2 flex flex-col">
                  <div className="font-bold text-blue-800 text-sm">{pub.title || pub.id || pub}</div>
                  <div className="text-xs text-gray-500">{pub.year || pub.type || ''}</div>
                </div>
              )) : <div className="text-xs text-gray-400">No publications</div>}
            </div>
          </div>
        </section>
        {/* Graph Area */}
        <section className="flex-1 bg-white rounded-3xl shadow-xl p-6 relative min-h-[600px] flex flex-col">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-60 pointer-events-none" />
          <div ref={graphRef} className="flex-1 flex items-center justify-center relative z-10">
            {nodes && nodes.length > 0 ? (
              <NetworkGraph
                nodes={nodes}
                links={links}
                selectedId={selectedId}
                onNodeClick={id => setSelectedIdWithLog(id, "node click")}
                onNodeHover={(id, evt) => {
                  setHoveredNodeIdWithLog(id);
                  if (id && evt && graphData) {
                    const node = graphData.nodes.find((n: any) => n.id === id);
                    if (node) {
                      // Get mouse position relative to SVG, with type checks
                      const target = evt.target as (SVGElement | null);
                      const svgRect = (target && 'ownerSVGElement' in target && target.ownerSVGElement)
                        ? target.ownerSVGElement.getBoundingClientRect()
                        : null;
                      setHoveredNodeTooltip(svgRect ? {
                        x: evt.clientX - svgRect.left,
                        y: evt.clientY - svgRect.top,
                        name: node.name || node.label || node.id,
                        label: node.label || node.type || node.id
                      } : null);
                    }
                  } else {
                    setHoveredNodeTooltip(null); // Always hide tooltip when not hovering
                  }
                }}
                onLinkHover={link => {
                  setHoveredLink(link);
                }}
                enableZoomPan={true}
              />
            ) : (
              <span className="text-4xl text-blue-200 font-bold">[Graph Placeholder]</span>
            )}
            {/* Edge hover tooltip */}
            {hoveredLink && !expandedLink && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-50 border border-blue-200 text-xs text-blue-800 rounded-full px-4 py-1 shadow z-20 cursor-pointer"
                onClick={() => setExpandedLink(hoveredLink)}
              >
                {getConnectionSummary(hoveredLink)}
              </div>
            )}
            {/* Edge click details */}
            {expandedLink && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white border border-blue-200 text-xs text-blue-800 rounded-xl px-6 py-4 shadow z-30">
                <div className="font-bold mb-2">Connection Details</div>
                <div>Source: {connectionDetails?.source}</div>
                <div>Target: {connectionDetails?.target}</div>
                <div>Type: {connectionDetails?.label}</div>
                <button className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-full" onClick={() => setExpandedLink(null)}>Close</button>
              </div>
            )}
            {/* Tooltip for hovered node */}
            {hoveredNodeId && hoveredNodeTooltip && (
              <div
                style={{
                  position: 'absolute',
                  left: hoveredNodeTooltip.x + 20,
                  top: hoveredNodeTooltip.y - 10,
                  pointerEvents: 'none',
                  zIndex: 100
                }}
                className="bg-white border border-blue-200 rounded px-3 py-1 text-xs text-blue-800 shadow"
              >
                <div className="font-bold">{hoveredNodeTooltip.name}</div>
                <div>{hoveredNodeTooltip.label}</div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}