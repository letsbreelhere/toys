import pytest
from main import var, lam, app, make_all_lambda_vars_unique, get_free_vars

def test_make_unique_simple_lambda():
    # Test with a single lambda
    expr = lam("x", var("x"))
    result = make_all_lambda_vars_unique(expr)

    # The variables should be unique, but in this simple case no change is needed
    assert result["type"] == "lambda"
    assert result["var"] == "x"
    assert result["expr"]["type"] == "var"
    assert result["expr"]["name"] == "x"

def test_make_unique_nested_lambdas_same_var():
    # Test with nested lambdas with the same variable name
    expr = lam("x", lam("x", var("x")))
    result = make_all_lambda_vars_unique(expr)

    # The inner lambda variable should be renamed
    assert result == lam("x", lam("x1", var("x1")))

def test_make_unique_nested_lambdas_different_vars():
    # Test with nested lambdas with different variable names
    expr = lam("x", lam("y", app(var("x"), var("y"))))
    result = make_all_lambda_vars_unique(expr)

    # No renaming needed in this case
    assert result == lam("x", lam("y", app(var("x"), var("y"))))

def test_make_unique_multiple_same_vars():
    # Test with multiple lambdas with the same variable name
    expr = lam("x", lam("x", lam("x", var("x"))))
    result = make_all_lambda_vars_unique(expr)

    # Each nested lambda should have a unique variable
    assert result == lam("x", lam("x1", lam("x2", var("x2"))))

    expr = app(lam("x", var("x")), lam("x", var("x")))
    result = make_all_lambda_vars_unique(expr)

    # Each nested lambda should have a unique variable
    assert result == app(lam("x", var("x")), lam("x1", var("x1")))

def test_make_unique_complex_expression():
    # Test with a more complex expression
    expr = lam("f", lam("x", app(var("f"), lam("f", app(var("f"), var("x"))))))
    result = make_all_lambda_vars_unique(expr)

    # The inner "f" should be renamed to avoid shadowing
    assert result["type"] == "lambda"
    assert result["var"] == "f"
    assert result["expr"]["type"] == "lambda"
    assert result["expr"]["var"] == "x"

    # Inside the application
    app_expr = result["expr"]["expr"]
    assert app_expr["type"] == "app"
    assert app_expr["expr1"]["type"] == "var"
    assert app_expr["expr1"]["name"] == "f"  # Should refer to outermost "f"

    # The innermost lambda should have a unique variable
    inner_lambda = app_expr["expr2"]
    assert inner_lambda["type"] == "lambda"
    assert inner_lambda["var"] != "f"  # Should be renamed to something like "f1"

    # Check inner application
    inner_app = inner_lambda["expr"]
    assert inner_app["type"] == "app"
    assert inner_app["expr1"]["type"] == "var"
    assert inner_app["expr1"]["name"] == inner_lambda["var"]  # Should refer to renamed inner lambda var

def test_make_unique_preserves_free_vars():
    # Test that free variables are preserved
    expr = lam("x", app(var("x"), var("y")))  # "y" is a free variable
    result = make_all_lambda_vars_unique(expr)

    # Free variable "y" should remain unchanged
    assert result["type"] == "lambda"
    assert result["var"] == "x"
    assert result["expr"]["type"] == "app"
    assert result["expr"]["expr1"]["type"] == "var"
    assert result["expr"]["expr1"]["name"] == "x"
    assert result["expr"]["expr2"]["type"] == "var"
    assert result["expr"]["expr2"]["name"] == "y"  # Free variable should be unchanged

    # Verify free variables
    free_vars = get_free_vars(result)
    assert "y" in free_vars
    assert len(free_vars) == 1

def test_make_unique_application():
    # Test with application of lambdas that use the same variable names
    expr = app(lam("x", var("x")), lam("x", var("x")))
    result = make_all_lambda_vars_unique(expr)

    # The second x should be renamed since the function processes the entire expression
    assert result["type"] == "app"
    assert result["expr1"]["type"] == "lambda"
    assert result["expr1"]["var"] == "x"
    assert result["expr2"]["type"] == "lambda"
    assert result["expr2"]["var"] != "x"  # Should be renamed to something like "x1"
    assert result["expr2"]["expr"]["type"] == "var"
    assert result["expr2"]["expr"]["name"] == result["expr2"]["var"]  # Should reference the renamed var
