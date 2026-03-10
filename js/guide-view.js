const params=new URLSearchParams(window.location.search)
const slug=params.get("slug")

async function loadGuide(){

let {data}=await supabase
.from("guides")
.select("*")
.eq("slug",slug)
.single()

const container=document.getElementById("guideContent")

data.blocks.forEach(b=>{

container.innerHTML+=`
<div class="guide-box">
<div class="guide-title">${b.title}</div>
<div class="guide-content">${b.content}</div>
</div>
`

})

}

loadGuide()
