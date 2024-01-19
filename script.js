(() => {
    'use strict';
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
})();

function generatePasswordWrapper() {
    const passwordDisplay = document.getElementById('password');
    if (!passwordDisplay) {
        console.error('Error: Password display element not found.');
        showErrorToast('Error: Password display element not found.');
        return;
    }

    generatePassword();
}

function getSavedSettings() {
    try {
        const optionsCookie = getCookie('passwordOptions');

        if (optionsCookie) {
            const options = JSON.parse(decodeURIComponent(optionsCookie));

            document.getElementById('pgLength').value = options.passwordLength || "8";
            document.getElementById('Uppercase').checked = options.includeUppercase || false;
            document.getElementById('Numbers').checked = options.includeNumbers || false;
            document.getElementById('Symbols').checked = options.includeSpecial || false;
            document.getElementById('Lowercase').checked = options.includeLowercase || false;
            document.getElementById('BeginWithC').checked = options.beginWithCharacter || false;
            document.getElementById('Nosimilar').checked = options.noSimilarCharacters || false;
            document.getElementById('AllUniqueC').checked = options.noDuplicateCharacters || false;
            document.getElementById('NoSeqC').checked = options.noSequentialCharacters || false;
            document.getElementById('AutoMake').checked = options.autoGenerateOnFirstCall || false;
            document.getElementById('CustomizeSymbols').value = options.customizeSymbols || "";

            if (options.autoGenerateOnFirstCall) {
                generatePassword(); // Trigger password generation
            }
        }
    } catch (error) {
        console.error('Error retrieving saved settings:', error);
        showErrorToast('Error retrieving saved settings. Please try again.');
    }
}

function saveOptions(isSaveSettings) {
    try {
        const selectedLength = document.getElementById('pgLength').value;

        const optionsToSave = {
            passwordLength: selectedLength,
            includeUppercase: document.getElementById('Uppercase').checked,
            includeNumbers: document.getElementById('Numbers').checked,
            includeSpecial: document.getElementById('Symbols').checked,
            includeLowercase: document.getElementById('Lowercase').checked,
            beginWithCharacter: document.getElementById('BeginWithC').checked,
            noSimilarCharacters: document.getElementById('Nosimilar').checked,
            noDuplicateCharacters: document.getElementById('AllUniqueC').checked,
            noSequentialCharacters: document.getElementById('NoSeqC').checked,
            autoGenerateOnFirstCall: document.getElementById('AutoMake').checked,
            customizeSymbols: document.getElementById('CustomizeSymbols').value, // Include customizeSymbols
        };

        const optionsString = JSON.stringify(optionsToSave);

        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 10);

        if (isSaveSettings) {
            document.cookie = `passwordOptions=${encodeURIComponent(optionsString)}; expires=${expirationDate.toUTCString()}; path=/`;
            console.log("Saving user preferences...");
        }
    } catch (error) {
        console.error('Error saving options:', error);
        showErrorToast('Error saving options. Please try again.');
    }
}

function generatePasswords(quantity) {
    try {
        console.log(`Generating ${quantity} passwords...`);

        for (let i = 0; i < quantity; i++) {
            generatePassword(true);  // Pass true to indicate it's part of batch generation
        }
    } catch (error) {
        console.error('Error generating passwords:', error);
        showErrorToast('Error generating passwords. Please try again.');
    }
}
function generatePassword(isBatch) {
    try {
        console.log("Generating password...");

        const length = document.getElementById('pgLength').value;
        const includeUppercase = document.getElementById('Uppercase').checked;
        const includeNumbers = document.getElementById('Numbers').checked;
        const includeSpecial = document.getElementById('Symbols').checked;
        const includeLowercase = document.getElementById('Lowercase').checked;
        const noSimilarCharacters = document.getElementById('Nosimilar').checked;
        const noDuplicateCharacters = document.getElementById('AllUniqueC').checked;
        const noSequentialCharacters = document.getElementById('NoSeqC').checked;

        if (!(includeUppercase || includeNumbers || includeSpecial || includeLowercase)) {
            showErrorToast("Please select at least one character set option.");
            return;
        }

        let charset = "";
        if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
        if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeNumbers) charset += "0123456789";
        if (includeSpecial) charset += document.getElementById('CustomizeSymbols').value;

        if (noSimilarCharacters) {
            charset = charset.replace(/[il1Lo0O]/g, '');
        }
        if (noDuplicateCharacters) {
            charset = Array.from(new Set(charset)).join('');
        }
        if (noSequentialCharacters) {
            charset = removeSequentialCharacters(charset);
        }

        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset.charAt(randomIndex);
        }

        if (!isBatch) {
            const passwordDisplay = document.getElementById('password');
            if (!passwordDisplay) {
                console.error('Error: Password display element not found.');
                return;
            }

            passwordDisplay.innerHTML = '';

            const passwordElement = document.createElement('pre');
            passwordElement.classList.add('generated-password');
            passwordElement.textContent = password;
            passwordDisplay.appendChild(passwordElement);

            passwordElement.addEventListener('click', () => {
                copyToClipboard(password);
                showToast('Password copied to clipboard!');
            });

            new bootstrap.Tooltip(passwordElement, {
                title: 'Click to copy',
                placement: 'top',
                trigger: 'hover',
            });
        } else {
            return password; // Return the password for batch generation
        }

    } catch (error) {
        console.error('Error generating password:', error);
        showErrorToast('Error generating password. Please try again.');
    }
}


function showErrorToast(errorMessage) {
    const toastElement = document.getElementById('errorToast');
    const toast = new bootstrap.Toast(toastElement);
    document.getElementById('errorToastBody').innerText = errorMessage;
    toast.show();
}

function removeSequentialCharacters(charset) {
    let result = "";
    for (let i = 0; i < charset.length; i++) {
        if (i === 0 || charset.charCodeAt(i) !== charset.charCodeAt(i - 1) + 1) {
            result += charset.charAt(i);
        }
    }
    return result;
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function showToast(message) {
    const toastElement = document.getElementById('copiedToast');
    const toast = new bootstrap.Toast(toastElement);
    document.getElementById('toastBody').innerText = message;
    toast.show();
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded event fired.");
    getSavedSettings();
});

document.getElementById('password').addEventListener('click', () => {
    console.log("Password clicked.");
    copyToClipboard(password);
    showToast('Password copied to clipboard!');
});

// Function to get the value of a cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function refreshSymbols() {
    const defaultSymbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
    document.getElementById('CustomizeSymbols').value = defaultSymbols;
    saveOptions(false);
}

function resetSymbols() {
    document.getElementById('CustomizeSymbols').value = "";
    saveOptions(false);
}


function checkPasswordStrength() {
    var password = document.getElementById('passwordInput').value;

    // You can implement your own password strength check logic here
    var strength = calculatePasswordStrength(password);

    // Display a toast message based on the password strength
    var toastBody = document.getElementById('toastBody');
    var strengthMessage = getStrengthMessage(strength);

    toastBody.innerText = strengthMessage;

    var copiedToast = new bootstrap.Toast(document.getElementById('copiedToast'));
    copiedToast.show();
}
function calculatePasswordStrength(password) {
    // Placeholder logic: Calculate strength based on length, uppercase, lowercase, numbers, and special characters
    var lengthScore = password.length * 4; // Adjust as needed
    var uppercaseScore = (password.match(/[A-Z]/g) || []).length * 5; // Adjust as needed
    var lowercaseScore = (password.match(/[a-z]/g) || []).length * 3; // Adjust as needed
    var digitScore = (password.match(/\d/g) || []).length * 5; // Adjust as needed
    var symbolScore = (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length * 5; // Adjust as needed

    // Combine scores and return the overall strength value (between 0 and 100)
    var totalScore = lengthScore + uppercaseScore + lowercaseScore + digitScore + symbolScore;
    return Math.min(100, totalScore);
}

function getStrengthMessage(strength) {
    // Customize the strength message based on your own criteria
    if (strength > 70) {
        return 'Strong Password!';
    } else if (strength > 40) {
        return 'Medium Password';
    } else {
        return 'Weak Password';
    }
}

