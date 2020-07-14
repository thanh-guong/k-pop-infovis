# k-pop-infovis
This project is for University purpose: Information Visualization course in Roma Tre University requires a project to be done, and this is mine.

My Professor (Maurizio Patrignani) committed me to find out a task that a user can do to visualize the given datasets. 

## Problem analysis

**Target user**: From the most inexpert in K-pop, to the most expert.

**Purpose**: Support the user for understanding how are the groups related.

**Solution**: Clustered graph visualization of the groups with force-directed algorithm.

## Graph drawing algorithm

The algorithm I chose is the force directed solution proposed by D3 JS library.

This library allows to manage the forces in the graph by setting the repulsive force between nodes, and the attraction of each node to a point (in my case, the center of the svg container for the graph).

I decided to simplify choose for the user, who doesn't have to insert manually the force values, but only use a multiplier for the repulsion and one for the attraction. These multipliers can variate in a range: [1, 20].

## Usage

### Launching with docker

Requires Docker Engine to be installed on your System.

You have to `git pull` the project then:
- `docker build -t k-pop-infovis .`
- `docker run -p 49160:8080 -d k-pop-infovis`

With `docker ps` you can see the container in which the application is running.

Navigate to http://localhost:49160 (or http://<your-local-ip-address>:49160)

If you want to stop it, just `docker ps`, check out what's the container's name, and `docker stop <container-name>`

### On Application Server

You can simply `git pull` the project in your Application Server.

### Launching with NodeJS

Requires NodeJS 12.* to be installed on your System.

You have to `git pull` the project and then `node server.js`.

## Demo

You can see my work here http://falcao5.ddns.net:50000/
