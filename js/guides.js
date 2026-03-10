async function loadGuides(){

const res = await fetch("data/guides.json")

const data = await res.json()

const container = document.getElementById("guide-sections")

data.sections.forEach(section =>{

const sectionDiv = document.createElement("div")

sectionDiv.className = "guide-section"

sectionDiv.innerHTML = `
<h2 class="section-title">${section.title}</h2>
<div class="guide-grid"></div>
`

const grid = sectionDiv.querySelector(".guide-grid")

section.guides.forEach(g =>{

const card = document.createElement("a")

card.className = "guide-card"

card.href = g.url

card.innerHTML = `

<img src="${g.image}">

<div class="guide-info">

<div class="guide-title">${g.title}</div>

<div class="guide-desc">${g.description || ""}</div>

</div>

`

grid.appendChild(card)

})

container.appendChild(sectionDiv)

})

}

loadGuides()
