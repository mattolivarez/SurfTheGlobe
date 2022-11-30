/*
JAVASCRIPT FILE THAT CONTAINS THE LOGIC BEHIND 
THE SEARCH PAGE WITH THE INTERACTIVE GLOBE
CS3340A SOFTWARE ENGINEERING
SURF THE GLOBE PROJECT
SPRING 2022
SARAH FLORES, MATTHEW OLIVAREZ, GABY RUBAN, VIVIAN VU, MIRSAB ZAR
*/

// imports 
import * as THREE from 'three'
import { Float32Attribute } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// various variables/assignments
let latField = document.getElementById("latitude") // grabs html tag with id of latitude
let longField = document.getElementById("longitude") // grabs html tag with id of longitude
let formSubmit = document.getElementById("formSubmit") // grabs html tag with id of formSubmit
const openModalButtons = document.querySelectorAll("[data-modal-target]")
const closeModalButtons = document.querySelectorAll("[data-close-button]")
const overlay = document.getElementById("overlay")
const globeCanvas = document.getElementById("globe-canvas")
const instructions = document.getElementById("instructions")
let obj
let lat, long

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


renderer.setSize(window.innerWidth, window.innerHeight)
//renderer.setSize(width, height)
renderer.setPixelRatio(window.devicePixelRatio) // cleans up image, better quality
//document.body.appendChild(renderer.domElement)
globeCanvas.appendChild(renderer.domElement)


// create a sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(3,50,50),
    new THREE.MeshBasicMaterial({
        //color: 0x2266EE
        map: new THREE.TextureLoader().load('../img/Globe.jpeg') // jpg is "wrapped" around the sphere
    })
)
sphere.userData.globe = true
sphere.userData.name = "Globe"
scene.add(sphere)

camera.position.z = 6

// helper ( draws axes)
// const helper = new THREE.AxesHelper(5)
// scene.add(helper)


// light
// const ambientLight = new THREE.AmbientLight(0x404040, 5);//333333
// scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
scene.add(directionalLight)
directionalLight.position.set(0, 50, 25)
// const color = 0xffffff, intensity = 3;
// const light = new THREE.DirectionalLight(color, intensity);
// light.position.set(4, 4, 4);
// scene.add(light);


// stars
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({color: 0xffffff})

const starVertices = []
let flag = true
for (let i = 0; i < 10000; i++)
{
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    let z = Math.random() * 2000
    if (flag)
    {
        z *= -1
    }
    starVertices.push(x,y,z)
    flag = !flag
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))

const stars = new THREE.Points(starGeometry, starMaterial)

scene.add(stars)

// controls 
const controls = new OrbitControls(camera, renderer.domElement)
controls.maxPolarAngle = 2 * Math.PI / 3
controls.minPolarAngle = Math.PI / 3
controls.enableDamping = true
controls.enableZoom = false
controls.enablePan = false

// add marker to clicked position
const targetGeometry = new THREE.SphereGeometry( 0.025 )
const targetMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } )
let target = new THREE.Mesh( targetGeometry, targetMaterial )
scene.add( target )

// group
// const group = new THREE.Group()
// group.add( ambientLight )
// group.add( stars )

// scene.add( group )

// mouse click functionality
const mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

function onWindowResize()
{
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
}

window.addEventListener( 'resize', onWindowResize );

window.addEventListener( 'mousedown', (e) => {
    if (instructions.style.display != "none")
    {
        instructions.style.display = "none"
    }
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1
    raycaster.setFromCamera( mouse, camera )
    const intersects = raycaster.intersectObjects( scene.children, false )
    console.log(intersects)
    if (intersects.length > 0)
    {
        for (let i = 0; i < intersects.length; i++)
        {
            if (intersects[i].object.userData.globe)
            {
                console.log("Globe clicked index = " + i)
                target.position.set(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z)
                convertToLatLong(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z)
            }
        }
    }
    
})

const convertToLatLong = (x, y ,z) =>
{
    const r = 3
    lat = (90 - (Math.acos(y / r) * 180 / Math.PI))
    const firstLong = (((270 + (Math.atan2(x, z) * 180 / Math.PI)) % 360) - 180)
    if (firstLong < 0)
    {
        long = (firstLong + 180)
        
    }
    else if (firstLong > 0)
    {
        long = (firstLong - 180)
    }
    //console.log(lat + " " + long)
    latField.value = lat.toFixed(3) // updated
    longField.value = long.toFixed(3) // updated
    
}

// establishing the "main" function or entry point into file
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    controls.update()
}

// calling entry point
animate()
//console.log(scene.children)

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


  
// connects our form so that when submit button is clicked 
// it tells express to send the post route, which begins all of the backend data retrieval
// formSubmit.addEventListener('submit', () => {
//     fetch("/search")
//         .then(response => response.json())
//         .then(result => obj = result)
//         .catch(error => console.log('error', error));
// })