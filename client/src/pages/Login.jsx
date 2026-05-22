import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AuthLayout from '../components/AuthLayout';
import useAuthStore from '../store/useAuthStore';
import { login } from '../services/authService';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, isBootstrapping } = useAuthStore();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, isBootstrapping, navigate]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      setAuth(response.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  if (isBootstrapping) return null;

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your workspace">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-theme-muted">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
