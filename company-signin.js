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

const COMPANY_PROFILE_API =
    `${API_BASE_URL}/company-profile`;


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

const COMPANY_DATA_KEY =
    "companyData";


// =========================================================
// REDIRECT PAGE
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
                passwordInput.type === "password";

            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";

            togglePassword.textContent =
                isPassword
                    ? "Hide"
                    : "Show";

            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

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

    localStorage.removeItem(
        COMPANY_DATA_KEY
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
// GET COMPANY NAME FROM API RESPONSE
// =========================================================

function extractCompanyName(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return "";

    }

    const candidates = [

        data.company?.company_name,

        data.company?.name,

        data.company?.companyName,

        data.company_name,

        data.companyName,

        data.name

    ];

    for (
        const value of candidates
    ) {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return String(value).trim();

        }

    }

    return "";

}


// =========================================================
// GET COMPANY ID FROM API RESPONSE
// =========================================================

function extractCompanyId(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return null;

    }

    const candidates = [

        data.companyId,

        data.company_id,

        data.company?.id,

        data.company?.company_id

    ];

    for (
        const value of candidates
    ) {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            const numericValue =
                Number(value);

            if (
                Number.isInteger(
                    numericValue
                ) &&
                numericValue > 0
            ) {

                return numericValue;

            }

        }

    }

    return null;

}


// =========================================================
// GET USER ID FROM API RESPONSE
// =========================================================

function extractUserId(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return null;

    }

    const candidates = [

        data.userId,

        data.user_id,

        data.company?.userId,

        data.company?.user_id,

        data.company?.recruiter_id

    ];

    for (
        const value of candidates
    ) {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return value;

        }

    }

    return null;

}


// =========================================================
// FETCH COMPANY PROFILE AFTER LOGIN
// =========================================================
//
// This is the important fallback.
//
// If /company/signin returns the token and company ID
// but does NOT include company_name, we use the same
// authenticated session to retrieve the company profile.
// =========================================================

async function fetchCompanyProfile(
    token,
    companyId
) {

    if (
        !token ||
        !companyId
    ) {

        return null;

    }

    try {

        const response =
            await fetch(
                `${COMPANY_PROFILE_API}/${companyId}`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await readResponse(
                response
            );

        if (
            !response.ok
        ) {

            console.warn(
                "Company profile request failed:",
                response.status,
                data
            );

            return null;

        }

        const profile =
            data?.profile ||
            data?.company ||
            data;

        if (
            !profile ||
            typeof profile !== "object"
        ) {

            return null;

        }

        return profile;

    } catch (error) {

        console.error(
            "Unable to fetch company profile after login:",
            error
        );

        return null;

    }

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
                    data?.jwt ||
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

                let companyId =
                    extractCompanyId(
                        data
                    );


                // =================================
                // FALLBACK: READ COMPANY ID
                // FROM JWT
                // =================================

                if (!companyId) {

                    try {

                        const parts =
                            token.split(".");

                        if (
                            parts.length === 3
                        ) {

                            const payload =
                                JSON.parse(
                                    decodeURIComponent(
                                        atob(
                                            parts[1]
                                                .replace(
                                                    /-/g,
                                                    "+"
                                                )
                                                .replace(
                                                    /_/g,
                                                    "/"
                                                )
                                        )
                                            .split("")
                                            .map(
                                                char =>
                                                    "%" +
                                                    (
                                                        "00" +
                                                        char
                                                            .charCodeAt(
                                                                0
                                                            )
                                                            .toString(
                                                                16
                                                            )
                                                    )
                                                        .slice(
                                                            -2
                                                        )
                                            )
                                            .join("")
                                    )
                                );

                            const jwtCompanyId =
                                Number(
                                    payload?.companyId ??
                                    payload?.company_id ??
                                    payload?.company?.id
                                );

                            if (
                                Number.isInteger(
                                    jwtCompanyId
                                ) &&
                                jwtCompanyId > 0
                            ) {

                                companyId =
                                    jwtCompanyId;

                            }

                        }

                    } catch (error) {

                        console.warn(
                            "Unable to read company ID from JWT:",
                            error
                        );

                    }

                }


                if (!companyId) {

                    throw new Error(
                        "Login succeeded, but the server did not return a valid company ID."
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
                    extractUserId(
                        data
                    );


                // =================================
                // GET COMPANY NAME
                // =================================

                let companyName =
                    extractCompanyName(
                        data
                    );


                // =================================
                // GET COMPLETE COMPANY OBJECT
                // =================================

                let companyData =
                    (
                        data?.company &&
                        typeof data.company === "object"
                    )
                        ? {
                            ...data.company
                        }
                        : null;


                // =================================
                // FALLBACK:
                // FETCH COMPANY PROFILE
                // =================================

                if (
                    !companyName
                ) {

                    console.log(
                        "Company name not present in signin response. Fetching company profile..."
                    );


                    const profile =
                        await fetchCompanyProfile(
                            token.trim(),
                            numericCompanyId
                        );


                    if (profile) {

                        const profileName =
                            extractCompanyName(
                                profile
                            );


                        if (
                            profileName
                        ) {

                            companyName =
                                profileName;

                        }


                        companyData = {

                            ...(companyData || {}),

                            ...profile

                        };

                    }

                }


                // =================================
                // GET COMPANY EMAIL
                // =================================

                const companyEmail =
                    data?.email ??
                    data?.company?.email ??
                    data?.company?.gmail ??
                    data?.gmail ??
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
                    companyData &&
                    typeof companyData ===
                        "object"
                ) {

                    localStorage.setItem(
                        COMPANY_DATA_KEY,
                        JSON.stringify(
                            companyData
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

                const savedCompanyName =
                    localStorage.getItem(
                        COMPANY_NAME_KEY
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
                    savedCompanyName ||
                    "(not returned by server)"
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
