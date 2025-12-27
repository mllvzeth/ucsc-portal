import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  RadioGroup,
  type RadioOption,
} from '@/ui';

export const Route = createFileRoute('/demo')({ component: DemoPage });

function DemoPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions: RadioOption[] = [
    { value: 'student', label: 'Student' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'admin', label: 'Administrator' },
    { value: 'staff', label: 'Staff' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(`Form submitted! Email: ${email}, Role: ${selectedRole}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          UI Component Library Demo
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          WCAG 2.1 AA compliant components built with Tailwind CSS
        </p>

        {/* Buttons Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Buttons</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Button Variants */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button isLoading>Loading...</Button>
                  <Button disabled>Disabled</Button>
                  <Button fullWidth>Full Width Button</Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Form Components */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Form Components</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text Input */}
              <Input
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                helpText="We'll never share your email with anyone"
                required
              />

              {/* Password Input */}
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                helpText="Must be at least 8 characters"
                required
              />

              {/* Radio Group */}
              <RadioGroup
                name="role"
                legend="Select your role"
                options={roleOptions}
                value={selectedRole}
                onChange={setSelectedRole}
                required
              />

              {/* Checkbox */}
              <Checkbox
                id="terms"
                label="I agree to the terms and conditions"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
              />
            </form>
          </CardBody>
          <CardFooter>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEmail('');
                  setPassword('');
                  setAgreedToTerms(false);
                  setSelectedRole('student');
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={!agreedToTerms || !email || !password}
              >
                Submit Form
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Cards Section */}
        <Card className="mb-8" hoverable>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">
              Hoverable Card Example
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-700">
              This card has a hover effect. Try hovering over it to see the shadow
              change. Cards can be used to group related content and provide visual
              hierarchy.
            </p>
          </CardBody>
          <CardFooter>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last updated: Today</span>
              <Button size="sm" variant="outline">
                Learn More
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Accessibility Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardBody>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">
                  WCAG 2.1 AA Compliance
                </h3>
                <p className="mt-2 text-sm text-blue-800">
                  All components meet WCAG 2.1 AA accessibility standards with proper
                  focus indicators, color contrast ratios (4.5:1+), keyboard
                  navigation, and screen reader support.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
