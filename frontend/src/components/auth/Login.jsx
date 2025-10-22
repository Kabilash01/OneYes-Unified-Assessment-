import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import MinimalFooter from '../common/MinimalFooter';

/**
 * Login validation schema
 */
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

/**
 * Login Component
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    console.log('🚀 Login form submitted');
    console.log('📧 Email:', values.email);
    
    const result = await login(values);
    console.log('📬 Login result:', result);
    
    if (result.success) {
      // Redirect based on role
      const role = result.user.role;
      console.log('✅ Login successful! User role:', role);
      
      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => {
        if (role === 'student') {
          console.log('🎓 Redirecting to student dashboard...');
          navigate('/student/dashboard', { replace: true });
        } else if (role === 'instructor') {
          console.log('👨‍🏫 Redirecting to instructor dashboard...');
          navigate('/instructor/dashboard', { replace: true });
        } else if (role === 'admin') {
          console.log('👨‍💼 Redirecting to admin dashboard...');
          navigate('/admin-dashboard', { replace: true });
        } else {
          console.log('🏠 Redirecting to home...');
          navigate('/', { replace: true });
        }
      }, 100); // Small delay to ensure state updates propagate
    } else {
      console.log('❌ Login failed:', result.error);
      setError(result.error);
    }
    
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">UA</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-700 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-card">
                <div className="space-y-4">
                  <Field name="email">
                    {({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        label="Email Address"
                        placeholder="john@example.com"
                        error={touched.email && errors.email}
                        required
                      />
                    )}
                  </Field>

                  <Field name="password">
                    {({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        error={touched.password && errors.password}
                        required
                      />
                    )}
                  </Field>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Sign In
                </Button>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      
      <MinimalFooter />
    </div>
  );
};

export default Login;
