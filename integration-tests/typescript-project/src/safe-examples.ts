// TypeScript examples of safe patterns that should NOT be flagged
import { setElementInnerHtml } from 'safevalues/dom';
import { sanitizeHtml } from 'safevalues';

interface User {
  name: string;
  email: string;
}

class SafeComponentRenderer {
  private container: HTMLElement;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  // Safe: Using textContent for plain text
  renderUserName(user: User): void {
    const nameElement = document.createElement('div');
    nameElement.textContent = user.name; // Safe - textContent
    this.container.appendChild(nameElement);
  }

  // Safe: Using safevalues library
  renderUserSafe(user: User): void {
    const template = `<div class="user">
      <h3>${user.name}</h3>
      <p>${user.email}</p>
    </div>`;
    setElementInnerHtml(this.container, sanitizeHtml(template)); // Safe - using safevalues
  }

  // Safe: Reading innerHTML (not assignment)
  getCurrentContent(): string {
    return this.container.innerHTML; // Safe - reading, not writing
  }

  // Safe: Setting other properties
  setId(id: string): void {
    this.container.id = id; // Safe - not innerHTML
  }

  // Safe: Setting attributes
  setAttribute(name: string, value: string): void {
    this.container.setAttribute(name, value); // Safe - not innerHTML
  }
}

// Safe: Using textContent
function updateTextContent(element: HTMLElement, text: string): void {
  element.textContent = text; // Safe - textContent
}

// Safe: Creating elements programmatically
function createSafeElement(tag: string, content: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = content; // Safe - textContent
  return element;
}

// Safe: Using template literals for other purposes
function generateCssClass(prefix: string, suffix: string): string {
  const className = `${prefix}-${suffix}`;
  return className; // Safe - not related to innerHTML
}

// Safe: Assigning to variables (not DOM properties)
let innerHTML = '<p>This is just a variable</p>'; // Safe - variable, not DOM property

// Safe: Method parameters named innerHTML
function processHtml(innerHTML: string): string {
  return innerHTML.trim(); // Safe - parameter, not assignment
}

// Safe: Non-Element objects with innerHTML property should not trigger
interface CustomObject {
  innerHTML: string;
  customProperty: boolean;
}

class NonElementWithInnerHTML {
  innerHTML: string = '';
  
  updateContent(content: string): void {
    this.innerHTML = content; // Safe - not a DOM Element type
  }
}

function updateCustomObject(obj: CustomObject, content: string): void {
  obj.innerHTML = content; // Safe - not a DOM Element type
}

// Safe: Plain objects with innerHTML property
const plainObject = {
  innerHTML: '',
  otherProperty: 42
};

function updatePlainObject(content: string): void {
  plainObject.innerHTML = content; // Safe - not a DOM Element type
}


// Export to prevent TypeScript unused variable warnings
export { 
  SafeComponentRenderer, 
  updateTextContent, 
  createSafeElement, 
  generateCssClass, 
  innerHTML, 
  processHtml,
  NonElementWithInnerHTML,
  updateCustomObject,
  plainObject,
  updatePlainObject
};