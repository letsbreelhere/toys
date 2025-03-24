import pygame

def lam(var, expr):
  return { "type": "lambda", "var": var, "expr": expr }

def app(expr1, expr2):
  return { "type": "app", "expr1": expr1, "expr2": expr2 }

def var(name):
  return { "type": "var", "name": name }

DIAGRAM_GAP = 50
MARGIN = 20

"""
A tromp diagram is given by a list of line components along with a bounding box size.
The output of the diagram is the bottom left corner of the bounding box.

Lambdas are represented by lines above the body of the diagram. Bound variables emanate from their binding lambda.
Applications are represented by horizontal lines connecting the outputs of the two components.
For both lambdas and applications, the size of the diagram is the size of the body of the diagram plus a gap.

We must track free variables in the diagram specially; once a lambda abstraction is introduce, we add a line to connect the lambda abstraction to the free variable.
"""

def draw_tromp(expr, origin = (0, 0), lambda_heights = {}):
  match expr:
    case { "type": "lambda", "var": var, "expr": expr }:
      lambda_heights[var] = origin[1]
      (bbox, lines) = draw_tromp(expr, (origin[0], origin[1] + DIAGRAM_GAP), lambda_heights)
      lines.append((origin[0], origin[1], origin[0] + bbox[2] + DIAGRAM_GAP, origin[1]))
      return ((origin[0], origin[1], bbox[2], bbox[3]), lines)

    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      (bbox1, lines1) = draw_tromp(expr1, origin, lambda_heights)
      (bbox2, lines2) = draw_tromp(expr2, (bbox1[0] + bbox1[2] + DIAGRAM_GAP, origin[1]), lambda_heights)
      lines = lines1 + lines2
      # Add line connecting bottom lefts of the two boxes
      print(f"Connecting {bbox1} to {bbox2}")
      lines.append((bbox1[0], bbox1[1], bbox2[0], bbox1[1]))
      # Add a small output line from bottom left down GAP pixels
      lines.append((bbox1[0], bbox1[3], bbox1[0], bbox1[3] + DIAGRAM_GAP))
      bbox = (bbox1[0], bbox1[1], bbox2[2], max(bbox1[3], bbox2[3]) + DIAGRAM_GAP)
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
      return ((ox, origin[1] + DIAGRAM_GAP, ox, origin[1] + DIAGRAM_GAP), lines)

if __name__ == "__main__":
  # S combinator λx.λy.λz.x z (y z)
  s_com = lam("x", lam("y", lam("z", app(app(var("x"), var("z")), app(var("y"), var("z"))))))
  k_com = lam("x", lam("y", var("x")))
  i_com = lam("x", var("x"))

  omega = lam("x", app(var("x"), var("x")))

  test_expr = lam("f", lam("x", app(app(var("f"), var("f")), var("x"))))
  # Get diagram lines and size
  (bbox, lines) = draw_tromp(test_expr)

  print(bbox)
  print(lines)


  pygame.init()
  width = 640
  height = 480
  screen = pygame.display.set_mode((width, height))
  pygame.display.set_caption("Tromp diagrams")
  running = True

  screen.fill((255, 255, 255))

  # Draw all lines
  for x1, y1, x2, y2 in lines:
    # Scale and translate coordinates
    pygame.draw.line(screen, (0, 0, 0), (x1 + MARGIN, y1 + MARGIN), (x2 + MARGIN, y2 + MARGIN), 2)

  while running:
    for event in pygame.event.get():
      if event.type == pygame.QUIT:
        running = False

    pygame.display.flip()

  pygame.quit()
