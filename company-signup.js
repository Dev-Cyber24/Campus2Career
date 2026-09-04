"use strict";

// ============================================
// CAMPUS2CAREER
// COMPANY REGISTRATION JAVASCRIPT
// ============================================

console.log("company-signup.js loaded");


// ============================================
// API CONFIGURATION
// ============================================

const API_BASE_URL =
    "https://campus2career-0pi8.onrender.com/api";

const SIGNUP_API =
    `${API_BASE_URL}/company/signup`;


// ============================================
// STORAGE KEYS
// ============================================

const COMPANY_TOKEN_KEY =
    "companyAuthToken";

const COMPANY_ID_KEY =
    "companyId";

const COMPANY_NAME_KEY =
    "companyName";

const COMPANY_GMAIL_KEY =
    "companyGmail";

const COMPANY_USER_ID_KEY =
    "companyUserId";

const COMPANY_DATA_KEY =
    "companyData";


// ============================================
// REDIRECT PAGE
// ============================================
//
// Actual project filename:
// company-signin.html
//
// ============================================

const COMPANY_SIGNIN_PAGE =
    "company-signin.html";


// ============================================
// ELEMENTS
// ============================================

const signupForm =
    document.getElementById(
        "companySignupForm"
    );

const companyNameInput =
    document.getElementById(
        "companyName"
    );

const gmailInput =
    document.getElementById(
        "gmail"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const signupBtn =
    document.getElementById(
        "signupBtn"
    );

const signupMessage =
    document.getElementById(
        "signupMessage"
    );

const companyNameError =
    document.getElementById(
        "companyNameError"
    );

const gmailError =
    document.getElementById(
        "gmailError"
    );

const passwordError =
    document.getElementById(
        "passwordError"
    );


// ============================================
// SHOW / HIDE PASSWORD
// ============================================

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        event => {

            event.preventDefault();


            if (!passwordInput) {
                return;
            }


            const isPassword =
                passwordInput.type ===
                "password";


            passwordInput.type =
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


// ============================================
// MESSAGE FUNCTION
// ============================================

function showMessage(
    text,
    type = "error"
) {

    if (!signupMessage) {

        console.log(
            text
        );

        return;

    }


    signupMessage.textContent =
        text || "";


    signupMessage.className =
        text
            ? `signup-message ${type}`
            : "signup-message";


    signupMessage.style.display =
        text
            ? "block"
            : "none";

}


// ============================================
// CLEAR MESSAGE
// ============================================

function clearMessage() {

    if (!signupMessage) {
        return;
    }


    signupMessage.textContent =
        "";


    signupMessage.style.display =
        "none";


    signupMessage.className =
        "signup-message";

}


// ============================================
// CLEAR FIELD ERRORS
// ============================================

function clearFieldErrors() {

    if (companyNameError) {

        companyNameError.textContent =
            "";

    }


    if (gmailError) {

        gmailError.textContent =
            "";

    }


    if (passwordError) {

        passwordError.textContent =
            "";

    }

}


// ============================================
// CLEAR PREVIOUS COMPANY SESSION
// ============================================

function clearCompanySession() {

    localStorage.removeItem(
        COMPANY_TOKEN_KEY
    );

    localStorage.removeItem(
        COMPANY_ID_KEY
    );

    localStorage.removeItem(
        COMPANY_NAME_KEY
    );

    localStorage.removeItem(
        COMPANY_GMAIL_KEY
    );

    localStorage.removeItem(
        COMPANY_USER_ID_KEY
    );

    localStorage.removeItem(
        COMPANY_DATA_KEY
    );

}


// ============================================
// VALIDATE GMAIL
// ============================================

function isValidGmail(
    email
) {

    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
        email
    );

}


// ============================================
// VALIDATE PASSWORD
// ============================================
//
// Backend requires at least 8 characters.
// ============================================

function isValidPassword(
    password
) {

    return (
        typeof password === "string" &&
        password.length >= 8
    );

}


// ============================================
// READ API RESPONSE SAFELY
// ============================================

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
            "Failed to read response:",
            error
        );


        return "";

    }

}


// ============================================
// GET API ERROR MESSAGE
// ============================================

function getApiErrorMessage(
    data,
    fallback
) {

    if (
        data &&
        typeof data === "object"
    ) {

        return (
            data.error ||
            data.message ||
            data.detail ||
            fallback
        );

    }


    if (
        typeof data === "string" &&
        data.trim() !== ""
    ) {

        return data.trim();

    }


    return fallback;

}


// ============================================
// FORM SUBMIT
// ============================================

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearMessage();

            clearFieldErrors();


            // =================================
            // VERIFY ELEMENTS
            // =================================

            if (
                !companyNameInput ||
                !gmailInput ||
                !passwordInput
            ) {

                showMessage(
                    "Registration fields are missing.",
                    "error"
                );


                console.error(
                    "One or more company signup fields were not found."
                );


                return;

            }


            // =================================
            // GET VALUES
            // =================================

            const companyName =
                companyNameInput.value
                    .trim();


            const gmail =
                gmailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            // =================================
            // VALIDATION
            // =================================

            let valid =
                true;


            // ---------------------------------
            // COMPANY NAME
            // ---------------------------------

            if (
                companyName.length < 2
            ) {

                if (companyNameError) {

                    companyNameError.textContent =
                        "Please enter a valid company name.";

                }


                valid =
                    false;

            }


            // ---------------------------------
            // GMAIL
            // ---------------------------------

            if (!gmail) {

                if (gmailError) {

                    gmailError.textContent =
                        "Please enter your Gmail ID.";

                }


                valid =
                    false;

            }

            else if (
                !isValidGmail(
                    gmail
                )
            ) {

                if (gmailError) {

                    gmailError.textContent =
                        "Please enter a valid Gmail ID.";

                }


                valid =
                    false;

            }


            // ---------------------------------
            // PASSWORD
            // ---------------------------------

            if (!password) {

                if (passwordError) {

                    passwordError.textContent =
                        "Please enter your password.";

                }


                valid =
                    false;

            }

            else if (
                !isValidPassword(
                    password
                )
            ) {

                if (passwordError) {

                    passwordError.textContent =
                        "Password must contain at least 8 characters.";

                }


                valid =
                    false;

            }


            if (!valid) {

                return;

            }


            // =================================
            // BUTTON STATE
            // =================================

            const originalButtonText =
                signupBtn?.textContent ||
                "Create Company Account";


            if (signupBtn) {

                signupBtn.disabled =
                    true;


                signupBtn.textContent =
                    "Creating Account...";

            }


            showMessage(
                "Creating your company account...",
                "success"
            );


            try {

                // =================================
                // CLEAR PREVIOUS COMPANY SESSION
                // =================================

                clearCompanySession();


                // =================================
                // BUILD REQUEST
                // =================================

                const requestData = {

                    company_name:
                        companyName,

                    gmail:
                        gmail,

                    password:
                        password

                };


                console.log(
                    "Company signup API:",
                    SIGNUP_API
                );


                console.log(
                    "Company signup data:",
                    {
                        company_name:
                            companyName,

                        gmail:
                            gmail,

                        password:
                            "[hidden]"
                    }
                );


                // =================================
                // SEND TO BACKEND
                // =================================

                const response =
                    await fetch(
                        SIGNUP_API,
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
                                    requestData
                                )
                        }
                    );


                // =================================
                // READ RESPONSE
                // =================================

                console.log(
                    "Company signup HTTP status:",
                    response.status
                );


                const data =
                    await readResponse(
                        response
                    );


                console.log(
                    "Company signup response:",
                    data
                );


                // =================================
                // BACKEND ERROR
                // =================================

                if (!response.ok) {

                    throw new Error(
                        getApiErrorMessage(
                            data,
                            "Company registration failed."
                        )
                    );

                }


                // =================================
                // VERIFY SUCCESS RESPONSE
                // =================================

                if (
                    data?.success === false
                ) {

                    throw new Error(
                        getApiErrorMessage(
                            data,
                            "Company registration failed."
                        )
                    );

                }


                // =================================
                // GET CREATED COMPANY ID
                // =================================

                const companyId =
                    data?.companyId ??
                    data?.id ??
                    null;


                // =================================
                // GET CREATED USER ID
                // =================================

                const userId =
                    data?.userId ??
                    null;


                // =================================
                // SAVE COMPANY ID
                // =================================

                if (
                    companyId !== null &&
                    companyId !== undefined
                ) {

                    localStorage.setItem(
                        COMPANY_ID_KEY,
                        String(
                            companyId
                        )
                    );

                }


                // =================================
                // SAVE USER ID
                // =================================

                if (
                    userId !== null &&
                    userId !== undefined
                ) {

                    localStorage.setItem(
                        COMPANY_USER_ID_KEY,
                        String(
                            userId
                        )
                    );

                }


                // =================================
                // SAVE COMPANY NAME
                // =================================

                localStorage.setItem(
                    COMPANY_NAME_KEY,
                    companyName
                );


                // =================================
                // SAVE GMAIL
                // =================================

                localStorage.setItem(
                    COMPANY_GMAIL_KEY,
                    gmail
                );


                // =================================
                // IMPORTANT:
                // SIGNUP DOES NOT AUTHENTICATE
                // THE COMPANY
                // =================================

                localStorage.removeItem(
                    COMPANY_TOKEN_KEY
                );


                // =================================
                // IMPORTANT:
                // DO NOT ASSUME COMPANY OBJECT
                // =================================

                if (
                    data?.company &&
                    typeof data.company ===
                        "object"
                ) {

                    localStorage.setItem(
                        COMPANY_DATA_KEY,
                        JSON.stringify(
                            data.company
                        )
                    );

                }


                // =================================
                // SUCCESS MESSAGE
                // =================================

                showMessage(
                    data?.message ||
                    "Company account created successfully. Redirecting to Company Sign In...",
                    "success"
                );


                // =================================
                // REDIRECT TO SIGN IN
                // =================================

                setTimeout(
                    () => {

                        window.location.href =
                            COMPANY_SIGNIN_PAGE;

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "============================================"
                );


                console.error(
                    "COMPANY SIGNUP ERROR:",
                    error
                );


                console.error(
                    "============================================"
                );


                showMessage(
                    error.message ||
                    "Unable to register company. Please try again.",
                    "error"
                );


            } finally {

                // =================================
                // RESTORE BUTTON
                // =================================

                if (signupBtn) {

                    signupBtn.disabled =
                        false;


                    signupBtn.textContent =
                        originalButtonText ||
                        "Create Company Account";

                }

            }

        }
    );

}

else {

    console.error(
        "Company signup form #companySignupForm was not found."
    );

}


// ============================================
// GLOBAL ACCESS
// ============================================

window.isValidGmail =
    isValidGmail;

window.isValidCompanyPassword =
    isValidPassword;
