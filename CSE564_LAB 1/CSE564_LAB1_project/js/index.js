var numberOfBins = 5 // default bin sise is set to 5
loadDataAndPlot("wins", "Wins by teams")

function loadDataAndPlot(val, textVal) {
   d3.selectAll("g > *").remove(); //clearing the svg before plotting new graph

   var svg = d3.select("svg"),
     margin = 200,
     width = svg.attr("width") - margin,
     height = svg.attr("height") - margin

  var xScale = d3.scaleBand().range([0, width]).padding(0.2);
  var yScale = d3.scaleLinear().range([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + 200 + "," + 100 + ")");

  d3.csv("data/NBA_match.csv", function(error, data) {
    if (error) {
      throw error;
    }

  //  var a = val
    var maxValue = d3.max(data, function(d) {
      return parseInt(d[val])
    })
    var minValue = d3.min(data, function(d) {
      return parseInt(d[val])
    })
   console.log("min max .. for " + val + " is " + minValue + "  " + maxValue)
    var binSize = Math.ceil((maxValue - minValue) / numberOfBins);
    //console.log("bin size calculated" + binSize)

    yBinArray = []
    for (i = 0; i < numberOfBins; i++) {
      yBinArray.push(0)
    }

    for (i = 0; i < data.length; i++) {
      var temp = Math.floor((data[i][val] - minValue) / binSize)
      if (temp == numberOfBins) {
        temp--; //to handle edge case when boundary value is present at the range end
      }
      yBinArray[temp]++
    }
    //console.log("data value" + yBinArray)

    xBinArray = []
    var rangeStart = minValue
    for (i = 0; i < numberOfBins; i++) {
      rangeEnd = parseInt(rangeStart) + binSize -1
      xBinArray.push("" + rangeStart + "-" + rangeEnd)
      rangeStart = rangeEnd + 1
    }
    //console.log("x array " + xBinArray)

    xScale.domain(xBinArray);
    yScale.domain([0, d3.max(yBinArray, function(d) {
      return d;
    })]);

    plot2DArray = []
    for (i = 0; i < numberOfBins; i++) {
      plot2DArray.push([])
      plot2DArray[i].push(xBinArray[i])
      plot2DArray[i].push(yBinArray[i])
    }

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("y", height - 300)
      .attr("x", width - 100)
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text(textVal);

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(function(d) {
          return d;
        })
        .ticks(5))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-5.1em")
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Count");

    var bars = g.selectAll(".bar")
      .data(plot2DArray)
      .enter().append("g")

    bars.append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return xScale(d[0]);
      })
      .attr("y", function(d) {
        return yScale(d[1]);
      })
      .attr("fill", "#AA3311")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .attr("width", xScale.bandwidth())
      .transition()
      .ease(d3.easeLinear)
      .duration(400)
      .delay(function (d, i) {
          return i * 50;
      })
      .attr("height", function(d) {
        return height - yScale(d[1]);
      })


    bars.append("text")
      .attr("x", function(d) {
        return xScale(d[0]) + 30;
      })
      .attr("y", function(d) {
        return yScale(d[1]) - 10;
      })
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", "black")
      .attr("opacity", '0')
      .attr("font-weight", 'bold')
      .attr("transform", function(d) {
        return "translate(20, -20)";
      })
      .text(function(d) {
        return d[1];
      });

    function handleMouseOver(d, i) {
      d3.select(this).attr("height", function(d) {
          return height - yScale(d[1]) + 8;
        })
        .attr("width", xScale.bandwidth() + 3)
        .attr("y", function(d) {
          return yScale(d[1]) - 8;
        })
        .attr("fill", "#800000");
      var txt = d3.select(this.nextSibling);
      txt.attr('opacity', '1');
    }

    function handleMouseOut(d, i) {
      d3.select(this).attr("height", function(d) {
          return height - yScale(d[1]);
        })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) {
          return yScale(d[1]);
        })
        .attr("fill", "#AA3311");
      var txt = d3.select(this.nextSibling);
      txt.attr('opacity', '0');
    }

    var state = "bar"
    svg.on("click", function() {
      if (state == "bar") {
        state = "pie";
        convertToPie();
      }
    });

    var slider = document.getElementById("binRange");
    slider.oninput = function() {
      console.log("bin number values is " + this.value)
      numberOfBins = this.value;
      console.log("slider " + state)
      loadDataAndPlot(val, textVal)
    }

    function convertToPie() {
      d3.selectAll("svg > *").remove();

      var  width = d3.select("svg").attr("width"),
        height = d3.select("svg").attr("height"),
      r = (Math.min(width, height)-100) / 2;
      var color = d3.scaleOrdinal(d3.schemeCategory10);

      var arc = d3.arc().innerRadius(0).outerRadius(r);
      var labelArc = d3.arc().outerRadius(r - 150).innerRadius(r - 80);

      var pie = d3.pie().
      value(function(d) {
        return d[1];
      })(plot2DArray);

      var svg = d3.select("svg").append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

      var g = svg.selectAll('arc')
       .data(pie)
        .enter()
        .append("g")
        .attr("class", "arc");

        g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data[0]); });

      g.append("text")
        .attr("transform", function(d) {
          return "translate(" + labelArc.centroid(d) + ")";
        })
        .text(function(d) {
          return d[0];
        })
        .style("fill", "#fff");

        g.append("text")
          .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
          .text(function(d) { return d.data[0];})
          .style("fill", "#fff");

      svg.on("click", function() {
        if (state == "pie") {
          console.log("in pie");
          loadDataAndPlot(val, textVal)
        }
      });
    }
  });

}
