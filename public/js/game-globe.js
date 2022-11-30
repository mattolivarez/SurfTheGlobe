/*
THIS FILE SERVES AS THE HINT IN THE GAME PAGE
CS3340A SOFTWARE ENGINEERING
SURF THE GLOBE PROJECT
SPRING 2022
SARAH FLORES, MATTHEW OLIVAREZ, GABY RUBAN, VIVIAN VU, MIRSAB ZAR
*/

// imports 
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { pickedCountry } from 'gameHome'

// defining variables from the DOM
const openModalButtons = document.querySelectorAll("[data-modal-target]")
const closeModalButtons = document.querySelectorAll("[data-close-button]")
const overlay = document.getElementById("overlay")
const modal = document.getElementById("modal")
const container = document.getElementById('game-modal-body')
const width = modal.offsetWidth
const height = modal.offsetHeight

// creating scene, camera, renderer
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
    )

const renderer = new THREE.WebGLRenderer({
    antialias: true
})


renderer.setSize(width, height)
// add the renderer to the div
container.appendChild(renderer.domElement);

//renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio) // cleans up image, better quality
//document.body.appendChild(renderer.domElement)


// light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
scene.add(directionalLight)
directionalLight.position.set(0, 50, 0)


// create a sphere -> intended to be our globe
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(3,50,50),
    new THREE.MeshBasicMaterial({
        //color: 0x2266EE
        map: new THREE.TextureLoader().load('./img/Globe.jpeg') // jpg is "wrapped" around the sphere
    })
)
// user data to distinguish this object from others within the scene
sphere.userData.globe = true
sphere.userData.name = "Globe"
scene.add(sphere)

camera.position.z = 6


// helper ( draws axes)
// const helper = new THREE.AxesHelper(5)
// scene.add(helper)


// controls 
const controls = new OrbitControls(camera, renderer.domElement)
controls.maxPolarAngle = 2 * Math.PI / 3
controls.minPolarAngle = Math.PI / 3
controls.enableDamping = true
controls.enableZoom = false;
controls.enablePan = false


// add marker to clicked position
const targetGeometry = new THREE.SphereGeometry( 0.05 )
const targetMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } )
let target = new THREE.Mesh( targetGeometry, targetMaterial )
scene.add( target )


// mouse click functionality
const mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

function onWindowResize()
{
    camera.aspect = container.innerWidth / container.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
}

window.addEventListener( 'resize', onWindowResize )

// finds the x coordinate 
const convertToXPoint = () =>
{
    let lat = parseFloat(pickedCountry.latitude)
    let long = parseFloat(pickedCountry.longitude)
    var phi   = (90-lat)*(Math.PI/180);
    var theta = (long+180)*(Math.PI/180);
    const r = 3
    
    let x = -(r * Math.sin(phi) * Math.cos(theta))

    return x
}

// finds the y coordinate
const convertToYPoint = () =>
{
    let lat = parseFloat(pickedCountry.latitude)
    let phi = (90-lat)*(Math.PI/180);
    const r = 3
    
    let y = r * Math.cos(phi)

    return y
}

// finds the z coordinate
const convertToZPoint = () =>
{
    let lat = parseFloat(pickedCountry.latitude)
    let long = parseFloat(pickedCountry.longitude)
    var phi   = (90-lat)*(Math.PI/180);
    var theta = (long+180)*(Math.PI/180);
    const r = 3

    let z = r * Math.sin(phi) * Math.sin(theta)

    return z
}

target.position.set(convertToXPoint(), convertToYPoint(), convertToZPoint())
//controls.object.position.set(camera.x, camera.y, camera.z);
//controls.target = new THREE.Vector3(convertToXPoint(), convertToYPoint(), convertToZPoint());

// establishing the "main" function or entry point into file
function animate() {
    // camera.lookAt(target.position)
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    // controls.update()
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

// calling entry point
animate()
//console.log(scene.children)