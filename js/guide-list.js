async function loadGuide(){

const params = new URLSearchParams(window.location.search)
const slug = params.get("slug")

const { data: guide, error } = await supabase
.from("guides")
.select("*")
.eq("slug", slug)
.single()

if(!guide){
console.error("Guide not found")
return
}

document.getElementById("guideTitle").textContent = guide.title
document.getElementById("guideDate").textContent = new Date(guide.created_at).toLocaleDateString()

const { data: blocks } = await supabase
.from("guide_blocks")
.select("*")
.eq("guide_id", guide.id)
.order("position", { ascending: true })

if(!blocks) return

const container = document.getElementById("guideContent")

blocks.forEach(block=>{
const div = document.createElement("div")
div.className = "guide-section"
div.innerHTML = `<h2>${block.title}</h2><p>${block.content}</p>`
container.appendChild(div)
})

}

loadGuide()
