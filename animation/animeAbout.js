let tl=gsap.timeline();
tl.from(".center-txt",{
    duration:0.7,
    y: -100,
    opacity:0,
    ease:Circ.easeInOut,
    delay:0.2,
})

tl.from(".our-tm",{
    duration:0.7,
    opacity:0,
    y:-100,
    stagger:0.2,
    delay:0.2,
    scrollTrigger:{
        trigger:".our-tm",
        start:"top 60%",
        end:"top 40%",
        scrub:1,
        scroller:"body",
    }
})


tl.from(".impact-elem",{
    duration:0.2,
    delay:0.2,
    opacity:0,
    x:-100,
    ease:"power1.out",
    scrollTrigger:{
        trigger:".impact-elem",
        start:"top 60%",
        end:"top 40%",
        scrub:1,
        scroller:"body",
    }
})