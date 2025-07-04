const fs = require('fs');

// === CONFIG: Set the researcher's name or ID here ===
const researcherName = '0000-0003-0427-0369'; // Example: ORCID or name substring

const data = JSON.parse(fs.readFileSync('graph-data.json', 'utf-8'));
const { nodes, links } = data;

// Find the researcher node by ID or name substring
const researcherNode = nodes.find(
  n => (n.type === 'Researcher') && (n.id.includes(researcherName) || n.label.includes(researcherName))
);

if (!researcherNode) {
  console.error('Researcher not found!');
  process.exit(1);
}

// Find all links where this researcher is source or target
const directLinks = links.filter(l => l.source === researcherNode.id || l.target === researcherNode.id);

// Find all directly connected node IDs
const connectedNodeIds = new Set([
  researcherNode.id,
  ...directLinks.map(l => l.source),
  ...directLinks.map(l => l.target)
]);

// Filter nodes to only those in the direct network
const filteredNodes = nodes.filter(n => connectedNodeIds.has(n.id));
// Filter links to only those between these nodes
const filteredLinks = links.filter(l => connectedNodeIds.has(l.source) && connectedNodeIds.has(l.target));

fs.writeFileSync('filtered-graph.json', JSON.stringify({ nodes: filteredNodes, links: filteredLinks }, null, 2));
console.log('Filtered graph saved to filtered-graph.json'); 