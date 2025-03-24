import pygame
import random
from parse import parse

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

def parse_lambda(str):
  """
  Parse a lambda expression from a string using unicode lambdas or backslashes.
  E.g.:
  parse_lambda("λx.λy.λz.(x z)(y z)") ==
  parse_lambda("\\x.\\y.\\z.(x z)(y z)") ==
  lam("x", lam("y", lam("z", app(app(var("x"), var("z")), app(var("y"), var("z"))))))
  """
  # Replace unicode lambda with backslash
  str = str.replace("λ", "\\")

  # If str is a single variable, return a var
  if str.isalpha():
    return var(str)

  attempt_lam = parse("\\{var}.{expr}", str)
  if attempt_lam:
    return lam(attempt_lam["var"], parse_lambda(attempt_lam["expr"]))

  attempt_parens = parse("({expr})", str)
  if attempt_parens:
    return parse_lambda(attempt_parens["expr"])

  # Must be an application; first try with spaces, then parens around one or both
  attempt_app = parse("{expr1} {expr2}", str)
  if attempt_app:
    return app(parse_lambda(attempt_app["expr1"]), parse_lambda(attempt_app["expr2"]))

  attempt_parens = parse("({expr1}){expr2}", str)
  if attempt_parens:
    return app(parse_lambda(attempt_parens["expr1"]), parse_lambda(attempt_parens["expr2"]))

  attempt_parens = parse("{expr1}({expr2})", str)
  if attempt_parens:
    return app(parse_lambda(attempt_parens["expr1"]), parse_lambda(attempt_parens["expr2"]))

  raise Exception(f"Failed to parse lambda expression: {str}")


DIAGRAM_GAP = 25
MARGIN = 20

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


def draw_tromp(expr, origin = (0, 0), lambda_heights = {}):
  match expr:
    case { "type": "lambda", "var": var, "expr": expr }:
      lambda_heights[var] = origin[1]
      (bbox, lines) = draw_tromp(expr, (origin[0], origin[1] + DIAGRAM_GAP), lambda_heights)
      # Draw line over the lambda abstraction
      lines.append((origin[0], origin[1], bbox.x + bbox.width + DIAGRAM_GAP/2, origin[1]))
      return (bbox, lines)

    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      (bbox1, lines1) = draw_tromp(expr1, origin, lambda_heights)
      (bbox2, lines2) = draw_tromp(expr2, (bbox1.x + bbox1.width + DIAGRAM_GAP, origin[1]), lambda_heights)
      lines = lines1 + lines2

      # Add line connecting bottom lefts of the two boxes
      min_bottom_left_y = min(bbox1.y + bbox1.height, bbox2.y + bbox2.height)
      max_bottom_left_y = max(bbox1.y + bbox1.height, bbox2.y + bbox2.height)
      lines.append((bbox1.x, max_bottom_left_y, bbox2.x, max_bottom_left_y))
      # Since this might be below the existing lines, add a vertical to the left to compensate
      lines.append((bbox1.x, origin[1], bbox1.x, max_bottom_left_y))
      # Same for expr2
      lines.append((bbox2.x, origin[1], bbox2.x, max_bottom_left_y))

      # Add a small output line from bottom left down GAP pixels
      lines.append((bbox1.x, max_bottom_left_y, bbox1.x, max_bottom_left_y + DIAGRAM_GAP))
      top_left = (bbox1.x, bbox1.y)
      bottom_right = (bbox2.x + bbox2.width + DIAGRAM_GAP, max_bottom_left_y + DIAGRAM_GAP)
      bbox = BBox.from_points(top_left, bottom_right)
      return (bbox, lines)

    case { "type": "var", "name": name }:
      # Find name in lambda_heights and draw a line from origin to the lambda line
      lambda_line = lambda_heights[name]
      if lambda_line is None:
        raise Exception(f"Free variable {name} not found")
      ox = origin[0] + DIAGRAM_GAP/2
      lines = [(ox, lambda_line, ox, origin[1])]
      # As with app, add a small output line from bottom left down GAP pixels
      lines.append((ox, origin[1], ox, origin[1] + DIAGRAM_GAP))
      return (BBox(ox, origin[1] + DIAGRAM_GAP, 0, 0), lines)
    case _:
      raise Exception(f"Unknown expression type: {expr}")

if __name__ == "__main__":
  # S combinator λx.λy.λz.x z (y z)
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

  # Get diagram lines and size
  (bbox, lines) = draw_tromp(test_expr)

  pygame.init()
  width = 640
  height = 480
  screen = pygame.display.set_mode((width, height))
  pygame.display.set_caption("Tromp diagrams")
  running = True
  font = pygame.font.Font(None, 24)

  canvas = pygame.Surface((width - MARGIN*2, height - MARGIN*2))
  canvas.fill((255, 255, 255))

  line_index = 0
  screen.fill((255, 255, 255))
  while running:
    for event in pygame.event.get():
      if event.type == pygame.QUIT:
        running = False

    for line in lines:
      x1, y1, x2, y2 = line
      pygame.draw.line(canvas, (0,0,0), (x1 + MARGIN, y1 + MARGIN), (x2 + MARGIN, y2 + MARGIN), 2)

    mouse_pos = pygame.mouse.get_pos()
    # Hover coords over cursor
    hover_x = mouse_pos[0] + 0.5*MARGIN
    hover_y = mouse_pos[1] - MARGIN
    text = font.render(f"({hover_x}, {hover_y})", True, (0, 0, 0))
    screen.fill((255, 255, 255))
    screen.blit(canvas, (MARGIN, MARGIN))
    screen.blit(text, (hover_x, hover_y))

    pygame.display.flip()

  pygame.quit()
