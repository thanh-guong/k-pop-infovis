#!/usr/bin/env python
# coding: utf-8

# In[1]:


# pandas is a Data Analysis library
import pandas as pd


# # Data import
# 
# Here I imported the data coming from the two datasets.
# Two pandas DataFrames are built from the two csv files containing the datasets.

# In[2]:


dataset_full_path = "data/"
edge_dataset_filename = "K-pop_edge.csv"
vertex_dataset_filename = "K-pop_node.csv"

edges = pd.read_csv(dataset_full_path + edge_dataset_filename)
vertexes = pd.read_csv(dataset_full_path + vertex_dataset_filename)


# # Vertexes dataset
# 
# Dataset is composed by:
# - **label** (record company)
# - **group** (musical group)
# - **artist**
#     - male (male person)
#     - female (female person)
#     - person (non-specified sex person, it's not the sum of males and females)

# In[3]:


vertexes


# # Edges dataset
# 
# This dataset models bidirectional relationships between vertexes.
# 
# - **label-label**: recording companies associations.
# - **label-artist/group**: management relation.
# - **artist-artist**: relationship between artists.
# - **artist-group**: 
#     - most of the times represents a "is-a-member-of" relationship
#     - could be a "collaborates-with" relationship.
# - **group-group**: 
#     - represents the association between groups.
#     - can be even used to model group-group collaboration.

# In[4]:


edges


# # Edges analysis
# 
# Some vertexes has higher grade, I need to find out why.
# 
# Total number of group-group edges is 242. The 20 vertexes with higher number of group-group relationships has an average of 16 relationships.

# In[5]:


edge_distinct_counts = edges.groupby('source').count()


# ### Source vertexes stars

# In[6]:


edge_distinct_counts = pd.DataFrame(edge_distinct_counts)


# In[7]:


edge_distinct_counts


# ### How many group-group edges

# In[8]:


# filtering to get only group vertexes
group_vertexes = vertexes[vertexes['type'] == 'group']


# In[9]:


# data intesection between edges and group vertexes
# dropna() required to filter out NaN rows
group_to_anonymous_edges = edges.join(group_vertexes.set_index('id')).dropna()

# removing all the non group-group edges
group_vertexes_ids = group_vertexes['id']
group_to_group_edges = group_to_anonymous_edges[~group_to_anonymous_edges['target'].isin(group_vertexes_ids)]

# counting the grade of each node with all non group-group edges removed
group_to_group_edges_count = group_to_group_edges.groupby('source')['target'].count()


# In[10]:


pd.DataFrame(group_to_group_edges_count).sort_values(by='target', ascending=False).head(20)


# # Vertexes analysis
# 
# Most of the highest grade vertexes are recording companies.
# 
# Except a couple of outliers, the average number of the 20 most connected vertexes is around 15/20.

# In[11]:


vertex_labels_distinct_counts = vertexes.groupby('type')['id'].nunique()


# In[12]:


pd.DataFrame(vertex_labels_distinct_counts)


# ## Vertexes with highest grade

# In[13]:


vertexes_ordered_by_grade = edge_distinct_counts.sort_values(by=['target'], ascending=False)


# In[14]:


vertexes_ordered_by_grade


# ### Highest grade vertexes informations
# 
# This is a data intersection between the highest grade vertexes and all the vertexes.

# In[15]:


vertexes_ordered_by_grade.join(vertexes.set_index('id')).head(20)


# ### Highest grade group vertexes
# 
# This is a data intersection between the highest grade vertexes and the group vertexes.

# In[16]:


# filtering to get only group vertexes
group_vertexes = vertexes[vertexes['type'] == 'group']


# In[17]:


# dropna() required to filter out NaN rows
vertexes_ordered_by_grade.join(group_vertexes.set_index('id')).dropna().head(20)

