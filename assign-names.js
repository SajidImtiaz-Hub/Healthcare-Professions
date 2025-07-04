const fs = require('fs');

// Read graph data
const data = JSON.parse(fs.readFileSync('public/graph-data.json', 'utf8'));

// Read names from CSV
const csv = fs.readFileSync('public/names.csv', 'utf8').split('\n').slice(1); // skip header
const names = csv
  .map(line => line.replace(/"/g, '').trim())
  .filter(line => line)
  .map(line => {
    const [first, last] = line.split(',');
    return first && last ? `${first.trim()} ${last.trim()}` : null;
  })
  .filter(Boolean);

// Map of ORCID to node index in data.nodes
const orcidToNodeIdx = {};
data.nodes.forEach((node, idx) => {
  if (node.type === 'Researcher') {
    const matches = node.id.match(/'([^']+)'/g);
    const orcid = matches && matches[1] ? matches[1].replace(/'/g, '') : null;
    if (orcid && !(orcid in orcidToNodeIdx)) {
      orcidToNodeIdx[orcid] = idx;
    }
  }
});

// Assign unique names to unique ORCIDs (only if missing)
const orcids = Object.keys(orcidToNodeIdx);
const usedNames = new Set();
let nameIdx = 0;
for (const orcid of orcids) {
  const nodeIdx = orcidToNodeIdx[orcid];
  const node = data.nodes[nodeIdx];
  if (!node.name) {
    // Find the next unused name
    while (nameIdx < names.length && usedNames.has(names[nameIdx])) {
      nameIdx++;
    }
    if (nameIdx < names.length) {
      node.name = names[nameIdx];
      usedNames.add(names[nameIdx]);
      nameIdx++;
    } else {
      console.warn('Ran out of unique names for researchers!');
      break;
    }
  }
}

fs.writeFileSync('public/graph-data.json', JSON.stringify(data, null, 2));
console.log('Assigned unique names to unique researcher ORCIDs (only if missing)!');