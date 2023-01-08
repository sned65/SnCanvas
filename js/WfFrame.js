'use strict'

const grid = new Grid()
const wfPanel = new WfPanel(grid)
window.onresize = () => wfPanel.resize()
wfPanel.resize()
wfPanel.animate()
