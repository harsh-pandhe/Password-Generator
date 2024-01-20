document.getElementById('generateBtn').addEventListener('click', function () {
    try {
        const generatedPassword = generatePassword();
        updatePasswordStrengthIndicator(generatedPassword);
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('passwordLength').addEventListener('input', function () {
    const passwordLength = this.value;
    document.getElementById('passwordLengthOutput').textContent = passwordLength;
});

document.getElementById('quantity').addEventListener('input', function () {
    const quantity = this.value;
    document.getElementById('quantityOutput').textContent = quantity;

    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
    copyToClipboardBtn.disabled = quantity > 1;
});

document.getElementById('copyToClipboardBtn').addEventListener('click', function () {
    try {
        const generatedPassword = document.getElementById('generatedPassword').value.trim();

        if (generatedPassword === '') {
            throw new Error('No password to copy.');
        }

        navigator.clipboard.writeText(generatedPassword);

        Toastify({
            text: 'Password copied to clipboard!',
            duration: 3000,
            backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
            close: true,
            gravity: 'bottom',
            position: 'left',
        }).showToast();
    } catch (error) {
        alert(error.message);
    }
});


function generatePassword() {
    const passwordLength = document.getElementById('passwordLength').value;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const beginWithLetter = document.getElementById('beginWithLetter').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    const noSimilarCharacters = document.getElementById('noSimilarCharacters').checked;
    const noDuplicateCharacters = document.getElementById('noDuplicateCharacters').checked;
    const noSequentialCharacters = document.getElementById('noSequentialCharacters').checked;
    const quantity = document.getElementById('quantity').value;

    if (!(includeNumbers || includeLowercase || includeUppercase || includeSymbols)) {
        throw new Error('Please select at least one character option.');
    }

    if (isNaN(passwordLength) || passwordLength < 4 || passwordLength > 128) {
        throw new Error('Please enter a valid password length between 4 and 128.');
    }


    let characters = '';
    if (includeNumbers) characters += '0123456789';
    if (includeLowercase) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeSymbols) characters += '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

    let generatedPassword = '';
    for (let i = 0; i < quantity; i++) {
        generatedPassword += generateSinglePassword(characters, passwordLength, beginWithLetter, noDuplicateCharacters, noSequentialCharacters);
        if (i < quantity - 1) {
            generatedPassword += '\n';
        }
    }

    if (noSimilarCharacters) {
        characters = characters.replace(/[il1Lo0O]/g, '');
    }

    const textarea = document.getElementById('generatedPassword');
    textarea.value = generatedPassword;

    textarea.rows = quantity;

    Toastify({
        text: "Passwords generated successfully!",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        close: true,
        gravity: "bottom",
        position: "left",
    }).showToast();
    updatePasswordStrengthIndicator(generatedPassword);
    return generatedPassword;
}

function generateSinglePassword(characters, length, beginWithLetter, noDuplicateCharacters, noSequentialCharacters) {
    let password = '';
    if (beginWithLetter) {
        const letterCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetterIndex = Math.floor(Math.random() * letterCharacters.length);
        password += letterCharacters.charAt(randomLetterIndex);
        length--;
    }

    if (noDuplicateCharacters) {
        characters = removeDuplicateCharacters(characters);
    }

    if (noSequentialCharacters) {
        characters = removeSequentialCharacters(characters);
    }

    if (length <= 0) {
        throw new Error('Password length is too short.');
    }

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
}

function removeDuplicateCharacters(input) {
    return input.split('').filter((char, index, self) => {
        return index === self.indexOf(char);
    }).join('');
}

function removeSequentialCharacters(input) {
    return input.replace(/(.)\1+/g, '$1');
}

document.getElementById('checkStrengthBtn').addEventListener('click', function () {
    try {
        const password = document.getElementById('passwordInput').value.trim();

        if (password === '') {
            displayEmptyPasswordToast();
            return;
        }

        const passwordStrength = checkPasswordStrength(password);

        displayPasswordStrengthToast(passwordStrength);
    } catch (error) {

        const errorMessageElement = document.getElementById('errorMessage');

        if (errorMessageElement) {
            errorMessageElement.textContent = error.message;
            errorMessageElement.style.display = 'block';
        } else {
            alert(error.message);
        }
    }
});
const checkboxes = document.querySelectorAll('.form-check-input');
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        updatePasswordStrength();
    });
});

document.getElementById('generatedPassword').addEventListener('input', function () {
    updatePasswordStrength();
});

function displayEmptyPasswordToast() {
    Toastify({
        text: 'Please enter a password.',
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, #ff8a00, #da1b60)',
        close: true,
        gravity: 'bottom',
        position: 'left',
    }).showToast();
}

function checkPasswordStrength(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password);

    const typesCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (password.length < 8 || typesCount < 3) {
        return 'Weak';
    } else if (password.length < 12 || typesCount === 3) {
        return 'Moderate';
    } else {
        return 'Strong';
    }
}

function displayPasswordStrengthToast(strength) {
    let message;
    switch (strength) {
        case 'Weak' || 'Very Weak':
            message = 'Weak password! Please consider a stronger one.';
            break;
        case 'Moderate':
            message = 'Medium strength password.';
            break;
        case 'Strong' || 'Very Strong':
            message = 'Strong password! Good job!';
            break;
        default:
            message = 'Invalid password strength';
    }

    Toastify({
        text: message,
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, #ff8a00, #da1b60)',
        close: true,
        gravity: 'bottom',
        position: 'left',
    }).showToast();
}

function updatePasswordStrength() {
    const generatedPassword = document.getElementById('generatedPassword').value.trim();
    updatePasswordStrengthIndicator(generatedPassword);
}

function updatePasswordStrengthIndicator(password) {

    if (password === undefined || password.trim() === '') {
        console.warn('Password is undefined or empty. Skipping password strength update.');
        return;
    }

    const passwordStrengthBar = document.getElementById('passwordStrengthBar');
    const strength = calculatePasswordStrength(password);

    passwordStrengthBar.style.width = `${strength * 7.5}%`;

    passwordStrengthBar.classList.remove('bg-danger', 'bg-warning', 'bg-info', 'bg-success');

    if (strength >= 14) {
        passwordStrengthBar.classList.add('bg-success');
    } else if (strength >= 12) {
        passwordStrengthBar.classList.add('bg-info');
    } else if (strength >= 10) {
        passwordStrengthBar.classList.add('bg-warning');
    } else {
        passwordStrengthBar.classList.add('bg-danger');
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const typesCount = [hasLowercase, hasUppercase, hasDigit, hasSpecialChar].filter(Boolean).length;

    strength += typesCount * 2;

    const hasCommonPatterns = /(123|abc|qwerty|password)/i.test(password);
    const hasSequentialChars = /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);

    if (!hasCommonPatterns) {
        strength += 2;
    }
    if (!hasSequentialChars) {
        strength += 2;
    }

    if (password.length >= 14) {
        strength += 2;
    } else if (password.length >= 10) {
        strength += 1;
    }

    return strength;
}

