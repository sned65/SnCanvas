// Based on Finn Eggers's answer from https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
class Arrow {
    
    static #id = 0
    static #nextId() {
        ++Arrow.#id
        return Arrow.#id
    }

    constructor(x0, y0, x1, y1, width = 1, head_width = 8, head_length = 10) {
        this.id = Arrow.#nextId()
        this.x0 = x0
        this.y0 = y0
        this.x1 = x1
        this.y1 = y1
        this.width = width
        this.head_width = head_width
        this.head_length = head_length
        this.color = 'green'
        this.selectedColor = 'brown'
        this.selected = false
    }
    
    same(other) {
        return this.id === other.id
    }
    
    within(x, y) {
        if (x < this.x0 && x < this.x1) return false
        if (x > this.x0 && x > this.x1) return false
        if (y < this.y0 && y < this.y1) return false
        if (y > this.y0 && y > this.y1) return false
        const d = Arrow.distance(this.x0, this.y0, this.x1, this.y1, x, y)
        return d < 5
    }
    
    /**
     * Distance between the line defined by two points (x0,y0) and (x1,y1)
     * and the point (x,y).
     */
    static distance(x0, y0, x1, y1, x, y) {
        const a = Math.abs((x-x0)*(y1-y0) - (y-y0)*(x1-x0))
        const b = Math.sqrt((x1-x0)**2 + (y1-y0)**2)
        return a / b
    }

    draw(context) {
        const color = this.selected ? this.selectedColor : this.color
        Arrow.draw(context, this.x0, this.y0, this.x1, this.y1, this.width, this.head_width, this.head_length, color)
    }

    static transform(xy, angle, xy0) {
        // put x and y relative to x0 and y0 so we can rotate around that
        const rel_x = xy[0] - xy0[0];
        const rel_y = xy[1] - xy0[1];
    
        // compute rotated relative points
        const new_rel_x = Math.cos(angle) * rel_x - Math.sin(angle) * rel_y;
        const new_rel_y = Math.sin(angle) * rel_x + Math.cos(angle) * rel_y;
    
        return [xy0[0] + new_rel_x, xy0[1] + new_rel_y];
    }
    
    static draw(context, x0, y0, x1, y1, width, head_width, head_length, color) {
        // compute length first
        const length = Math.sqrt((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0));
        let angle  = Math.atan2(y1-y0, x1-x0);
        // adjust the angle by 90 degrees since the arrow we rotate is rotated by 90 degrees
        angle -= Math.PI / 2;

        let p0 = [x0,y0];

        // order will be: p1 -> p3 -> p5 -> p7 -> p6 -> p4 -> p2
        // formulate the two base points
        let p1 = [x0 + width / 2, y0];
        let p2 = [x0 - width / 2, y0];

        // formulate the upper base points which connect the pointy end with the lengthy thing
        let p3 = [x0 + width / 2, y0 + length - head_length];
        let p4 = [x0 - width / 2, y0 + length - head_length];

        // formulate the outter points of the triangle
        let p5 = [x0 + head_width / 2, y0 + length - head_length];
        let p6 = [x0 - head_width / 2, y0 + length - head_length];

        // end point of the arrow
        let p7 = [x0, y0 + length];

        p1 = Arrow.transform(p1,angle,p0);
        p2 = Arrow.transform(p2,angle,p0);
        p3 = Arrow.transform(p3,angle,p0);
        p4 = Arrow.transform(p4,angle,p0);
        p5 = Arrow.transform(p5,angle,p0);
        p6 = Arrow.transform(p6,angle,p0);
        p7 = Arrow.transform(p7,angle,p0);

        context.save()
        // move to start first
        context.moveTo(p1[0], p1[1]);
        context.beginPath();
        // start drawing the lines
        context.lineTo(p3[0], p3[1]);
        context.lineTo(p5[0], p5[1]);
        context.lineTo(p7[0], p7[1]);
        context.lineTo(p6[0], p6[1]);
        context.lineTo(p4[0], p4[1]);
        context.lineTo(p2[0], p2[1]);
        context.lineTo(p1[0], p1[1]);
        context.closePath();
        context.arc(x0, y0, width/2, angle-Math.PI, angle);
        context.fillStyle = color;
        context.fill();
        context.restore()
    }
}