updateGraph("scree")

function updateGraph(plotDataString) {
  console.log("plotDataString")
  $.ajax({
    url: '/loadData',
    type: 'POST',
    data: {
      "plotData": plotDataString
    },
    dataType: 'json',
    success: function(response) {
      // console.log(response)
      $("#svgDivRight").html("");
      $("#svgDivLeft").html("");
      var margin = {
          top: 30,
          right: 20,
          bottom: 30,
          left: 50
        },
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      // plot pca scree
      if (plotDataString == "scree") {
        var pcaScree = response.pca_scree
        console.log(pcaScree)


        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom()
          .ticks(5)
          .tickFormat(function(d) {
            return "PC" + d
          })
          .scale(x);

        var yAxis = d3.axisLeft()
          .scale(y);

        var valueline = d3.line()
          .x(function(d) {
            return x(d[0]);
          })
          .y(function(d) {
            return y(d[1]);
          });
        var valueline2 = d3.line()
          .x(function(d) {
            return x(d[0]);
          })
          .y(function(d) {
            return y(d[1]);
          });

        var svg = d3.select("#svgDivLeft")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
          .attr("x", (width / 2))
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("text-decoration", "underline")
          .text("PCA Scree Plot after Stratified Sampling");

        x.domain(d3.extent(pcaScree, function(d) {
          return d[0];
        }));
        y.domain([0, d3.max(pcaScree, function(d) {
          return d[1];
        })]);

        svg.append("path")
          .attr("class", "line")
          .attr("d", valueline(pcaScree));

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        var pcaScreeBefore = response.pca_scree_before
        console.log("pca scree before sampling: " + pcaScreeBefore)

        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);
        var xAxis = d3.axisBottom()
          .ticks(5)
          .tickFormat(function(d) {
            return "PC" + d
          })
          .scale(x);

        var yAxis = d3.axisLeft()
          .scale(y);

        var valueline = d3.line()
          .x(function(d) {
            return x(d[0]);
          })
          .y(function(d) {
            return y(d[1]);
          });
        var valueline2 = d3.line()
          .x(function(d) {
            return x(d[0]);
          })
          .y(function(d) {
            return y(d[1]);
          });

        var svg = d3.select("#svgDivRight")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
          .attr("x", (width / 2))
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("text-decoration", "underline")
          .text("PCA Scree Plot before Stratified Sampling");

        x.domain(d3.extent(pcaScreeBefore, function(d) {
          return d[0];
        }));
        y.domain([0, d3.max(pcaScreeBefore, function(d) {
          return d[1];
        })]);

        svg.append("path")
          .attr("class", "line")
          .attr("d", valueline(pcaScreeBefore));

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
      } //end of scree
      else if (plotDataString == "scatter") {
        var pcaJson = JSON.parse(response.pca_transform)
        console.log(pcaJson);

        var svg = d3.select("#svgDivLeft")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
          .attr("x", (width / 2))
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("text-decoration", "underline")
          .text("PCA Scatterplot");

        var minmax = {
          PC1: {
            min: 0,
            max: 0
          },
          PC2: {
            min: 0,
            max: 0
          }
        }
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        pcaJson.forEach(function(d) {
          minmax.PC1.min = Math.min(d.PC1, minmax.PC1.min);
          minmax.PC1.max = Math.max(d.PC1, minmax.PC1.max);
          minmax.PC2.min = Math.min(d.PC2, minmax.PC2.min);
          minmax.PC2.max = Math.max(d.PC2, minmax.PC2.max);
        });
        console.log(minmax);

        var x = d3.scaleLinear()
          .range([0, width])
          .domain([Math.floor(minmax.PC1.min), Math.ceil(minmax.PC1.max)]);

        var y = d3.scaleLinear()
          .range([height, 0])
          .domain([Math.floor(minmax.PC2.min), Math.ceil(minmax.PC2.max)]);


        var xAxis = d3.axisBottom()
          .scale(x);


        var yAxis = d3.axisLeft()
          .scale(y);

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + y(0) + ")")
          .call(xAxis)
          .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Coord. 1");

        svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + x(0) + ",0)")
          .call(yAxis)
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Coord. 2");

        svg.selectAll(".circle")
          .data(pcaJson)
          .enter().append("circle")
          .attr("class", "circle")
          .attr("r", 2.5)
          .attr("cx", function(d) {
            return x(d.PC1);
          })
          .attr("cy", function(d) {
            return y(d.PC2);
          })
          .style("stroke", function(d) {
            return color(d.cluster_index);
          })
          .style("fill", function(d) {
            return color(d.cluster_index);
          }); // end of PCA


        var mdsJson = JSON.parse(response.mds_transform)
        console.log(mdsJson)
        var svg = d3.select("#svgDivRight")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
          .attr("x", (width / 2))
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("text-decoration", "underline")
          .text("MDS Scatterplot");

        var minmax = {
          MDS1: {
            min: 0,
            max: 0
          },
          MDS2: {
            min: 0,
            max: 0
          }
        }
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        mdsJson.forEach(function(d) {
          minmax.MDS1.min = Math.min(d.MDS1, minmax.MDS1.min);
          minmax.MDS1.max = Math.max(d.MDS1, minmax.MDS1.max);
          minmax.MDS2.min = Math.min(d.MDS2, minmax.MDS2.min);
          minmax.MDS2.max = Math.max(d.MDS2, minmax.MDS2.max);
        });
        console.log(minmax);

        var x = d3.scaleLinear()
          .range([0, width])
          .domain([Math.floor(minmax.MDS1.min), Math.ceil(minmax.MDS1.max)]);

        var y = d3.scaleLinear()
          .range([height, 0])
          .domain([Math.floor(minmax.MDS2.min), Math.ceil(minmax.MDS2.max)]);

        var xAxis = d3.axisBottom()
          .scale(x);

        var yAxis = d3.axisLeft()
          .scale(y);

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + y(0) + ")")
          .call(xAxis)
          .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Coord. 1");

        svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + x(0) + ",0)")
          .call(yAxis)
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Coord. 2");

        svg.selectAll(".circle")
          .data(mdsJson)
          .enter().append("circle")
          .attr("class", "circle")
          .attr("r", 2.5)
          .attr("cx", function(d) {
            return x(d.MDS1);
          })
          .attr("cy", function(d) {
            return y(d.MDS2);
          })
          .style("stroke", function(d) {
            return color(d.cluster_index);
          })
          .style("fill", function(d) {
            return color(d.cluster_index);
          });
      } //end of scatter
      else if (plotDataString == "scatterMatrix") {
        console.log("scatter matrix")

        var size = 270,
          padding = 20;
        var matrixResult = jQuery.parseJSON(response.matrix_result);
        var position = {};
        response.matrix_columns.forEach(function(columnName) {
          function value(d) {
            return d[columnName];
          }
          position[columnName] = d3.scaleLinear()
            .domain([d3.min(matrixResult, value), d3.max(matrixResult, value)])
            .range([padding / 2, size - padding / 2]);
        });

        var x = d3.scaleLinear()
          .range([padding / 2, size - padding / 2]);

        var y = d3.scaleLinear()
          .range([size - padding / 2, padding / 2]);

        var xAxis = d3.axisBottom()
          .scale(x)
          .ticks(6);

        var yAxis = d3.axisLeft()
          .scale(y)
          .ticks(6);

        var svg = d3.select("#svgDivLeft")
          .append("svg:svg")
          .attr("width", size * response.matrix_columns.length)
          .attr("height", size * response.matrix_columns.length)
          .attr("transform", "translate(250,20)");

        var matrixBlock = svg.selectAll("g")
          .data(response.matrix_columns)
          .enter().append("svg:g")
          .attr("transform", function(d, i) {
            return "translate(" + i * size + ",0)";
          });

        var row = matrixBlock.selectAll("g")
          .data(cross(response.matrix_columns))
          .enter().append("svg:g")
          .attr("transform", function(d, i) {
            return "translate(0," + i * size + ")";
          });

        row.selectAll("line.x")
          .data(function(d) {
            return position[d.x].ticks(5).map(position[d.x]);
          })
          .enter().append("svg:line")
          .attr("class", "x")
          .attr("x1", function(d) {
            return d;
          })
          .attr("x2", function(d) {
            return d;
          })
          .attr("y1", padding / 2)
          .attr("y2", size - padding / 2);

        row.selectAll("line.y")
          .data(function(d) {
            return position[d.y].ticks(5).map(position[d.y]);
          })
          .enter().append("svg:line")
          .attr("class", "y")
          .attr("x1", padding / 2)
          .attr("x2", size - padding / 2)
          .attr("y1", function(d) {
            return d;
          })
          .attr("y2", function(d) {
            return d;
          });

        row.append("svg:rect")
          .attr("x", padding / 2)
          .attr("y", padding / 2)
          .attr("width", size - padding)
          .attr("height", size - padding)
          .style("fill", "none")
          .style("stroke", "#aaa")
          .style("stroke-width", 1.5)
          .attr("pointer-events", "all");

        row.filter(function(d) {
            return d.i === d.j;
          }).append("text")
          .attr("x", padding)
          .attr("y", padding)
          .attr("dy", ".71em")
          .text(function(d) {
            return d.x;
          });

        var circle = row.selectAll("circle")
          .data(cross(matrixResult))
          .enter().append("svg:circle")
          .attr("cx", function(d) {
            return position[d.x.x](d.y[d.x.x]);
          })
          .attr("cy", function(d) {
            return size - position[d.x.y](d.y[d.x.y]);
          })
          .attr("r", 3)
          .data(response.matrix_clusters)
          .style("fill", "#900C3F")
          .attr("pointer-events", "none");

        function cross(a) {
          return function(d) {
            var c = [];
            for (var i = 0, n = a.length; i < n; i++) c.push({
              x: d,
              y: a[i]
            });
            return c;
          };
        }
      } // end of scatterplot matrix
    }, //end of success
    error: function(error) {
      console.log("Error occured while loading data");
    } // end of error
  });
}
$(document).ready(function() {
  // end of ajax call
}); // end of jquery doc ready
