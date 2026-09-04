"use strict";

// =========================================
// CAMPUS2CAREER
// COMPANY SIGN IN JAVASCRIPT
// JWT AUTHENTICATION
// =========================================

console.log("company-signin.js loaded");


// =========================================================
// API CONFIGURATION
// =========================================================

const API_BASE_URL =
    "https://campus2career-0pi8.onrender.com/api";

const SIGNIN_API =
    `${API_BASE_URL}/company/signin`;


// =========================================================
// STORAGE KEYS
// =========================================================

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


// =========================================================
// REDIRECT PAGE
// =========================================================
//
// Actual project filename:
// COMAIN.html
//
// =========================================================

const COMPANY_PORTAL_PAGE =
    "COMAIN.html";


// =========================================================
// ELEMENTS
// =========================================================

const signinForm =
    document.getElementById(
        "companySigninForm"
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

const signinBtn =
    document.getElementById(
        "signinBtn"
    );

const signinMessage =
    document.getElementById(
        "signinMessage"
    );

const gmailError =
    document.getElementById(
        "gmailError"
    );

const passwordError =
    document.getElementById(
        "passwordError"
    );


// =========================================================
// SHOW / HIDE PASSWORD
// =========================================================

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


// =========================================================
// GMAIL VALIDATION
// =========================================================

function isValidGmail(
    email
) {

    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
        email
    );

}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(
    text,
    type = "error"
) {

    if (!signinMessage) {

        console.log(
            text
        );

        return;

    }


    signinMessage.textContent =
        text || "";


    signinMessage.className =
        text
            ? `signin-message ${type}`
            : "signin-message";


    signinMessage.style.display =
        text
            ? "block"
            : "none";

}


// =========================================================
// CLEAR MESSAGE
// =========================================================

function clearMessage() {

    if (!signinMessage) {
        return;
    }


    signinMessage.textContent =
        "";


    signinMessage.style.display =
        "none";


    signinMessage.className =
        "signin-message";

}


// =========================================================
// CLEAR FIELD ERRORS
// =========================================================

function clearErrors() {

    if (gmailError) {

        gmailError.textContent =
            "";

    }


    if (passwordError) {

        passwordError.textContent =
            "";

    }

}


// =========================================================
// CLEAR OLD COMPANY SESSION
// =========================================================

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

}


// =========================================================
// READ API RESPONSE SAFELY
// =========================================================

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


// =========================================================
// GET API ERROR
// =========================================================

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


// =========================================================
// SIGN IN
// =========================================================

if (signinForm) {

    signinForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            // =====================================
            // CLEAR PREVIOUS STATE
            // =====================================

            clearErrors();

            clearMessage();


            // =====================================
            // VERIFY INPUT ELEMENTS
            // =====================================

            if (
                !gmailInput ||
                !passwordInput
            ) {

                showMessage(
                    "Login fields are missing.",
                    "error"
                );


                console.error(
                    "gmail or password input not found."
                );


                return;
            }


            // =====================================
            // GET VALUES
            // =====================================

            const gmail =
                gmailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            // =====================================
            // VALIDATION
            // =====================================

            let valid =
                true;


            // -------------------------------------
            // GMAIL
            // -------------------------------------

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


            // -------------------------------------
            // PASSWORD
            // -------------------------------------

            if (!password) {

                if (passwordError) {

                    passwordError.textContent =
                        "Please enter your password.";

                }


                valid =
                    false;
            }


            if (!valid) {

                return;

            }


            // =====================================
            // DISABLE BUTTON
            // =====================================

            const originalButtonText =
                signinBtn?.textContent ||
                "Sign In";


            if (signinBtn) {

                signinBtn.disabled =
                    true;


                signinBtn.textContent =
                    "Signing In...";

            }


            showMessage(
                "Checking company credentials...",
                "success"
            );


            try {

                // =================================
                // CLEAR OLD SESSION
                // =================================

                clearCompanySession();


                // =================================
                // CALL BACKEND
                // =================================

                console.log(
                    "Company signin API:",
                    SIGNIN_API
                );


                const response =
                    await fetch(
                        SIGNIN_API,
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
                                JSON.stringify({

                                    gmail:
                                        gmail,

                                    password:
                                        password

                                })
                        }
                    );


                console.log(
                    "Company signin HTTP status:",
                    response.status
                );


                // =================================
                // READ RESPONSE
                // =================================

                const data =
                    await readResponse(
                        response
                    );


                console.log(
                    "Company signin response:",
                    data
                );


                // =================================
                // LOGIN FAILED
                // =================================

                if (!response.ok) {

                    throw new Error(
                        getApiErrorMessage(
                            data,
                            "Invalid company Gmail ID or password."
                        )
                    );

                }


                // =================================
                // VERIFY SUCCESS FLAG
                // =================================

                if (
                    data?.success === false
                ) {

                    throw new Error(
                        getApiErrorMessage(
                            data,
                            "Company login failed."
                        )
                    );

                }


                // =================================
                // GET JWT
                // =================================

                const token =
                    data?.token ||
                    data?.accessToken ||
                    "";


                if (
                    typeof token !== "string" ||
                    token.trim() === ""
                ) {

                    throw new Error(
                        "Login succeeded, but the server did not return an authentication token."
                    );

                }


                // =================================
                // GET COMPANY ID
                // =================================

                const companyId =
                    data?.companyId ??
                    data?.company?.id ??
                    data?.company_id;


                if (
                    companyId === undefined ||
                    companyId === null ||
                    String(
                        companyId
                    ).trim() === ""
                ) {

                    throw new Error(
                        "Login succeeded, but the server did not return a company ID."
                    );

                }


                const numericCompanyId =
                    Number(
                        companyId
                    );


                if (
                    !Number.isInteger(
                        numericCompanyId
                    ) ||
                    numericCompanyId <= 0
                ) {

                    throw new Error(
                        "The company ID returned by the server is invalid."
                    );

                }


                // =================================
                // GET USER ID
                // =================================

                const userId =
                    data?.userId ??
                    data?.company?.userId ??
                    null;


                // =================================
                // GET COMPANY NAME
                // =================================

                const companyName =
                    data?.company?.company_name ??
                    data?.company_name ??
                    "";


                // =================================
                // GET COMPANY EMAIL
                // =================================

                const companyEmail =
                    data?.email ??
                    data?.company?.email ??
                    gmail;


                // =================================
                // STORE JWT
                // =================================

                localStorage.setItem(
                    COMPANY_TOKEN_KEY,
                    token.trim()
                );


                // =================================
                // STORE COMPANY ID
                // =================================

                localStorage.setItem(
                    COMPANY_ID_KEY,
                    String(
                        numericCompanyId
                    )
                );


                // =================================
                // STORE COMPANY NAME
                // =================================

                if (
                    companyName
                ) {

                    localStorage.setItem(
                        COMPANY_NAME_KEY,
                        String(
                            companyName
                        )
                    );

                }


                // =================================
                // STORE COMPANY GMAIL
                // =================================

                localStorage.setItem(
                    COMPANY_GMAIL_KEY,
                    String(
                        companyEmail
                    )
                );


                // =================================
                // STORE USER ID
                // =================================

                if (
                    userId !== null &&
                    userId !== undefined &&
                    String(
                        userId
                    ).trim() !== ""
                ) {

                    localStorage.setItem(
                        COMPANY_USER_ID_KEY,
                        String(
                            userId
                        )
                    );

                }


                // =================================
                // STORE COMPLETE COMPANY OBJECT
                // =================================

                if (
                    data?.company &&
                    typeof data.company ===
                        "object"
                ) {

                    localStorage.setItem(
                        "companyData",
                        JSON.stringify(
                            data.company
                        )
                    );

                }


                // =================================
                // VERIFY STORAGE
                // =================================

                const savedToken =
                    localStorage.getItem(
                        COMPANY_TOKEN_KEY
                    );


                const savedCompanyId =
                    localStorage.getItem(
                        COMPANY_ID_KEY
                    );


                if (
                    !savedToken ||
                    !savedCompanyId
                ) {

                    throw new Error(
                        "Company login data could not be stored correctly."
                    );

                }


                // =================================
                // LOG SUCCESS
                // =================================

                console.log(
                    "Company login successful."
                );


                console.log(
                    "Company ID:",
                    savedCompanyId
                );


                console.log(
                    "Company User ID:",
                    userId
                );


                console.log(
                    "Company Name:",
                    companyName
                );


                // =================================
                // SUCCESS MESSAGE
                // =================================

                showMessage(
                    "Login successful. Redirecting to Company Portal...",
                    "success"
                );


                // =================================
                // REDIRECT
                // =================================

                setTimeout(
                    () => {

                        window.location.href =
                            COMPANY_PORTAL_PAGE;

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "========================================="
                );


                console.error(
                    "COMPANY SIGNIN ERROR:",
                    error
                );


                console.error(
                    "========================================="
                );


                // =================================
                // REMOVE INVALID SESSION
                // =================================

                clearCompanySession();


                // =================================
                // SHOW ERROR
                // =================================

                showMessage(
                    error.message ||
                    "Unable to sign in. Please try again.",
                    "error"
                );


            } finally {

                // =================================
                // RESTORE BUTTON
                // =================================

                if (signinBtn) {

                    signinBtn.disabled =
                        false;


                    signinBtn.textContent =
                        originalButtonText ||
                        "Sign In";

                }

            }

        }
    );

}

else {

    console.error(
        "Company signin form #companySigninForm was not found."
    );

}


// =========================================================
// GLOBAL HELPERS
// =========================================================

window.companySignin =
    function () {

        if (
            signinForm
        ) {

            signinForm.requestSubmit();

        }

    };
