"use client";
import Link from "next/link";

import { Button } from "t/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "t/components/ui/card";
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { api } from 'techme/trpc/react';


const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

export function LoginForm() {
  const mutation = api.login.verifyUser.useMutation();

  const handleLogin = async (values: any) => {
    try {
      const response = await mutation.mutateAsync(values);
      if (response) {
        // Handle successful login, e.g., redirect to dashboard
        window.location.href = `/dashboard/${response.role?.toLowerCase()}`;
      }
    } catch (error) {
      // Handle login error
      console.error('Login failed:', error);
    }
  };
  return (
      <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Field
                  id="username"
                  name="username"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.username && touched.username ? (
                  <div className="text-red-600 text-sm">{errors.username}</div>
                ) : null}
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.password && touched.password ? (
                  <div className="text-red-600 text-sm">{errors.password}</div>
                ) : null}
              </div>
              <Button type="submit" variant="default" className="w-full my-10">
                Login
              </Button>
            </Form>
          )}
        </Formik>
  );
}
