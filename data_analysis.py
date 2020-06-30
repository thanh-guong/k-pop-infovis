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
# - label (record company)
# - gruppo (musical group)
# - male (male person)
# - female (female person)
# - person (non-specified sex person, it's not the sum of males and females)

# In[3]:


vertexes


# # Edges dataset
# 
# This dataset models bidirectional relationships between vertexes.

# In[4]:


edges


# # Edges analysis
# 
# Some vertexes has higher grade, I need to find out why.

# In[5]:


edge_distinct_counts = edges.groupby('source').count()


# ### Source nodes stars
# 
# Stelle uscenti da ogni source node

# In[6]:


edge_distinct_counts = pd.DataFrame(edge_distinct_counts)


# In[7]:


edge_distinct_counts


# # Vertexes analysis
# 
# Most of the highest grade vertexes are recording companies.
# 
# Except a couple of outliers, the average number of the 20 most connected vertexes is around 15/20.

# In[8]:


vertex_labels_distinct_counts = vertexes.groupby('type')['id'].nunique()


# In[9]:


pd.DataFrame(vertex_labels_distinct_counts)


# ## Vertexes with highest grade

# In[10]:


vertexes_ordered_by_grade = edge_distinct_counts.sort_values(by=['target'], ascending=False)


# In[11]:


vertexes_ordered_by_grade


# ### Highest grade vertexes informations
# 
# This is a data intersection between the highest grade vertexes and all the vertexes.

# In[12]:


vertexes_ordered_by_grade.join(vertexes.set_index('id')).head(20)


# ### Highest grade group vertexes
# 
# This is a data intersection between the highest grade vertexes and the group vertexes.

# In[13]:


# filtering to get only group vertexes
group_vertexes = vertexes[vertexes['type'] == 'group']


# In[14]:


# dropna() required to filter out NaN rows
vertexes_ordered_by_grade.join(group_vertexes.set_index('id')).dropna().head(20)


# In[ ]:




