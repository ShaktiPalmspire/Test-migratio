# Step4PreviewProperties Modular Structure

This directory contains the modularized version of the Step4PreviewProperties component, breaking down the original 1500+ line component into smaller, more manageable pieces.

## Structure

```
components/
├── types/
│   └── propertyTypes.ts          # TypeScript interfaces and types
├── utils/
│   └── propertyUtils.ts          # Utility functions for property handling
├── hooks/
│   └── usePropertyHooks.ts      # Custom React hooks for state management
├── components/
│   ├── PropertyTableComponents.tsx  # Reusable UI components
│   └── AddPropertyModal.tsx        # Modal component for adding properties
├── Step4PreviewPropertiesRefactored.tsx  # Main component (reduced from 1500+ to ~500 lines)
└── index.ts                     # Export file for easy importing
```

## Files Breakdown

### Types (`types/propertyTypes.ts`)
- `ObjectKey`: Union type for object types (contacts, companies, deals, tickets)
- `PropertyItem`: Interface for property data structure
- `PreviewRow`: Interface for table row data
- `CustomPropertiesState`: Interface for custom properties state
- `PendingJsonState`: Interface for pending JSON changes
- `CreateFormState`, `EditFormState`: Form state interfaces
- `PropPoolState`, `LoadedListsState`: State management interfaces
- `CreateStatus`: Union type for creation status

### Utilities (`utils/propertyUtils.ts`)
- `slugify()`: Convert strings to URL-friendly format
- `getDisplayText()`: Extract display text from various data types
- `getPropertyLabel()`: Get property label from internal name
- `getInternalNameForLabel()`: Get internal name from label
- `validateInternalName()`: Validate internal name format
- `ensureUniqueName()`: Ensure unique property names
- `fixCorruptedProperties()`: Fix corrupted property data
- `norm()`: Normalize strings for comparison
- `getTotalPropertiesCount()`: Get total properties count for object type

### Hooks (`hooks/usePropertyHooks.ts`)
- `useCustomProperties()`: Hook for managing custom properties fetching and caching
- `usePropertyPool()`: Hook for managing property pool state and loading

### Components (`components/`)
- `PropertyTableComponents.tsx`:
  - `PropertyTable`: Main table component for displaying properties
  - `SearchBar`: Search functionality component
  - `SummarySection`: Summary statistics component
- `AddPropertyModal.tsx`:
  - `AddPropertyModal`: Modal for adding new property mappings

### Main Component (`Step4PreviewPropertiesRefactored.tsx`)
- Reduced from 1500+ lines to approximately 500 lines
- Uses all modular components and utilities
- Maintains all original functionality
- Improved readability and maintainability

## Benefits of Modularization

1. **Maintainability**: Each file has a single responsibility
2. **Reusability**: Components and utilities can be reused elsewhere
3. **Testability**: Smaller components are easier to test
4. **Readability**: Code is more organized and easier to understand
5. **Type Safety**: Better TypeScript support with dedicated type files
6. **Performance**: Better code splitting and lazy loading potential

## Usage

```typescript
// Import the main component
import { Step4PreviewProperties } from './components/Step4PreviewPropertiesRefactored';

// Or import individual pieces
import { PropertyTable, SearchBar } from './components/PropertyTableComponents';
import { useCustomProperties } from './hooks/usePropertyHooks';
import { slugify, getPropertyLabel } from './utils/propertyUtils';
```

## Migration Notes

The refactored component maintains 100% compatibility with the original component. All props, state, and functionality remain the same. The only difference is the internal structure, which is now more modular and maintainable.
