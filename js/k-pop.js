DEBUG = true;
INTERVAL_MS = 300 // milliseconds

let nodes = "";
let edges = "";

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

function draw_graph()
{
    /**********
     * CHECKS *
     **********/
    if(checkData() < 0)
    {
        return -1;
    }

    console.log(nodes.length)
    console.log(edges.length)


}

document.getElementById('nodes').addEventListener('change', readNodes, false);
document.getElementById('edges').addEventListener('change', readEdges, false);


