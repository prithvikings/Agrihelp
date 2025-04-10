let tl=gsap.timeline();

tl.from(".contact-cards",{
    duration:0.4,
    x:-100,
    stagger:0.5,
    opacity:0,
    delay:0.5,
    ease:"power2.out"
})

tl.from(".contact-form-map",{
    duration:1,
    delay:0.5,
    y:-100,
    opacity:0,
    ease:"power2.out"
}, "-=0.4");