// Aria Tree Inspector by Andrey Ustinov Yurievich aka DR8 https://github.com/DR8off/Aria-Tree-Inspector
// This software is free to use and modify under the MIT License.
// Please note that this is not the final version, so it may contain bugs and issues

function GetAllAccessibilityRequiredElements() {
  const buttons = document.querySelectorAll("button");
  const inputs = document.querySelectorAll('input:not([type="hidden"])');
  const textareas = document.querySelectorAll("textarea");
  const selects = document.querySelectorAll("select");
  const images = document.querySelectorAll("img");
  const links = document.querySelectorAll("a");

  const total = [
    ...buttons,
    ...inputs,
    ...textareas,
    ...selects,
    ...images,
    ...links,
  ];

  return {
    count: total.length,
    allElements: {
      button: [...buttons],
      input: [...inputs],
      textarea: [...textareas],
      select: [...selects],
      img: [...images],
      a: [...links],
    },
  };
}

const totalElements = GetAllAccessibilityRequiredElements();

const ariaValidationRules = {
  img: (element) => {
    if (element.hasAttribute("aria-hidden")) {
      return true; //Element doesn't need alt
    }

    const alt = element.getAttribute("alt");

    return alt ? alt.length > 0 : false;
  },
  button: (element) => {
    const hasVisibleText = element.textContent.trim() !== "";

    if (hasVisibleText) {
      return true;
    }

    const hasAriaLabel = element.hasAttribute("aria-label");
    const hasAriaLabelledby = element.hasAttribute("aria-labelledby");

    return hasAriaLabel || hasAriaLabelledby;
  },
  a: (element) => {
    const isElementHidden = element.getAttribute("aria-hidden");

    if (isElementHidden) {
      return true;
    }

    const hasTextContent = element.textContent.trim() !== "";
    const hasAriaLabel = element.hasAttribute("aria-label");
    const hasAriaLabelledby = element.hasAttribute("aria-labelledby");

    return hasTextContent || hasAriaLabel || hasAriaLabelledby;
  },
  input: (element) => {
    if (element.labels && element.labels.length > 0) {
      return true;
    }

    const type = element.getAttribute("type");
    const hasAriaLabel = element.hasAttribute("aria-label");
    const hasAriaLabelledby = element.hasAttribute("aria-labelledby");
    const hasAriaDescribedBy = element.hasAttribute("aria-describedby");

    if (type === "hidden") {
      return true;
    }
    if (type === "image") {
      const alt = element.getAttribute("alt");
      return alt !== null;
    }

    return hasAriaLabel || hasAriaLabelledby || hasAriaDescribedBy;
  },
  textarea: (element) => {
    const hasLabel = element.labels && element.labels.length > 0;
    const hasAriaLabel = element.hasAttribute("aria-label");
    const hasAriaLabelledby = element.hasAttribute("aria-labelledby");

    return hasLabel || hasAriaLabel || hasAriaLabelledby;
  },
  select: (element) => {
    const hasLabel = element.labels && element.labels.length > 0;
    const hasAriaLabel = element.hasAttribute("aria-label");
    const hasAriaLabelledby = element.hasAttribute("aria-labelledby");

    return hasLabel || hasAriaLabel || hasAriaLabelledby;
  },
};

function IsElementHasRequiredAriaAttribute(element, elementType) {
  const validator = ariaValidationRules[elementType];
  return validator(element);
}

function InspectAllElementsForAriaAttributes() {
  const elementsWithoutRequiredAria = [];

  for (const key in totalElements.allElements) {
    const group = totalElements.allElements[key];

    group.forEach((element) => {
      if (!IsElementHasRequiredAriaAttribute(element, key)) {
        elementsWithoutRequiredAria.push(element);
      }
    });
  }

  return elementsWithoutRequiredAria;
}

const elementsWithoutRequiredAria = InspectAllElementsForAriaAttributes();

function GetFinalScoreAsLetter(percent) {
  if (percent <= 65) {
    return '"F" - Very bad';
  } else if (percent <= 75) {
    return '"D" - Bad';
  } else if (percent <= 85) {
    return '"C" - Decent';
  } else if (percent <= 95) {
    return '"B" - Good';
  } else if (percent > 95) {
    return '"A" - Very good!';
  }
}

function LogFinalAriaScore() {
  const elementsWithMissingAriaCount = elementsWithoutRequiredAria.length;

  const totalScore = Math.ceil(
    ((totalElements.count - elementsWithMissingAriaCount) /
      totalElements.count) *
      100
  );

  console.log(`
    ################################################################

    Aria Tree Inspector 0.1.0 by DR8 | GitHub - https://github.com/DR8off

    Total score - ${totalScore}%
    ${GetFinalScoreAsLetter(totalScore)}

    Total elements checked: ${totalElements.count}
    Elements with missing attributes: ${elementsWithMissingAriaCount}

    ${
      elementsWithMissingAriaCount
        ? `Missing attributes at: ${elementsWithoutRequiredAria.map(
            (e) => e.localName
          )}`
        : ""
    }

    ################################################################
  `);
}

LogFinalAriaScore();
