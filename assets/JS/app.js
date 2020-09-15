// Automatically resizes the chart
function makeResponsive() {

    // clearing the SVG area and inputting chart
    var svgArea = d3.select("#scatter").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;


    var margin = {
        top: 20,
        right: 20,
        bottom: 80,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale var upon click on axis label
    function xScale(censusData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
                d3.max(censusData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    function yScale(censusData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(censusData, d => d[chosenYAxis])])
            .range([height, 0]);

        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))

        return circlesGroup;
    }

    function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    }

    // new functions for rendering text
    function renderXText(textGroup, newXScale, chosenXAxis) {

        textGroup.transition()
            .duration(2000)
            .attr("dx", d => newXScale(d[chosenXAxis]))

        return textGroup;
    }

    function renderYText(textGroup, newYScale, chosenYAxis) {

        textGroup.transition()
            .duration(2000)
            .attr("dy", d => newYScale(d[chosenYAxis]));

        return textGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTipForCircles(chosenXAxis, chosenYAxis, circlesGroup) {

        var xlabel;
        if (chosenXAxis === "poverty") {
            xlabel = "In Poverty %";
        } else if (chosenXAxis === "age") {
            xlabel = "Age (Median)";
        } else {
            xlabel = "Household Income (Median)";
        }

        var ylabel;
        if (chosenYAxis === "healthcare") {
            ylabel = "Lacks Healthcare %";
        } else if (chosenYAxis === "obesity") {
            ylabel = "Obesity %";
        } else {
            ylabel = "Smokes %";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            // .offset([80, -60])
            .html(function(d) {
                return (`<strong>${d.state}</strong><hr> ${xlabel}: ${d[chosenXAxis]} & ${ylabel}: ${d[chosenYAxis]}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
                toolTip.show(data, this);
                toolTip.style("top", (d3.mouse(this)[1]) + 170 + "px")
                    .style("left", (d3.mouse(this)[0]) + 170 + "px")

                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("fill", "pink")
                    .attr("r", "35");
            })
            // onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);

                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("fill", "#89bdd3")
                    .attr("r", "20");
            });

        return circlesGroup;
    }

    // function used for updating text group with new tooltip
    function updateToolTipForText(chosenXAxis, chosenYAxis, textGroup) {

        var xlabel;
        if (chosenXAxis === "poverty") {
            xlabel = "In Poverty %";
        } else if (chosenXAxis === "age") {
            xlabel = "Age (Median)";
        } else {
            xlabel = "Household Income (Median)";
        }

        var ylabel;
        if (chosenYAxis === "healthcare") {
            ylabel = "Lacks Healthcare %";
        } else if (chosenYAxis === "obesity") {
            ylabel = "Obesity %";
        } else {
            ylabel = "Smokes %";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            // .offset([80, -60])
            .html(function(d) {
                return (`<strong>${d.state}</strong><hr> ${xlabel}: ${d[chosenXAxis]} & ${ylabel}: ${d[chosenYAxis]}`);
            });

        textGroup.call(toolTip);

        textGroup.on("mouseover", function(data) {
                toolTip.show(data, this);
                toolTip.style("top", (d3.mouse(this)[1]) + 170 + "px")
                    .style("left", (d3.mouse(this)[0]) + 170 + "px")

                d3.select(this)
                    .attr("cursor", "default");

                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("fill", "black")
                    .attr("font-size", "24px");
            })
            // onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);

                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("fill", "#fff")
                    .attr("font-size", "12px");
            });

        return textGroup;
    }

    // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data.csv").then(function(censusData, err) {
        if (err) throw err;

        // parse data
        censusData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // xLinearScale function above csv import
        var xLinearScale = xScale(censusData, chosenXAxis);

        // Create y scale function
        var yLinearScale = yScale(censusData, chosenYAxis);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        var overallPoints = chartGroup.selectAll("circle")
            .data(censusData)
            .enter();

        var circlesGroup = overallPoints
            .append("circle")
            .attr("r", "20")
            // .attr("class", "stateCircle");
            .attr("fill", "#89bdd3")
            .attr("stroke-width", "2")
            .attr("stroke", "#e3e3e3")
            .attr("opacity", ".5");

        //fly in
        circlesGroup
            .transition()
            .duration(0)
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]));

        // now draw text in each of our point containers
        var textGroup = overallPoints
            .append("text")
            // We return the abbreviation to .text, which makes the text the abbreviation.
            .text(function(d) {
                return d.abbr;
            })
            // Now place the text using our scale.
            .attr("dx", function(d) {
                return xLinearScale(d[chosenXAxis]);
            })
            .attr("dy", function(d) {
                return yLinearScale(d[chosenYAxis])
            })
            .attr("font-size", "12px")
            .attr("fill", "#fff")
            .attr("class", "stateText");

        // Create group for two x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .attr("class", "aText")
            .classed("active", true)
            .text("In Poverty %");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .attr("class", "aText")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .attr("class", "aText")
            .classed("inactive", true)
            .text("Household Income (Median)");

        // append y axis
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "healthcare") // value to grab for event listener
            .attr("class", "aText")
            .classed("active", true)
            .text("Lacks Healthcare %");

        var obesityLabel = ylabelsGroup.append("text")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "obesity") // value to grab for event listener
            .attr("class", "aText")
            .classed("inactive", true)
            .text("Obesity %");

        var smokesLabel = ylabelsGroup.append("text")
            .attr("y", 60 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "smokes") // value to grab for event listener
            .attr("class", "aText")
            .classed("inactive", true)
            .text("Smokes %");

        // updateToolTip function above csv import
        circlesGroup = updateToolTipForCircles(chosenXAxis, chosenYAxis, circlesGroup);
        textGroup = updateToolTipForText(chosenXAxis, chosenYAxis, textGroup);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // console.log(chosenXAxis)

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(censusData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxis(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

                    //update circle text
                    textGroup = renderXText(textGroup, xLinearScale, chosenXAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTipForCircles(chosenXAxis, chosenYAxis, circlesGroup);
                    textGroup = updateToolTipForText(chosenXAxis, chosenYAxis, textGroup);

                    // changes classes to change bold text
                    if (chosenXAxis === "age") {
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenXAxis === "poverty") {
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // replaces chosenXAxis with value
                    chosenYAxis = value;

                    // console.log(chosenXAxis)

                    // functions here found above csv import
                    // updates x scale for new data
                    yLinearScale = yScale(censusData, chosenYAxis);

                    // updates x axis with transition
                    yAxis = renderYAxis(yLinearScale, yAxis);

                    // updates circles with new x values
                    circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

                    //update circle text
                    textGroup = renderYText(textGroup, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTipForCircles(chosenXAxis, chosenYAxis, circlesGroup);
                    textGroup = updateToolTipForText(chosenXAxis, chosenYAxis, textGroup);

                    // changes classes to change bold text
                    if (chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenYAxis === "obesity") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    }).catch(function(error) {
        console.log(error);
    });
}


// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
