const code = (sketch) => {
  const createPoint = (x = 0, y = 0) => {
    const point = sketch.createP();
    point.style("z-index", "9999");
    point.style("position", "fixed");

    const px = x + 110 > sketch.width ? x - 110 : x + 10;
    const py = y + 50 > sketch.height ? y - 50 : y + 10;
    point.style("left", `${px}px`);
    point.style("top", `${py}px`);

    point.style("color", "#000");
    point.style("font-size", "12px");
    point.style("font-family", "monospace");
    point.style("font-weight", "bold");
    point.style("padding", "10px 15px");
    point.style("border-radius", "5px");
    point.style("background-color", "rgba(255, 255, 255, 0.7)");

    point.html(`${x}, ${y}`);
    point.x = x;
    point.y = y;
    return point;
  };

  const deletePoint = (point) => {
    point.style("display", "none");
    point.remove();
  };

  const points = [];
  const mousePoint = createPoint();
  let showMousePoint = true;
  let hoveringPoint = null;

  sketch.setup = () => {
    const canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    const body = sketch.select("body");
    body.style("user-select", "none");
    canvas.parent(body);

    body.style("margin", "0");
    body.style("padding", "0");
    canvas.style("z-index", "9999");
    canvas.style("position", "fixed");
    canvas.style("top", "0");
    canvas.style("left", "0");
  };
  sketch.draw = () => {
    sketch.clear();
    sketch.background(0, 0);
    sketch.strokeWeight(1);

    sketch.stroke(255);
    sketch.fill(255, 0);
    sketch.drawingContext.setLineDash([5, 5]);
    sketch.line(0, sketch.mouseY, sketch.width, sketch.mouseY);
    sketch.line(sketch.mouseX, 0, sketch.mouseX, sketch.height);
    sketch.drawingContext.setLineDash([]);

    sketch.stroke(255, 0, 0);
    sketch.ellipse(sketch.mouseX, sketch.mouseY, 20, 20);
    sketch.stroke(255);

    showMousePoint = true;
    hoveringPoint = null;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      sketch.stroke(255);
      // drawing crosshair
      sketch.stroke(255, 0, 0);
      sketch.line(p1.x, p1.y - 10, p1.x, p1.y + 10);
      sketch.line(p1.x - 10, p1.y, p1.x + 10, p1.y);
      sketch.stroke(255);

      if (sketch.dist(p1.x, p1.y, sketch.mouseX, sketch.mouseY) < 10) {
        showMousePoint = false;
        hoveringPoint = p1;
      }
      for (let j = 0; j < points.length; j++) {
        const p2 = points[j];
        // drawing lines between all points
        sketch.line(p1.x, p1.y, p2.x, p2.y);
      }
    }
    // drawing mouse point
    if (showMousePoint) {
      mousePoint.style("display", "block");
      mousePoint.html(`${sketch.mouseX}, ${sketch.mouseY}`);
      const cx =
        sketch.mouseX + 110 > sketch.width
          ? sketch.mouseX - 110
          : sketch.mouseX + 10;
      const cy =
        sketch.mouseY + 50 > sketch.height
          ? sketch.mouseY - 50
          : sketch.mouseY + 10;
      mousePoint.style("left", `${cx}px`);
      mousePoint.style("top", `${cy}px`);
    } else {
      mousePoint.style("display", "none");
    }

    // drawing distance between points
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];
        const distance = sketch.dist(p1.x, p1.y, p2.x, p2.y);

        const angle =
          p1.x <= p2.x
            ? sketch.atan2(p2.y - p1.y, p2.x - p1.x)
            : sketch.atan2(p1.y - p2.y, p1.x - p2.x);

        const textX = (p1.x + p2.x) / 2 - 10;
        const textY = (p1.y + p2.y) / 2 - 10;

        sketch.fill(255);
        sketch.noStroke();
        sketch.textSize(12);
        sketch.textAlign(sketch.CENTER, sketch.CENTER);

        sketch.push();
        sketch.translate(textX, textY);
        sketch.rotate(angle);

        sketch.text(distance.toFixed(2), 0, 0);
        sketch.pop();
      }
    }
  };

  sketch.mousePressed = () => {
    // if (points.length >= 25) {
    //   deletePoint(points.shift());
    // }
    if (showMousePoint) {
      points.push(createPoint(sketch.mouseX, sketch.mouseY));
    }
  };

  sketch.mouseDragged = () => {
    if (!showMousePoint && hoveringPoint) {
      hoveringPoint.x = sketch.mouseX;
      hoveringPoint.y = sketch.mouseY;
      hoveringPoint.html(`${sketch.mouseX}, ${sketch.mouseY}`);
      const px =
        sketch.mouseX + 110 > sketch.width
          ? sketch.mouseX - 110
          : sketch.mouseX + 10;
      const py =
        sketch.mouseY + 50 > sketch.height
          ? sketch.mouseY - 50
          : sketch.mouseY + 10;
      hoveringPoint.style("left", `${px}px`);
      hoveringPoint.style("top", `${py}px`);
    }
  };

  sketch.keyPressed = () => {
    switch (sketch.keyCode) {
      case sketch.DELETE:
        const last = points.pop();
        deletePoint(last);
        break;
      case sketch.ESCAPE:
        if (points.length !== 0) {
          points.forEach(deletePoint);
          points.length = 0;
        } else {
          sketch.remove();
          sketch = null;
          console.log("'Distance Between' sketch removed");
        }
        break;
    }
  };

  sketch.windowResized = () => {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
  };
};

let sketch = null;

chrome.runtime.onMessage.addListener(() => {
  if (sketch) {
    sketch.remove();
    sketch = null;
    console.log("'Distance Between' sketch removed");
  } else {
    sketch = new p5(code);
    console.log("'Distance Between' sketch started");
  }
});
