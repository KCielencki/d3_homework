// Automatically resize the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads, remove it and replace it
    var svgArea = d3.select(".scatter").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and height of the browser
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 20,
        right: 40,
        bottom: 60,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold the chart.
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Import Data
    d3.csv("assets/data.csv").then(function(censusData) {

        // Parse Data/Cast as numbers
        censusData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        console.log(censusData);

        // Create scale functions
        var xLinearScale = d3.scaleLinear()
            .domain(d3.extent(censusData, d => d.poverty))
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(censusData, d => d.healthcare)])
            .range([height, 0]);

        // Create axis functions
        var xAxis = d3.axisBottom(xLinearScale);
        var yAxis = d3.axisLeft(yLinearScale);

        // Step 4: Append Axes to the chart
        // ==============================
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        chartGroup.append("g")
            .call(yAxis);

        // Step 5: Create Circles
        // ==============================
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "15")
            .attr("fill", "purple")
            .attr("stroke-width", "2")
            .attr("stroke", "black")
            .attr("opacity", ".5");

        // Step 6: Initialize tool tip
        // ==============================
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            // .offset([80, -60])
            .html(function(d) {
                return (`<strong>${d.state}<strong><hr>Poverty: ${d.poverty} & Healthcare: ${d.healthcare}`);
            });

        // Step 7: Create tooltip in the chart
        // ==============================
        chartGroup.call(toolTip);

        // Step 8: Create event listeners to display and hide the tooltip
        // ==============================
        circlesGroup.on("mouseover", function(d) {
            toolTip.show(d, this);
            toolTip.style("top", (d3.mouse(this)[1]) + 70 + "px")
                .style("left", (d3.mouse(this)[0]) + 70 + "px")

            // tooltip.style("left", d3.event.pageX + "px");
            // tooltip.style("top", d3.event.pageY + "px");

            d3.select(this)
                .transition()
                .duration(1000)
                .attr("fill", "pink")
                .attr("r", "35");
        }).on("mouseout", function(d) {
            toolTip.hide(d);

            d3.select(this)
                .transition()
                .duration(1000)
                .attr("fill", "purple")
                .attr("r", "15");
        });

        // Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("Poverty");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("class", "axisText")
            .text("Access To Healthcare");
    }).catch(function(error) {
        console.log(error);
    });
}


// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);