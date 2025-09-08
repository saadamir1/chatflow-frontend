'use client';

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LOGIN_MUTATION } from "../../graphql/operations";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthForms.css";
import { useToast } from "../common/ToastProvider";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "admin@gmail.com",
    password: "123456",
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const getErrorMessage = (error: any) => {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message;
    }
    return error.message;
  };

  const [loginMutation] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      console.log('Login successful:', data);
      login(data.login);
      setIsLoading(false);
      showSuccess('Signed in successfully');
      // Redirect after a short delay to ensure token is set
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    },
    onError: (error) => {
      console.error("Login error:", error);
      setErrors({ submit: getErrorMessage(error) });
      setIsLoading(false);
      showError('Sign in failed');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    loginMutation({
      variables: {
        loginInput: {
          email: formData.email,
          password: formData.password,
        },
      },
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
          <div className="auth-link">
            New user? <Link href="/register">Register here</Link>
          </div>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account?{" "}
            <Link href="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
          <p>
            <Link href="/admin-bootstrap" className="auth-link">
              Bootstrap Admin Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
