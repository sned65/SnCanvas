class WfPanel {
    constructor(grid) {
        this.grid = grid
        this.canvas = document.getElementById('wf_canvas_main')
        this.ctx = this.canvas.getContext('2d')
        
        this.actionNodes = []
        this.arrowNodes = []  // [{arrow: arrow, from: action1, to: action2}]
        
        this.selectNavigation = {  // not complete arrow (in the process of building)
            isActive: false,
            x0: undefined,
            y0: undefined,
            node0: undefined,
            x1: undefined,
            y1: undefined,
            arrow: undefined
        }
        
        this.mouseMoveListener()
        this.mouseDownListener()
        this.mouseUpListener()
        this.keyPressListener()
    }
    
    resize() {
        this.canvas.height = window.innerHeight * 0.9

        const div = document.getElementById('wf_canvas_wrapper') // todo hardcoded
        const style = window.getComputedStyle(div)
        //console.log('div style w =',style.width)
        this.canvas.width = parseInt(style.width)

        this.grid.resize(this.canvas.width, this.canvas.height)
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    
    resetSelectNavigation() {
        this.selectNavigation = {
            isActive: false,
            x0: undefined,
            y0: undefined,
            node0: undefined,
            x1: undefined,
            y1: undefined,
            arrow: undefined
        }
        WfPanel.disableNavButtons(false)
        this.canvas.classList.remove('wfp-progress')
    }
    
    redraw() {
        this.clear()
        this.actionNodes.forEach(e => {
            e.draw(this.ctx)
        })
        this.arrowNodes.forEach(e => {
            e.arrow.draw(this.ctx)
        })
        if (this.selectNavigation.arrow) this.selectNavigation.arrow.draw(this.ctx)
    }

    // =============================================================
    //                    ADD/REMOVE NODES
    // =============================================================

    addAction(actionType) {
        const a = new ActionNode(actionType, 100, 150)
        this.actionNodes.push(a)
        this.selectNode(a)
    }
    
    addNav() {        
        WfPanel.disableNavButtons(true)
        this.selectNavigation.isActive = true
        this.canvas.classList.add('wfp-progress')
    }
    
    /**
     * Creates an arrow from `action1` to `action2`.
     */
    join(action1, action2) {
        //console.log('WfPanel.join(', action1, ', ', action2, ')')
        const center1 = action1.center()
        const center2 = action2.center()
        const start = action1.anchorFor(center2.x, center2.y)
        const end   = action2.anchorFor(center1.x, center1.y)
        const arrow = new Arrow(start.x, start.y, end.x, end.y)
        this.arrowNodes.push({arrow: arrow, from: action1, to: action2})
    }
    
    removeNodeByIndex(idx) {
        const n = this.actionNodes[idx]
        const arrows = this.arrowNodes.filter(a => a.from.same(n) || a.to.same(n))
        arrows.forEach(a => this.removeArrow(a))
        
        this.actionNodes.splice(idx, 1)
        WfPanel.removeParamForm()
    }
    
    removeArrowByIndex(idx) {
        this.arrowNodes.splice(idx, 1)
    }
    
    removeArrow(arrowStruct) {
        const idx = this.arrowNodes.findIndex(a => a.arrow.same(arrowStruct.arrow))
        if (idx !== -1) this.removeArrowByIndex(idx)
    }
    
    // =============================================================
    //                     PARAMETER FORM
    // =============================================================

    static #paramsFormId = 'action_pars'

    static removeParamForm() {
        const parsDiv = document.getElementById(WfPanel.#paramsFormId)
        parsDiv.replaceChildren()
    }

    static buildParamForm(params) {
        const parsDiv = document.getElementById(WfPanel.#paramsFormId)
        const newChildren = []
        const fields = {}
        for (const attr in params) {
            //console.log('buildParamForm ',attr, ' -> ', params[attr])
            const f = WfPanel.buildInputField(attr, params[attr])
            newChildren.push(f.p)
            fields[attr] = f.input
            //if (attr === "name") nameField = f.input
        }
        parsDiv.replaceChildren(...newChildren)
        return fields
    }
    
    /*
     *    Build something like
     *    <p>
     *        <label class="w3-text-teal w3-small"><b>Name</b></label>
     *        <input class="w3-input w3-border" type="text">
     *    </p>
     */
    static buildInputField(name, value) {
        const p = document.createElement("p")
        
        const label = document.createElement("label")
        label.innerText = name
        const labelClasses = ["w3-text-teal", "w3-small"]
        label.classList.add(...labelClasses)
        label.style.fontWeight = 'bold'
        
        const input = document.createElement("input")
        input.type = "text" // todo other types
        if (value) input.value = value
        const inputClasses = ["w3-input", "w3-border"]
        input.classList.add(...inputClasses)
        
        p.appendChild(label)
        p.appendChild(input)
        return { p, input }
    }


    // =============================================================
    //                          SELECTORS
    // =============================================================
    
    clearActionSelections() {
        this.actionNodes.forEach(n => n.selected = false)
        WfPanel.removeParamForm()
    }
        
    clearArrowSelections() {
        this.arrowNodes.forEach(n => n.arrow.selected = false)
    }

    clearAllSelections() {
        this.clearActionSelections()
        this.clearArrowSelections()
    }
    
    selectedNode() {
        return this.actionNodes.find(n => n.selected)
    }
    
    selectedNodeIndex() {
        return this.actionNodes.findIndex(n => n.selected)
    }
    
    selectedArrow() {
        return this.arrowNodes.find(n => n.arrow.selected)
    }
    
    selectedArrowIndex() {
        return this.arrowNodes.findIndex(n => n.arrow.selected)
    }

    selectNode(node) {
        if (node) {
            if (!node.selected) {
                this.clearAllSelections()
                node.selected = true
                //console.log('selectNode() selects ', node.id)
                const inputFields = WfPanel.buildParamForm(node.params)
                this.actionNameListeners(inputFields, node)
            }
        }
        else {
            this.clearActionSelections()
        }
    }
    
    selectNodeByMouse(mouse) {
        const node = this.actionNodes.find(n => n.within(mouse.x, mouse.y))
        this.selectNode(node)
        return node
    }
    
    selectArrow(node) {
        if (node) {
            if (!node.arrow.selected) {
                this.clearAllSelections()
                node.arrow.selected = true
            }
        }
        else {
            this.clearArrowSelections()
        }
    }
    
    selectArrowByMouse(mouse) {
        const node = this.arrowNodes.find(n => n.arrow.within(mouse.x, mouse.y))
        this.selectArrow(node)
        return node
    }

    // =============================================================
    //                          HANDLERS
    // =============================================================

    mouseMoveListener() {
        this.canvas.addEventListener('mousemove', e => {
            const mouse = WfPanel.getMouseCoords(this.canvas, e)

            if (this.selectNavigation.isActive) {
                //console.log('mouseMoveListener ',this.selectNavigation)
                if (this.selectNavigation.x0 && this.selectNavigation.y0) { // the start point has been defined
                    if (this.selectNavigation.arrow) {
                        // set the end point of arrow
                        this.selectNavigation.arrow.x1 = mouse.x
                        this.selectNavigation.arrow.y1 = mouse.y
                    }
                    else {
                        // create floating arrow
                        this.selectNavigation.arrow = new Arrow(this.selectNavigation.x0, this.selectNavigation.y0, mouse.x, mouse.y)
                    }
                }
            }
            else {

                // Drag node(s)
                this.actionNodes.forEach(n => {

                    if (n.dragged) {
                        n.x = mouse.x - n.offset.x
                        n.y = mouse.y - n.offset.y
                        
                        this.arrowNodes.forEach(a => {
                            if (a.from.same(n) || a.to.same(n)) WfPanel.correctArrow(a)
                        })
                    }

                    n.active = n.within(mouse.x, mouse.y)
                })

                // Set pointer
                this.actionNodes.find(n => n.active) !== undefined ?
                    this.canvas.classList.add('wfp-pointer')
                    : this.canvas.classList.remove('wfp-pointer')
            }
        })
    }
        
    /**
     * Corrects coordinates of arrow according to new positions of connected actions.
     * @param arrowStruct `{arrow: arrow, from: action1, to: action2}`
     */
    static correctArrow(arrowStruct) {
        const {arrow: arrow, from: action1, to: action2} = arrowStruct
        const center1 = action1.center()
        const center2 = action2.center()
        const start = action1.anchorFor(center2.x, center2.y)
        const end   = action2.anchorFor(center1.x, center1.y)
        arrow.x0 = start.x
        arrow.y0 = start.y
        arrow.x1 = end.x
        arrow.y1 = end.y
    }

    mouseDownListener() {
        this.canvas.addEventListener('mousedown', e => {
            const mouse = WfPanel.getMouseCoords(this.canvas, e)
            const node = this.actionNodes.find(n => n.within(mouse.x, mouse.y))
            if (node) {
                if (this.selectNavigation.isActive) {
                    const c = node.center()
                    this.selectNavigation.x0 = c.x
                    this.selectNavigation.y0 = c.y
                    this.selectNavigation.node0 = node
                }
                else {
                    //console.log('mouseDownListener: ', ' mouse =', mouse, ' dragged=true')
                    node.dragged = true
                    node.offset = WfPanel.getOffsetCoords(mouse, node)
                }
            }
        })
    }

    mouseUpListener() {
        this.canvas.addEventListener('mouseup', e => {
            if (this.selectNavigation.isActive) {
                const mouse = WfPanel.getMouseCoords(this.canvas, e)
                const node = this.actionNodes.find(n => n.within(mouse.x, mouse.y))
                if (node && !this.selectNavigation.node0.same(node)) {
                    this.join(this.selectNavigation.node0, node)
                }
                this.resetSelectNavigation()
            }
            else {
                this.actionNodes.forEach(n => n.dragged = false)

                const mouse = WfPanel.getMouseCoords(this.canvas, e)
                const selectedNode = this.selectNodeByMouse(mouse)
                if (selectedNode === undefined) this.selectArrowByMouse(mouse)
            }
        })
    }
    
    keyPressListener() {
        this.canvas.addEventListener('keydown', e => { // keypress does not work!
            if (e.key === 'Delete') {
                const actIdx = this.selectedNodeIndex()
                if (actIdx !== -1) {
                    this.removeNodeByIndex(actIdx)
                }
                else {
                    const arrIdx = this.selectedArrowIndex()
                    if (arrIdx !== -1) this.removeArrowByIndex(arrIdx)
                }
            }
        })
    }
    
    actionNameListeners(inputFields, actionNode) {
        for (const attr in inputFields) {
            const inputField = inputFields[attr]
            inputField.addEventListener('input', e => {
                actionNode.params[attr] = e.target.value
            })
        }
    }

    // =============================================================
    //                          UTILITIES
    // =============================================================

    static getMouseCoords(canvas, event) {
        const canvasCoords = canvas.getBoundingClientRect()
        return {
            x: event.pageX - canvasCoords.left,
            y: event.pageY - canvasCoords.top
        }
    }
    
    static getOffsetCoords(mouse, rect) {
        return {
            x: mouse.x - rect.x,
            y: mouse.y - rect.y
        }
    }
    
    static disableNavButtons(flag) {
        const buttons = document.getElementsByClassName('nav-button')
        for (const b of buttons) {
            if (flag) JsUtils.addClassElement(b, 'w3-disabled')
            else JsUtils.removeClassElement(b, 'w3-disabled')
        }
    }
        
    printNodes() {
        console.log(`Total of ${this.actionNodes.length} actions`)
        for (const a of this.actionNodes) {
            console.log('   ', a.id)
        }
        console.log(`Total of ${this.arrowNodes.length} arrows`)
        for (const a of this.arrowNodes) {
            console.log('   ', a)
        }
    }

    // =============================================================
    //                          MAIN LOOP
    // =============================================================

    animate() {
        this.redraw();
        window.requestAnimationFrame(() => this.animate())
    }
}
