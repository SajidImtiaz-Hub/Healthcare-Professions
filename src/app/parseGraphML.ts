const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xml = fs.readFileSync('test.txt', 'utf-8');
const parser = new XMLParser({ ignoreAttributes: false });
const json = parser.parse(xml);

const graph = json.graphml.graph;

// Helper to normalize node/edge arrays
function toArray(x: any) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

const nodes = toArray(graph.node).map((node) => {
  const id = node['@_id'] || node['@id'];
  const label = node.data && node.data['#text'] ? node.data['#text'] : (node.data || '');
  // Try to extract type from id or label
  let type = '';
  if (id && id.startsWith("('")) {
    const match = id.match(/^\('([^']+)'/);
    if (match) type = match[1];
  }
  return { id, label, type };
});

const edges = toArray(graph.edge).map((edge) => {
  const source = edge['@_source'] || edge['@source'];
  const target = edge['@_target'] || edge['@target'];
  const label = edge.data && edge.data['#text'] ? edge.data['#text'] : (edge.data || '');
  return { source, target, label };
});

fs.writeFileSync('graph-data.json', JSON.stringify({ nodes, links: edges }, null, 2));

console.log('Parsed graph saved to graph-data.json'); 