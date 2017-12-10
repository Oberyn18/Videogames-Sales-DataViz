'use strict'

window.onload = () => {
    let map = new WorldMap(d3.select('#world-map svg'))
    let stream = new StreamGraph(d3.select('#stream-graph svg'))
    let grouped = new GroupedHorizontalBarChart(d3.select('#grouped-horizontal-bar-chart svg'))
    let serie = new MultiSeriesLineChart(d3.select('#serie-line-chart svg'))

    let countries_columns = ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales']
    let platforms_columns = []

    let colors = d3.scaleOrdinal().range(['#2ad73a', '#de074e', '#654fc1', '#ffd80a', '#e6e6e6']).domain(countries_columns)
    let parseTime = d3.timeParse('%Y')

    let countries = {}, platforms = {}, genres = []

    d3.json('assets/land.json', (jsonError, jsonData) => {
        if (jsonError) throw jsonError

        jsonData.features.forEach(value => { countries[value.column] = value.id })

        d3.csv('assets/data.csv',(data, _, columns) => {
            data['Year'] = parseTime(data['Year'])

            if (!genres.includes(data['Genre'])) genres.push(data['Genre'])
            if (!platforms_columns.includes(data['Platform'])) {
                platforms_columns.push(data['Platform'])
                platforms[data['Platform']] = data['Platform']
            }

            return data
        }, (csvError, csvData) => {
            if (csvError) throw csvError

            let c = getData(csvData), s = getSales(csvData)

            map.render(jsonData, countries_columns, colors, 120, null, { 'element': grouped, 'data': s, 'array': genres }, { 'element': stream, 'platforms': platforms, 'array': platforms_columns, 'data': csvData, 'minimum_time': parseTime(2018), 'real_data': c, 'countries': countries })
            stream.render(c, countries_columns, countries, colors)
            grouped.render(s, genres, countries_columns)
            serie.render(c, countries_columns, countries, colors)
        })
    })

    function getData(data) {
        let a = {}, i, j, minimum_time = parseTime(2018)

        for (i = 0; i < data.length; i++) {
            if (data[i]['Year'] <= minimum_time) {

                a[data[i]['Year']] = a[data[i]['Year']] || { 'Year': data[i]['Year'] }

                for (j in countries_columns) a[data[i]['Year']][countries_columns[j]] = +data[i][countries_columns[j]] + (a[data[i]['Year']][countries_columns[j]] || 0)
            }
        }

        let d = []

        for (i in a) d.push(a[i])

        return d.sort((a, b) => a['Year'] - b['Year'])
    }

    function getSales(data) {
        let a = {}, i, j

        for (i = 0; i < data.length; i++) {
            for (j in countries_columns) {
                a[countries_columns[j]] = a[countries_columns[j]] || { 'Country': countries_columns[j] }

                a[countries_columns[j]][data[i]['Genre']] = +data[i][countries_columns[j]] + (a[countries_columns[j]][data[i]['Genre']] || 0)
            }
        }

        let d = []

        for (i in a) d.push(a[i])

        return d
    }

    document.querySelectorAll('div > a').forEach(element => {

        element.addEventListener('click', function(event) {
            event.preventDefault()

            this.classList.add('view')

            document.getElementById(this.dataset.id).classList.add('view')
        })
    })

    document.querySelectorAll('.veil > a').forEach(element => {
        element.addEventListener('click', function(event) {
            event.preventDefault()

            document.getElementById(this.dataset.id).classList.remove('view')

            document.getElementById(this.dataset.aria).classList.remove('view')
        })
    })
}
