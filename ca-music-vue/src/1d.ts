import p5 from 'p5'
import $ from 'jquery'

const sketch = (p: p5) => {
  p.setup = () => {
    const canvas = p.createCanvas(800, 800)
    const container = $('.tab-content')[0]
    canvas.parent(container)
    p.background
  }

  p.draw = () => {
    p.background(0)
    p.stroke(255)
    p.strokeWeight(4)
    p.noFill()
    p.ellipse(p.width / 2, p.height / 2, 100, 100)
  }
}

export default sketch
