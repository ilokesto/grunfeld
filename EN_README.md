Language : EN | [KR](./README.md)

# Grunfeld

Grunfeld is a **simple and intuitive dialog management library for React applications**. You can implement modals, alerts, and confirmation dialogs with just a few lines of code, without complex state management.

## ✨ Key Features

- 🚀 **Simple API** – Ready to use without complex setup
- 🎯 **Sync/Async Support** – Handles everything from alerts to user input
- 📱 **Flexible Positioning** – Precisely place dialogs using a 9-grid system
- 🔄 **Smart Stack Management** – Logically manages dialogs in LIFO order
- ⚡ **Top-layer Support** – Utilizes native `<dialog>` elements
- 🎨 **Fully Customizable** – Freely style and control behavior

## 📦 Installation

```bash
npm install grunfeld
# or
yarn add grunfeld
```

## 🚀 Quick Start

### 1. Provider Setup

Add `GrunfeldProvider` at the top level of your app:

```tsx
import { GrunfeldProvider } from "grunfeld";

function App() {
  return <GrunfeldProvider>{/* app content */}</GrunfeldProvider>;
}
```

### 2. Basic Usage

```tsx
import { grunfeld } from "grunfeld";

function MyComponent() {
  const showAlert = () => {
    // Simple alert - void return (no return value)
    grunfeld.add(() => <div>Hello!</div>);
  };

  return <button onClick={showAlert}>Show Alert</button>;
}
```

### 3. Getting User Response

```tsx
const showConfirm = async () => {
  const result = await grunfeld.add<boolean>((removeWith) => ({
    element: (
      <div>
        <p>Are you sure you want to delete?</p>
        <button onClick={() => removeWith(true)}>Confirm</button>
        <button onClick={() => removeWith(false)}>Cancel</button>
      </div>
    ),
  }));

  if (result) {
    console.log("User clicked confirm");
  } else {
    console.log("User clicked cancel");
  }
};
```

## 📖 Main Usage Patterns

### Alert Dialog

If you omit the type parameter, it works as a simple alert that doesn't wait for a response:

```tsx
// Basic alert – return a React element directly
grunfeld.add(() => (
  <div
    style={{
      padding: "20px",
      background: "white",
      borderRadius: "8px",
      textAlign: "center",
    }}
  >
    <p>Save completed!</p>
    <button onClick={() => grunfeld.remove()}>OK</button>
  </div>
));
```

### Confirmation Dialog

A confirmation dialog that waits for the user's choice:

```tsx
const confirmed = await grunfeld.add<boolean>((removeWith) => ({
  element: (
    <div
      style={{
        padding: "20px",
        background: "white",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <p>Are you sure you want to delete?</p>
      <div>
        <button onClick={() => removeWith(true)}>Delete</button>
        <button onClick={() => removeWith(false)}>Cancel</button>
      </div>
    </div>
  ),
}));

if (confirmed) {
  console.log("User confirmed deletion");
  // Execute delete logic
} else {
  console.log("User canceled");
}
```

### Input Dialog

A dialog to receive input from the user:

```tsx
const InputModal = ({ onClose }: { onClose: (name: string) => void }) => {
  const [name, setName] = useState("");

  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        borderRadius: "8px",
        minWidth: "300px",
      }}
    >
      <h2>Enter your name</h2>
      <input
        autoFocus
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && name.trim() && onClose(name.trim())
        }
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <div>
        <button
          onClick={() => name.trim() && onClose(name.trim())}
          disabled={!name.trim()}
          style={{ marginRight: "10px" }}
        >
          Confirm
        </button>
        <button onClick={() => onClose("")}>Cancel</button>
      </div>
    </div>
  );
};

export default function GrunfeldPage() {
  return (
    <button
      onClick={async () => {
        const value = await grunfeld.add<string>((removeWith) => ({
          element: <InputModal onClose={removeWith} />,
        }));
        console.log(value);
      }}
    >
      Test Button
    </button>
  );
}
```

### Async Handling

You can perform async operations when creating a dialog:

```tsx
const result = await grunfeld.add<string>(async (removeWith) => {
  // Show loading
  const loadingElement = (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>Loading user info...</p>
      <div>⏳</div>
    </div>
  );

  // Show loading dialog first
  setTimeout(() => {
    // After loading data, update content
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        // To update UI after successful load,
        // create a new dialog or use state management
      })
      .catch(() => {
        removeWith("Load failed");
      });
  }, 100);

  return {
    element: loadingElement,
  };
});

// More practical example: selection list
const selectedItem = await grunfeld.add<string>(async (removeWith) => {
  const items = await fetch("/api/items").then((res) => res.json());

  return {
    element: (
      <div style={{ padding: "20px", minWidth: "250px" }}>
        <h3>Select an item</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item: any) => (
            <li key={item.id}>
              <button
                onClick={() => removeWith(item.name)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "4px",
                  textAlign: "left",
                }}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => removeWith("")}>Cancel</button>
      </div>
    ),
  };
});
```

## ⚙️ Configuration Options

### Provider Options

```tsx
<GrunfeldProvider
  options={{
    defaultPosition: "center",           // Default position
    defaultLightDismiss: true,           // Dismiss on backdrop click
    defaultRenderMode: "inline",         // Render mode
    defaultBackdropStyle: {              // Default backdrop style
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    }
  }}
>
```

### Per-dialog Options

```tsx
grunfeld.add(() => ({
  element: <MyDialog />,
  position: "top-right", // Position (9-grid)
  lightDismiss: false, // Disable backdrop click
  renderMode: "top-layer", // Top-layer rendering
  backdropStyle: {
    // Custom backdrop
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(5px)",
  },
  dismissCallback: () => {
    // Function to run when dialog closes
    console.log("Dialog closed");
  },
}));

// Styling example
grunfeld.add(() => ({
  element: (
    <>
      <h2>🎉 Congratulations!</h2>
      <p>The operation was successful.</p>
      <button onClick={() => grunfeld.remove()}>OK</button>
    </>
  ),
  position: "center",
  backdropStyle: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    backdropFilter: "blur(8px)",
  },
}));
```

## 📍 Positioning System

You can place dialogs precisely using a 9-grid system:

```
top-left     | top-center     | top-right
center-left  | center         | center-right
bottom-left  | bottom-center  | bottom-right
```

> **Note:** : The center position can be specified as either center or center-center.

**Usage Example:**

```tsx
// Centered – both work the same
grunfeld.add(() => ({
  element: <Modal />,
  position: "center", // or "center-center"
}));

// Top-right notification
grunfeld.add(() => ({
  element: <Notification />,
  position: "top-right",
}));

// Bottom action sheet
grunfeld.add(() => ({
  element: <ActionSheet />,
  position: "bottom-center",
}));
```

## 🎨 Render Modes

### Inline Rendering (default)

- Stable with z-index
- Supported by all browsers
- Flexible customization
- ESC key handled by JavaScript

### Top-layer Rendering

- Uses native <dialog> element
- No z-index conflicts
- Native ESC key handling by browser
- Supported only in modern browsers (Chrome 37+, Firefox 98+, Safari 15.4+)

```tsx
grunfeld.add(() => ({
  element: <MyDialog />,
  renderMode: "top-layer", // Use native dialog
}));
```

## 🛠 대화상자 제거

```tsx
// Remove the most recent dialog
grunfeld.remove();

// Remove all dialogs
grunfeld.clear();

// Close with ESC key
// Or by clicking the backdrop if lightDismiss: true
```

Dialogs are removed in LIFO (Last In First Out) order to maintain contextual relationships between dialogs.

### Promise Interruption Handling

If you forcibly close a dialog with `grunfeld.remove()` or `grunfeld.clear()`, the Promise for that dialog resolves to `undefined`:

```tsx
// When a promise is in progress and the dialog is removed externally
const promise = grunfeld.add<boolean>((removeWith) => ({
  element: (
    <div>
      <p>Are you sure?</p>
      <button onClick={() => removeWith(true)}>Yes</button>
      <button onClick={() => removeWith(false)}>No</button>
    </div>
  ),
}));

// Remove the dialog from somewhere else
setTimeout(() => {
  grunfeld.remove(); // promise resolves to undefined
}, 1000);

const result = await promise; // result is undefined
if (result === undefined) {
  console.log("Dialog was interrupted");
} else if (result) {
  console.log("User selected Yes");
} else {
  console.log("User selected No");
}
```

**Practical Example:**

```tsx
const showConfirmWithTimeout = async () => {
  const confirmPromise = grunfeld.add<boolean>((removeWith) => ({
    element: (
      <div>
        <p>Please respond within 10 seconds. Do you confirm?</p>
        <button onClick={() => removeWith(true)}>Confirm</button>
        <button onClick={() => removeWith(false)}>Cancel</button>
      </div>
    ),
  }));

  // Remove automatically after 10 seconds
  const timeoutId = setTimeout(() => {
    grunfeld.remove(); // Promise resolves to undefined
  }, 10000);

  const result = await confirmPromise;
  clearTimeout(timeoutId); // Clear timer if user responds

  if (result === undefined) {
    console.log("Dialog closed due to timeout");
  } else if (result) {
    console.log("User selected Confirm");
  } else {
    console.log("User selected Cancel");
  }
};
```

This behavior prevents memory leaks and solves the hanging Promise problem. All Promises are properly cleaned up, so you can use them safely.

## 🎯 Real-world Example

### Complete Component Example

```tsx
import React, { useState } from "react";
import { grunfeld, GrunfeldProvider } from "grunfeld";

function MyApp() {
  const [message, setMessage] = useState("");

  const showNotification = () => {
    grunfeld.add(() => ({
      element: <div>Notification displayed!</div>,
      position: "top-right",
    }));

    // Remove automatically after 2 seconds
    setTimeout(() => grunfeld.remove(), 2000);
  };

  const showConfirm = async () => {
    const result = await grunfeld.add<boolean>((removeWith) => ({
      element: (
        <div
          style={{ padding: "20px", background: "white", borderRadius: "8px" }}
        >
          <h3>Confirm</h3>
          <p>Are you sure you want to proceed?</p>
          <button onClick={() => removeWith(true)}>Yes</button>
          <button onClick={() => removeWith(false)}>No</button>
        </div>
      ),
    }));

    setMessage(result ? "Confirmed" : "Canceled");
  };

  const showInput = async () => {
    const input = await grunfeld.add<string>((removeWith) => ({
      element: <InputDialog onSubmit={removeWith} />,
    }));

    setMessage(input ? `Input: ${input}` : "Canceled");
  };

  return (
    <GrunfeldProvider>
      <div style={{ padding: "20px" }}>
        <h1>Grunfeld Example</h1>
        <button onClick={showNotification}>Show Notification</button>
        <button onClick={showConfirm}>Confirmation Dialog</button>
        <button onClick={showInput}>Input Dialog</button>
        <p>Status: {message}</p>
      </div>
    </GrunfeldProvider>
  );
}

const InputDialog = ({ onSubmit }: { onSubmit: (value: string) => void }) => {
  const [value, setValue] = useState("");

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "8px" }}>
      <h3>Input</h3>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
        autoFocus
      />
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => onSubmit(value)}>Confirm</button>
        <button onClick={() => onSubmit("")}>Cancel</button>
      </div>
    </div>
  );
};
```

## 📋 API Reference

### `grunfeld.add<T>(dialogFactory)`

**Two overloads:**

1. **Simple alerts (no parameters):**
   - `grunfeld.add(() => React.ReactNode | GrunfeldProps): void`
   - Executes immediately with no return value (synchronous)
2. **Get user response (with parameters):**
   - `grunfeld.add<T>((removeWith: (data: T) => void) => GrunfeldProps): Promise<T>`
   - Waits for user response (asynchronous)

**Usage Example:**

```tsx
// 1. Simple alert - no return value
grunfeld.add(() => <div>Simple alert</div>);

// With options
grunfeld.add(() => ({
  element: <div>Alert with position</div>,
  position: "top-right",
  lightDismiss: false,
}));

// 2. Get user response - returns Promise
const result = await grunfeld.add<boolean>((removeWith) => ({
  element: (
    <div>
      <p>Are you sure?</p>
      <button onClick={() => removeWith(true)}>Yes</button>
      <button onClick={() => removeWith(false)}>No</button>
    </div>
  ),
}));

// Get string input
const input = await grunfeld.add<string>((removeWith) => ({
  element: <InputForm onSubmit={removeWith} />,
}));
```

      <p>Are you sure?</p>
      <button onClick={() => removeWith(true)}>Yes</button>
      <button onClick={() => removeWith(false)}>No</button>
    </div>

),
}));

````

**GrunfeldProps:**

```typescript
{
  element: React.ReactNode;              // Content to display
  position?: Position;                   // Position (default: "center")
  lightDismiss?: boolean;                // Dismiss on backdrop click (default: true)
  backdropStyle?: React.CSSProperties;   // Backdrop style
  dismissCallback?: () => unknown;       // Function to run when dialog closes (do NOT call grunfeld.remove() here)
  renderMode?: "inline" | "top-layer";   // Render mode
}
````

**⚠️ Important:** `dismissCallback` runs when the dialog is removed, so do NOT call `grunfeld.remove()` or `grunfeld.clear()` inside it. To make an auto-dismissing alert, use setTimeout after creating the dialog:

```tsx
// ❌ Wrong way
grunfeld.add(() => ({
  element: <div>Alert</div>,
  dismissCallback: () => {
    setTimeout(() => grunfeld.remove(), 2000); // Risk of infinite loop
  },
}));

// ✅ Correct way
grunfeld.add(() => ({
  element: <div>Alert</div>,
}));
setTimeout(() => grunfeld.remove(), 2000);
```

### `grunfeld.remove()`

Removes the most recent dialog.

### `grunfeld.clear()`

Removes all dialogs.

### Position Type

```typescript
type PositionX = "left" | "center" | "right";
type PositionY = "top" | "center" | "bottom";

type Position = `${PositionY}-${PositionX}` | "center";
```

## 🌐 Browser Compatibility

**Inline rendering:** All modern browsers + IE 11+
**Top-layer rendering:** Chrome 37+, Firefox 98+, Safari 15.4+, Edge 79+
