"use strict";

// =========================================
// CAMPUS2CAREER
// INSTITUTION REGISTRATION JAVASCRIPT
// =========================================

console.log("InstitutionRegistration.js loaded");


// =========================================
// API CONFIGURATION
// =========================================

const API_BASE_URL =
    "https://campus2career-0pi8.onrender.com/api";

const REGISTER_API =
    `${API_BASE_URL}/institution/signup`;


// =========================================
// STORAGE KEYS
// =========================================

const TOKEN_KEY =
    "institutionAuthToken";

const INSTITUTION_KEY =
    "institutionData";

const INSTITUTION_USER_ID_KEY =
    "institutionUserId";

const INSTITUTION_ID_KEY =
    "institutionId";


// =========================================
// ELEMENTS
// =========================================

const form =
    document.getElementById(
        "institutionRegistrationForm"
    );

const registerBtn =
    document.getElementById(
        "registerBtn"
    );

const message =
    document.getElementById(
        "message"
    );

const password =
    document.getElementById(
        "password"
    );

const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const passwordMatch =
    document.getElementById(
        "passwordMatch"
    );


// =========================================
// SHOW MESSAGE
// =========================================

function showMessage(
    text,
    type = "error"
) {

    if (!message) {

        console.log(
            text
        );

        return;

    }


    message.textContent =
        text || "";


    message.className =
        text
            ? `message show ${type}`
            : "message";

}


// =========================================
// HIDE MESSAGE
// =========================================

function hideMessage() {

    if (!message) {

        return;

    }


    message.textContent =
        "";

    message.className =
        "message";

}


// =========================================
// CLEAR OLD INSTITUTION SESSION
// =========================================

function clearInstitutionSession() {

    localStorage.removeItem(
        TOKEN_KEY
    );

    localStorage.removeItem(
        INSTITUTION_KEY
    );

    localStorage.removeItem(
        INSTITUTION_USER_ID_KEY
    );

    localStorage.removeItem(
        INSTITUTION_ID_KEY
    );

    localStorage.removeItem(
        "institutionEmail"
    );

}


// =========================================
// READ API RESPONSE SAFELY
// =========================================

async function readResponse(
    response
) {

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        contentType
            .toLowerCase()
            .includes(
                "application/json"
            )
    ) {

        try {

            return await response.json();

        } catch (error) {

            console.error(
                "Failed to parse JSON response:",
                error
            );

            return {};

        }

    }


    try {

        return await response.text();

    } catch (error) {

        console.error(
            "Failed to read server response:",
            error
        );

        return "";

    }

}


// =========================================
// GET API ERROR
// =========================================

function getApiErrorMessage(
    result,
    fallback = "Registration failed."
) {

    if (
        result &&
        typeof result === "object"
    ) {

        return (
            result.error ||
            result.message ||
            result.detail ||
            fallback
        );

    }


    if (
        typeof result === "string" &&
        result.trim() !== ""
    ) {

        return result.trim();

    }


    return fallback;

}


// =========================================
// PASSWORD RULES
// =========================================

function validatePasswordRules() {

    if (!password) {

        return false;

    }


    const value =
        password.value;


    const lengthRule =
        document.getElementById(
            "ruleLength"
        );

    const upperRule =
        document.getElementById(
            "ruleUpper"
        );

    const lowerRule =
        document.getElementById(
            "ruleLower"
        );

    const numberRule =
        document.getElementById(
            "ruleNumber"
        );


    // =====================================
    // PASSWORD REQUIREMENTS
    // =====================================

    const lengthValid =
        value.length >= 8;

    const upperValid =
        /[A-Z]/.test(
            value
        );

    const lowerValid =
        /[a-z]/.test(
            value
        );

    const numberValid =
        /[0-9]/.test(
            value
        );


    // =====================================
    // UPDATE UI
    // =====================================

    if (lengthRule) {

        lengthRule.classList.toggle(
            "valid",
            lengthValid
        );

    }


    if (upperRule) {

        upperRule.classList.toggle(
            "valid",
            upperValid
        );

    }


    if (lowerRule) {

        lowerRule.classList.toggle(
            "valid",
            lowerValid
        );

    }


    if (numberRule) {

        numberRule.classList.toggle(
            "valid",
            numberValid
        );

    }


    return (
        lengthValid &&
        upperValid &&
        lowerValid &&
        numberValid
    );

}


// =========================================
// PASSWORD MATCH
// =========================================

function validatePasswordMatch() {

    if (
        !password ||
        !confirmPassword
    ) {

        return false;

    }


    const first =
        password.value;

    const second =
        confirmPassword.value;


    // =====================================
    // EMPTY CONFIRM PASSWORD
    // =====================================

    if (!second) {

        if (passwordMatch) {

            passwordMatch.textContent =
                "";

            passwordMatch.className =
                "password-match";

        }


        return false;

    }


    // =====================================
    // PASSWORDS MATCH
    // =====================================

    if (
        first === second
    ) {

        if (passwordMatch) {

            passwordMatch.textContent =
                "Passwords match.";

            passwordMatch.className =
                "password-match success";

        }


        return true;

    }


    // =====================================
    // PASSWORDS DO NOT MATCH
    // =====================================

    if (passwordMatch) {

        passwordMatch.textContent =
            "Passwords do not match.";

        passwordMatch.className =
            "password-match error";

    }


    return false;

}


// =========================================
// TOGGLE PASSWORD VISIBILITY
// =========================================

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        event => {

            event.preventDefault();


            if (!password) {

                return;

            }


            const isPassword =
                password.type ===
                "password";


            password.type =
                isPassword
                    ? "text"
                    : "password";


            togglePassword.textContent =
                isPassword
                    ? "Hide"
                    : "Show";

        }
    );

}


// =========================================
// LIVE PASSWORD VALIDATION
// =========================================

if (password) {

    password.addEventListener(
        "input",
        () => {

            validatePasswordRules();


            if (
                confirmPassword &&
                confirmPassword.value
            ) {

                validatePasswordMatch();

            }

        }
    );

}


// =========================================
// LIVE PASSWORD MATCH VALIDATION
// =========================================

if (confirmPassword) {

    confirmPassword.addEventListener(
        "input",
        validatePasswordMatch
    );

}


// =========================================
// FORM SUBMISSION
// =========================================

if (form) {

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            hideMessage();


            // =================================
            // VERIFY REQUIRED ELEMENTS
            // =================================

            if (
                !password ||
                !confirmPassword
            ) {

                showMessage(
                    "Password fields are missing.",
                    "error"
                );

                return;

            }


            // =================================
            // VALIDATE PASSWORD
            // =================================

            const passwordValid =
                validatePasswordRules();

            const passwordMatches =
                validatePasswordMatch();


            if (!passwordValid) {

                showMessage(
                    "Please create a stronger password.",
                    "error"
                );


                password.focus();

                return;

            }


            if (!passwordMatches) {

                showMessage(
                    "Please make sure both passwords match.",
                    "error"
                );


                confirmPassword.focus();

                return;

            }


            // =================================
            // COLLECT FORM DATA
            // =================================

            const formData =
                new FormData(
                    form
                );


            const institutionName =
                String(
                    formData.get(
                        "institutionName"
                    ) || ""
                ).trim();


            const institutionType =
                String(
                    formData.get(
                        "institutionType"
                    ) || ""
                ).trim();


            const email =
                String(
                    formData.get(
                        "email"
                    ) || ""
                )
                    .trim()
                    .toLowerCase();


            const phone =
                String(
                    formData.get(
                        "phone"
                    ) || ""
                ).trim();


            const website =
                String(
                    formData.get(
                        "website"
                    ) || ""
                ).trim();


            const address =
                String(
                    formData.get(
                        "address"
                    ) || ""
                ).trim();


            const city =
                String(
                    formData.get(
                        "city"
                    ) || ""
                ).trim();


            const state =
                String(
                    formData.get(
                        "state"
                    ) || ""
                ).trim();


            const country =
                String(
                    formData.get(
                        "country"
                    ) || ""
                ).trim();


            const description =
                String(
                    formData.get(
                        "description"
                    ) || ""
                ).trim();


            const passwordValue =
                password.value;


            // =================================
            // CLIENT VALIDATION
            // =================================

            if (!institutionName) {

                showMessage(
                    "Institution name is required.",
                    "error"
                );

                return;

            }


            if (!institutionType) {

                showMessage(
                    "Institution type is required.",
                    "error"
                );

                return;

            }


            if (!email) {

                showMessage(
                    "Email address is required.",
                    "error"
                );

                return;

            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email
                )
            ) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;

            }


            if (!passwordValue) {

                showMessage(
                    "Password is required.",
                    "error"
                );

                return;

            }


            // =================================
            // OPTIONAL WEBSITE VALIDATION
            // =================================

            let normalizedWebsite =
                website;


            if (normalizedWebsite) {

                if (
                    !/^https?:\/\//i.test(
                        normalizedWebsite
                    )
                ) {

                    normalizedWebsite =
                        `https://${normalizedWebsite}`;

                }


                try {

                    new URL(
                        normalizedWebsite
                    );

                } catch {

                    showMessage(
                        "Please enter a valid website URL.",
                        "error"
                    );

                    return;

                }

            }


            // =================================
            // CREATE API PAYLOAD
            // =================================

            /*
             * These names match what server.js accepts:
             *
             * institutionName
             * institutionType
             * email
             * phone
             * website
             * address
             * city
             * state
             * country
             * description
             * password
             *
             * confirmPassword is NOT sent because
             * the backend does not need it.
             */

            const data = {

                institutionName:
                    institutionName,

                institutionType:
                    institutionType,

                email:
                    email,

                phone:
                    phone,

                website:
                    normalizedWebsite,

                address:
                    address,

                city:
                    city,

                state:
                    state,

                country:
                    country ||
                    "India",

                description:
                    description,

                password:
                    passwordValue

            };


            console.log(
                "Institution registration payload:",
                {
                    ...data,
                    password:
                        "[hidden]"
                }
            );


            // =================================
            // BUTTON STATE
            // =================================

            const originalButtonText =
                registerBtn?.textContent ||
                "Create Institution Account";


            if (registerBtn) {

                registerBtn.disabled =
                    true;


                registerBtn.textContent =
                    "Creating Account...";

            }


            showMessage(
                "Creating your institution account...",
                "success"
            );


            try {

                // =================================
                // CLEAR OLD SESSION
                // =================================

                clearInstitutionSession();


                // =================================
                // SEND REGISTRATION REQUEST
                // =================================

                console.log(
                    "Registration API:",
                    REGISTER_API
                );


                const response =
                    await fetch(
                        REGISTER_API,
                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    data
                                )
                        }
                    );


                console.log(
                    "Registration HTTP status:",
                    response.status
                );


                // =================================
                // READ RESPONSE
                // =================================

                const result =
                    await readResponse(
                        response
                    );


                console.log(
                    "Registration API response:",
                    result
                );


                // =================================
                // SERVER ERROR
                // =================================

                if (!response.ok) {

                    throw new Error(
                        getApiErrorMessage(
                            result,
                            "Institution registration failed."
                        )
                    );

                }


                // =================================
                // VERIFY SUCCESS
                // =================================

                if (
                    result?.success === false
                ) {

                    throw new Error(
                        getApiErrorMessage(
                            result,
                            "Institution registration failed."
                        )
                    );

                }


                // =================================
                // VERIFY SERVER RESPONSE
                // =================================

                const returnedUserId =
                    result?.userId;

                const returnedInstitutionId =
                    result?.institutionId;


                if (
                    returnedUserId ===
                        undefined ||
                    returnedUserId ===
                        null
                ) {

                    throw new Error(
                        "Registration succeeded, but the server did not return the institution user ID."
                    );

                }


                if (
                    returnedInstitutionId ===
                        undefined ||
                    returnedInstitutionId ===
                        null
                ) {

                    throw new Error(
                        "Registration succeeded, but the server did not return the institution ID."
                    );

                }


                // =================================
                // STORE REGISTRATION IDENTIFIERS
                // =================================

                localStorage.setItem(
                    INSTITUTION_USER_ID_KEY,
                    String(
                        returnedUserId
                    )
                );


                localStorage.setItem(
                    INSTITUTION_ID_KEY,
                    String(
                        returnedInstitutionId
                    )
                );


                if (
                    result.email
                ) {

                    localStorage.setItem(
                        "institutionEmail",
                        String(
                            result.email
                        )
                    );

                }


                // =================================
                // IMPORTANT:
                // DO NOT STORE TOKEN HERE
                // =================================

                /*
                 * server.js creates the JWT during
                 * institution SIGNIN, not SIGNUP.
                 */

                localStorage.removeItem(
                    TOKEN_KEY
                );


                // =================================
                // SUCCESS MESSAGE
                // =================================

                showMessage(
                    result.message ||
                    "Institution registered successfully. Redirecting to login...",
                    "success"
                );


                // =================================
                // REDIRECT TO INSTITUTION LOGIN
                // =================================

                setTimeout(
                    () => {

                        window.location.href =
                            "InstitutionLogin.html";

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "========================================="
                );

                console.error(
                    "INSTITUTION REGISTRATION ERROR:",
                    error
                );

                console.error(
                    "========================================="
                );


                showMessage(
                    error.message ||
                    "Unable to register institution.",
                    "error"
                );


            } finally {

                // =================================
                // RESTORE BUTTON
                // =================================

                if (registerBtn) {

                    registerBtn.disabled =
                        false;


                    registerBtn.textContent =
                        originalButtonText ||
                        "Create Institution Account";

                }

            }

        }
    );

}

else {

    console.error(
        "Institution registration form #institutionRegistrationForm was not found."
    );

}


// =========================================
// GLOBAL ACCESS
// =========================================

window.validatePasswordRules =
    validatePasswordRules;

window.validatePasswordMatch =
    validatePasswordMatch;

window.showInstitutionMessage =
    showMessage;
