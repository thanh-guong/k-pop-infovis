function applyForces()
{
    for(let i = 0; i < nodes.length; i++)
    {
        let x_actual_position = nodes[i].x;
        let y_actual_position = nodes[i].y;

        let delta_x = nodes[i].delta_x;
        let delta_y = nodes[i].delta_y;

        let x_future = x_actual_position + delta_x;
        let y_future = y_actual_position + delta_y;

        let x_distance = x_future - (width / 2);
        let y_distance = y_future - (height / 2);

        let total_distance = (x_distance ** 2) + (y_distance ** 2);
        total_distance = Math.sqrt(total_distance);

        nodes[i].delta_x -= (total_distance * gravity) * (x_distance / total_distance)
        nodes[i].delta_y -= (total_distance * gravity) * (y_distance / total_distance)

        nodes[i].x += nodes[i].delta_x;
        nodes[i].y += nodes[i].delta_y;
    }

    edges
        .attr("x1", function(d){return d.source.x})
        .attr("y1", function(d){return d.source.y})
        .attr("x2", function(d){return d.target.x})
        .attr("y2", function(d){return d.target.y});

    nodes_displayed
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) {return d.y});
}

function zoom()
{
    function zoomed()
    {
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    let zoom = d3
        .behavior
        .zoom()
        .scaleExtent([0.01, 10])
        .on("zoom", zoomed);

    svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "svg")
        .attr("style", "border-style: solid")
        .call(zoom);
}

function iterativeEadesAlgorithm()
{
    /***************************
     * ELECTROSTATIC REPULSION *
     ***************************/
    electrostaticRepulsion();

    /*****************
     * SPRING FORCES *
     *****************/
    springForces();

    /*****************
     * APPLY FORCES *
     *****************/
    applyForces();
}

function drawGraph()
{
    /**********
     * CHECKS *
     **********/
    if(checkData() < 0)
    {
        return -1;
    }

    nodesInitialization();
    //incidenceMatrix();
    initializeGlobalVariablesFromDOM();
    svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "svg")
        .attr("style", "border-style: solid; margin: auto;");
    //zoom();

    var container = svg.append("g");

    edges_displayed = container
        .selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .attr("stroke-width", "1")
        .attr("stroke", "#999")
        .attr("fill", "transparent");

    var color = d3.scale.category20();

    nodes_displayed = container
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("fill", "#E00000")
        .style("fill", function(d) { return color(d.group); })
        .attr("r", "5");

    nodes_displayed
        .append("title")
        .text(function(d) { return d.name; });

    let iterations = document.getElementById("iterations").value;

    for (let i = 0; i < iterations; i++)
    {
        setTimeout(iterativeEadesAlgorithm, STEP_TIME_MS);
    }
}
