class ActionNode {
    
    static #id = 0
    static #nextId() {
        ++ActionNode.#id
        return ActionNode.#id
    }
    
    static defaultWidth = 60
    static defaultHeight = 30
    static maxTextWidth = 150

    constructor(type, x, y) {
        this.id = ActionNode.#nextId()
        this.type = type
        this.x = x
        this.y = y
        this.width = ActionNode.defaultWidth
        this.height = ActionNode.defaultHeight
        this.borderWidth = 2
        this.color = 'green'
        this.activeColor = 'red'
        this.draggedColor = 'blue'
        this.selectedColor = 'brown'
        this.dragged = false    // true if mouse is down on this object; mouse up releases the selection
        this.selected = false   // true if mouse is down on this object; mouse up does not release the selection
        this.active = false     // true if mouse is inside this object
        this.params = ActionNode.createParams(type)
    }

    same(other) {
        return this.id === other.id
    }
    
    within(x, y) {
        return JsUtils.cursorInRect(x, y, this.x, this.y, this.width, this.height)
    }
    
    topAnchor() {
        return {
            x: this.x + this.width / 2,
            y: this.y
        }
    }
    
    bottomAnchor() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height
        }
    }
    
    leftAnchor() {
        return {
            x: this.x,
            y: this.y + this.height / 2
        }
    }
    
    rightAnchor() {
        return {
            x: this.x + this.width,
            y: this.y + this.height / 2
        }
    }
    
    anchorFor(x, y) {
        const c = this.center()
        if (x < this.x &&
            Math.abs(y - c.y) < Math.abs(x-this.x)) return this.leftAnchor()
        else if (x > this.x + this.width &&
            Math.abs(y - c.y) < Math.abs(x-this.x)) return this.rightAnchor()
        else if (y < this.y) return this.topAnchor()
        else if (y > this.y + this.height) return this.bottomAnchor()
        else return { x: undefined, y: undefined }
    }
    
    center() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        }
    }

    draw(context) {
        //console.log('ActionNode.draw() dragged=',this.dragged,' active=',this.active)
        if (this.active) {
            JsUtils.drawCoords(context, this.x, this.y, this.activeColor)
        }
        
        if (this.dragged) {
            context.strokeStyle = this.draggedColor
        }
        else if (this.selected) {
            context.strokeStyle = this.selectedColor
        }
        else {
            context.strokeStyle = this.color
        }

        context.lineWidth = this.borderWidth
        if (this.params.name) {
            context.save()
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.font = '12px Arial'
            const c = this.center()
            context.fillText(this.params.name, c.x, c.y, ActionNode.maxTextWidth)
            const textMetrics = context.measureText(this.params.name)
            const pad = 2*10
            const w = Math.min(Math.floor(textMetrics.width), ActionNode.maxTextWidth) + pad
            this.width = Math.max(w, ActionNode.defaultWidth)
            //console.log('textMetrics.width=', textMetrics.width)
            context.restore()
        }
        else {
            this.width = ActionNode.defaultWidth
            this.height = ActionNode.defaultHeight
        }
        context.strokeRect(this.x, this.y, this.width, this.height)
    }
    
    static createParams(type) {
        const ans = {
            name: undefined,
            parse: undefined
        }
        switch (type) { // todo
            case 'regex':
                ans.regex = undefined
                ans.produces = undefined // comma-separated string
                return ans
            case 'kv':
                return ans
            case 'csv':
                return ans
            default:
                return {}
        }
    }
}