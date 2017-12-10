'use strict'

class MultiSeriesLineChart {

    constructor(element) { this.svg = element }

    render(data, array, countries_name, color) {
        let margin = { top: 20, right: 50, bottom: 30, left: 50 }
        let width = parseInt(this.svg.style('width'), 10) - margin.left - margin.right
        let height = parseInt(this.svg.style('height'), 10) - margin.top - margin.bottom

        let g = this.svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

        let line =  d3.line().curve(d3.curveBasis).x(d => x(d['Year'])).y(d => y(d['Sale']))
        let parseTime = d3.timeParse('%Y')

        let x = d3.scaleTime().range([0, width])
        let y = d3.scaleLinear().range([height, 0])

        let countries = array.map(c => {
            return {
                'name': countries_name[c],
                'id': c,
                'values': data.map(d => { return { 'Year': d['Year'], 'Sale': d[c] } })
            }
        })

        x.domain(d3.extent(data, d => d['Year']))
        y.domain([0, d3.max(countries, d => d3.max(d.values, v => v['Sale']))])

        g
            .append('g')
            .attr('class', 'x-axis axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(12))

        g
            .append('g')
            .attr('class', 'y-axis axis')
            .call(d3.axisLeft(y))
            .append('text')
            .attr('y', 6)
            .attr('x', 4)
            .attr('dy', '.71em')
            .attr('fill', 'black')
            .attr('font-size', '18px')
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text('Vendas')

        let serie = g.selectAll('.serie').data(countries).enter().append('g').attr('class', 'serie')

        serie
            .append('path')
            .attr('class', d =>  `${d['name']} country line`)
            .attr('d', d => line(d['values']))
            .style('stroke', d => color(d['id']))
    }

}
