async function loadGuides(){

const { data, error } = await supabase
.from("guides")
.select("*")
.order("created_at",{ascending:false})

const list=document.getElementById("guideList")

data.forEach(g=>{

list.innerHTML+=`
<div class="guide-card">
<a href="guide.html?slug=${g.slug}">
<h3>${g.title}</h3>
</a>
</div>
`

})

}

loadGuides()
