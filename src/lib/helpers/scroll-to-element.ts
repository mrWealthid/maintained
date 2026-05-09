"use client";

type ScrollToElementOptions = {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
  offset?: number;
};

function isScrollable(node: HTMLElement) {
  const style = window.getComputedStyle(node);
  const overflowY = style.overflowY;

  return (
    (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
    node.scrollHeight > node.clientHeight
  );
}

function getScrollableAncestors(element: HTMLElement) {
  const ancestors: HTMLElement[] = [];
  let current = element.parentElement;

  while (current) {
    if (isScrollable(current)) {
      ancestors.push(current);
    }
    current = current.parentElement;
  }

  return ancestors;
}

function isWithinViewport(rect: DOMRect) {
  return rect.top >= 0 && rect.bottom <= window.innerHeight;
}

function scrollAncestorToReveal(args: {
  ancestor: HTMLElement;
  element: HTMLElement;
  offset: number;
  behavior: ScrollBehavior;
}) {
  const { ancestor, element, offset, behavior } = args;
  const ancestorRect = ancestor.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const isAbove = elementRect.top < ancestorRect.top;
  const isBelow = elementRect.bottom > ancestorRect.bottom;

  if (!isAbove && !isBelow) {
    return;
  }

  const nextTop =
    ancestor.scrollTop + (elementRect.top - ancestorRect.top) - offset;

  ancestor.scrollTo({
    top: Math.max(0, nextTop),
    behavior,
  });
}

export function scrollElementIntoView(element: HTMLElement, options?: ScrollToElementOptions) {
  const behavior = options?.behavior ?? "smooth";
  const block = options?.block ?? "start";
  const inline = options?.inline ?? "nearest";
  const offset = Math.max(0, options?.offset ?? 24);

  const scrollableAncestors = getScrollableAncestors(element);
  scrollableAncestors.forEach((ancestor) => {
    scrollAncestorToReveal({
      ancestor,
      element,
      offset,
      behavior,
    });
  });

  if (scrollableAncestors.length > 0) {
    return;
  }

  const rect = element.getBoundingClientRect();
  if (!isWithinViewport(rect)) {
    const absoluteTop = window.scrollY + rect.top - offset;
    window.scrollTo({
      top: Math.max(0, absoluteTop),
      behavior,
    });
    element.scrollIntoView({
      behavior,
      block,
      inline,
    });
  }
}
