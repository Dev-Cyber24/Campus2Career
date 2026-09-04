// =========================================
// CAMPUS2CAREER
// USER SIGNUP JAVASCRIPT
// =========================================
// Backend:
// POST https://campus2career-0pi8.onrender.com/api/signup
//
// Request:
// {
//     fullname,
//     email,
//     password
// }
//
// Success response:
// {
//     success: true,
//     message: "Account created successfully.",
//     userId
// }
// =========================================


// =========================================
// API
// =========================================

const API_URL =
    "https://campus2career-0pi8.onrender.com/api/signup";


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const signupForm =
            document.getElementById(
                "signupForm"
            );


        const signupBtn =
            document.getElementById(
                "signupBtn"
            );


        // -----------------------------------------
        // Required form check
        // -----------------------------------------

        if (!signupForm) {

            console.error(
                "Campus2Career: signupForm was not found."
            );

            return;

        }


        // =========================================
        // FORM SUBMISSION
        // =========================================

        signupForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                // -------------------------------------
                // Get form elements
                // -------------------------------------

                const fullnameElement =
                    document.getElementById(
                        "fullname"
                    ) ||
                    document.getElementById(
                        "fullName"
                    );


                const emailElement =
                    document.getElementById(
                        "email"
                    );


                const passwordElement =
                    document.getElementById(
                        "password"
                    );


                const confirmPasswordElement =
                    document.getElementById(
                        "confirmPassword"
                    );


                // -------------------------------------
                // Check required elements
                // -------------------------------------

                if (
                    !fullnameElement ||
                    !emailElement ||
                    !passwordElement
                ) {

                    showMessage(
                        "❌ Required signup fields are missing.",
                        "red"
                    );

                    console.error(
                        "Required signup input elements were not found."
                    );

                    return;

                }


                // -------------------------------------
                // Read values
                // -------------------------------------

                const fullname =
                    fullnameElement.value.trim();


                const email =
                    emailElement.value
                        .trim()
                        .toLowerCase();


                const password =
                    passwordElement.value;


                const confirmPassword =
                    confirmPasswordElement
                        ? confirmPasswordElement.value
                        : "";


                // =====================================
                // VALIDATION
                // =====================================


                // -------------------------------------
                // Full name
                // -------------------------------------

                if (!fullname) {

                    showMessage(
                        "❌ Full Name is required.",
                        "red"
                    );

                    fullnameElement.focus();

                    return;

                }


                if (fullname.length < 3) {

                    showMessage(
                        "❌ Full Name must contain at least 3 characters.",
                        "red"
                    );

                    fullnameElement.focus();

                    return;

                }


                // -------------------------------------
                // Email
                // -------------------------------------

                if (!email) {

                    showMessage(
                        "❌ Email is required.",
                        "red"
                    );

                    emailElement.focus();

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
                        "❌ Invalid email format.",
                        "red"
                    );

                    emailElement.focus();

                    return;

                }


                // -------------------------------------
                // Password
                // -------------------------------------

                if (!password) {

                    showMessage(
                        "❌ Password is required.",
                        "red"
                    );

                    passwordElement.focus();

                    return;

                }


                if (password.length < 8) {

                    showMessage(
                        "❌ Password must be at least 8 characters long.",
                        "red"
                    );

                    passwordElement.focus();

                    return;

                }


                // -------------------------------------
                // Confirm password
                // -------------------------------------

                if (
                    confirmPasswordElement &&
                    !confirmPassword
                ) {

                    showMessage(
                        "❌ Please confirm your password.",
                        "red"
                    );

                    confirmPasswordElement.focus();

                    return;

                }


                if (
                    confirmPasswordElement &&
                    password !== confirmPassword
                ) {

                    showMessage(
                        "❌ Passwords do not match.",
                        "red"
                    );

                    confirmPasswordElement.focus();

                    return;

                }


                // =====================================
                // DISABLE SUBMIT BUTTON
                // =====================================

                if (signupBtn) {

                    signupBtn.disabled =
                        true;

                    signupBtn.dataset.originalText =
                        signupBtn.textContent;

                    signupBtn.textContent =
                        "Creating Account...";

                }


                showMessage(
                    "Creating your account...",
                    "#2563eb"
                );


                // =====================================
                // SEND REQUEST
                // =====================================

                try {

                    console.log(
                        "Sending signup request to:",
                        API_URL
                    );


                    const response =
                        await fetch(
                            API_URL,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    Accept:
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        fullname,
                                        email,
                                        password
                                    })
                            }
                        );


                    // ---------------------------------
                    // Read response safely
                    // ---------------------------------

                    const responseText =
                        await response.text();


                    let data = {};


                    if (
                        responseText &&
                        responseText.trim()
                    ) {

                        try {

                            data =
                                JSON.parse(
                                    responseText
                                );

                        } catch (parseError) {

                            console.error(
                                "Invalid JSON received from signup API:",
                                responseText
                            );

                            throw new Error(
                                "The server returned an invalid response."
                            );

                        }

                    }


                    console.log(
                        "Signup API status:",
                        response.status
                    );


                    console.log(
                        "Signup API response:",
                        data
                    );


                    // =================================
                    // HANDLE SERVER ERRORS
                    // =================================

                    if (!response.ok) {

                        const serverError =
                            data?.error ||
                            data?.message ||
                            `Signup failed. Server returned HTTP ${response.status}.`;


                        // ---------------------------------
                        // Duplicate email
                        // Backend returns 409
                        // ---------------------------------

                        if (
                            response.status === 409
                        ) {

                            throw new Error(
                                "This email is already registered."
                            );

                        }


                        throw new Error(
                            serverError
                        );

                    }


                    // =================================
                    // VERIFY SUCCESS RESPONSE
                    // =================================

                    if (
                        data.success !== true
                    ) {

                        throw new Error(
                            data.error ||
                            data.message ||
                            "Account creation was not completed."
                        );

                    }


                    // =================================
                    // STORE USER ID
                    // =================================
                    //
                    // The backend returns userId.
                    // Store only the ID.
                    //
                    // NEVER store the password.
                    // =================================

                    if (
                        data.userId !== undefined &&
                        data.userId !== null
                    ) {

                        localStorage.setItem(
                            "userId",
                            String(
                                data.userId
                            )
                        );


                        console.log(
                            "Registered user ID saved:",
                            data.userId
                        );

                    }


                    // ---------------------------------
                    // Store basic non-sensitive info
                    // ---------------------------------

                    localStorage.setItem(
                        "signupEmail",
                        email
                    );


                    localStorage.setItem(
                        "signupName",
                        fullname
                    );


                    // =================================
                    // SUCCESS
                    // =================================

                    showMessage(
                        "✅ Account created successfully! Redirecting to login...",
                        "green"
                    );


                    // Clear form

                    signupForm.reset();


                    // =================================
                    // REDIRECT TO LOGIN
                    // =================================

                    setTimeout(
                        () => {

                            window.location.href =
                                "login.html";

                        },
                        1000
                    );


                } catch (error) {

                    console.error(
                        "SIGNUP ERROR:",
                        error
                    );


                    showMessage(
                        "❌ " +
                        (
                            error.message ||
                            "Unable to create your account."
                        ),
                        "red"
                    );


                    // ---------------------------------
                    // Enable button again
                    // ---------------------------------

                    if (signupBtn) {

                        signupBtn.disabled =
                            false;


                        signupBtn.textContent =
                            signupBtn.dataset.originalText ||
                            "Sign Up";

                    }

                }

            }
        );


        // =========================================
        // LIVE PASSWORD MATCH CHECK
        // =========================================

        const passwordInput =
            document.getElementById(
                "password"
            );


        const confirmPasswordInput =
            document.getElementById(
                "confirmPassword"
            );


        if (
            passwordInput &&
            confirmPasswordInput
        ) {

            confirmPasswordInput.addEventListener(
                "input",
                () => {

                    const confirmValue =
                        confirmPasswordInput.value;


                    if (!confirmValue) {

                        confirmPasswordInput.setCustomValidity(
                            ""
                        );

                        return;

                    }


                    if (
                        passwordInput.value !==
                        confirmValue
                    ) {

                        confirmPasswordInput.setCustomValidity(
                            "Passwords do not match."
                        );


                        showMessage(
                            "❌ Passwords do not match.",
                            "red"
                        );

                    } else {

                        confirmPasswordInput.setCustomValidity(
                            ""
                        );


                        showMessage(
                            "✅ Passwords match.",
                            "green"
                        );

                    }

                }
            );


            passwordInput.addEventListener(
                "input",
                () => {

                    if (
                        confirmPasswordInput.value === ""
                    ) {

                        return;

                    }


                    if (
                        passwordInput.value !==
                        confirmPasswordInput.value
                    ) {

                        confirmPasswordInput.setCustomValidity(
                            "Passwords do not match."
                        );

                    } else {

                        confirmPasswordInput.setCustomValidity(
                            ""
                        );

                    }

                }
            );

        }

    }
);


// =========================================
// DISPLAY MESSAGE
// =========================================

function showMessage(
    text,
    color
) {

    const message =
        document.getElementById(
            "message"
        );


    if (!message) {

        console.log(text);

        return;

    }


    message.textContent =
        text;


    message.style.color =
        color;


    message.style.display =
        "block";

}


// =========================================
// GLOBAL ACCESS
// =========================================

window.showSignupMessage =
    showMessage;
