export class Navigator {

    constructor() {
        this.state = {
            currentSlide: null,
        };   
        window.history.replaceState(this.state, null, "");
        window.onpopstate = (event) => {
            if (event.state) { this.state = event.state; }
            this.#render();
        };
    }

    pushSlide(slide) {
        this.state.currentSlide = slide;
        window.history.pushState(this.state, null, "");
        this.#render();
    }

    #setSlideStylies(slideStyleNames) {
        let headBlock = document.getElementsByTagName("head")[0];
        let oldSlideStylesBlock = document.getElementById("slide-styles");
        if (oldSlideStylesBlock != null) {
            headBlock.removeChild(oldSlideStylesBlock);
        }
        let newSlideStylesBlock = document.createElement("div");
        newSlideStylesBlock.id = "slide-styles";
        headBlock.appendChild(newSlideStylesBlock);

        for (let slideName of slideStyleNames) {
            let styleLink = document.createElement("link");
            styleLink.rel = "stylesheet";
            styleLink.href = `../css/${slideName}.css`;
            newSlideStylesBlock.appendChild(styleLink);
        }
    }

    #render() {
        let oldSlideBlock = document.getElementById('slide-block');
        if (oldSlideBlock != null) {
            oldSlideBlock.parentNode.removeChild(oldSlideBlock);
        }
        let slideBlock = document.createElement('div');
        slideBlock.id = 'slide-block';
        if (this.state.currentSlide != undefined) {
            slideBlock.innerHTML = this.state.currentSlide.htmlContent;
            document.body.insertBefore(slideBlock, document.getElementsByTagName('footer')[0]);
            this.#setSlideStylies(this.state.currentSlide.styleNames);
        }
        else {
            console.log('ERROR: Current slide is undefined!');
        }
    }
}