// Charger les données
Promise.all([
    d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'),
    d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
]).then(([educationData, countiesData]) => {
    
    // Créer la projection et le chemin pour dessiner la carte
    const projection = d3.geoAlbersUsa();
    const path = d3.geoPath().projection(projection);
    
    // Créer l'échelle de couleurs
    const colorScale = d3.scaleQuantize()
        .domain([0, 100]) // Intervalle des données d'éducation
        .range(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"]);
    
    // Créer l'élément SVG pour dessiner la carte
    const svg = d3.select('#choropleth')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    // Créer les comtés
    svg.append('g')
        .selectAll('path')
        .data(topojson.feature(countiesData, countiesData.objects.counties).features)
        .enter().append('path')
        .attr('class', 'county')
        .attr('d', path)
        .attr('fill', d => {
            // Trouver les données d'éducation pour chaque comté
            const countyData = educationData.find(c => c.fips === d.id);
            return countyData ? colorScale(countyData.bachelorsOrHigher) : "#ccc";
        })
        .attr('data-fips', d => d.id)
        .attr('data-education', d => {
            const countyData = educationData.find(c => c.fips === d.id);
            return countyData ? countyData.bachelorsOrHigher : 0;
        })
        .on('mouseover', function(event, d) {
            const countyData = educationData.find(c => c.fips === d.id);
            const tooltip = d3.select('#tooltip');
            tooltip.transition().duration(200).style('visibility', 'visible');
            tooltip.html(`${countyData ? countyData.area_name : 'Inconnu'}, ${countyData ? countyData.state : 'Inconnu'}<br>${countyData ? countyData.bachelorsOrHigher : 'Données manquantes'}% ayant un diplôme universitaire`)
                .attr('data-education', countyData ? countyData.bachelorsOrHigher : 0)
                .style('top', `${event.pageY + 5}px`)
                .style('left', `${event.pageX + 5}px`);
        })
        .on('mouseout', function() {
            d3.select('#tooltip').transition().duration(200).style('visibility', 'hidden');
        });

    // Ajouter la légende
    const legend = d3.select('#legend')
        .append('svg')
        .attr('width', '300px')
        .attr('height', '50px');

    const legendScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, 300]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d => `${d}%`);

    legend.append('g')
        .selectAll('rect')
        .data(colorScale.range())
        .enter().append('rect')
        .attr('x', (d, i) => i * 60)
        .attr('y', 10)
        .attr('width', 60)
        .attr('height', 20)
        .style('fill', d => d);

    legend.append('g')
        .attr('transform', 'translate(0, 30)')
        .call(legendAxis);
});
