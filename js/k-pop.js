DEBUG = true;
STEP_TIME_MS = 100;
INTERVAL_MS = 300; // milliseconds

let nodes = "";
let edges = "";

let svg;

let nodes_displayed;
let edges_displayed;

let k_electrostatic;
let k_elastic;
let spring_length;
let gravity;

let width = "1600";
let height = "800";

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

function filterNodes()
{
    // filter to get only group nodes
    nodes = nodes.filter(node => node.type === 'group');
}

function filterEdges()
{
    // filter to get only group-group relationships
    edges = edges.filter(edge => nodes.filter(node => node.id === edge.source).length > 0 && nodes.filter(node => node.id === edge.target).length > 0);
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

/*******************
 *******************
 * FORCE FUNCTIONS *
 *******************
 *******************/

function electrostaticRepulsionForAxis(distance_on_axis, total_distance)
{
    let first_term = k_electrostatic / (total_distance ** 2);
    return first_term * (distance_on_axis / total_distance);
}

function electrostaticRepulsionBetweenTwoNodes(i, j)
{
    // distances
    let x_distance = nodes[i].x - nodes[j].x;
    x_distance = Math.abs(x_distance);
    let y_distance = nodes[i].y - nodes[j].y;
    y_distance = Math.abs(y_distance);
    let total_distance = Math.sqrt((x_distance ** 2) + (y_distance ** 2));

    // quadratic complexity, i don't need to do this for both i_node and j_node, but only for one (and doesn't matter which one)
    nodes[i].delta_x += electrostaticRepulsionForAxis(x_distance, total_distance);
    nodes[i].delta_y += electrostaticRepulsionForAxis(y_distance, total_distance);
}

function electrostaticRepulsion()
{
    // for each couple of nodes
    for(let i = 0; i < nodes.length; i++)
    {
        for(let j = 0; j < nodes.length; j++)
        {
            // skip if the node is "himself"
            if(i === j)
            {
                continue;
            }
            electrostaticRepulsionBetweenTwoNodes(i, j);
        }
    }
}

function hookeLawForAxis(distance_on_axis, total_distance)
{
    let spring_delta = (total_distance - spring_length);
    return - ( k_elastic * spring_delta * (distance_on_axis / total_distance))
}

function springForcesBetweenTwoNodes(i, j)
{
    // distances
    let x_distance = nodes[i].x - nodes[j].x;
    x_distance = Math.abs(x_distance);
    let y_distance = nodes[i].y - nodes[j].y;
    y_distance = Math.abs(y_distance);
    let total_distance = Math.sqrt((x_distance ** 2) + (y_distance ** 2));

    // if x distance is too small
    if(x_distance < 1 && x_distance > -1)
    {
        x_distance = 1;
    }

    // if y distance is too small
    if(y_distance < 1 && y_distance > -1)
    {
        y_distance = 1;
    }

    nodes[i].delta_x -= hookeLawForAxis(x_distance, total_distance)
    nodes[i].delta_y -= hookeLawForAxis(y_distance, total_distance)
    nodes[j].delta_x += hookeLawForAxis(x_distance, total_distance)
    nodes[j].delta_y += hookeLawForAxis(y_distance, total_distance)
}

function springForces()
{
    // for each edge
    for(let i = 0; i < edges.length; i++)
    {
        // find related target and source nodes
        let i_node = nodes.filter(node => node.id === edges[i].source);
        let j_node = nodes.filter(node => node.id === edges[i].target);

        let i = nodes.indexOf(i_node);
        let j = nodes.indexOf(j_node);

        springForcesBetweenTwoNodes(i, j);
    }
}

/**********************
 **********************
 * DOM INPUT / OUTPUT *
 **********************
 **********************/

function nodesInitialization()
{
    let seed = 1;

    function random()
    {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // nodes values initialization
    for (let i = 0; i < nodes.length; i++)
    {
        nodes[i].x = random() * width;
        nodes[i].y = random() * height;
        nodes[i].delta_x = 0;
        nodes[i].delta_y = 0;
        nodes[i].links = 0;
        nodes[i].dragging = false;
        nodes[i].index = i;
    }
}

function edgesInitialization()
{
    for (let i = 0; i < edges.length; i++)
    {
        let source = nodes.find(node => node.id === edges[i].source);
        let target = nodes.find(node => node.id === edges[i].target);

        edges[i].x1 = source.x;
        edges[i].y1 = source.y;
        edges[i].x2 = target.x;
        edges[i].y2 = target.y;
    }
}

function initializeGlobalVariablesFromDOM()
{
    k_electrostatic = document.getElementById("k_electrostatic").value;
    k_elastic = document.getElementById("k_elastic").value;
    spring_length = document.getElementById("spring_length").value;
    gravity = document.getElementById("gravity").value;
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
    let filteredNodes = filterNodes();
    let filtered = filterEdges();
    nodesInitialization();
    edgesInitialization();
    initializeGlobalVariablesFromDOM();

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var label = {
        'nodes': [],
        'links': []
    };

    nodes.forEach(function(d, i) {
        label.nodes.push({node: d});
        label.nodes.push({node: d});
        label.links.push({
            source: i * 2,
            target: i * 2 + 1
        });
    });

    var labelLayout = d3.forceSimulation(label.nodes)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("link", d3.forceLink(label.links).distance(0).strength(2));

    var graphLayout = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-3000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(1))
        .force("y", d3.forceY(height / 2).strength(1))
        .force("link", d3.forceLink(edges).id(function(d) {return d.id; }).distance(50).strength(1))
        .on("tick", ticked);

    var adjlist = [];

    edges.forEach(function(d) {
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
        .data(edges)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", "1px");

    var node = container.append("g").attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
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
document.getElementsByName('values').forEach(value => { value.addEventListener('change', drawGraph, false); })
