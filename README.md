# k-pop-infovis
This project is for University purpose: Information Visualization course in Roma Tre University requires a project to be done, and this is mine.

This project comes from a challenge started in ???.
My Professor committed me to find out a task that a user can do to visualize the given datasets. 

## Problem analysis

**Target user**: From the most inexpert in K-pop, to the most expert
**Purpose**: Support the user in understanding who are the artists that compose a group, and how are the groups related.
**Solution**: Clustered graph visualization of the groups, with tunable k-core (to let the user choose the "accuracy") and force-directed algorithm (aesthetics)

### Questions

**Use a third dataset for inferring the role that a group member is covering in the group**
- How to intersect the data with the new dataset?
- What dataset can i choose?
- Where are the given datasets coming from?

**Use a fourth dataset for inferring a photo of each artist, to show these photos in the focus visualization**
- How to intersect the data with the new dataset?
- What dataset can i choose?
- Where are the given datasets coming from?


## Graph drawing algorithm

The algorithm I chose is a spring embedding described in a paper called "A Heuristic for Graph Drawing" [Eades, 1986].
Eades presented an algorithm based on physics laws: each linked couple of nodes is under effect of a force.
This force vector is the sum of the electrostatic repulsion between the couple of nodes, and the force exherted by a spring.

