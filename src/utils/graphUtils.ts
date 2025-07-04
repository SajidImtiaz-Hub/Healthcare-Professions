export interface GraphNode {
  id: string;
  label: string;
  type: string;
  name?: string;
  [key: string]: any;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
  [key: string]: any;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function getSubgraph(graphData: GraphData, selectedId: string) {
  if (!graphData || !graphData.nodes || !graphData.links || !selectedId) return { nodes: [], links: [] };
  const selectedNode = graphData.nodes.find((n) => n.id === selectedId);
  if (!selectedNode) return { nodes: [], links: [] };

  // 1-hop neighbors
  const directLinks = graphData.links.filter((l) => l.source === selectedId || l.target === selectedId);
  const neighborIds = new Set([
    ...directLinks.map((l) => l.source),
    ...directLinks.map((l) => l.target)
  ]);
  neighborIds.delete(selectedId);

  // 2-hop neighbors (via any path)
  const twoHopLinks = graphData.links.filter((l) => neighborIds.has(l.source) || neighborIds.has(l.target));
  const twoHopNeighborIds = new Set([
    ...twoHopLinks.map((l) => l.source),
    ...twoHopLinks.map((l) => l.target)
  ]);
  twoHopNeighborIds.delete(selectedId);

  // All researcher ids within 2 hops
  const allResearcherIds = new Set([
    selectedId,
    ...[...neighborIds, ...twoHopNeighborIds].filter((id) => {
      const node = graphData.nodes.find((n) => n.id === id);
      return node && node.type === 'Researcher';
    })
  ]);

  // Collect all links that connect any two of these researchers (direct or via a path node)
  const relevantLinks = graphData.links.filter((l) =>
    (allResearcherIds.has(l.source) && allResearcherIds.has(l.target)) ||
    (allResearcherIds.has(l.source) && !allResearcherIds.has(l.target)) ||
    (allResearcherIds.has(l.target) && !allResearcherIds.has(l.source))
  );

  // Collect all nodes on these links
  const relevantNodeIds = new Set([
    ...Array.from(allResearcherIds),
    ...relevantLinks.map((l) => l.source),
    ...relevantLinks.map((l) => l.target)
  ]);
  const nodes = graphData.nodes.filter((n) => relevantNodeIds.has(n.id));
  const links = relevantLinks;

  return { nodes, links };
} 