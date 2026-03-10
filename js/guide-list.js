const db = window.supabaseClient

async function loadGuides(){

const { data, error } = await db
.from("guides")
.select("*")
.order("created_at",{ascending:false})

if(error) return

const newbie = document.getElementById("newbieGuides")
const generic = document.getElementById("genericGuides")

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

if(g.category==="generic"){
generic.innerHTML += card
}

})

}

loadGuides()
