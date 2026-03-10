async function publishGuide(){

let title=document.getElementById("title").value

let blocks=[]

document.querySelectorAll(".block").forEach(b=>{

blocks.push({
type:b.dataset.type,
title:b.querySelector(".btitle").value,
content:b.querySelector(".bcontent").value
})

})

let slug=title.toLowerCase().replaceAll(" ","-")

await supabase.from("guides").insert({
title:title,
slug:slug,
blocks:blocks
})

alert("Guide Published!")

}
