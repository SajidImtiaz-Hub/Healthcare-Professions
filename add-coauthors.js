const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/graph-data.json', 'utf8'));

// The publication you want to add co-authors to
const publicationId = "('BookPublication', 'The Molecular Basis of Touch Sensation As Modeled in Caenorhabditis elegans')";

// List of new co-authors to add (add as many as you want)
const coAuthors = [
  { orcid: "0000-0001-1234-5678", name: "Emily Carter" },
  { orcid: "0000-0002-2345-6789", name: "John Smith" },
  { orcid: "0000-0003-3456-7890", name: "Sarah Lee" }
];

// Add each co-author node and link
coAuthors.forEach(author => {
  const researcherId = `('Researcher', '${author.orcid}')`;
  // Add researcher node if not present
  if (!data.nodes.find(n => n.id === researcherId)) {
    data.nodes.push({
      id: researcherId,
      type: "Researcher",
      name: author.name
    });
  }
  // Add co-authorship link if not present
  if (!data.links.find(l => l.source === researcherId && l.target === publicationId)) {
    data.links.push({
      source: researcherId,
      target: publicationId,
      label: "AUTHORED"
    });
  }
});

fs.writeFileSync('public/graph-data.json', JSON.stringify(data, null, 2));
console.log('Added co-authors to publication!');