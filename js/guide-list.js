const db = window.supabaseClient

async function loadGuides(){

const { data, error } = await db
.from("guides")
.select("*")
.order("created_at",{ascending:false})

const list = document.getElementById("guideList")

if(!data) return

data.forEach(g=>{

list.innerHTML += `
<a href="guide.html?slug=${g.slug}" class="guide-card">

<img class="guide-thumb"
src="https://placehold.co/80x80">

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

})

}

loadGuides()
