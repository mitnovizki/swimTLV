

//const fetch = require('node-fetch');

const endpoint =
  'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json'

const cities = []

fetch(endpoint)
  .then(blob => blob.json())
  .then(data => { cities.push(...data) })
// .then(() => console.log(findMatch('Bos', cities)))

function findMatch(wordToMatch, cities) {
  return cities.filter(place => {
    const reg = new RegExp(wordToMatch, 'g')
    return place.city.match(reg) || place.state.match(reg)
  })
}

function displayMatches() {
  const matchArray = findMatch(this.value, cities)


  let html = matchArray.map(place => {
    return `<li>
    <span class ='name'> ${place.city},${place.state}</span>
    <span class ='population'> ${place.population}</span>
    </li>`
  }).join('') // return to string an array that returned by map

  suggestions.innerHTML = html
}
const searchInput = document.querySelector('.search')
const suggestions = document.querySelector('.suggestions')


searchInput.addEventListener('change', displayMatches)
searchInput.addEventListener('keyup', displayMatches)

