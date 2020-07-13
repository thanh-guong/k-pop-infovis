DEBUG = true;
LABEL_LAYOUT_CHARGE_STRENGTH = 50;
LABEL_LAYOUT_LINK_STRENGTH = 2;
LABEL_LAYOUT_DISTANCE = 0;
GRAPH_LAYOUT_CHARGE_STRENGTH = 3000;
GRAPH_LAYOUT_X_STRENGTH = 1;
GRAPH_LAYOUT_Y_STRENGTH = 1;
GRAPH_LAYOUT_LINK_STRENGTH = 1;
GRAPH_LAYOUT_DISTANCE = 50;

let nodes = "";
let edges = "";
let filteredNodes = [];
let filteredEdges = [];

let svg;

let nodes_displayed;
let edges_displayed;

let labelLayoutChargeStrength = 50;
let labelLayoutLinkStrength = 2;
let labelLayoutDistance	= 0;
let graphLayoutChargeStrength = 3000;
let graphLayoutXStrength = 1;
let graphLayoutYStrength = 1;
let graphLayoutLinkStrength	= 1;
let graphLayoutDistance	= 50;

labelLayoutChargeStrength = LABEL_LAYOUT_CHARGE_STRENGTH;
labelLayoutLinkStrength = LABEL_LAYOUT_LINK_STRENGTH;
labelLayoutDistance	= LABEL_LAYOUT_DISTANCE;
graphLayoutChargeStrength = GRAPH_LAYOUT_CHARGE_STRENGTH;
graphLayoutXStrength = GRAPH_LAYOUT_X_STRENGTH;
graphLayoutYStrength = GRAPH_LAYOUT_Y_STRENGTH;
graphLayoutLinkStrength	= GRAPH_LAYOUT_LINK_STRENGTH;
graphLayoutDistance	= GRAPH_LAYOUT_DISTANCE;

let repulsionMultiplier = 1;
let attractionMultiplier = 1;

let width = "1200";
let height = "600";

/**************************
 **************************
 * INPUT / OUTPUT SECTION *
 **************************
 **************************/

function readFile(file)
{
    let reader = new FileReader();
    reader.readAsText(file);
    return reader;
}

function readNodes(event)
{
    let reader = readFile(event.target.files[0]);
    reader.onload = function(e)
    {
        nodes = JSON.parse(reader.result);
    };
}

function readEdges(event)
{
    let reader = readFile(event.target.files[0]);
    reader.onload = function(e)
    {
        edges = JSON.parse(reader.result);
    };
}

// may be useful for k-core
function howManyLinks(_edges, id)
{
    let links = 0;
    _edges.forEach(edge => { if (edge.id === id) { links++; } });
    return links;
}

function filterNodes()
{
    // filter to get only group nodes
    return nodes.filter(node => node.type === 'group');
}

function filterEdges(filteredNodes)
{
    // filter to get only group-group relationships
    console.log(filteredNodes);

    function existsANodeWithId(id)
    {
        let result = false;
        filteredNodes.forEach(node => {if ( node.id === id ) result = true; })
        return result;
    }

    let result = edges.filter
    (edge =>
        existsANodeWithId(edge.source) &&
        existsANodeWithId(edge.target)
    );

    return result;
}

function checkData()
{
    // if both datasets are not empty
    if(nodes.length > 0 && edges.length > 0)
    {
        return 0;  // ok state reporting
    }

    if(nodes.length < 1 && DEBUG)
    {
        console.log("Nodes empty")
    }

    if(edges.length < 1 && DEBUG)
    {
        console.log("Edges empty")
    }

    return -1;       // error state
}

function initializeGlobalVariablesFromDOM()
{
    repulsionMultiplier = document.getElementById("repulsionMultiplier").value;
    attractionMultiplier = document.getElementById("attractionMultiplier").value;

    labelLayoutChargeStrength = LABEL_LAYOUT_CHARGE_STRENGTH * repulsionMultiplier;
    labelLayoutLinkStrength = LABEL_LAYOUT_LINK_STRENGTH * attractionMultiplier;
    labelLayoutDistance	= LABEL_LAYOUT_DISTANCE;
    graphLayoutChargeStrength = GRAPH_LAYOUT_CHARGE_STRENGTH * repulsionMultiplier;
    graphLayoutXStrength = GRAPH_LAYOUT_X_STRENGTH;
    graphLayoutYStrength = GRAPH_LAYOUT_Y_STRENGTH;
    graphLayoutLinkStrength	= GRAPH_LAYOUT_LINK_STRENGTH * attractionMultiplier;
    graphLayoutDistance	= GRAPH_LAYOUT_DISTANCE;
}

function defaultValues()
{
    labelLayoutChargeStrength = LABEL_LAYOUT_CHARGE_STRENGTH;
    labelLayoutLinkStrength = LABEL_LAYOUT_LINK_STRENGTH;
    labelLayoutDistance	= LABEL_LAYOUT_DISTANCE;
    graphLayoutChargeStrength = GRAPH_LAYOUT_CHARGE_STRENGTH;
    graphLayoutXStrength = GRAPH_LAYOUT_X_STRENGTH;
    graphLayoutYStrength = GRAPH_LAYOUT_Y_STRENGTH;
    graphLayoutLinkStrength	= GRAPH_LAYOUT_LINK_STRENGTH;
    graphLayoutDistance	= GRAPH_LAYOUT_DISTANCE;

    repulsionMultiplier = 1;
    attractionMultiplier = 1;

    document.getElementById("repulsionMultiplier").value = 1;
    document.getElementById("attractionMultiplier").value = 1;
}

function cleanSvgIfDirty()
{
    d3.select("#viz").remove();
    svg = d3
        .select(".svg-container")
        .append("svg")
        .attr("id", "viz")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "border-style: solid;");
}

/***************************************************
 ******************* MAIN **************************
 ***************************************************/

function drawGraph()
{
    if(checkData() !== 0)
    {
        return -1;
    }

    cleanSvgIfDirty();
    if(filteredNodes.length < 1)
    {
        filteredNodes = filterNodes();
    }

    if(filteredEdges.length < 1)
    {
        filteredEdges = filterEdges(filteredNodes);
    }

    if(DEBUG)
    {
        console.log("Begin debug block");
        console.log(nodes);
        console.log(edges);
        console.log(filteredNodes);
        console.log(filteredEdges);
        console.log("End debug block");
    }

    initializeGlobalVariablesFromDOM();

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var label = {
        'nodes': [],
        'links': []
    };

    filteredNodes.forEach(function(d, i) {
        label.nodes.push({node: d});
        label.nodes.push({node: d});
        label.links.push({
            source: i * 2,
            target: i * 2 + 1
        });
    });

    var labelLayout = d3.forceSimulation(label.nodes)
        .force("charge", d3.forceManyBody().strength(-labelLayoutChargeStrength))
        .force("link", d3.forceLink(label.links).distance(labelLayoutDistance).strength(labelLayoutLinkStrength));

    var graphLayout = d3.forceSimulation(filteredNodes)
        // repusion force
        .force("charge", d3.forceManyBody().strength(-graphLayoutChargeStrength))
        // atractive force
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(graphLayoutXStrength))
        .force("y", d3.forceY(height / 2).strength(graphLayoutYStrength))
        .force("link", d3.forceLink(filteredEdges).id(function(d) { return d.id; }).distance(graphLayoutDistance).strength(graphLayoutLinkStrength))
        .on("tick", ticked);

    var adjlist = [];

    filteredEdges.forEach(function(d) {
        adjlist[d.source.index + "-" + d.target.index] = true;
        adjlist[d.target.index + "-" + d.source.index] = true;
    });

    function neigh(a, b) {
        return a == b || adjlist[a + "-" + b];
    }

    var container = svg.append("g");

    svg.call(
        d3.zoom()
            .scaleExtent([.1, 4])
            .on("zoom", function() { container.attr("transform", d3.event.transform); })
    );

    var link = container.append("g").attr("class", "links")
        .selectAll("line")
        .data(filteredEdges)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", "1px");

    var node = container.append("g").attr("class", "nodes")
        .selectAll("g")
        .data(filteredNodes)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return color(d.group); })

    node.on("mouseover", focus).on("mouseout", unfocus);

    node.call(
        d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    );

    var labelNode = container.append("g").attr("class", "labelNodes")
        .selectAll("text")
        .data(label.nodes)
        .enter()
        .append("text")
        .text(function(d, i) { return i % 2 == 0 ? "" : d.node.name; })
        .style("fill", "#555")
        .style("font-family", "Arial")
        .style("font-size", 12)
        .style("pointer-events", "none"); // to prevent mouseover/drag capture

    node.on("mouseover", focus).on("mouseout", unfocus);

    function ticked()
    {

        node.call(updateNode);
        link.call(updateLink);

        labelLayout.alphaTarget(0.3).restart();
        labelNode.each(function(d, i)
        {
            if(i % 2 == 0) {
                d.x = d.node.x;
                d.y = d.node.y;
            } else {
                var b = this.getBBox();

                var diffX = d.x - d.node.x;
                var diffY = d.y - d.node.y;

                var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                var shiftX = b.width * (diffX - dist) / (dist * 2);
                shiftX = Math.max(-b.width, Math.min(0, shiftX));
                var shiftY = 16;
                this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
            }
        });
        labelNode.call(updateNode);

    }

    function fixna(x)
    {
        if (isFinite(x)) return x;
        return 0;
    }

    function focus(d)
    {
        var index = d3.select(d3.event.target).datum().index;
        node.style("opacity", function(o) {
            return neigh(index, o.index) ? 1 : 0.1;
        });
        labelNode.attr("display", function(o) {
            return neigh(index, o.node.index) ? "block": "none";
        });
        link.style("opacity", function(o) {
            return o.source.index == index || o.target.index == index ? 1 : 0.1;
        });
    }

    function unfocus()
    {
        labelNode.attr("display", "block");
        node.style("opacity", 1);
        link.style("opacity", 1);
    }

    function updateLink(link)
    {
        link.attr("x1", function(d) { return fixna(d.source.x); })
            .attr("y1", function(d) { return fixna(d.source.y); })
            .attr("x2", function(d) { return fixna(d.target.x); })
            .attr("y2", function(d) { return fixna(d.target.y); });
    }

    function updateNode(node)
    {
        node.attr("transform", function(d) {
            return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
        });
    }

    function dragstarted(d)
    {
        d3.event.sourceEvent.stopPropagation();
        if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d)
    {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d)
    {
        if (!d3.event.active) graphLayout.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

document.getElementById('nodes').addEventListener('change', readNodes, false);
document.getElementById('edges').addEventListener('change', readEdges, false);
// document.getElementsByName('values').forEach(value => { value.addEventListener('change', drawGraph, false); })
