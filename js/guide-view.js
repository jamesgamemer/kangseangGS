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

const container = document.getElementById("guideContent")

container.innerHTML = `
<h1>${data.title}</h1>
<p>Guide content coming soon...</p>
`

}

loadGuide()
