const db = window.supabaseClient

const params = new URLSearchParams(window.location.search)
const slug = params.get("slug")

async function loadGuide(){

const { data, error } = await db
.from("guides")
.select("*")
.eq("slug", slug)
.single()

if(error){
console.log(error)
return
}

document.getElementById("guideTitle").innerText = data.title
document.getElementById("guideDate").innerText = data.created_at

const container = document.getElementById("guideContent")

container.innerHTML = `

<div class="guide-section">
<h2 id="about">ABOUT THE GAME</h2>
<p>This guide will help you understand the basic mechanics of the game.</p>
</div>

<div class="guide-section">
<h2 id="links">OFFICIAL LINKS</h2>

<ul>
<li><a href="#">Official Website</a></li>
<li><a href="#">Official Discord</a></li>
<li><a href="#">Official YouTube</a></li>
</ul>

</div>

<div class="tip-box">
Tip: Focus on leveling your main character first.
</div>

<div class="warning-box">
Warning: Do not waste premium currency early.
</div>

`

createTOC()

}

function createTOC(){

const toc = document.getElementById("toc")

toc.innerHTML = ""

document.querySelectorAll(".guide-section h2").forEach(section => {

const id = section.id
const text = section.innerText

const li = document.createElement("li")

li.innerHTML = `<a href="#${id}">${text}</a>`

toc.appendChild(li)

})

}

loadGuide()
