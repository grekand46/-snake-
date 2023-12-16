export default {
    aspect_ratio: 5 / 3,
    canvas: document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    layers: [],
    init: function() {
        document.body.appendChild(this.canvas);
        this.resize_svg();
        this.layers[0] = this.group();
        this.canvas.appendChild(this.layers[0]);
    },
    clear: function(layer) {
        layer ||= 0;
        if(!this.layers[layer]) return;
        this.layers[layer].textContent = "";
    },
    resize_svg: function() {
        this.canvas.setAttribute("width", window.innerWidth);
        this.canvas.setAttribute("height", window.innerHeight);
    },
    add: function(component, layer) {
        layer ||= 0;
        if(!this.layers[layer]) {
            this.layers[layer] = this.group();
            this.canvas.appendChild(this.layers[layer]);
        }
        this.layers[layer].appendChild(component);
    },
    get_width: function() {
        return this.canvas.getAttribute("width");
    },
    get_height: function() {
        return this.canvas.getAttribute("height");
    },
    get_aspect_ratio: function() {
        return this.get_width() / this.get_height();
    },
    from_screen_space: function({x, y}) {
        const offset_x = this.get_width() / 2;
        const offset_y = this.get_height() / 2;
        let zoom = Math.min(this.get_width(), this.get_height()) / 2;
        return {
            x: x * zoom + offset_x,
            y: -y * zoom + offset_y
        };
    },
    from_length: function(l) {
        let zoom = Math.min(this.get_width(), this.get_height()) / 2;
        return l * zoom;
    },
    square: function(position, side_length) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const position_tranformed = this.from_screen_space(position);
        const length_transformed = this.from_length(side_length);
        rect.setAttribute("width", length_transformed);
        rect.setAttribute("height", length_transformed);
        rect.setAttribute("x", position_tranformed.x - length_transformed / 2);
        rect.setAttribute("y", position_tranformed.y - length_transformed / 2);
        return rect;
    },
    rect: function(corner1, corner2) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const corner1_transformed = this.from_screen_space(corner1);
        const corner2_transformed = this.from_screen_space(corner2);
        const rect_pos = {
            x: Math.min(corner1_transformed.x, corner2_transformed.x),
            y: Math.min(corner1_transformed.y, corner2_transformed.y),
        }
        const rect_width = Math.abs(corner1_transformed.x - corner2_transformed.x);
        const rect_height = Math.abs(corner1_transformed.y - corner2_transformed.y);
        
        rect.setAttribute("width", rect_width);
        rect.setAttribute("height", rect_height);
        rect.setAttribute("x", rect_pos.x);
        rect.setAttribute("y", rect_pos.y);
        return rect;
    },
    text: function(position, content, size) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const position_tranformed = this.from_screen_space(position);
        const text_size = this.from_length(size);
        text.textContent = content;
        text.setAttribute("x", position_tranformed.x);
        text.setAttribute("y", position_tranformed.y);
        text.setAttribute("font-size", `${text_size}px`);
        return text;
    },
    group: function() {
        return document.createElementNS("http://www.w3.org/2000/svg", "g");
    }
};