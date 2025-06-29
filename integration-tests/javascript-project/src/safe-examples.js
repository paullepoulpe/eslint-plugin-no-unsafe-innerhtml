// This file shows correct usage that should NOT be flagged by the plugin
import {setElementInnerHtml} from 'safevalues/dom';
import {sanitizeHtml} from 'safevalues';

function safeUpdateContent() {
    const element = document.getElementById('content');
    const userInput = getUserInput();
    
    // Safe usage with safevalues - should NOT be flagged
    setElementInnerHtml(element, sanitizeHtml(userInput));
}

function safeTextContent() {
    const element = document.getElementById('text');
    const plainText = getPlainText();
    
    // Using textContent is safe - should NOT be flagged
    element.textContent = plainText;
}

function otherProperties() {
    const element = document.getElementById('test');
    
    // Other properties are allowed - should NOT be flagged
    element.id = 'newId';
    element.className = 'newClass';
    element.setAttribute('data-value', 'test');
}

function readingInnerHTML() {
    const element = document.getElementById('content');
    
    // Reading innerHTML is safe - should NOT be flagged
    const content = element.innerHTML;
    console.log('Current content:', content);
    
    return content;
}

// Helper functions
function getUserInput() {
    return '<img src="x" onerror="alert(1)">';
}

function getPlainText() {
    return 'This is safe plain text content';
}