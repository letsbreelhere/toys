import pygame
import random
from parse import parse

DIAGRAM_GAP = (15, 10)
MARGIN = 15
LINE_THICKNESS = 4

def lam(var, expr):
  return { "type": "lambda", "var": var, "expr": expr }

def lamn(vars, expr):
  if len(vars) == 0:
    return expr
  return lam(vars[0], lamn(vars[1:], expr))

def app(expr1, expr2):
  return { "type": "app", "expr1": expr1, "expr2": expr2 }

def appn(*exprs):
  if len(exprs) == 0:
    raise Exception("No arguments to application")
  if len(exprs) == 1:
    return exprs[0]
  return app(appn(*exprs[:-1]), exprs[-1])

def var(name):
  return { "type": "var", "name": name }

"""
A tromp diagram is given by a list of line components along with a bounding box size.
The output of the diagram is the bottom left corner of the bounding box.

Lambdas are represented by lines above the body of the diagram. Bound variables emanate from their binding lambda.
Applications are represented by horizontal lines connecting the outputs of the two components.
For both lambdas and applications, the size of the diagram is the size of the body of the diagram plus a gap.

We must track free variables in the diagram specially; once a lambda abstraction is introduce, we add a line to connect the lambda abstraction to the free variable.
"""

class BBox:
  @staticmethod
  def from_points(top_left, bottom_right):
    return BBox(top_left[0], top_left[1], bottom_right[0] - top_left[0], bottom_right[1] - top_left[1])

  def __init__(self, x, y, width, height):
    self.x = x
    self.y = y
    self.width = width
    self.height = height

  def top_left(self):
    return (self.x, self.y)

  def bottom_right(self):
    return (self.x + self.width, self.y + self.height)


def draw_tromp(expr, origin = (MARGIN, MARGIN), lambda_heights = {}):
  match expr:
    case { "type": "lambda", "var": var, "expr": expr }:
      lambda_heights[var] = origin[1]
      (bbox, lines) = draw_tromp(expr, (origin[0], origin[1] + DIAGRAM_GAP[1]), lambda_heights)
      # Draw line over the lambda abstraction
      lines.append((origin[0], origin[1], bbox.x + bbox.width + DIAGRAM_GAP[0]/2, origin[1]))
      return (bbox, lines)

    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      (bbox1, lines1) = draw_tromp(expr1, origin, lambda_heights)
      (bbox2, lines2) = draw_tromp(expr2, (bbox1.x + bbox1.width + DIAGRAM_GAP[0], origin[1]), lambda_heights)
      lines = lines1 + lines2

      # Add line connecting bottom lefts of the two boxes
      max_y = max(bbox1.y + bbox1.height, bbox2.y + bbox2.height)
      lines.append((bbox1.x, max_y, bbox2.x + LINE_THICKNESS/2, max_y))
      # Since this might be below the existing lines, add a vertical to the left to compensate
      lines.append((bbox1.x, bbox1.y, bbox1.x, max_y))
      # Same for expr2
      lines.append((bbox2.x, bbox2.y, bbox2.x, max_y))

      # Add a small output line from bottom left down GAP pixels
      lines.append((bbox1.x, max_y, bbox1.x, max_y + DIAGRAM_GAP[1]))
      top_left = (bbox1.x, bbox1.y)
      bottom_right = (bbox2.x + bbox2.width, max_y + DIAGRAM_GAP[1])
      bbox = BBox.from_points(top_left, bottom_right)
      return (bbox, lines)

    case { "type": "var", "name": name }:
      # Find name in lambda_heights and draw a line from origin to the lambda line
      lambda_line = lambda_heights[name]

      if lambda_line is None:
        raise Exception(f"Free variable {name} not found")
      ox = origin[0] + DIAGRAM_GAP[0]/2
      lines = [(ox, lambda_line, ox, origin[1])]
      return (BBox(ox, origin[1], 0, 0), lines)
    case _:
      raise Exception(f"Unknown expression type: {expr}")

def blit_tromp(expr, surface):
  (bbox, lines) = draw_tromp(expr)
  for line in lines:
    pygame.draw.line(surface, (0,0,0), (line[0], line[1]), (line[2], line[3]), LINE_THICKNESS)
  return bbox

def substitute(expr, var, inner):
  match expr:
    case { "type": "var", "name": name }:
      if name == var:
        return inner
      return expr
    case { "type": "lambda", "var": v, "expr": body }:
      if v == var:
        return expr
      return lam(v, substitute(body, var, inner))
    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      return app(substitute(expr1, var, inner), substitute(expr2, var, inner))
    case _:
      raise Exception(f"Unknown expression type: {expr}")

def beta_reduce_step(expr):
  match expr:
    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      if expr1["type"] == "lambda":
        var = expr1["var"]
        body = expr1["expr"]
        return substitute(body, var, expr2)
      return app(beta_reduce_step(expr1), beta_reduce_step(expr2))
    case _:
      return expr

def beta_reduce(expr):
  while True:
    reduced = beta_reduce_step(expr)
    if reduced == expr:
      return expr

def nth_iter(n):
  def subiter(n):
    if n == 0:
      return var("x")
    return app(var("f"), subiter(n - 1))
  return lamn(["f", "x"], subiter(n))

if __name__ == "__main__":
  s_com = lam("x", lam("y", lam("z", app(app(var("x"), var("z")), app(var("y"), var("z"))))))
  k_com = lam("x", lam("y", var("x")))
  false = lam("x", lam("y", var("y")))
  i_com = lam("x", var("x"))
  omega = lam("x", app(var("x"), var("x")))
  y_com = lam("f", app(omega, lam("x", app(var("f"), app(var("x"), var("x"))))))

  #  λn.λf.λx.n(λg.λh.h(g f))(λu.x)(λu.u)
  pred = lamn(["n", "f", "x"],
              appn(
                var("n"),
                lamn(["g", "h"], appn(var("h"), appn(var("g"), var("f")))),
                lam("u", var("x")),
                lam("u", var("u"))
              )
  )

  test_expr = pred

  pygame.init()
  width = 640
  height = 480
  screen = pygame.display.set_mode((width, height))
  pygame.display.set_caption("Tromp diagrams")
  running = True
  font = pygame.font.Font(None, 24)

  canvas = pygame.Surface((width - MARGIN*2, height - MARGIN*2))
  canvas.fill((255, 255, 255))
  blit_tromp(test_expr, canvas)

  line_index = 0
  screen.fill((255, 255, 255))
  while running:
    for event in pygame.event.get():
      if event.type == pygame.QUIT:
        running = False

    mouse_pos = pygame.mouse.get_pos()
    screen.blit(canvas, (0, 0))

    pygame.display.flip()

  pygame.quit()
