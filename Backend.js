// =========================================
// CAMPUS2CAREER LOGIN JAVASCRIPT
// JWT AUTHENTICATION
// =========================================

console.log("Backend.js loaded");


// =========================================
// API URL
// =========================================

const API_BASE_URL =
    "https://campus2career-0pi8.onrender.com";

const API_URL =
    `${API_BASE_URL}/api/login`;


// =========================================
// STORAGE KEYS
// =========================================

const TOKEN_KEY =
    "authToken";

const USER_ID_KEY =
    "userId";

const USERNAME_KEY =
    "username";

const EMAIL_KEY =
    "loginEmail";


// =========================================
// MAIN PORTAL PAGE
// =========================================

const MAIN_PORTAL =
    "MainPortal.html";


// =========================================
// PAGE INITIALIZATION
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Login page initialized.");


        // =====================================
        // GET FORM ELEMENTS
        // =====================================

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const signInBtn =
            document.getElementById(
                "signinBtn"
            );


        // =====================================
        // CHECK HTML ELEMENTS
        // =====================================

        if (!loginForm) {

            console.error(
                "ERROR: loginForm was not found."
            );

            return;
        }


        if (!signInBtn) {

            console.error(
                "ERROR: signinBtn was not found."
            );

            return;
        }


        // =====================================
        // LOGIN SUBMISSION
        // =====================================

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                // =================================
                // GET INPUT ELEMENTS
                // =================================

                const emailElement =
                    document.getElementById(
                        "email"
                    );

                const passwordElement =
                    document.getElementById(
                        "password"
                    );


                if (
                    !emailElement ||
                    !passwordElement
                ) {

                    console.error(
                        "Login input fields are missing."
                    );

                    showMessage(
                        "Login fields are missing.",
                        "red"
                    );

                    return;
                }


                // =================================
                // GET INPUT VALUES
                // =================================

                const email =
                    emailElement.value
                        .trim()
                        .toLowerCase();

                const password =
                    passwordElement.value;


                // =================================
                // CLEAR PREVIOUS MESSAGE
                // =================================

                showMessage(
                    "",
                    ""
                );


                // =================================
                // EMAIL VALIDATION
                // =================================

                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (email === "") {

                    showMessage(
                        "Email is required.",
                        "red"
                    );

                    emailElement.focus();

                    return;
                }


                if (
                    !emailPattern.test(email)
                ) {

                    showMessage(
                        "Please enter a valid email address.",
                        "red"
                    );

                    emailElement.focus();

                    return;
                }


                // =================================
                // PASSWORD VALIDATION
                // =================================

                if (password === "") {

                    showMessage(
                        "Password is required.",
                        "red"
                    );

                    passwordElement.focus();

                    return;
                }


                if (password.length < 8) {

                    showMessage(
                        "Password must be at least 8 characters long.",
                        "red"
                    );

                    passwordElement.focus();

                    return;
                }


                // =================================
                // DISABLE LOGIN BUTTON
                // =================================

                signInBtn.disabled =
                    true;

                const originalButtonText =
                    signInBtn.textContent;

                signInBtn.textContent =
                    "Signing In...";


                showMessage(
                    "Checking your credentials...",
                    "#2563eb"
                );


                try {

                    // =================================
                    // CHECK API URL
                    // =================================

                    console.log(
                        "Sending login request to:",
                        API_URL
                    );


                    // =================================
                    // SEND LOGIN REQUEST
                    // =================================

                    const response =
                        await fetch(
                            API_URL,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Accept":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        email: email,
                                        password: password
                                    })
                            }
                        );


                    // =================================
                    // READ RESPONSE
                    // =================================

                    const responseText =
                        await response.text();


                    console.log(
                        "Login HTTP status:",
                        response.status
                    );

                    console.log(
                        "Login server response:",
                        responseText
                    );


                    // =================================
                    // PARSE JSON RESPONSE
                    // =================================

                    let data = {};


                    if (
                        responseText &&
                        responseText.trim() !== ""
                    ) {

                        try {

                            data =
                                JSON.parse(
                                    responseText
                                );

                        } catch (jsonError) {

                            console.error(
                                "Invalid JSON returned by server:",
                                jsonError
                            );

                            console.error(
                                "Raw server response:",
                                responseText
                            );

                            throw new Error(
                                "The server returned an invalid response."
                            );
                        }
                    }


                    // =================================
                    // HANDLE HTTP ERRORS
                    // =================================

                    if (!response.ok) {

                        let errorMessage =
                            "Invalid email or password.";


                        if (
                            data &&
                            typeof data.error === "string" &&
                            data.error.trim() !== ""
                        ) {

                            errorMessage =
                                data.error;
                        }

                        else if (
                            data &&
                            typeof data.message === "string" &&
                            data.message.trim() !== ""
                        ) {

                            errorMessage =
                                data.message;
                        }

                        else if (
                            data &&
                            typeof data.detail === "string" &&
                            data.detail.trim() !== ""
                        ) {

                            errorMessage =
                                data.detail;
                        }


                        throw new Error(
                            errorMessage
                        );
                    }


                    // =================================
                    // VERIFY LOGIN SUCCESS
                    // =================================

                    if (
                        !data ||
                        typeof data !== "object"
                    ) {

                        throw new Error(
                            "The server returned an invalid login response."
                        );
                    }


                    // =================================
                    // VERIFY JWT TOKEN
                    // =================================

                    if (
                        !data.token ||
                        typeof data.token !== "string" ||
                        data.token.trim() === ""
                    ) {

                        console.error(
                            "Login response does not contain a valid token:",
                            data
                        );

                        throw new Error(
                            "Login succeeded, but the server did not return an authentication token."
                        );
                    }


                    // =================================
                    // VERIFY USER ID
                    // =================================

                    if (
                        data.userId === undefined ||
                        data.userId === null ||
                        String(data.userId).trim() === ""
                    ) {

                        console.error(
                            "Login response does not contain userId:",
                            data
                        );

                        throw new Error(
                            "Login succeeded, but the server did not return a user ID."
                        );
                    }


                    // =================================
                    // PREPARE USER DATA
                    // =================================

                    const userId =
                        String(
                            data.userId
                        );

                    const username =
                        data.username
                            ? String(data.username)
                            : "";

                    const loginEmail =
                        data.email
                            ? String(data.email)
                            : email;


                    // =================================
                    // CLEAR OLD LOGIN DATA
                    // =================================

                    localStorage.removeItem(
                        TOKEN_KEY
                    );

                    localStorage.removeItem(
                        USER_ID_KEY
                    );

                    localStorage.removeItem(
                        USERNAME_KEY
                    );

                    localStorage.removeItem(
                        EMAIL_KEY
                    );


                    // =================================
                    // STORE JWT TOKEN
                    // =================================

                    localStorage.setItem(
                        TOKEN_KEY,
                        data.token
                    );


                    // =================================
                    // STORE USER ID
                    // =================================

                    localStorage.setItem(
                        USER_ID_KEY,
                        userId
                    );


                    // =================================
                    // STORE USERNAME
                    // =================================

                    if (username !== "") {

                        localStorage.setItem(
                            USERNAME_KEY,
                            username
                        );
                    }


                    // =================================
                    // STORE EMAIL
                    // =================================

                    localStorage.setItem(
                        EMAIL_KEY,
                        loginEmail
                    );


                    // =================================
                    // VERIFY LOCAL STORAGE
                    // =================================

                    const savedToken =
                        localStorage.getItem(
                            TOKEN_KEY
                        );

                    const savedUserId =
                        localStorage.getItem(
                            USER_ID_KEY
                        );


                    if (
                        !savedToken ||
                        savedToken.trim() === ""
                    ) {

                        throw new Error(
                            "The authentication token could not be stored."
                        );
                    }


                    if (
                        !savedUserId ||
                        savedUserId.trim() === ""
                    ) {

                        throw new Error(
                            "The user ID could not be stored."
                        );
                    }


                    // =================================
                    // DEBUG INFORMATION
                    // =================================

                    console.log(
                        "Login successful."
                    );

                    console.log(
                        "JWT stored successfully."
                    );

                    console.log(
                        "Logged-in user ID:",
                        savedUserId
                    );

                    console.log(
                        "Username:",
                        username
                    );

                    console.log(
                        "Email:",
                        loginEmail
                    );


                    // =================================
                    // SUCCESS MESSAGE
                    // =================================

                    showMessage(
                        "✅ Login successful! Redirecting...",
                        "green"
                    );


                    // =================================
                    // REDIRECT TO MAIN PORTAL
                    // =================================

                    setTimeout(
                        function () {

                            window.location.href =
                                MAIN_PORTAL;

                        },
                        800
                    );


                } catch (error) {

                    // =================================
                    // LOGIN ERROR
                    // =================================

                    console.error(
                        "LOGIN ERROR:",
                        error
                    );


                    // =================================
                    // SHOW USER ERROR
                    // =================================

                    showMessage(
                        "❌ " +
                        (
                            error.message ||
                            "Unable to sign in. Please try again."
                        ),
                        "red"
                    );


                    // =================================
                    // ENABLE BUTTON
                    // =================================

                    signInBtn.disabled =
                        false;

                    signInBtn.textContent =
                        originalButtonText ||
                        "Sign In";
                }

            }
        );

    }
);


// =========================================
// SHOW MESSAGE
// =========================================

function showMessage(
    text,
    color
) {

    const message =
        document.getElementById(
            "message"
        );


    // =====================================
    // MESSAGE ELEMENT NOT FOUND
    // =====================================

    if (!message) {

        if (text) {

            console.log(
                text
            );
        }

        return;
    }


    // =====================================
    // SET MESSAGE TEXT
    // =====================================

    message.textContent =
        text;


    // =====================================
    // SET MESSAGE COLOR
    // =====================================

    if (color) {

        message.style.color =
            color;

    } else {

        message.style.color =
            "";
    }

}
