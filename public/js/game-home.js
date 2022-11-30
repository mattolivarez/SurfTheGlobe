/*
JAVASCRIPT FILE THAT CONTAINS THE LOGIC BEHIND 
THE LATITUDE/LONGITUDE GAME
CS3340A SOFTWARE ENGINEERING
SURF THE GLOBE PROJECT
SPRING 2022
SARAH FLORES, MATTHEW OLIVAREZ, GABY RUBAN, VIVIAN VU, MIRSAB ZAR
*/

// imports
import { availableCountries } from 'countrySeeds'

// local variables
let numOfSquares = 8
let pickedCountry
let countries = []

// variables taken from the DOM
const squares = document.querySelectorAll(".square")
const messageDisplay = document.querySelector("#message")
const h1 = document.querySelector("h1")
const resetButton = document.querySelector("#reset")
const latitude = document.getElementById('latitude')
const longitude = document.getElementById('longitude')
const heading = document.getElementById('heading')
const openModalButtons = document.querySelectorAll("[data-modal-target]")
const closeModalButtons = document.querySelectorAll("[data-close-button]")
const overlay = document.getElementById("overlay")
const countryButton = document.getElementById("country-button")

// ------------------------------------------- Game Logic --------------------------------------------------------------

const init = () =>
{
	setUpSquares()
	reset()
}

// sets up logic for the squares
const setUpSquares = () =>
{
	for (var i = 0; i < squares.length; i++)
	{
		// adds click listeners to the squares containing country names
		squares[i].addEventListener("click", function()
		{
			var clickedCountry = this.innerHTML
			// if the clicked country name == the randomly selected country name display correct information
			if ( clickedCountry === pickedCountry.name  && messageDisplay.innerHTML !== "Correct")
			{
				messageDisplay.textContent = "Correct"
				resetButton.textContent = "Play Again?"
				heading.innerHTML += " " + clickedCountry
				countryButton.innerText = "Explore " + clickedCountry
				countryButton.style.display = "inline"
				//changeCountry(clickedCountry)
			} 
			else 
			{
				this.style.backgroundColor = "teal"
				this.style.border = "none"
				this.style.color = "teal"
				messageDisplay.textContent = "Try Again!"
			}
		})
	}
}

// main logic of program
const reset = () =>
{
	// generates array of random countries
	countries = generateRandomCountries(numOfSquares)
	//console.log(countries)
	// randomly selects country from countries array
	pickedCountry = pickCountry()
	latitude.value = parseFloat(pickedCountry.latitude).toFixed(3) // updated
    longitude.value = parseFloat(pickedCountry.longitude).toFixed(3) // updated
	resetButton.innerHTML = "New Countries"
	messageDisplay.innerHTML = ""
	heading.innerHTML = "Name that country?"
	countryButton.style.display = "none"
	for ( let i = 0; i < squares.length; i++)
	{
		if (countries[i])
		{
			squares[i].style.display = "block"
			squares[i].innerHTML = countries[i].name
			squares[i].style.backgroundColor = "white"
			squares[i].style.color = "black"
			squares[i].style.border = ".1rem solid white"
		} else 
		{
			squares[i].style.display = "none"
		}
		
	}
	//h1.style.backgroundColor = "steelblue"
}

// reset button listens for click
resetButton.addEventListener("click", function()
{
	reset()
})

// generates random countries to place in array, while avoiding duplicates
const generateRandomCountries = (numOfSquares) =>
{
	let countryList = []
	countryList.push(availableCountries[Math.floor(Math.random() * availableCountries.length)])
	//console.log(countryList[0].name)
	let newCountry
	let found
	for (let i = 1; i < numOfSquares; i++)
	{
		found = false
		newCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)]
		//console.log(newCountry.name)
		for (let j = 0; j < countryList.length; j++)
		{
			if (countryList[j].name === newCountry.name)
			{
				found = true
				break
			}
		}
		if (!found)
		{
			countryList.push(newCountry)
		}
		else
		{
			i--
		}
	}
	return countryList
}

// picks random country
const pickCountry = () =>
{
	return countries[Math.floor(Math.random() * numOfSquares)]
}

// ------------------------------------------- Popup help screen --------------------------------------------------

const openModal = (modal) => {
    if (modal === null) return
    modal.classList.add('active')
    overlay.classList.add('active')
}

const closeModal = (modal) => {
    if (modal === null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
}

overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active')
    modals.forEach(modal => {
        closeModal(modal)
    })
})

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = document.querySelector(button.dataset.modalTarget)
        openModal(modal)
    })
})

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal')
        closeModal(modal)
    })
})

init()

export { pickedCountry }