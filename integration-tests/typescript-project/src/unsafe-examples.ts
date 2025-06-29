// TypeScript examples of unsafe innerHTML usage that should be caught

interface User {
  name: string;
  email: string;
}

class ComponentRenderer {
  private container: HTMLElement;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  // Unsafe: Direct innerHTML assignment with user data
  renderUser(user: User): void {
    const template = `<div class="user">
      <h3>${user.name}</h3>
      <p>${user.email}</p>
    </div>`;
    this.container.innerHTML = template; // Should be flagged
  }

  // Unsafe: innerHTML with potentially unsafe content
  renderHtml(htmlContent: string): void {
    this.container.innerHTML = htmlContent; // Should be flagged
  }
}

// Unsafe: Traditional DOM manipulation
function updateContent(element: HTMLElement, content: string): void {
  element.innerHTML = content; // Should be flagged
}

// Unsafe: Generic function with any type
function displayData(target: any, data: any): void {
  target.innerHTML = data; // Should be flagged
}

// Unsafe: Arrow function with destructured parameters
const renderTemplate = (element: HTMLDivElement, { title, body }: { title: string, body: string }) => {
  element.innerHTML = `<h1>${title}</h1><p>${body}</p>`; // Should be flagged
};

// Unsafe: Method in interface implementation
interface Renderer {
  render(element: HTMLElement, content: string): void;
}

class UnsafeRenderer implements Renderer {
  render(element: HTMLElement, content: string): void {
    element.innerHTML = content; // Should be flagged
  }
}

// Unsafe: Using querySelector result
function updateById(id: string, content: string): void {
  const el = document.querySelector(`#${id}`) as HTMLElement;
  if (el) {
    el.innerHTML = content; // Should be flagged
  }
}

// Export to prevent TypeScript unused variable warnings
export { ComponentRenderer, updateContent, displayData, renderTemplate, UnsafeRenderer, updateById };