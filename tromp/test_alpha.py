import pytest
from main import var, lam, app, alpha_equivalent

def test_var_equivalence():
    assert alpha_equivalent(var("x"), var("x"))
    assert not alpha_equivalent(var("x"), var("y"))

def test_lambda_equivalence():
    # Same variable names
    assert alpha_equivalent(
        lam("x", var("x")),
        lam("x", var("x"))
    )

    # Different variable names but same structure
    assert alpha_equivalent(
        lam("x", var("x")),
        lam("y", var("y"))
    )

    # Different structures
    assert not alpha_equivalent(
        lam("x", var("x")),
        lam("x", var("y"))
    )

    # Test with nested lambdas and potential variable capture
    assert alpha_equivalent(
        lam("x", lam("y", app(var("x"), var("y")))),
        lam("y", lam("x", app(var("y"), var("x"))))
    )

    # Test with free variables and bound variables with same names
    assert alpha_equivalent(
        lam("x", app(var("x"), var("z"))),
        lam("y", app(var("y"), var("z")))
    )

    # Test with shadowing
    assert alpha_equivalent(
        lam("x", lam("x", var("x"))),
        lam("y", lam("z", var("z")))
    )

def test_application_equivalence():
    # Same structure
    assert alpha_equivalent(
        app(var("x"), var("y")),
        app(var("x"), var("y"))
    )

    # Different structures
    assert not alpha_equivalent(
        app(var("x"), var("y")),
        app(var("y"), var("x"))
    )

    # Test with lambda expressions
    assert alpha_equivalent(
        app(lam("x", var("x")), var("y")),
        app(lam("z", var("z")), var("y"))
    )

def test_nested_expressions():
    # Complex nested lambda expressions
    expr1 = lam("x", lam("y", app(var("x"), var("y"))))
    expr2 = lam("a", lam("b", app(var("a"), var("b"))))
    assert alpha_equivalent(expr1, expr2)

    # Different structures in nested expressions
    expr3 = lam("x", lam("y", app(var("y"), var("x"))))
    assert not alpha_equivalent(expr1, expr3)

def test_mixed_types():
    # Different types should not be equivalent
    assert not alpha_equivalent(var("x"), lam("x", var("x")))
    assert not alpha_equivalent(var("x"), app(var("x"), var("y")))
    assert not alpha_equivalent(lam("x", var("x")), app(var("x"), var("y")))
