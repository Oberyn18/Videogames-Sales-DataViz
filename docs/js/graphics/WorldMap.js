'use strict'

class WorldMap {

    constructor(element) { this.svg = element }

    render(data, countries, color, scale, transalation, groupedData, streamData) {
        this.svg.html('')

        let width = parseInt(this.svg.style('width'), 10)

        let legend = this.svg.append('g').attr('width', width).attr('height', '50px').attr("font-size", 10).attr("text-anchor", "end").selectAll("g").data(data.features.filter(d => d.id !== 'ATA').slice().reverse()).enter().append("g").attr("transform", (d, i) => `translate(0, ${i * 13})`)

        legend
            .append('rect')
            .attr('x', width - 19)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', d => color(d.column))

        legend
            .append('text')
            .attr('x', width - 24)
            .attr('y', 5.5)
            .attr('dy', '.32em')
            .attr('font-size', '14px')
            .text(d => d.properties.name)

        let g = this.svg.append('g').attr('class', 'map')

        transalation = transalation || [width / 2, 464]

        let projection = d3.geoMercator().scale(scale).translate(transalation)
        let path = d3.geoPath().projection(projection)

        g
            .append('g')
            .attr('class', 'countries')
            .selectAll('path')
            .data(data.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', d => `${d.id} country`)
            .style('fill', d => color(d.column))
            .on('click', d => {
                if (d.column) {
                    d3.selectAll(`.country:not(.${d.id})`).classed('not-clicked', true)
                    d3.selectAll('.clicked').classed('clicked', false)
                    d3.selectAll(`.${d.id}`).classed('clicked', true).classed('not-clicked', false)

                    groupedData['element'].render(groupedData['data'], groupedData['array'], [d.column])

                    let a = {}, i, j, cd = streamData['data'], column = 'Platform'

                    for (i = 0; i < cd.length; i++) {
                        if (cd[i]['Year'] <= streamData['minimum_time']) {

                            a[cd[i]['Year']] = a[cd[i]['Year']] || { 'Year': cd[i]['Year'] }
                            a[cd[i]['Year']][cd[i][column]] = +cd[i][d.column] + (a[cd[i]['Year']][cd[i][column]] || 0)
                        }
                    }

                    let b = [], c = {}

                    for (i in a) {
                        for (j in streamData['array']) a[i][streamData['array'][j]] = a[i][streamData['array'][j]] || 0

                        b.push(a[i])
                    }

                    for (i in streamData['array']) c[streamData['array'][i]] = streamData['array'][i]

                    streamData['element'].render(b.sort((m, n) => m['Year'] - n['Year']), streamData['array'], c, d3.scaleOrdinal(d3.schemeCategory20c))

                    d3.select('#stream-title').text(`Plataformas para as quais se venden videogames na região de ${d.properties.name}`)
                    d3.select('#grouped-title').text(`Gêneros de videogames vendidos em ${d.properties.name}`)
                }
            })

        this.svg
            .on('wheel.zoom', () => {
                d3.event.preventDefault()

                let dy = d3.event.deltaY / 5, scale = projection.scale(), a = d3.select('.clicked'), b = d3.selectAll('.not-clicked')

                if (scale - dy > 30 && scale - dy < 250) this.render(data, countries, color, scale - dy, transalation, groupedData, streamData)

                if (!a.empty()) d3.select(`.country.${a.datum()['id']}`).classed('click', true)

                if (!b.empty()) b.nodes().map(d => d.classList[0]).forEach(d => { d3.selectAll(`.country.${d}`).classed('not-clicked', true) })
            })
            .on('click', () => {
                if (!d3.select(d3.event.toElement).classed('country') || d3.event.srcElement.classList.contains('ATA')) {
                    d3.selectAll('.country').classed('clicked not-clicked', false)

                    groupedData['element'].render(groupedData['data'], groupedData['array'], countries)
                    streamData['element'].render(streamData['real_data'], countries, streamData['countries'], color)

                    d3.select('#stream-title').text('Evolução das vendas de videogames em cada região ao longo dos anos')
                    d3.select('#grouped-title').text('Gêneros de videogames vendidos em cada regiao')
                }
            })

            let px, py, currentTransalation

            d3.select('#world-map').call(d3.drag()
                .on('start', () => {
                    px = d3.event.x
                    py = d3.event.y
                    currentTransalation = projection.translate()
                })
                .on('drag', () => {
                    let dx = currentTransalation[0] + (d3.event.x - px), dy = currentTransalation[1] + (d3.event.y - py)

                    let a = d3.select('.clicked'), b = d3.selectAll('.not-clicked')

                    if (dy < 1000 && dy > 0 && dx > 0 && dx < 1000) this.render(data, countries, color, scale, [dx, dy], groupedData, streamData)

                    if (!a.empty()) d3.select(`.country.${a.datum()['id']}`).classed('click', true)

                    if (!b.empty()) b.nodes().map(d => d.classList[0]).forEach(d => { d3.selectAll(`.country.${d}`).classed('not-clicked', true) })
                })
                // .on('end', function() {
                //     console.log(d3.event, "end");
                // })
            )
    }
}
