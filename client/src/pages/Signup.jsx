import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AuthLayout from '../components/AuthLayout';
import useAuthStore from '../store/useAuthStore';
import { signup } from '../services/authService';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Signup = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, isBootstrapping } = useAuthStore();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, isBootstrapping, navigate]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await signup(data);
      setAuth(response.data);
      toast.success('Account created — welcome!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  if (isBootstrapping) return null;

  return (
    <AuthLayout title="Create your account" subtitle="Start collaborating in minutes">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input label="Full name" autoComplete="name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          Get started
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-theme-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;
