'use strict'

class StreamGraph {

    constructor(element) { this.svg = element }

    render(data, array, countries, color) {
        this.svg.html('')

        let margin = { top: 20, right: 50, bottom: 30, left: 50 }
        let width = parseInt(this.svg.style('width'), 10) - margin.left - margin.right
        let height = parseInt(this.svg.style('height'), 10) - margin.top - margin.bottom

        let g = this.svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`).attr('width', width).attr('height', height)

        let stack = d3.stack().keys(array).order(d3.stackOrderNone).offset(d3.stackOffsetWiggle)

        let layers = stack(data)

        let x = d3.scaleTime().range([0 , width]).domain(d3.extent(data, d => d['Year']))
        let y = d3.scaleLinear().range([height, 0]).domain([d3.min(layers, d => d3.min(d, s => Math.min(s[0], s[1]))), d3.max(layers, d => d3.max(d, s => Math.max(s[0], s[1])))])

        let area = d3.area().x((d, i) => x(d['data']['Year'])).y0(d => y(d[0]) - 0.2).y1(d => y(d[1]) - 0.2).curve(d3.curveBasis)

        g
            .append('g')
            .selectAll('path')
            .data(layers)
            .enter()
            .append('path')
            .attr('d', area)
            .attr('id', d => `layer-${d.index}`)
            .attr('class', d => 'layer')
            .style('fill', d => color(d.index))
            .on('mousemove', function(d) {
                vertical.style('display', 'block')
                stream_values.style('display', 'block')

                let mouse = d3.mouse(this)

                let year = x.invert(mouse[0]).getFullYear()

                let value

                for (let j = 0; j < data.length; j++){
                    if (data[j]['Year'].getFullYear() == year) {
                        stream_values.text(`${countries[d.key]}: ${data[j][d.key].toFixed(4)}`)
                        break
                    }
                }
            })
            .on('mouseover', (d) => {
                d3.selectAll(`.layer:not(#layer-${d.index})`).classed('not-moused', true)
                d3.select(`.layer#layer-${d.index}`).classed('moused', true).classed('not-moused', false)
            })
            .on('mouseout', (d) => {
                vertical.style('display', 'none')
                stream_values.style('display', 'none')
                d3.select(`.layer#layer-${d.index}`).classed('moused', false)
                d3.selectAll('.layer.not-moused').classed('not-moused', false)
            })

        g
            .append('g')
            .attr('class', 'x-axis axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(12))

        let vertical = d3.select('#stream-graph').append('div').style('position', 'absolute').style('z-index', '50').style('width', '1px').style('height', `${height - 5}px`).style('top', `${margin.top + 40}px`).style('left', '0px').style('background', 'rgb(90, 86, 91)').style('display', 'none')

        let stream_values = d3.select('#stream-graph').append('div').style('position', 'absolute').style('width', '200px').style('height', '100px').style('font-size', '14px').style('color', 'black').style('top', `${margin.top + 27}px`).style('left', `${margin.left}px`).style('font-weight', 'bold').style('z-index', '100')

        d3.select('#stream-graph')
            .on('mousemove', function() {
                let mouse = d3.mouse(this)
                vertical.style('left', `${mouse[0] + 5}px`)
            })
            .on('mouseover', function() {
                let mouse = d3.mouse(this)
                vertical.style('left', `${mouse[0] + 5}px`)
            })

        // g
        //     .append('g')
        //     .attr('class', 'y-axis axis')
        //     .call(d3.axisLeft(y))
        //     .append('text')
        //     .attr('y', 6)
        //     .attr('x', 4)
        //     .attr('dy', '.71em')
        //     .attr('fill', 'black')
        //     .attr('font-size', '18px')
        //     .attr('text-anchor', 'start')
        //     .attr('font-weight', 'bold')
        //
        // g
        //     .append('g')
        //     .attr('class', 'y-axis axis')
        //     .attr('transform', `translate(${width}, 0)`)
        //     .call(d3.axisRight(y))
        //     .append('text')
        //     .attr('y', 6)
        //     .attr('x', 4)
        //     .attr('dy', '.71em')
        //     .attr('fill', 'black')
        //     .attr('font-size', '18px')
        //     .attr('text-anchor', 'start')
        //     .attr('font-weight', 'bold')
    }

}
