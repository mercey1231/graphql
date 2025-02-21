import React, { useEffect, useRef } from 'react';
import './graphs.css';
import * as d3 from 'd3';

const TICK = 80

const margin = { top: -10, right: 30, bottom: 30, left: -20 },
    width = 750 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

export interface DistributionProps {
    users: {
        username: string
        totalXp: number
    }[],
    title: string
}

function DistributionChart({ users, title }: DistributionProps) {
    if (users.length < 1) return null

    users.sort((a, b) => a.totalXp - b.totalXp)

    const svgElement = useRef(null)
    const tooltipElement = useRef(null)
    useEffect(() => {
        let { minAmount, maxAmount } = users.reduce(({ minAmount, maxAmount }, { totalXp }) => {
            if (totalXp < minAmount) minAmount = totalXp
            if (totalXp > maxAmount) maxAmount = totalXp
            return { minAmount, maxAmount }
        }, {
            minAmount: users[0].totalXp,
            maxAmount: users[0].totalXp
        })

        d3.select(svgElement.current).selectAll("*").remove()
        // create svg
        const svg = d3.select(svgElement.current)
            .attr('height', `100%`)
            .attr('width', '100%')
            .attr("viewBox", [margin.left, margin.top, width + margin.right, height + margin.bottom])
            .attr('preserveAspectRatio', 'none')

        // --------------------------------------------------
        // create tooltip
        const tooltip = d3.select(tooltipElement.current)
            .append("div")
            .style("opacity", 0)
            .attr("class", "graph__tooltip")
            .style("right", 0)
            .style('top', 0)

        // tooltip show and update event
        const showTooltip = (e: MouseEvent, d: d3.Bin<{
            username: string;
            totalXp: number;
        }, number>) => {
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 1)
            let text = ""

            for (const { username, totalXp } of d) {
                text += `${username}: ${totalXp}\n`
            }
            tooltip
                .html(text)
        }

        // tooltip hide event
        const hideTooltip = function () {
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 0)
        }

        // ----------------------------------------------

        // create group for two axes and text
        const axesAndTextGroup = svg
            .append('g')
            .attr('class', 'graph__axes')
            .attr('fill', 'currentColor')

        axesAndTextGroup.append("text")
            .attr('fill', 'currentColor')
            .attr("x", (width / 2))
            .attr("y", 16)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(`${title}`)

        // create x axis
        const scaleX = d3.scaleLinear()
            .domain([minAmount, maxAmount * 1.03])
            .range([0, width])

        axesAndTextGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(scaleX))

        // create histogram generator
        const histogram = d3.bin<{ username: string, totalXp: number }, number>()
            .value(({ totalXp }) => totalXp)
            .domain([minAmount, maxAmount])
            .thresholds(scaleX.ticks(TICK))

        // create bins
        const bins = histogram(users)

        // create y-axis
        const scaleY = d3.scaleLinear()
            .range([height, 24])

        let yMax = d3.max(bins, (d) => { return d.length; })
        if (!yMax) {
            return
        }

        scaleY.domain([0, yMax])

        axesAndTextGroup.append("g")
            .call(d3.axisLeft(scaleY))

        // creating cols
        svg.selectAll("rect")
            .data(bins)
            .join("rect")
            .attr("x", 1)
            .attr("transform", ({ x0, length }) => (!x0) ? '' : `translate(${scaleX(x0)}, ${scaleY(length)})`)
            .attr("width", ({ x0, x1 }) => (!x1 || !x0) ? 0 : scaleX(x1) - scaleX(x0) - 1)
            .attr("height", ({ length }) => height - scaleY(length))
            .style("fill", "#69b3a2")
            .on("mouseover", showTooltip)
            .on("mouseleave", hideTooltip)

    }, [users])

    return (
        <div ref={tooltipElement} className='graph'>
            <svg ref={svgElement} />
        </div>
    )
}

export default DistributionChart;
