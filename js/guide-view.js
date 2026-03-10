const db = window.supabaseClient

const params = new URLSearchParams(window.location.search)
const slug = params.get("slug")

async function loadGuide(){

const { data:guide } = await db
.from("guides")
.select("*")
.eq("slug",slug)
.single()

document.getElementById("guideTitle").textContent = guide.title

const { data:blocks } = await db
.from("guide_blocks")
.select("*")
.eq("guide_id",guide.id)
.order("position")

const container = document.getElementById("guideContent")

blocks.forEach(b=>{

let html=""

if(b.type==="banner"){
html=`
<div class="guide-banner">
<img src="images/guides/${b.image}">
</div>`
}

if(b.type==="text"){
html=`
<div class="guide-section">
<h2>${b.title}</h2>
<p>${b.content}</p>
</div>`
}

if(b.type==="tip"){
html=`
<div class="guide-tip">
<strong>TIP</strong>
<p>${b.content}</p>
</div>`
}

if(b.type==="warning"){
html=`
<div class="guide-warning">
<strong>WARNING</strong>
<p>${b.content}</p>
</div>`
}

if(b.type==="image"){
html=`
<div class="guide-image">
<img src="images/guides/${b.image}">
</div>`
}

container.innerHTML += html

})

}

loadGuide()
