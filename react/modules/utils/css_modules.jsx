
export function getComputedWidth(cssClass) {
    const tempElement = document.createElement('div');
    tempElement.className = cssClass;
    document.body.appendChild(tempElement);
    const computedStyle = window.getComputedStyle(tempElement);
    const width = computedStyle.width;
    document.body.removeChild(tempElement);
    return parseFloat(width);
}
