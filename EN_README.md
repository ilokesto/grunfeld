# Grunfeld

## Features

- 🚀 **Simple API**: Manage dialogs with just a few lines of code, without complex state management.
- 🎯 **Sync/Async Support**: Supports all scenarios, from simple alerts to confirmation dialogs that require user response.
- 📱 **Flexible Positioning**: Easily adjust dialog position for various UI patterns, such as center modals or bottom sheets.
- 🔄 **Smart Stack Management**: Dialogs are managed in a logical LIFO (Last In First Out) stack order.
- 🎨 **Custom Styling**: Freely customize everything from the backdrop to individual dialog styles.
- 👆 **Intuitive UX**: Features like light dismiss (close on backdrop click) and auto-focus for a better user experience.

Grunfeld is a lightweight and easy-to-use dialog manager library for React applications.

## Installation

```bash
npm install grunfeld
# or
yarn add grunfeld
```

## Usage

### Basic Setup

Add `GrunfeldProvider` at the top level of your application. This component provides context and renders all dialogs:

```tsx
import { GrunfeldProvider } from "grunfeld";

function App() {
  return (
    <GrunfeldProvider
      options={{
        defaultPosition: "center",
        defaultLightDismiss: true,
        backdropStyle: {
          /* custom backdrop style */
        },
      }}
    >
      {/* Application content */}
    </GrunfeldProvider>
  );
}
```

### Showing a Basic Dialog

Use this for simple information or interactions:

```tsx
import { grunfeld } from "grunfeld";

function YourComponent() {
  const showDialog = () => {
    grunfeld.add({
      element: <div>Hello!</div>,
      position: "center",
      lightDismiss: true,
    });
  };

  return <button onClick={showDialog}>Open Dialog</button>;
}
```

### Async Dialog (Waiting for User Response)

Use this when you need to wait for user input. Returns a Promise, so you can use async/await:

```tsx
import { grunfeld } from "grunfeld";

function YourComponent() {
  const showConfirmDialog = async () => {
    const result = await grunfeld.addAsync((removeWith) => ({
      element: (
        <div>
          <p>Are you sure you want to delete?</p>
          <button onClick={() => removeWith(true)}>Confirm</button>
          <button onClick={() => removeWith(false)}>Cancel</button>
        </div>
      ),
      position: "center",
    }));

    if (result) {
      console.log("User confirmed");
    } else {
      console.log("User cancelled");
    }
  };

  return <button onClick={showConfirmDialog}>Show Confirm Dialog</button>;
}
```

### Simple Dialog (Passing ReactNode Directly)

Quickly show a dialog by passing a JSX element or string:

```tsx
import { grunfeld } from "grunfeld";

function YourComponent() {
  const showSimpleDialog = () => {
    grunfeld.add(<div>Simple message</div>);
  };

  return <button onClick={showSimpleDialog}>Simple Dialog</button>;
}
```

### Removing Dialogs

Grunfeld manages dialogs as a stack. This preserves the **contextual relationship** between dialogs.

For example, if dialog B is opened from dialog A, B should be closed before A. It would be illogical for B to close A directly. Therefore, `remove()` always closes the most recently opened dialog first (LIFO principle).

```tsx
import { grunfeld } from "grunfeld";

// Remove the most recent dialog
grunfeld.remove();

// Remove all dialogs at once
grunfeld.clear();
```

## API Reference

### GrunfeldProvider

| Prop     | Type                    | Default  | Description           |
| -------- | ----------------------- | -------- | --------------------- |
| children | ReactNode               | required | Child components      |
| options  | GrunfeldProviderOptions | -        | Default configuration |

#### GrunfeldProviderOptions

| Prop                | Type                 | Default  | Description                   |
| ------------------- | -------------------- | -------- | ----------------------------- |
| defaultPosition     | 'center' \| 'bottom' | 'center' | Default dialog position       |
| defaultLightDismiss | boolean              | true     | Default light dismiss setting |
| backdropStyle       | CSSProperties        | -        | Custom backdrop style         |

### grunfeld object

#### `grunfeld.add(dialog)`

Adds a new dialog.

**Parameter:**

- `dialog: GrunfeldProps` - Dialog configuration

**GrunfeldProps:**

```typescript
type GrunfeldProps =
  | {
      element: React.ReactNode;
      position?: "center" | "bottom";
      lightDismiss?: boolean;
      dismissCallback?: () => unknown;
    }
  | React.ReactNode;
```

#### `grunfeld.addAsync<T>(dialog)`

Adds an async dialog and waits for user response.

**Parameter:**

- `dialog: (removeWith: (data: T) => T) => GrunfeldProps` - Dialog factory function

**Returns:**

- `Promise<T>` - Resolves with the data passed to `removeWith`

#### `grunfeld.remove()`

Removes the most recently added dialog.

This method follows the **LIFO (Last In First Out)** principle. When multiple dialogs are open, the most recently opened dialog is always closed first. This preserves the logical context between dialogs: for example, if dialog B was opened from dialog A, B should be closed before A. It would be unnatural for B to close A directly.

```tsx
// Example: If dialogs are opened in the order A → B → C
grunfeld.remove(); // Closes C
grunfeld.remove(); // Closes B
grunfeld.remove(); // Closes A
```

#### `grunfeld.clear()`

Removes all dialogs at once.

Use this for emergencies or when you need to clean up all dialogs (e.g., on page navigation). If any dialog has a `dismissCallback`, it will be called before removal.

## Advanced Usage

### Custom dismiss callback

If you need to run logic when a dialog closes (cleanup, state update, analytics, etc.), use `dismissCallback`:

```tsx
grunfeld.add({
  element: <MyDialog />,
  dismissCallback: () => {
    console.log("Dialog closed");
    // Perform cleanup
  },
});
```

### Dialog Positioning

Adjust the dialog's position for different UI patterns:

```tsx
// Centered dialog
grunfeld.add({
  element: <CenterDialog />,
  position: "center",
});

// Bottom sheet style
grunfeld.add({
  element: <BottomSheet />,
  position: "bottom",
});
```
