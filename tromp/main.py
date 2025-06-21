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
      # If the bound variable v appears free in inner, we need to rename it
      if v in get_free_vars(inner):
        new_var = v + "'"
        new_body = substitute(body, v, var(new_var))
        return lam(new_var, substitute(new_body, var, inner))
      return lam(v, substitute(body, var, inner))
    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      return app(substitute(expr1, var, inner), substitute(expr2, var, inner))
    case _:
      raise Exception(f"Unknown expression type: {expr}")

def rename_bound_var(expr, old_var, new_var, seen = False):
  match expr:
    case { "type": "var", "name": name }:
      return var(new_var if name == old_var else name)
    case { "type": "lambda", "var": v, "expr": body }:
      if v == old_var:
        if seen:
          return expr
        else:
          return lam(new_var, rename_bound_var(body, old_var, new_var, True))
      return lam(v, rename_bound_var(body, old_var, new_var, seen))
    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      return app(rename_bound_var(expr1, old_var, new_var, seen), rename_bound_var(expr2, old_var, new_var, seen))
    case _:
      return expr

def rename_var(expr, old_var, new_var):
  match expr:
    case { "type": "var", "name": name }:
      if name == old_var:
        return var(new_var)
      return expr
    case { "type": "lambda", "var": v, "expr": body }:
      if v == old_var:
        return expr # Skip renaming bound variables
      return lam(v, rename_var(body, old_var, new_var))
    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      return app(rename_var(expr1, old_var, new_var), rename_var(expr2, old_var, new_var))
    case _:
      raise Exception(f"Unknown expression type: {expr}")

def alpha_equivalent(expr1, expr2):
  match (expr1, expr2):
    case ({ "type": "var", "name": name1 }, { "type": "var", "name": name2 }):
      return name1 == name2
    case ({ "type": "lambda", "var": v1, "expr": body1 }, { "type": "lambda", "var": v2, "expr": body2 }):
      # For lambda expressions, we rename both bound variables to a fresh variable
      # and compare the bodies
      fresh_var = "fresh_" + str(len(get_free_vars(body1) | get_free_vars(body2)))
      new_body1 = substitute(body1, v1, var(fresh_var))
      new_body2 = substitute(body2, v2, var(fresh_var))
      return alpha_equivalent(new_body1, new_body2)
    case ({ "type": "app", "expr1": expr1_1, "expr2": expr1_2 }, { "type": "app", "expr1": expr2_1, "expr2": expr2_2 }):
      return alpha_equivalent(expr1_1, expr2_1) and alpha_equivalent(expr1_2, expr2_2)
    case _:
      return False

def make_all_lambda_vars_unique(expr):
  fresh_vars = {}
  def make_unique(expr):
    nonlocal fresh_vars
    match expr:
      case { "type": "lambda", "var": v, "expr": body }:
        if v not in fresh_vars:
          fresh_vars[v] = 0
          return lam(v, make_unique(body))
        fresh_vars[v] += 1
        new_var = v + str(fresh_vars[v])
        # Use rename_bound_var instead of rename_var to avoid infinite recursion
        return lam(new_var, make_unique(rename_bound_var(body, v, new_var, False)))
      case { "type": "app", "expr1": expr1, "expr2": expr2 }:
        return app(make_unique(expr1), make_unique(expr2))
      case _:
        return expr
  return make_unique(expr)

def get_free_vars(expr):
  match expr:
    case { "type": "var", "name": name }:
      return {name}
    case { "type": "lambda", "var": v, "expr": body }:
      return get_free_vars(body) - {v}
    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      return get_free_vars(expr1) | get_free_vars(expr2)
    case _:
      raise Exception(f"Unknown expression type: {expr}")

def beta_reduce_step(expr):
  match expr:
    case { "type": "app", "expr1": { "type": "lambda", "var": var, "expr": body }, "expr2": expr2 }:
      # This is a redex - we can reduce it
      return substitute(body, var, expr2)

    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      # Try reducing the left side first (normal order reduction)
      reduced_expr1 = beta_reduce_step(expr1)
      if not alpha_equivalent(reduced_expr1, expr1):
        return app(reduced_expr1, expr2)

      # If left side is in normal form, try reducing the right side
      reduced_expr2 = beta_reduce_step(expr2)
      if not alpha_equivalent(reduced_expr2, expr2):
        return app(expr1, reduced_expr2)

      # If we get here, both sides are in normal form
      return expr

    case { "type": "lambda", "var": v, "expr": body }:
      return expr

    case { "type": "var" }:
      # Variables are already in normal form
      return expr

    case _:
      raise Exception(f"Unknown expression type: {expr}")

def is_redex(expr):
  """Check if an expression contains any redexes (sub-expressions that can be reduced)"""
  match expr:
    case { "type": "var" }:
      return False
    case { "type": "lambda", "expr": body }:
      return is_redex(body)
    case { "type": "app", "expr1": { "type": "lambda" }, "expr2": _ }:
      # Direct application of lambda to argument - this is a redex
      return True
    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      # Check both components for redexes
      return is_redex(expr1) or is_redex(expr2)
    case _:
      return False

def beta_reduce(expr):
  loc_expr = make_all_lambda_vars_unique(expr)

  # First yield the initial expression
  yield loc_expr

  while True:
    # Check if there are any redexes to reduce
    if not is_redex(loc_expr):
      # No redexes - we've reached normal form
      return

    # Perform one step of reduction
    reduced = beta_reduce_step(loc_expr)

    # If no changes, we're done
    if alpha_equivalent(reduced, loc_expr):
      return

    # Yield the reduced expression and continue
    loc_expr = reduced
    yield loc_expr

def nth_iter(n):
  def subiter(n):
    if n == 0:
      return var("x")
    return app(var("f"), subiter(n - 1))
  return lamn(["f", "x"], subiter(n))

def pretty_print(expr):
  match expr:
    case { "type": "var", "name": name }:
      return name
    case { "type": "lambda", "var": v, "expr": body }:
      return f"λ{v}.{pretty_print(body)}"
    case { "type": "app", "expr1": expr1, "expr2": expr2 }:
      # Get the string representations
      left = pretty_print(expr1)
      right = pretty_print(expr2)

      # Add parentheses when needed
      if expr1["type"] == "lambda":
        left = f"({left})"  # Lambda in function position needs parentheses

      # Only add parentheses for right side if it's an application
      # (Lambda already extends to the right, vars don't need parens)
      if expr2["type"] == "app":
        right = f"({right})"

      return f"{left} {right}"
    case _:
      raise Exception(f"Unknown expression type: {expr}")

if __name__ == "__main__":
  s_com = lam("x", lam("y", lam("z", app(app(var("x"), var("z")), app(var("y"), var("z"))))))
  k_com = lam("x", lam("y", var("x")))
  false = lam("x", lam("y", var("y")))
  i_com = lam("x", var("x"))
  omega = lam("x", app(var("x"), var("x")))
  y_com = lam("f", app(omega, lam("x", app(var("f"), app(var("x"), var("x"))))))

  succ = lamn(["n", "f", "x"],
              appn(
                var("f"),
                appn(
                  var("n"),
                  var("f"),
                  var("x")
                )
              )
  )
  #  λn.λf.λx.n(λg.λh.h(g f))(λu.x)(λu.u)
  pred = lamn(["n", "f", "x"],
              appn(
                var("n"),
                lamn(["g", "h"], appn(var("h"), appn(var("g"), var("f")))),
                lam("u", var("x")),
                lam("u", var("u"))
              )
  )

  test_expr = y_com

  pygame.init()
  width = 1920
  height = 1080
  screen = pygame.display.set_mode((width, height))
  pygame.display.set_caption("Tromp diagrams")
  running = True
  font = pygame.font.Font(None, 24)

  def draw_expr(expr):
    canvas = pygame.Surface((width - MARGIN*2, height - MARGIN*2))
    canvas.fill((255, 255, 255))
    blit_tromp(expr, canvas)
    return canvas

  screen.fill((255, 255, 255))
  reduction_generator = beta_reduce(test_expr)
  current_expr = next(reduction_generator)
  last_update_time = pygame.time.get_ticks()
  update_interval = 100
  is_final_expr = False

  while running:
    for event in pygame.event.get():
      if event.type == pygame.QUIT:
        running = False

    current_time = pygame.time.get_ticks()
    if current_time - last_update_time >= update_interval:
      try:
        next_expr = next(reduction_generator)
        current_expr = next_expr
        is_final_expr = False
        last_update_time = current_time
      except StopIteration:
        # If we've reached the end of reductions, mark as final
        is_final_expr = True
        # Don't restart immediately - keep showing the final version in green

    screen.fill((255, 255, 255))

    # Draw the expression with green strokes if it's the final one
    if is_final_expr:
      # We need a custom draw function for the final expression
      canvas = pygame.Surface((width - MARGIN*2, height - MARGIN*2))
      canvas.fill((255, 255, 255))

      # Temporarily change LINE_THICKNESS for the final expression
      original_thickness = LINE_THICKNESS
      (bbox, lines) = draw_tromp(current_expr)

      # Draw lines in green
      for line in lines:
        pygame.draw.line(canvas, (0, 128, 0), (line[0], line[1]), (line[2], line[3]), LINE_THICKNESS)

      screen.blit(canvas, (0, 0))
    else:
      screen.blit(draw_expr(current_expr), (0, 0))

    pygame.display.flip()

  pygame.quit()
