import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export interface HCPNode {
  id: string;
  label: string;
  type: string;
  profilePhoto?: string;
  name?: string;
}

export interface HCPLink {
  source: string;
  target: string;
  label: string;
}

interface NetworkGraphProps {
  nodes: HCPNode[];
  links: HCPLink[];
  selectedId?: string;
  onNodeClick?: (id: string) => void;
  onNodeHover?: (id: string | null, evt?: MouseEvent) => void;
  onLinkHover?: (link: HCPLink | null) => void;
  enableZoomPan?: boolean;
}

// Responsive: use 100% width/height
const width = 1000;
const height = 600;

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  links,
  selectedId,
  onNodeClick,
  onNodeHover,
  onLinkHover,
  enableZoomPan,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Deep clone nodes and links to avoid D3 mutation bugs
  const nodesCopy = JSON.parse(JSON.stringify(nodes));
  const linksCopy = JSON.parse(JSON.stringify(links));

  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);

    // Zoom and pan
    if (enableZoomPan) {
      svg.call(
        d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.5, 2])
          .on("zoom", (event) => {
            svg.select("g.zoomable").attr("transform", event.transform);
          })
      );
    }

    // D3 force simulation
    const simulation = d3.forceSimulation(nodesCopy as any)
      .force("link", d3.forceLink(linksCopy as any).id((d: any) => d.id).distance(140))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .stop(); // Don't auto-run

    // Run simulation for a fixed number of ticks
    for (let i = 0; i < 100; ++i) {
      simulation.tick();
    }

    // Main group for zooming
    const mainGroup = svg.append("g").attr("class", "zoomable");

    // Draw links
    const link = mainGroup.append("g")
      .attr("stroke", "#bbb")
      .attr("stroke-width", 2)
      .selectAll("line")
      .data(linksCopy)
      .enter().append("line")
      .on("mouseover", (event: any, d: unknown) => onLinkHover && onLinkHover(d as HCPLink))
      .on("mouseout", () => onLinkHover && onLinkHover(null));

    // Draw nodes (as groups for image + border)
    const nodeGroup = mainGroup.append("g")
      .selectAll("g")
      .data(nodesCopy)
      .enter().append("g")
      .style("cursor", "pointer")
      .on("click", (event: any, d: unknown) => onNodeClick && onNodeClick((d as HCPNode).id));

    // Node border circle (attach hover events here only)
    nodeGroup.append("circle")
      .attr("r", 34)
      .attr("fill", (d: unknown) => (d as HCPNode).id === selectedId ? "#2563eb" : "#60a5fa")
      .attr("stroke", (d: unknown) => (d as HCPNode).id === selectedId ? "#1e40af" : "#3b82f6")
      .attr("stroke-width", 3)
      .attr("filter", "drop-shadow(0 2px 6px #0002)")
      .on("mouseenter", (event: MouseEvent, d: unknown) => onNodeHover && onNodeHover((d as HCPNode).id, event))
      .on("mouseleave", function(event: any) {
        if (onNodeHover) onNodeHover(null, event);
      });

    // Profile photo
    nodeGroup.append("image")
      .attr("xlink:href", (d: unknown) => (d as HCPNode).profilePhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent((d as HCPNode).label))
      .attr("x", -28)
      .attr("y", -28)
      .attr("width", 56)
      .attr("height", 56)
      .attr("clip-path", "circle(28px at 28px 28px)");

    // Node labels (below node)
    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 50)
      .attr("font-size", 13)
      .attr("fill", "#222")
      .attr("font-weight", 600)
      .text((d: unknown) => {
        const node = d as HCPNode;
        if (node.type === 'Researcher' && node.name) {
          return node.name;
        }
        if (typeof node.id === 'string') {
          const match = node.id.match(/'([^']+)'/g);
          if (match && match[1]) return match[1].replace(/'/g, '');
        }
        return node.label || node.type || node.id;
      });

    // Link labels
    const linkLabel = mainGroup.append("g")
      .selectAll("text")
      .data(linksCopy)
      .enter().append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -6)
      .attr("font-size", 10)
      .attr("fill", "#888")
      .text((d: unknown) => (d as HCPLink).label);

    // Set positions after simulation
    link
      .attr("x1", d => ((d as any).source as any).x)
      .attr("y1", d => ((d as any).source as any).y)
      .attr("x2", d => ((d as any).target as any).x)
      .attr("y2", d => ((d as any).target as any).y);
    nodeGroup
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    linkLabel
      .attr("x", d => (((d as any).source as any).x + ((d as any).target as any).x) / 2)
      .attr("y", d => (((d as any).source as any).y + ((d as any).target as any).y) / 2);

    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedId, onNodeClick, onNodeHover, onLinkHover, enableZoomPan]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full min-h-[500px]"
      style={{ display: "block" }}
    />
  );
}; 