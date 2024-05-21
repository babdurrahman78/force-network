"use client";

import * as d3 from "d3";
import {useEffect} from "react";
import {linksD, nodesD} from "./constant1";

export default function Home() {
  useEffect(() => {
    const width = 928;
    const height = 600;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = linksD.map(d => ({...d}));
    const nodes = nodesD.map(d => ({...d}));

    // Create a simulation with several forces.
    const simulation = d3
      .forceSimulation<any>(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.name)
          .distance(100)
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    // Create the SVG container.
    const svg = d3
      .select("#myPlot")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Add a line for each link, and a circle for each node.
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll()
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .style("marker-end", "url(#test)");

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll()
      .data(nodes)
      .join("g");

    node
      .append("circle")
      .attr("r", 5)
      .attr("fill", d => color(d.group))
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

    node
      .append("text")
      .text((d: any) => d.name)
      .style("font", "15px sans-serif")
      .style("font-weight", 400)
      .attr("stroke", (d: any) => color(d.group))
      .attr("dx", 12)
      .attr("dy", "0.35em");

    svg
      .append("defs")
      .selectAll("marker")
      .data(links)
      .enter()
      .append("marker")
      .attr("id", "test")
      .attr("viewBox", "0, -5, 10, 10")
      .attr("refX", 0)
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .style("fill", "context-fill")
      .style("fill", "#999")
      // .style("opacity", options.opacity)
      .append("path")
      .attr("d", "M0,-5 L10,0 L0,5");

    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    div.html("emomlex");

    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked() {
      function idx(d: any, type: any) {
        // var linkWidthFunc = eval("(" + options.linkWidth + ")");
        var a = d.target.x - d.source.x;
        var b = d.target.y - d.source.y;
        var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
        if (type == "x1") return d.source.x;
        if (type == "y1") return d.source.y;
        if (type == "x2") return d.target.x - (15 * a) / c;
        if (type == "y2") return d.target.y - (15 * b) / c;
      }

      link
        .attr("x1", d => idx(d, "x1"))
        .attr("y1", d => idx(d, "y1"))
        .attr("x2", d => idx(d, "x2"))
        .attr("y2", d => idx(d, "y2"));

      node.attr("transform", (d: any) => `translate(${d.x}, ${d.y} )`);
    }

    var linkedByIndex = {};
    linksD.forEach(item => {
      linkedByIndex[item.source + "," + item.target] = 1;
      linkedByIndex[item.target + "," + item.source] = 1;
    });

    function neighboring(a: any, b: any) {
      return linkedByIndex[a.name + "," + b.name];
    }

    function mouseover(d: any, value: any) {
      console.log(value);
      // unfocus non-connected links and nodes
      //if (options.focusOnHover) {
      var unfocusDivisor = 4;

      link
        .transition()
        .duration(200)
        .style("opacity", function (l) {
          return value != l.source && value != l.target ? 1 / 4 : 1;
        });

      node
        .transition()
        .duration(200)
        .style("opacity", function (o: any) {
          return value.index == o.index || neighboring(value, o) ? 1 : 1 / 4;
        });

      div
        .html(value.Eigen_Weighted)
        .style("opacity", 1)
        .style("left", d.pageX + 10 + "px")
        .style("top", d.pageY + 10 + "px");
    }

    function mouseout(this: any) {
      node.style("opacity", 1);
      link.style("opacity", 1);

      d3.select(this)
        .select("circle")
        .transition()
        .duration(750)
        .attr("r", function (d) {
          return 15;
        });
      d3.select(this)
        .select("text")
        .transition()
        .duration(1250)
        .attr("x", 0)
        .style("opacity", 1 / 4);
    }
  }, []);

  return (
    <main className="flex min-h-screen bg-white flex-col items-center justify-between p-24">
      <svg id="myPlot" />
    </main>
  );
}
