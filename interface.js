let width = 1280,
    height = 700;



let date = '20201009';
document.querySelector("#today").value = date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8)

function changeDate(element) {
    let dateString = element.target.value.split("-")

    console.log(dateString);
    date = dateString[0] + dateString[1] + dateString[2]
    d3.select('.view').remove()
    createChart(date)

}



let createChart = function (date) {
    Promise.all([

        d3.csv('https://raw.githubusercontent.com/fuyuGT/mvp_selection_data/master/teams.csv'),
        d3.csv('https://raw.githubusercontent.com/fuyuGT/mvp_selection_data/master/images/playerImage.csv'),
        d3.csv('schedule_10082020_19_07ET.csv'),
        d3.csv('ref_report_10092020_09_21ET.csv'),
        d3.csv('injury_report_10092020_09_25ET.csv'),
        d3.csv('nbarefImage.csv')
    ]).then(datasets => {

        teams = datasets[0].slice(0, 30)
        playerImageUrl = datasets[1]
        games = datasets[2]
        todayRefs = datasets[3]
        currentInjuryList = datasets[4]
        refImageUrls = datasets[5]


        todayGames = d3.filter(games, d => d.date == date)



        height = todayGames.length * 100 + 100 > 750 ? todayGames.length * 100 + 100 : 750


        console.log(games);
        const logoSize = 60

        const viewBox = d3.select('.viewBox').append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('class', 'view')
            .attr('render-order', '-1');
 

        let appendTeamLogo = function (parent_g, x, y, width, teamName, opacity = 0.5) {
            var logoPath = '../images/NBATeamLogo/' + teamName + '.svg';



            parent_g.append('svg:image')
                .attr('xlink:href', logoPath)
                .attr('class', 'teamLogo')
                .attr('opacity', opacity)
                .attr('width', width)
                .attr('height', width)
                .attr('transform', 'translate(' + x + ',' + y + ')')

        }


        let removeTeamLogo = function (params) {
            d3.select('.backgroundTeamLogo').remove();
        }



        console.log(todayGames);

        if (todayGames.length > 0) {
            todayGames.forEach((game, i) => {

                let selectedDay = new Date(date.slice(0, 4), date.slice(4, 6) - 1, date.slice(6, 8))


                const gameGroup = viewBox.append('g')
                    .attr('class', 'gameGroup')
                    .attr('transform', 'translate(' + 0 + ',' + i * 100 + ')')
                    .style('cursor', 'pointer')

                const rectWidth = 320;

                gameGroup.append('rect')
                    .attr('class', 'backgroundRect')
                    .attr('width', rectWidth)
                    .attr('height', 90)
                    .attr('x', 5)
                    .attr('y', 0)
                    .style('fill', 'white')
                    .style('opacity', 0.2)
                    .style('stroke', '#000')
                    .style('stroke-fill', 'gray')
                    .attr("rx", 6)
                    .attr("ry", 6)

                gameGroup.append('text')
                    .text(`${game.time}m EST`)
                    .attr('class', 'gameTime')
                    .attr('x', rectWidth / 2)
                    .attr('y', 30)
                    .style('opacity', 0.8)
                    .style('fill', '#000')

                gameGroup.append('text')
                    .text('@')
                    .attr('class', 'gameTime')
                    .attr('x', rectWidth / 2)
                    .attr('y', 50)
                    .style('font-size', 24)
                    .style('font-family', "'Play', 'sans-serif'")

                gameGroup.append('text')
                    .text(game.awayTeam)
                    .attr('class', 'teamName')
                    .attr('x', 60)
                    .attr('y', 80)
                    .style('font-size', 10)

                gameGroup.append('text')
                    .text(game.homeTeam)
                    .attr('class', 'teamName')
                    .attr('x', rectWidth - 60)
                    .attr('y', 80)
                    .style('font-size', 10)


                if (game.homeTeamScore) {
                    gameGroup.append('text')
                        .text(game.awayTeamScore)
                        .attr('class', 'teamName')
                        .attr('x', rectWidth / 2 - 20)
                        .attr('y', 80)
                        .style('font-size', 14)
                        .style('fill', d => game.awayTeamScore > game.homeTeamScore ? 'green' : 'red')

                    gameGroup.append('text')
                        .text(":")
                        .attr('class', 'teamName')
                        .attr('x', rectWidth / 2)
                        .attr('y', 80)
                        .style('font-size', 14)

                    gameGroup.append('text')
                        .text(game.homeTeamScore)
                        .attr('class', 'teamName')
                        .attr('x', rectWidth / 2 + 20)
                        .attr('y', 80)
                        .style('font-size', 14)
                        .style('fill', d => game.awayTeamScore < game.homeTeamScore ? 'green' : 'red')

                }


                const injuryGroup = viewBox.append('g')
                    .attr('transform', 'translate(' + 300 + ',' + i * 100 + ')')

                appendTeamLogo(gameGroup, 30, 10, 60, game.awayTeam, 1)
                appendTeamLogo(gameGroup, rectWidth - 90, 10, 60, game.homeTeam, 1)



            });

        }
        else {
            viewBox.append('text')
                .text("No game today")
                .attr('x', width / 2)
                .attr('y', 80)
                .style('font-size', 28)

        }


        let selectedGame = d3.selectAll('.gameGroup')
            .on('click', function () {
                d3.selectAll('.backgroundRect')
                    .style('fill', '#fff')


                rect = d3.select(this.childNodes[0])

                rect.style('fill', 'gray')
                drawDetails(this)
            })
        // .on('mouseleave', function () {
        //     d3.selectAll('.backgroundRect')
        //         .style('fill', '#fff')

        //     d3.select('.injuryGroup').selectAll('*').remove()

        // })


        function drawDetails(d) {
            const injuryGroup = viewBox.append('g')
            .attr('class', 'injuryGroup')
            .attr('transform', 'translate(' + 400 + ',' + 0 + ')')

        const refGroup = viewBox.append('g')
            .attr('class', 'refGroup')
            .attr('transform', 'translate(' + 1100 + ',' + 60 + ')')

            refGroup.append('text')
                    .text('Referee Group')
                    .attr('x', 0)
                    .attr('y', 0)
                    .style('font-size',24)

            let awayTeam = d.childNodes[3].textContent
            let homeTeam = d.childNodes[4].textContent

            console.log(awayTeam);
            // .style('cursor', 'pointer')
            awayTeamLogo = injuryGroup.append('g')
            appendTeamLogo(awayTeamLogo, 70, 0, 100, awayTeam, 1)
            appendTeamLogo(awayTeamLogo, 420, 0, 100, homeTeam, 1)

            awayTeamInjuries = d3.filter(currentInjuryList, d => d.team == awayTeam)
            homeTeamInjuries = d3.filter(currentInjuryList, d => d.team == homeTeam)


            console.log(awayTeamInjuries, homeTeamInjuries);

            let imgURL = function (playerName) {


                for (let index = 0; index < playerImageUrl.length; index++) {
                    const element = playerImageUrl[index];

                    if (element.player === playerName) {
                        return (element.image_url)
                    }
                }
            }
            injuryGroup.append('text')
                .attr('transform', 'translate(' + 0 + ',' + 150 + ')')
                .text("Player")
                .attr('class', 'injuryGroup')
                .style('font-weight', 800)

            injuryGroup.append('text')
                .attr('transform', 'translate(' + 120 + ',' + 150 + ')')
                .text("Current Status")
                .attr('class', 'injuryGroup')
                .style('font-weight', 800)


            injuryGroup.append('text')
                .attr('transform', 'translate(' + 240 + ',' + 150 + ')')
                .text("Update Date")
                .attr('class', 'injuryGroup')
                .style('font-weight', 800)

            injuryGroup.append('text')
                .attr('transform', 'translate(' + 350 + ',' + 150 + ')')
                .text("Player")
                .attr('class', 'injuryGroup')
                .style('font-weight', 800)


            injuryGroup.append('text')
                .attr('transform', 'translate(' + 470 + ',' + 150 + ')')
                .text("Current Status")
                .attr('class', 'injuryGroup')
                .style('font-weight', 800)

            injuryGroup.append('text')
                .attr('transform', 'translate(' + 590 + ',' + 150 + ')')
                .text("Update Date")
                .attr('class', 'injuryGroup')
                .style('font-weight', 800)

            awayTeamInjuries.forEach((d, i) => {
                awayTeamPlayerGroup = injuryGroup.append('g')
                    .attr('class', 'injuryGroup')
                    .attr('transform', 'translate(' + 0 + ',' + (150 + i * 100) + ')')




                awayTeamPlayerGroup.append('text')
                    .attr('transform', 'translate(' + 0 + ',' + 85 + ')')
                    .text(d.name)
                    .attr('class', 'injuryGroup')

                awayTeamPlayerGroup.append('text')
                    .attr('transform', 'translate(' + 120 + ',' + 60 + ')')
                    .text(d.status)
                    .style('font-size', 20)
                    .attr('class', 'injuryGroup')

                awayTeamPlayerGroup.append('text')
                    .attr('transform', 'translate(' + 240 + ',' + 60 + ')')
                    .text(d.date)
                    .style('font-size', 12)
                    .attr('class', 'injuryGroup')

                awayTeamPlayerGroup.append('text')
                    .attr('transform', 'translate(' + 120 + ',' + 100 + ')')
                    .text(d.comments)
                    .attr('class', 'injuryGroup')
                    .attr('id', 'comments')
                    .style('font-size', 8)
                    .attr('display', 'none')

                awayTeamPlayerGroup.append('svg:image')
                    .attr('xlink:href', function () {
                        return imgURL(d.name)
                    })
                    .attr('class', 'injuryPlayerImage')
                    .attr('width', 70)
                    .attr('height', 70)
                    .attr('x', -35)
                    .attr('y', 10)
                    .style('cursor', 'pointer')
                    .on('mouseover', function () {
                        d3.select('#comments')
                            .attr('display', 'block')
                    })
                    .on('mouseleave', function () {
                        d3.select('#comments')
                            .attr('display', 'none')
                    })




            });
            homeTeamInjuries.forEach((d, i) => {

                homeTeamPlayerGroup = injuryGroup.append('g')
                    .attr('transform', 'translate(' + 350 + ',' + (150 + i * 100) + ')')

                homeTeamPlayerGroup.append('text')
                    .attr('transform', 'translate(' + 0 + ',' + 85 + ')')
                    .text(d.name)

                homeTeamPlayerGroup.append('text')
                    .attr('transform', 'translate(' + 120 + ',' + 60 + ')')
                    .text(d.status)
                    .style('font-size', 20)
                    .attr('class', 'injuryGroup')

                homeTeamPlayerGroup.append('text')
                    .attr('transform', 'translate(' + 240 + ',' + 60 + ')')
                    .text(d.date)
                    .style('font-size', 12)
                    .attr('class', 'injuryGroup')

                homeTeamPlayerGroup.append('text')
                    .attr('transform', 'translate(' + 120 + ',' + 100 + ')')
                    .text(d.comments)
                    .attr('class', 'injuryGroup')
                    .attr('id', 'comments')
                    .style('font-size', 8)
                    .attr('display', 'none')

                homeTeamPlayerGroup.append('svg:image')
                    .attr('xlink:href', function () {
                        return imgURL(d.name)
                    })
                    .attr('class', 'injuryPlayerImage')
                    .attr('width', 70)
                    .attr('height', 70)
                    .attr('x', -35)
                    .attr('y', 10)
                    .style('cursor', 'pointer')
                    .on('mouseover', function () {
                        d3.select('#comments')
                            .attr('display', 'block')
                    })
                    .on('mouseleave', function () {
                        d3.select('#comments')
                            .attr('display', 'none')
                    })

            });



            let refImgURL = function (refName) {

                for (let index = 0; index < refImageUrls.length; index++) {
                    const element = refImageUrls[index];
                    if (element.Name == refName.trim()) {
                        console.log(element.Link);
                        return element.Link
                    }
                }
            }

            todayRefs.forEach((d) => {
                    console.log(d);

                    refList = d.refs

                    console.log(refList);

                    ref1 = refList.split(',')[0].split('(')[0].split("'")[1]
                    ref2 = refList.split(',')[1].split('(')[0].split("'")[1]
                    ref3 = refList.split(',')[2].split('(')[0].split("'")[1]

                    console.log(refImgURL(ref1.toUpperCase()));


                    // refList.forEach((ref,i) => {

                    //     console.log(ref);

                        refGroup.append('svg:image')
                        .attr('xlink:href', function () {
                            return refImgURL(ref1.toUpperCase())
                        })
                        .attr('class', 'refImage')
                        .attr('width', 70)
                        .attr('height', 70)
                        .attr('x', 50)
                        .attr('y', 100)
                        

                        refGroup.append('svg:image')
                        .attr('xlink:href', function () {
                            return refImgURL(ref2.toUpperCase())
                        })
                        .attr('class', 'refImage')
                        .attr('width', 70)
                        .attr('height', 70)
                        .attr('x', 50)
                        .attr('y', 200)


                        refGroup.append('svg:image')
                        .attr('xlink:href', function () {
                            return refImgURL(ref3.toUpperCase())
                        })
                        .attr('class', 'refImage')
                        .attr('width', 70)
                        .attr('height', 70)
                        .attr('x', 50)
                        .attr('y', 300)


                        refGroup.append('text')
                        .text(ref1)
                        .attr('class', 'refNames')
                        .attr('x', 85)
                        .attr('y', 180)

                        

                        refGroup.append('text')
                        .text(ref2)
                        .attr('class', 'refNames')
                        .attr('x', 85)
                        .attr('y', 280)
                        

                        refGroup.append('text')
                        .text(ref3)
                        .attr('class', 'refNames')
                        .attr('x', 85)
                        .attr('y', 380)





                    
                    // });
            });

        }

        


    })
}

createChart(date)
