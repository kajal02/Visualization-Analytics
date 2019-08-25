import json

from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
from sklearn import preprocessing
import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import MDS
import matplotlib
import math

app = Flask(__name__)
df = pd.read_csv('NBA_match.csv')
data = df.iloc[:, 2:20]
#Random sampling
randomSampledData = data.sample(500, replace="False")
min_max_scaler = preprocessing.MinMaxScaler()
scaledData = min_max_scaler.fit_transform(data.astype(float))
normalizedData = pd.DataFrame(scaledData)

msd = []
for k in range(2, 20):
    kmeans = KMeans(n_clusters=k)
    kmeans = kmeans.fit(normalizedData)
    msd.append(kmeans.inertia_)

optimal_K = 4;
kmeans = KMeans(n_clusters=optimal_K)
kmeansModel = kmeans.fit(normalizedData)
clusterLabels = kmeansModel.labels_
data['cluster_index'] = clusterLabels
reducedDataSize = 500
percentData = reducedDataSize/ len(data)

sampledData = pd.DataFrame()
for i in range(0, optimal_K):
    clusterData = data.loc[data['cluster_index'] == i]
    #randomly sample data from this
    reqDataSize = math.ceil(len(clusterData)*percentData)
    randomKMeansSample = clusterData.sample(reqDataSize, replace="False")
    sampledData = pd.concat([sampledData, randomKMeansSample])

sampledDataWithColumn = sampledData
sampledData = sampledData.drop(['cluster_index'], axis = 1)

@app.route("/", methods = ['POST', 'GET'])
def index():
    global df
    return render_template("index.html")

@app.route('/loadData', methods=['GET','POST'])
def loadData():
    if(request.form['plotData'] == "scree"):
         pca = PCA(n_components=5).fit(sampledData)
         pcaTransform = pca.transform(sampledData)
         # PCA scree plots
         pcaScreeColumns = [1,2,3,4,5]
         pcaVariance = pca.explained_variance_ratio_
         pcaVarianceList = list(zip(pcaScreeColumns, pcaVariance))

         # PCA on data before sampling
         pcaRandom = PCA(n_components=5).fit(randomSampledData)
         pcaTransformRandom = pcaRandom.transform(randomSampledData)
         # print(pcaTransformData)
         pcaScreeBeforeColumns = [1,2,3,4,5]
         pcaVarianceBefore = pcaRandom.explained_variance_ratio_
         pcaVarianceBeforeList = list(zip(pcaScreeBeforeColumns, pcaVarianceBefore))

         return json.dumps({'pca_scree': pcaVarianceList, 'pca_scree_before': pcaVarianceBeforeList})
    elif request.form['plotData'] == "scatter":
        pca = PCA(n_components=2).fit(sampledData)
        pcaTransform = pca.transform(sampledData)
        pcaTransformData = np.concatenate((pcaTransform,sampledDataWithColumn["cluster_index"][:,None]),axis=1)
        pcaTransformData = pd.DataFrame(pcaTransformData)
        pcaTransformData.columns = ['PC1','PC2', 'cluster_index']
        # print(pcaTransformData)
        pcaTransformJson = pcaTransformData.to_json(orient='records')

        # MDS scatter plot
        mds = MDS(n_components=2, dissimilarity="euclidean", random_state=1)
        modelFit = mds.fit_transform(sampledData)
        mdsTransformData = np.concatenate((modelFit,sampledDataWithColumn["cluster_index"][:,None]),axis=1)
        mdsTransformData = pd.DataFrame(mdsTransformData)
        mdsTransformData.columns = ['MDS1','MDS2','cluster_index']
        mdsTransformJson = mdsTransformData.to_json(orient='records')
        return json.dumps({'pca_transform': pcaTransformJson, 'mds_transform': mdsTransformJson})
    else:
      pcaMatrix = PCA(n_components=3).fit(sampledData)
      loadings = pcaMatrix.components_.T * np.sqrt(pcaMatrix.explained_variance_)
      loadings = np.square(pd.DataFrame(loadings))
      loadingsSum = pd.DataFrame(np.sum(loadings,axis=1))
      topThreePcaAttrs = loadingsSum.nlargest(3,0)
      columnNames = [list(data)[i] for i in topThreePcaAttrs.index.values]
      matrixData = sampledData.iloc[:, topThreePcaAttrs.index.values]
      matrixData.columns = columnNames
      matrixDataArray = matrixData.to_json(orient='records')
      clusterResult = sampledData.to_json(orient='records')
      return json.dumps({'matrix_result': matrixDataArray, 'matrix_columns': columnNames, 'matrix_clusters': clusterResult})

if __name__ == "__main__":
    app.run(debug=True)
