let tl=gsap.timeline();

tl.from(".nav-title",{
    duration:0.4,
    y: -100,
    opacity:0,
    ease:"power1.out",
    delay:0.2,
})
tl.from(".nav-elem",{
    duration:0.4,
    delay:0.2,
    opacity:0,
    y:-50,
    stagger:0.2,
    ease:"power2.out"
})

tl.from(".hero-img",{
    duration:0.2,
    opacity:0,
    ease:"power1.out",
})

tl.from(".hero-left",{
    duration:0.4,
    opacity:0,
    x:-100,
    stagger:0.2,
    ease:"power1.out",
})

tl.from("#second-section #second-section-content",{
    duration:0.2,
    delay:0.2,
    opacity:0,
    y:100,
    ease:"power1.out",
    scrollTrigger:{
        trigger:"#second-section #second-section-content",
        start:"top 60%",
        end:"top 40%",
        scrub:1,
        scroller:"body",
    }
})

tl.from(".txt-aigarden",{
    duration:0.5,
    delay:0.2,
    opacity:0,
    y:100,
    ease:"power1.out",
    scrollTrigger:{
        trigger:".txt-aigarden",
        start:"top 60%",
        end:"top 40%",
        scrub:1,
        scroller:"body",
    }
})

tl.from(".features-section",{
    duration:0.2,
    delay:0.2,
    opacity:0,
    x:-100,
    ease:"power1.out",
    scrollTrigger:{
        trigger:".features-section",
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
    y:100,
    ease:"power1.out",
    scrollTrigger:{
        trigger:".impact-elem",
        start:"top 60%",
        end:"top 40%",
        scrub:1,
        scroller:"body",
    }
})