'use client';
import React from 'react';

interface StepperComponentProps {
  currentStep: number; // 1 | 2 | 3
  selectedCrmName?: string;
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, label: 'Connect CRM', description: 'Connect your source CRM and HubSpot' },
  { number: 2, label: 'Configure', description: 'Map fields and configure migration' },
  { number: 3, label: 'Preview & Migrate', description: 'Review and execute migration' },
];

export default function StepperComponent({
  currentStep,
  selectedCrmName,
  onStepClick,
}: StepperComponentProps) {
  return (
    <div className="w-full max-w-10xl mx-auto">
      {/* row 1: each step is its own equal column; connectors are drawn inside each column */}
      <div className="grid grid-cols-3 items-center">
        {steps.map((step, i) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <div key={step.number} className="relative flex items-center justify-center py-2">
              {/* left half connector (to previous step) */}
              {i > 0 && (
                <div
                  className={`absolute top-1/2 left-0 right-1/2 h-0.5 -translate-y-1/2 ${
                    i <= currentStep - 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
              {/* right half connector (to next step) */}
              {i < steps.length - 1 && (
                <div
                  className={`absolute top-1/2 left-1/2 right-0 h-0.5 -translate-y-1/2 ${
                    i < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* circle (centered in the same column that will also hold the label) */}
              <button
                type="button"
                onClick={() => onStepClick?.(step.number)}
                className={[
                  'z-10 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                    : 'bg-gray-200 text-gray-600',
                ].join(' ')}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* row 2: labels — same 3 equal columns → perfectly under each circle */}
      <div className="mt-3 grid grid-cols-3 ">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          return (
            <div key={step.number} className="text-center">
              <div
                className={`font-semibold text-sm ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {step.label}
              </div>
              <div className="text-xs text-gray-400 mt-1">{step.description}</div>
            </div>
          );
        })}
      </div>

      {selectedCrmName && (
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Currently configuring: <span className="font-semibold text-blue-600">{selectedCrmName}</span>
          </p>
        </div>
      )}
    </div>
  );
}
