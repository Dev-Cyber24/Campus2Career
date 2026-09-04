"use strict";

// =========================================
// CAMPUS2CAREER
// INSTITUTION LOGIN JAVASCRIPT
// =========================================

console.log("InstitutionLogin.js loaded");


// =========================================
// API CONFIGURATION
// =========================================

const API_BASE_URL =
    "https://campus2career-0pi8.onrender.com/api";

const LOGIN_API =
    `${API_BASE_URL}/institution/signin`;


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
// REDIRECT PAGE
// IMPORTANT:
// Actual project filename is:
// courseprofile.html
// =========================================

const COURSE_PROFILE_PAGE =
    "courseprofile.html";


// =========================================
// ELEMENTS
// =========================================

const form =
    document.getElementById(
        "institutionLoginForm"
    );

const email =
    document.getElementById(
        "email"
    );

const password =
    document.getElementById(
        "password"
    );

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

const message =
    document.getElementById(
        "message"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
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


    if (text) {

        message.className =
            `message show ${type}`;

    } else {

        message.className =
            "message";

    }

}


// =========================================
// CLEAR PREVIOUS LOGIN
// =========================================

function clearPreviousInstitutionLogin() {

    localStorage.removeItem(
        TOKEN_KEY
    );

    localStorage.removeItem(
        INSTITUTION_USER_ID_KEY
    );

    localStorage.removeItem(
        INSTITUTION_ID_KEY
    );

    localStorage.removeItem(
        INSTITUTION_KEY
    );

}


// =========================================
// GET API ERROR MESSAGE
// =========================================

function getApiErrorMessage(
    result,
    fallback = "Login failed."
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
// READ SERVER RESPONSE SAFELY
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
// TOGGLE PASSWORD
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
// LOGIN
// =========================================

if (form) {

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            // =================================
            // CLEAR OLD MESSAGE
            // =================================

            showMessage(
                "",
                "error"
            );


            // =================================
            // VERIFY INPUT ELEMENTS
            // =================================

            if (
                !email ||
                !password
            ) {

                console.error(
                    "Institution login fields are missing."
                );


                showMessage(
                    "Login fields are missing.",
                    "error"
                );


                return;

            }


            // =================================
            // READ INPUT
            // =================================

            const emailValue =
                email.value
                    .trim()
                    .toLowerCase();

            const passwordValue =
                password.value;


            // =================================
            // VALIDATE EMAIL
            // =================================

            if (!emailValue) {

                showMessage(
                    "Please enter your email address.",
                    "error"
                );


                email.focus();

                return;

            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    emailValue
                )
            ) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );


                email.focus();

                return;

            }


            // =================================
            // VALIDATE PASSWORD
            // =================================

            if (!passwordValue) {

                showMessage(
                    "Please enter your password.",
                    "error"
                );


                password.focus();

                return;

            }


            // =================================
            // DISABLE LOGIN BUTTON
            // =================================

            const originalButtonText =
                loginBtn?.textContent ||
                "Sign In";


            if (loginBtn) {

                loginBtn.disabled =
                    true;


                loginBtn.textContent =
                    "Signing In...";

            }


            showMessage(
                "Checking your institution credentials...",
                "success"
            );


            try {

                // =================================
                // REMOVE OLD SESSION
                // =================================

                clearPreviousInstitutionLogin();


                // =================================
                // SEND LOGIN REQUEST
                // =================================

                console.log(
                    "Institution login API:",
                    LOGIN_API
                );


                const response =
                    await fetch(
                        LOGIN_API,
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

                                    email:
                                        emailValue,

                                    password:
                                        passwordValue

                                })
                        }
                    );


                // =================================
                // READ RESPONSE
                // =================================

                console.log(
                    "Institution login HTTP status:",
                    response.status
                );


                const result =
                    await readResponse(
                        response
                    );


                console.log(
                    "Institution login response:",
                    result
                );


                // =================================
                // SERVER ERROR
                // =================================

                if (!response.ok) {

                    throw new Error(
                        getApiErrorMessage(
                            result,
                            "Invalid institution email or password."
                        )
                    );

                }


                // =================================
                // VERIFY SUCCESS RESPONSE
                // =================================

                if (
                    result?.success === false
                ) {

                    throw new Error(
                        getApiErrorMessage(
                            result,
                            "Institution login failed."
                        )
                    );

                }


                // =================================
                // VERIFY JWT
                // =================================

                const token =
                    result?.token;


                if (
                    typeof token !== "string" ||
                    token.trim() === ""
                ) {

                    console.error(
                        "Missing institution authentication token:",
                        result
                    );


                    throw new Error(
                        "Login succeeded, but no authentication token was returned."
                    );

                }


                // =================================
                // VERIFY USER ID
                // =================================

                if (
                    result?.userId === undefined ||
                    result?.userId === null ||
                    String(
                        result.userId
                    ).trim() === ""
                ) {

                    throw new Error(
                        "Login succeeded, but no institution user ID was returned."
                    );

                }


                // =================================
                // VERIFY INSTITUTION ID
                // =================================

                if (
                    result?.institutionId === undefined ||
                    result?.institutionId === null ||
                    String(
                        result.institutionId
                    ).trim() === ""
                ) {

                    throw new Error(
                        "Login succeeded, but no institution ID was returned."
                    );

                }


                // =================================
                // STORE JWT
                // =================================

                localStorage.setItem(
                    TOKEN_KEY,
                    token.trim()
                );


                // =================================
                // STORE USER ID
                // =================================

                localStorage.setItem(
                    INSTITUTION_USER_ID_KEY,
                    String(
                        result.userId
                    )
                );


                // =================================
                // STORE INSTITUTION ID
                // =================================

                localStorage.setItem(
                    INSTITUTION_ID_KEY,
                    String(
                        result.institutionId
                    )
                );


                // =================================
                // STORE EMAIL
                // =================================

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
                // STORE INSTITUTION DATA
                // =================================

                if (
                    result.institution &&
                    typeof result.institution ===
                        "object"
                ) {

                    localStorage.setItem(
                        INSTITUTION_KEY,
                        JSON.stringify(
                            result.institution
                        )
                    );

                }

                else {

                    console.warn(
                        "Institution object was not included in the login response."
                    );

                }


                // =================================
                // VERIFY STORAGE
                // =================================

                const savedToken =
                    localStorage.getItem(
                        TOKEN_KEY
                    );

                const savedUserId =
                    localStorage.getItem(
                        INSTITUTION_USER_ID_KEY
                    );

                const savedInstitutionId =
                    localStorage.getItem(
                        INSTITUTION_ID_KEY
                    );


                if (
                    !savedToken ||
                    !savedUserId ||
                    !savedInstitutionId
                ) {

                    throw new Error(
                        "Institution login data could not be stored correctly."
                    );

                }


                // =================================
                // SUCCESS LOG
                // =================================

                console.log(
                    "Institution login successful."
                );


                console.log(
                    "Institution user ID:",
                    savedUserId
                );


                console.log(
                    "Institution ID:",
                    savedInstitutionId
                );


                console.log(
                    "Institution email:",
                    result.email ||
                    emailValue
                );


                // =================================
                // SUCCESS MESSAGE
                // =================================

                showMessage(
                    "Login successful. Opening Course Profile...",
                    "success"
                );


                // =================================
                // REDIRECT
                // =================================

                setTimeout(
                    () => {

                        window.location.href =
                            COURSE_PROFILE_PAGE;

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "========================================="
                );

                console.error(
                    "INSTITUTION LOGIN ERROR:",
                    error
                );

                console.error(
                    "========================================="
                );


                // =================================
                // REMOVE POSSIBLY INVALID SESSION
                // =================================

                clearPreviousInstitutionLogin();


                // =================================
                // SHOW ERROR
                // =================================

                showMessage(
                    error.message ||
                    "Unable to login. Please try again.",
                    "error"
                );


            } finally {

                // =================================
                // RESTORE BUTTON
                // =================================

                if (loginBtn) {

                    loginBtn.disabled =
                        false;


                    loginBtn.textContent =
                        originalButtonText ||
                        "Sign In";

                }

            }

        }
    );

}

else {

    console.error(
        "Institution login form #institutionLoginForm was not found."
    );

}
