const text = "Data Scientist | AI Enthusiast";

let index = 0;

function typeEffect() {

    const typing = document.getElementById("typing");

    if(index < text.length){
        typing.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeEffect, 100);
    }
}

window.onload = typeEffect;


// NAVBAR EFFECT

window.addEventListener("scroll", () => {

    const navbar = document.querySelector(".navbar");

    if(window.scrollY > 50){
        navbar.classList.add("scrolled");
    }
    else{
        navbar.classList.remove("scrolled");
    }

});


/* AHI THI NICHE NAVO CODE PASTE KARO */

const revealElements =
document.querySelectorAll(
".hero-text,.hero-image,.about-container,.stat-card"
);

function reveal(){

revealElements.forEach((el)=>{

const top =
el.getBoundingClientRect().top;

if(top < window.innerHeight - 100){

el.style.opacity = "1";
el.style.transform = "translateY(0px)";

}

});

}

window.addEventListener("scroll", reveal);

reveal();