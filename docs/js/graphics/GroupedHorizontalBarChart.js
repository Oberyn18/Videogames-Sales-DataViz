'use strict'

class GroupedHorizontalBarChart {

    constructor(element) { this.svg = element }

    render(data, array, columns) {
        this.svg.html('')

        let margin = { top: 20, right: 20, bottom: 30, left: 40 }
        let width = parseInt(this.svg.style('width'), 10) - margin.left - margin.right
        let height = parseInt(this.svg.style('height'), 10) - margin.top - margin.bottom

        let g = this.svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

        let x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1)
        let x1 = d3.scaleBand().padding(0.05)
        let y = d3.scaleLinear().rangeRound([height, 0])
        let z = d3.scaleOrdinal().range(['#81D8C7', '#F4FFAA', '#C3AEDB', '#FF766A', '#84A7D5', '#FBBD53', '#9AF45C', '#FFC1E5', '#D8D8D8', '#C661BE', '#C1F5C2', '#F2FF5C'])

        let genres = []

        x0.domain(columns)
        x1.domain(array).rangeRound([0, x0.bandwidth()])
        y.domain([0, Math.ceil(d3.max(data, d => d3.max(array, g => d[g])))])

        if (columns.length !== 4) {
            for (let i in data)
                if (columns.includes(data[i]['Country'])) genres.push(data[i])
        } else genres = data

        y.domain([0, d3.max(genres, d => d3.max(array, c => d[c]))])

        g
            .append('g')
            .selectAll('g')
            .data(genres)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${x0(d['Country'])}, 0)`)
            .selectAll('rect')
            .data(d => array.map(g => { return { 'key': g, 'value': d[g], 'country': d['Country'] } }))
            .enter()
            .append('rect')
            .attr('class', 'genre')
            .attr('x', d => x1(d['key']))
            .attr('y', d => y(d['value']))
            .attr('width', x1.bandwidth())
            .attr('height', d => height - y(d['value']))
            .attr('fill', d => z(d['key']))
            .on('mouseover', (d) => {
                tooltip.style('top', `${y(d['value']) + 30}px`).style('left', `${margin.left + x0(d['country']) + x1(d['key']) - 25 + x1.bandwidth() / 2}px`).style('display', 'block').text(d['value'].toFixed(2))
            })
            .on('mouseout', () => { tooltip.style('display', 'none') })

        g
            .append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x0))

        g
            .append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y).ticks(null, 's'))
            .append('text')
            .attr('x', 2)
            .attr('y', y(y.ticks().pop()) + 0.5)
            .attr('dy', '.32em')
            .attr('fill', 'black')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'start')
            .attr('font-size', '18px')
            .text('Vendas')

        let tooltip = d3.select('#grouped-horizontal-bar-chart').append('div').style('position', 'absolute').style('width', '50px').style('height', '22px').style('border-radius', '5px').style('background', 'rgb(17, 103, 164)').style('display', 'none').style('text-align', 'center').style('padding', '4px 0').style('font-size', '14px').style('color', 'white')

        let legend = g.append('g').attr("font-size", 10).attr("text-anchor", "end").selectAll("g").data(array.slice().reverse()).enter().append("g").attr("transform", (d, i) => `translate(-${+(i / 12).toFixed(0) * 100}, ${(i % 6) * 13})`)

        legend
            .append('rect')
            .attr('x', width - 19)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', z)

        legend
            .append('text')
            .attr('x', width - 24)
            .attr('y', 5.5)
            .attr('dy', '.32em')
            .attr('font-size', '14px')
            .text(d => d)
    }

}
