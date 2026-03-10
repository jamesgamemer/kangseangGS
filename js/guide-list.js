const db = window.supabaseClient

async function loadGuides(){

const { data, error } = await db
.from("guides")
.select("*")
.order("created_at",{ascending:false})

if(error){
console.error("Guide load error:", error)
return
}

console.log("Guides:", data)

const newbie = document.getElementById("newbieGuides")
const generic = document.getElementById("genericGuides")

if(!data || data.length===0){
console.warn("No guides found")
return
}

data.forEach(g=>{

const card = `
<a href="guide.html?slug=${g.slug}" class="guide-card">

<img class="guide-thumb"
src="images/guides/${g.slug}.jpg"
onerror="this.src='images/guides/default.jpg'">

<div class="guide-info">

<div class="guide-name">
${g.title}
</div>

<div class="guide-arrow">
→
</div>

</div>

</a>
`

if(g.category==="newbie"){
newbie.innerHTML += card
}

else if(g.category==="generic"){
generic.innerHTML += card
}

else{
console.warn("Unknown category:", g.category)
}

})

}

loadGuides()
