class JsUtils {

    /////////////////
    // GRAPHICS
    /////////////////

    /**
     * @return `true` if (`mouseX`, `mouseY`) is in rectangular defined by
     *         the top-left corner (`rectX`, `rectY`) and width and height.
     */
    static cursorInRect(mouseX, mouseY, rectX, rectY, rectW, rectH) {
        const xLine = mouseX > rectX && mouseX < rectX + rectW
        const yLine = mouseY > rectY && mouseY < rectY + rectH
        return xLine && yLine
    }
    
    /**
     * Draws vertical and horizontal lines from (x, y)
     * to the up and left borders of canvas. The lines
     * have labels with `x` and `y` values in pixels.
     */
    static drawCoords(ctx, x, y, color) {
        ctx.save()
        
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(0, y)
        ctx.moveTo(x, y)
        ctx.lineTo(x, 0)
        ctx.moveTo(x, y)
        ctx.closePath()
        ctx.strokeStyle = color
        ctx.lineWidth = 0.5
        ctx.setLineDash([5,10])
        ctx.stroke()
        
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '10px Arial'
        ctx.translate(x, y)
        ctx.fillStyle = color
        ctx.fillRect(-45, -7, 30, 14)
        ctx.fillStyle = 'white'
        ctx.fillText(Math.floor(x), -30, 0)
        ctx.rotate(Math.PI / 2)
        ctx.fillStyle = color
        ctx.fillRect(-45, -7, 30, 14)
        ctx.fillStyle = 'white'
        ctx.fillText(Math.floor(y), -30, 0)
        ctx.restore()
    }

    /////////////////
    // QUERIES
    /////////////////
    
    /**
     * @param selectors a string containing one or more selectors to match against.
     *        This string must be a valid CSS selector string.
     * @return list of the document's elements that match the specified group of selectors.
     */
    static getElements(selectors) {
        return document.querySelectorAll(selectors)
    }

    /////////////////
    // HIDE / SHOW
    /////////////////

    static styleElement(element, prop, val) {
        element.style.setProperty(prop, val)
    }

    static styleElements(elements, prop, val) {
        for (const e of elements) {    
            JsUtils.styleElement(e, prop, val)
        }
    }
    
    static hideElement(element) {
        JsUtils.styleElement(element, "display", "none")
    }
    
    static hideElements(elements) {
        for (const e of elements) {
            JsUtils.hideElement(elements[i])
        }
    }
    
    static showElement(element) {
        JsUtils.styleElement(element, "display", "block")
    }
        
    static showElements(elements) {
        for (const e of elements) {
            JsUtils.showElement(e)
        }
    }

    // todo element.classList.add/remove
    static removeClassElement(element, name) {
        const arr1 = element.className.split(" ")
        const arr2 = name.split(" ")
        for (const c of arr2) {
            while (arr1.indexOf(c) > -1) {
                arr1.splice(arr1.indexOf(c), 1)     
            }
        }
        element.className = arr1.join(" ")
    }
    
    static addClassElement(element, name) {
        const arr1 = element.className.split(" ")
        const arr2 = name.split(" ")
        for (const c of arr2) {
            if (arr1.indexOf(c) === -1) {element.className += " " + c}
        }
    }
}