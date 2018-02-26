/* some helpers */

const strengthFactor = compose(analyzePassword, calculateFactor);
const howStrongIsThePassword = compose(strengthFactor, determineStrength);
const getHint = compose(analyzePassword, constructHints);

/* Vanilla solution */

const input = document.querySelector('#pwd');
const indicator = document.querySelector('#indicator');
const hint = document.querySelector('#hint');

const setIndicator = compose(
    howStrongIsThePassword,
    setElementsClassName(indicator),
);
const setHints = compose(getHint, setInnerHtml(hint));

setIndicator('weak');
setHints('');

input.addEventListener('input', event => {
    const { target: { value } } = event;

    if (isPasswordToShort(value) || isPasswordLongEnough(value)) {
        setHints(value);
        return;
    } else {
        setIndicator(value);
        setHints(value);
    }
});

/* RxJS solution */
const rxInput = document.querySelector('#rx-pwd');
const rxIndicator = document.querySelector('#rx-indicator');
const rxHint = document.querySelector('#rx-hint');

const inputs = Rx.Observable.fromEvent(rxInput, 'input').map(
    event => event.target.value,
);

inputs
    .filter(pwd => !isPasswordToShort(pwd))
    .filter(pwd => !isPasswordLongEnough(pwd))
    .map(howStrongIsThePassword)
    .startWith('weak')
    .subscribe(setElementsClassName(rxIndicator));

inputs
    .map(getHint)
    .startWith(getHint(''))
    .subscribe(setInnerHtml(rxHint));

/* Helpers */

function compose(head, ...tail) {
    return param => tail.reduce((acc, func) => func(acc), head(param));
}

function isPasswordToShort(pwd) {
    return pwd.length < 4;
}

function isPasswordLongEnough(pwd) {
    return pwd.length >= 15;
}

function analyzePassword(pwd = '') {
    return {
        length: pwd.length,
        hasNumber: pwd.search(/\d/) > -1,
        hasSpecial: pwd.search(/\W/) > -1,
        hasUpper: pwd.search(/[A-Z]/) > -1,
    };
}

function calculateFactor({ length, hasNumber, hasSpecial, hasUpper }) {
    return length + hasNumber + hasSpecial * 2 + hasUpper;
}

function determineStrength(factor) {
    if (factor > 10) {
        return 'strong';
    } else if (factor <= 6) {
        return 'weak';
    } else {
        return 'medium';
    }
}

function constructHints({ length, hasNumber, hasSpecial, hasUpper }) {
    const isTooShort = length < 4;
    const shouldGiveCharacterHints = !isTooShort && length < 15;

    return `${isTooShort ? 'Password is too short. ' : ''}${
        shouldGiveCharacterHints && !hasNumber
            ? 'Add at least one number. '
            : ''
    }${
        shouldGiveCharacterHints && !hasSpecial
            ? 'Add at least one special character. '
            : ''
    }${
        shouldGiveCharacterHints && !hasUpper
            ? 'Add at least one uppercase letter. '
            : ''
    }`;
}

function setElementsClassName(elem) {
    return className => {
        elem.className = className;
    };
}

function setInnerHtml(elem) {
    return content => {
        elem.innerHTML = content;
    };
}
