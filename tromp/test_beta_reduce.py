from main import *

# Define test expressions
omega = lam("x", app(var("x"), var("x")))
y_com = lam("f", app(omega, lam("x", app(var("f"), app(var("x"), var("x"))))))

print("Testing beta reduction for Y combinator")
print("Original Y combinator:", pretty_print(y_com))

print("\nReduction steps:")
for i, expr in enumerate(beta_reduce(y_com)):
    print(f"Step {i}: {pretty_print(expr)}")

    # Stop after 5 steps to prevent potential infinite loop
    if i >= 5:
        print("Stopping after 5 steps...")
        break

print("\nTesting beta reduction for a simple expression: (λx.x) y")
simple_expr = app(lam("x", var("x")), var("y"))
print("Original expression:", pretty_print(simple_expr))

print("\nReduction steps:")
for i, expr in enumerate(beta_reduce(simple_expr)):
    print(f"Step {i}: {pretty_print(expr)}")
