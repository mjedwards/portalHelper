import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useActivityTracker } from "../../context/ActivityTrackerContext";
import { allAvailableWidgets } from "../../data/allAvailableWidgets";

const ActivityBarChart: React.FC = () => {
	const { activityCounts, goals, currentTimeFrame } = useActivityTracker();
	const svgRef = useRef<SVGSVGElement>(null);

	// Filter to only include activities with data
	const activitiesWithData = allAvailableWidgets.filter(
		(activity) => activityCounts[activity.id] !== undefined
	);

	// Prepare the data for D3
	const chartData = activitiesWithData.map((activity) => ({
		name: activity.name,
		count: activityCounts[activity.id] || 0,
		goal: (goals[activity.id] && goals[activity.id][currentTimeFrame]) || 0,
	}));

	useEffect(() => {
		if (!svgRef.current || chartData.length === 0) return;

		// Clear previous chart
		d3.select(svgRef.current).selectAll("*").remove();

		// Set up dimensions
		const margin = { top: 40, right: 30, bottom: 60, left: 60 };
		const width = svgRef.current.clientWidth - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		// Create SVG
		const svg = d3
			.select(svgRef.current)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// Add title
		svg
			.append("text")
			.attr("x", width / 2)
			.attr("y", -20)
			.attr("text-anchor", "middle")
			.attr("font-size", "16px")
			.attr("font-weight", "bold")
			.text(
				`Activity Metrics (${
					currentTimeFrame.charAt(0).toUpperCase() + currentTimeFrame.slice(1)
				})`
			);

		// Create scales
		const x = d3
			.scaleBand()
			.domain(chartData.map((d) => d.name))
			.range([0, width])
			.padding(0.3);

		const maxValue = d3.max(chartData, (d) => Math.max(d.count, d.goal)) || 0;
		const y = d3
			.scaleLinear()
			.domain([0, maxValue * 1.1]) // Add 10% padding to top
			.range([height, 0]);

		// Create axes
		const xAxis = d3.axisBottom(x);
		const yAxis = d3.axisLeft(y);

		// Add X axis
		svg
			.append("g")
			.attr("transform", `translate(0,${height})`)
			.call(xAxis)
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end")
			.attr("font-size", "12px");

		// Add Y axis
		svg.append("g").call(yAxis).selectAll("text").attr("font-size", "12px");

		// Create grouped bar chart
		const subgroups = ["count", "goal"];
		const subgroupColors = ["#3b82f6", "#e5e7eb"]; // blue-500 and gray-200

		// Add X axis label
		svg
			.append("text")
			.attr("x", width / 2)
			.attr("y", height + margin.bottom - 10)
			.attr("text-anchor", "middle")
			.text("Activities");

		// Add Y axis label
		svg
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -margin.left + 15)
			.attr("x", -height / 2)
			.attr("text-anchor", "middle")
			.text("Count");

		// Create bars
		subgroups.forEach((subgroup, i) => {
			svg
				.selectAll(`.bar-${subgroup}`)
				.data(chartData)
				.join("rect")
				.attr("class", `bar-${subgroup}`)
				.attr("x", (d) => {
					const subX = x(d.name)!;
					return subX + (i * x.bandwidth()) / 2;
				})
				.attr("y", (d) => y(d[subgroup as keyof typeof d] as number))
				.attr("width", x.bandwidth() / 2)
				.attr(
					"height",
					(d) => height - y(d[subgroup as keyof typeof d] as number)
				)
				.attr("fill", subgroupColors[i])
				.attr("rx", 4) // Rounded corners
				.attr("ry", 4);
		});

		// Add legend
		const legend = svg
			.append("g")
			.attr("transform", `translate(${width - 100}, 0)`);

		// Current count
		legend
			.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 15)
			.attr("height", 15)
			.attr("fill", subgroupColors[0]);

		legend
			.append("text")
			.attr("x", 20)
			.attr("y", 12.5)
			.text("Current Count")
			.attr("font-size", "12px");

		// Goal
		legend
			.append("rect")
			.attr("x", 0)
			.attr("y", 25)
			.attr("width", 15)
			.attr("height", 15)
			.attr("fill", subgroupColors[1]);

		legend
			.append("text")
			.attr("x", 20)
			.attr("y", 37.5)
			.text("Goal")
			.attr("font-size", "12px");

		// Add tooltips
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		chartData.forEach((d, i) => {
			subgroups.forEach((subgroup, j) => {
				const value = d[subgroup as keyof typeof d] as number;
				const barX = x(d.name)! + (j * x.bandwidth()) / 2;
				const barY = y(value);

				svg
					.append("text")
					.attr("x", barX + x.bandwidth() / 4)
					.attr("y", barY - 5)
					.attr("text-anchor", "middle")
					.attr("font-size", "10px")
					.text(value);
			});
		});
	}, [chartData, currentTimeFrame]);

	return (
		<div className='w-full h-[400px] overflow-x-auto'>
			<svg ref={svgRef} className='w-full h-full' />
		</div>
	);
};

export default ActivityBarChart;
