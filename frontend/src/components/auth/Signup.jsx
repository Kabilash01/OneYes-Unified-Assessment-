import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';

/**
 * Signup validation schema
 */
const signupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string()
    .oneOf(['student', 'instructor'], 'Invalid role')
    .required('Please select a role'),
  instituteCode: Yup.string().optional(),
});

/**
 * Signup Component
 */
const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    const { confirmPassword, ...userData } = values;
    
    const result = await register(userData);
    
    if (result.success) {
      // Redirect based on role
      const role = result.user.role;
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/');
    } else {
      setError(result.error);
    }
    
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">UA</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join our assessment platform
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-700 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'student',
            instituteCode: '',
          }}
          validationSchema={signupSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-card">
              <div className="space-y-4">
                <Field name="name">
                  {({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="Full Name"
                      placeholder="John Doe"
                      error={touched.name && errors.name}
                      required
                    />
                  )}
                </Field>

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

                <Field name="confirmPassword">
                  {({ field }) => (
                    <Input
                      {...field}
                      type="password"
                      label="Confirm Password"
                      placeholder="••••••••"
                      error={touched.confirmPassword && errors.confirmPassword}
                      required
                    />
                  )}
                </Field>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    I am a <span className="text-danger-500">*</span>
                  </label>
                  <Field name="role">
                    {({ field }) => (
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            {...field}
                            type="radio"
                            value="student"
                            checked={field.value === 'student'}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            Student
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            {...field}
                            type="radio"
                            value="instructor"
                            checked={field.value === 'instructor'}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            Instructor
                          </span>
                        </label>
                      </div>
                    )}
                  </Field>
                  {touched.role && errors.role && (
                    <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                      {errors.role}
                    </p>
                  )}
                </div>

                <Field name="instituteCode">
                  {({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="Institute Code (Optional)"
                      placeholder="e.g., INST001"
                      error={touched.instituteCode && errors.instituteCode}
                    />
                  )}
                </Field>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Account
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Sign in
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signup;
