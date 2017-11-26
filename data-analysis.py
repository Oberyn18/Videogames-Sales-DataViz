# Carlos Córdova Sáenz - 10222984
import numpy as np
import pandas as pd 

########### DATA PRE-PROCESSING ##########
# Import data using pandas
data = pd.read_csv("vgsales.csv")
    #data.info()

# Drop NaN values
data.dropna(how="any", inplace=True)

# Change data type on Year attribute
data.Year = data.Year.astype(int)
    #data.info()

# Save pre-processed data for visualizations
data.to_csv('data.csv', encoding='utf-8', index=False)

###################  PCA ##################
# Discard nominal attributes on dataset for PCA
data.drop(['Rank', 'Name', 'Platform', 'Year', 'Genre', 'Publisher'], axis=1, inplace=True)

# Normalize data
M = np.copy(data)
for i in range(M.shape[1]):
    if M[:, i].std():
        M[:, i]=(M[:, i]-M[:, i].mean())/M[:, i].std()
    else:
        M[:, i]=0.

# Number of desired dimensions
final_dimensions = 3

# Covariance matrix:
C = np.cov(M.T, bias=1)
# Autovetores e autovalores
eig_values, eig_vectors = np.linalg.eig(C)

# Ordering eigenvalues and eigenvectors
args = np.argsort(eig_values)[::-1]
eig_values = eig_values[args]
eig_vectors = eig_vectors[:,args]
# Retaining the three eigen vectors that corresponds to the three greatest eigen values
feature_vec = eig_vectors[:,:final_dimensions]
# The final data is the product of the normalized data and the feature vector
final_data = np.dot(M,feature_vec)
# Separate the three principal components for plotting
x = final_data[:,0]
y = final_data[:,1]
z = final_data[:,2]

# To understand how the measurements combine into the principal components
eig_values_ = 100*eig_values/np.sum(np.abs(eig_values))
eig_vectors_ = np.array([100*eig_vectors[:,i]/np.abs(eig_vectors[:,i]).sum() for i in range(eig_vectors.shape[1])]).T
feature_vec_ = np.array([100*feature_vec[:,i]/np.abs(feature_vec[:,i]).sum() for i in range(feature_vec.shape[1])]).T

# PLOTS
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import axes3d, Axes3D
import pylab as p

# Show the % of dispersion of each components by looking at the eigen values sorted in descending order
aux_x = [0,1,2,3,4]
fig, ax = plt.subplots()
bars = ax.bar(aux_x, eig_values_, color="darkblue", width=0.9)
ax.set_xlabel('Principal Component')
ax.set_ylabel("Dispersion's Percentage")
ax.set_title("Principal Component's Dispersion Percentage")
ax.set_xticks(np.add(aux_x,(0.45/10)))
ax.set_xticklabels(('PC1', 'PC2', 'PC3', 'PC4', 'PC5'))

def autolabel(bars):
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., 1*height,'%.2f' % height + '%', ha='center', va='bottom')

autolabel(bars)
plt.show()

# Show the eigen vectors in order to see which properties are more important for the Ranking
properties = ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales', 'Global_Sales']

fig = plt.figure()
pc1 = eig_vectors[:,0]  
pc2 = eig_vectors[:,1]
pc3 = eig_vectors[:,3]
ax1 = fig.add_subplot(111)
ax1.set_title("Eigen Vectors 2D")
ax1.plot(pc1, pc2, "b+", color="blue", markeredgecolor="black", ms=8)
ax1.set_xlabel('Principal Component 1')
ax1.set_ylabel('Principal Component 2')
# Add the properties labels
for i, label in enumerate(properties):
    ax1.annotate(label, (pc1[i]+0.007,pc2[i]+0.002), size=9.5)


fig = plt.figure()
ax1 = fig.add_subplot(111, projection='3d')
ax1.set_title("Eigen Vectors 3D")
ax1.plot(pc1, pc2, pc3, "bo", color="blue", markeredgecolor="black", ms=8)
ax1.set_xlabel('PC 1')
ax1.set_ylabel('PC 2')
ax1.set_zlabel('PC 3')

# Plot the final data in two dimensions
fig = plt.figure()
ax1 = fig.add_subplot(211)
ax1.set_title("Final data 2D")
ax1.plot(x, y, "ro", color="blue", markeredgecolor='black', ms=4)

# Plot the final data in three dimensions
ax2 = fig.add_subplot(212, projection='3d')
ax2.set_title("Final data 3D")
ax2.plot(x, y, z, "ro", color="blue", markeredgecolor='black', ms=4)

plt.tight_layout()
fig = plt.gcf()
plt.show()

# Save the figure of the 2D Final data
p.plot(x, y, "ro", color="blue", markeredgecolor='black', ms=4)
p.title("Final PCA Data")
p.xlabel('First component')
p.ylabel('Second component')
p.savefig("pcaScatterPlot2D.png")




