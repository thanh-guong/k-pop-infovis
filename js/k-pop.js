DEBUG = true;
STEP_TIME_MS = 100;
INTERVAL_MS = 300; // milliseconds

let nodes = "";
let edges = "";

let nodes_displayed;
let edges_displayed;

let k_electrostatic;
let k_elastic;
let spring_length;
let gravity;

let svg;
let width = 900;
let height = 600;

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

/***
 * NO SENSE, AND NON USED
 */
function incidenceMatrix()
{
    let incidence_matrix = {}

    for (let i = 0; i < edges.length; i++)
    {
        edges[i].source = nodes[edges[i].source];
        edges[i].target = nodes[edges[i].target];

        incidence_matrix[edges[i].source.index + "," + edges[i].target.index] = 1;
    }
}

/**********************
 **********************
 *  *
 **********************
 **********************/

function activateZoom(container)
{
    svg
    .call(
    d3.zoom()
        .scaleExtent([.1, 4])
        .on("zoom", function() { container.attr("transform", d3.event.transform); })
);
}

function drawGraph()
{
    filterNodes();
    filterEdges();
    nodesInitialization();
    edgesInitialization();
    initializeGlobalVariablesFromDOM();

    // clean if is not the first time
    if (svg != null)
    {
        svg.remove();
    }

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    // create svg
    svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "graph")
        .attr("style", "border-style: solid;");

    let container = svg.append("g");

    activateZoom(container);

    if (DEBUG)
    {
        console.log("Nodes");
        console.log(nodes);
        console.log("Edges");
        console.log(edges);
    }

    // draw edges
    edges_displayed = container
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", "1px")
        .attr("x1", d => d.x1)
        .attr("y1", d => d.y1)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2);

    // draw nodes
    nodes_displayed = container
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return color(d.group); })
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    let iterations = document.getElementById("iterations").value;

    for (let i = 0; i < iterations; i++)
    {
            electrostaticRepulsion();
            springForces();
    }

}

document.getElementById('nodes').addEventListener('change', readNodes, false);
document.getElementById('edges').addEventListener('change', readEdges, false);
