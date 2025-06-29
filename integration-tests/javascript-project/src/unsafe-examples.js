// This file contains various innerHTML violations that should be caught by the plugin

function updateContent() {
    const element = document.getElementById('content');
    const userInput = getUserInput();
    
    // Basic innerHTML assignment - should be flagged
    element.innerHTML = userInput;
}

function renderTemplate() {
    const container = document.querySelector('.container');
    const template = `<div class="card">${getTitle()}</div>`;
    
    // Template literal innerHTML assignment - should be flagged  
    container.innerHTML = template;
}

function insertHtml() {
    const div = document.createElement('div');
    
    // String literal innerHTML assignment - should be flagged
    div.innerHTML = '<p>Hello <script>alert("xss")</script></p>';
    
    document.body.appendChild(div);
}

function dynamicContent() {
    const elements = document.querySelectorAll('.dynamic');
    const htmlContent = fetchHtmlFromApi();
    
    elements.forEach(el => {
        // Variable innerHTML assignment - should be flagged
        el.innerHTML = htmlContent;
    });
}

function complexExample() {
    // Chained property access - should be flagged
    document.getElementById('test').innerHTML = generateComplexHtml();
}

// Helper functions
function getUserInput() {
    return '<img src="x" onerror="alert(1)">';
}

function getTitle() {
    return 'User Title <script>evil()</script>';
}

function fetchHtmlFromApi() {
    return '<div>API content <script>malicious()</script></div>';
}

function generateComplexHtml() {
    return '<div onclick="badStuff()">Click me</div>';
}