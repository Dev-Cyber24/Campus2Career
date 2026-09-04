"use strict";

// =========================================
// CAMPUS2CAREER COURSE FORM JAVASCRIPT
// CREATE COURSE
// =========================================

console.log("courses.js loaded");


// =========================================
// API
// =========================================

const API_BASE_URL =
    "https://campus2career-0pi8.onrender.com";

const COURSES_API =
    `${API_BASE_URL}/api/courses`;


// =========================================
// STORAGE KEYS
// =========================================

const TOKEN_KEY =
    "authToken";


// =========================================
// ELEMENTS
// =========================================

const courseForm =
    document.getElementById(
        "courseForm"
    );

const saveCourseBtn =
    document.getElementById(
        "saveCourseBtn"
    );

const message =
    document.getElementById(
        "message"
    );


// =========================================
// FORM FIELDS
// =========================================

const courseName =
    document.getElementById(
        "courseName"
    );

const field =
    document.getElementById(
        "field"
    );

const institution =
    document.getElementById(
        "institution"
    );

const description =
    document.getElementById(
        "description"
    );

const level =
    document.getElementById(
        "level"
    );

const mode =
    document.getElementById(
        "mode"
    );

const duration =
    document.getElementById(
        "duration"
    );

const courseUrl =
    document.getElementById(
        "courseUrl"
    );


// =========================================
// PREVIEW ELEMENTS
// =========================================

const previewName =
    document.getElementById(
        "previewName"
    );

const previewField =
    document.getElementById(
        "previewField"
    );

const previewDescription =
    document.getElementById(
        "previewDescription"
    );

const previewInstitution =
    document.getElementById(
        "previewInstitution"
    );

const previewLevel =
    document.getElementById(
        "previewLevel"
    );

const previewMode =
    document.getElementById(
        "previewMode"
    );

const previewDuration =
    document.getElementById(
        "previewDuration"
    );

const previewLink =
    document.getElementById(
        "previewLink"
    );


// =========================================
// AUTHENTICATION
// =========================================

function getAuthToken() {

    const token =
        localStorage.getItem(
            TOKEN_KEY
        );

    return (
        token &&
        token.trim()
            ? token.trim()
            : null
    );

}


// =========================================
// CLEAR AUTH DATA
// =========================================

function clearAuthData() {

    localStorage.removeItem(
        "authToken"
    );

    localStorage.removeItem(
        "userId"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "loginEmail"
    );

}


// =========================================
// SHOW MESSAGE
// =========================================

function showMessage(
    text,
    color
) {

    if (!message) {

        if (text) {
            console.log(text);
        }

        return;

    }


    message.textContent =
        text || "";


    message.style.color =
        color || "";


    message.style.display =
        text
            ? "block"
            : "none";

}


// =========================================
// READ API RESPONSE
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
                "JSON parsing error:",
                error
            );

            return {};

        }

    }


    try {

        return await response.text();

    } catch (error) {

        console.error(
            "Response reading error:",
            error
        );

        return "";

    }

}


// =========================================
// GET ERROR MESSAGE
// =========================================

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
        data.trim()
    ) {

        return data.trim();

    }


    return fallback;

}


// =========================================
// UPDATE LIVE PREVIEW
// =========================================

function updatePreview() {

    // ---------------------------------------
    // COURSE NAME
    // ---------------------------------------

    if (previewName) {

        previewName.textContent =
            courseName?.value.trim() ||
            "Course Name";

    }


    // ---------------------------------------
    // FIELD
    // ---------------------------------------

    if (previewField) {

        previewField.textContent =
            field?.value.trim() ||
            "Course Field";

    }


    // ---------------------------------------
    // DESCRIPTION
    // ---------------------------------------

    if (previewDescription) {

        previewDescription.textContent =
            description?.value.trim() ||
            "Course description will appear here.";

    }


    // ---------------------------------------
    // INSTITUTION
    // ---------------------------------------

    if (previewInstitution) {

        previewInstitution.textContent =
            institution?.value.trim() ||
            "Institution not specified";

    }


    // ---------------------------------------
    // LEVEL
    // ---------------------------------------

    if (previewLevel) {

        previewLevel.textContent =
            level?.value ||
            "Not specified";

    }


    // ---------------------------------------
    // MODE
    // ---------------------------------------

    if (previewMode) {

        previewMode.textContent =
            mode?.value ||
            "Not specified";

    }


    // ---------------------------------------
    // DURATION
    // ---------------------------------------

    if (previewDuration) {

        previewDuration.textContent =
            duration?.value.trim() ||
            "Not specified";

    }


    // ---------------------------------------
    // COURSE URL
    // ---------------------------------------

    if (previewLink) {

        const url =
            courseUrl?.value.trim() ||
            "";


        if (url !== "") {

            let validUrl =
                url;


            // Add https:// when omitted
            if (
                !/^https?:\/\//i.test(
                    validUrl
                )
            ) {

                validUrl =
                    `https://${validUrl}`;

            }


            previewLink.href =
                validUrl;


            previewLink.target =
                "_blank";


            previewLink.rel =
                "noopener noreferrer";


            previewLink.textContent =
                "View Course";


            previewLink.style.display =
                "block";

        } else {

            previewLink.removeAttribute(
                "href"
            );


            previewLink.removeAttribute(
                "target"
            );


            previewLink.removeAttribute(
                "rel"
            );


            previewLink.textContent =
                "View Course";


            previewLink.style.display =
                "none";

        }

    }

}


// =========================================
// GET COURSE DATA
// =========================================

function getCourseData() {

    return {

        course_name:
            courseName?.value.trim() ||
            "",

        field:
            field?.value.trim() ||
            "",

        description:
            description?.value.trim() ||
            "",

        institution:
            institution?.value.trim() ||
            "",

        level:
            level?.value.trim() ||
            "",

        mode:
            mode?.value.trim() ||
            "",

        duration:
            duration?.value.trim() ||
            "",

        course_url:
            courseUrl?.value.trim() ||
            ""

    };

}


// =========================================
// VALIDATE COURSE
// =========================================

function validateCourse(
    data
) {

    // ---------------------------------------
    // COURSE NAME
    // ---------------------------------------

    if (!data.course_name) {

        showMessage(
            "Course name is required.",
            "red"
        );


        if (courseName) {
            courseName.focus();
        }


        return false;

    }


    // ---------------------------------------
    // FIELD
    // ---------------------------------------

    if (!data.field) {

        showMessage(
            "Course field is required.",
            "red"
        );


        if (field) {
            field.focus();
        }


        return false;

    }


    // ---------------------------------------
    // COURSE URL
    // ---------------------------------------

    if (data.course_url) {

        let testUrl =
            data.course_url;


        if (
            !/^https?:\/\//i.test(
                testUrl
            )
        ) {

            testUrl =
                `https://${testUrl}`;

        }


        try {

            new URL(
                testUrl
            );

        } catch {

            showMessage(
                "Please enter a valid course URL.",
                "red"
            );


            if (courseUrl) {
                courseUrl.focus();
            }


            return false;

        }

    }


    return true;

}


// =========================================
// SAVE COURSE
// =========================================

async function saveCourse() {

    // =====================================
    // CHECK FORM
    // =====================================

    if (!courseForm) {

        console.error(
            "courseForm was not found."
        );

        return;

    }


    // =====================================
    // GET TOKEN
    // =====================================

    const token =
        getAuthToken();


    if (!token) {

        showMessage(
            "❌ Please login before creating a course.",
            "red"
        );


        console.error(
            "No authToken found in localStorage."
        );


        setTimeout(
            () => {

                window.location.href =
                    "login.html";

            },
            700
        );


        return;

    }


    // =====================================
    // GET FORM DATA
    // =====================================

    const data =
        getCourseData();


    console.log(
        "Course data:",
        data
    );


    // =====================================
    // VALIDATION
    // =====================================

    if (
        !validateCourse(
            data
        )
    ) {

        return;

    }


    // =====================================
    // NORMALIZE COURSE URL
    // =====================================

    if (
        data.course_url &&
        !/^https?:\/\//i.test(
            data.course_url
        )
    ) {

        data.course_url =
            `https://${data.course_url}`;

    }


    // =====================================
    // DISABLE BUTTON
    // =====================================

    let originalButtonText =
        "Save Course";


    if (saveCourseBtn) {

        originalButtonText =
            saveCourseBtn.textContent ||
            "Save Course";


        saveCourseBtn.disabled =
            true;


        saveCourseBtn.textContent =
            "Saving Course...";

    }


    showMessage(
        "Saving course...",
        "#0a66c2"
    );


    try {

        // =================================
        // SEND REQUEST TO NODE.JS
        // =================================

        console.log(
            "POST:",
            COURSES_API
        );


        const response =
            await fetch(
                COURSES_API,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            data
                        )
                }
            );


        console.log(
            "Courses API status:",
            response.status
        );


        // =================================
        // READ SERVER RESPONSE
        // =================================

        const result =
            await readResponse(
                response
            );


        console.log(
            "Courses API response:",
            result
        );


        // =================================
        // SESSION EXPIRED
        // =================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            clearAuthData();


            throw new Error(
                "Your login session has expired. Please login again."
            );

        }


        // =================================
        // SERVER ERROR
        // =================================

        if (!response.ok) {

            throw new Error(
                getApiErrorMessage(
                    result,
                    `Server returned HTTP ${response.status}.`
                )
            );

        }


        // =================================
        // VERIFY SUCCESS
        // =================================

        if (
            result &&
            typeof result === "object" &&
            result.success === false
        ) {

            throw new Error(
                getApiErrorMessage(
                    result,
                    "Course could not be created."
                )
            );

        }


        // =================================
        // GET CREATED COURSE ID
        // =================================

        const createdCourseId =
            result?.courseId ??
            result?.course?.id ??
            result?.id ??
            null;


        // =================================
        // SAVE ID
        // =================================

        if (
            createdCourseId !== null &&
            createdCourseId !== undefined
        ) {

            localStorage.setItem(
                "lastCourseId",
                String(
                    createdCourseId
                )
            );


            console.log(
                "Created course ID:",
                createdCourseId
            );

        }


        // =================================
        // SUCCESS
        // =================================

        showMessage(
            result?.message ||
            "✅ Course saved successfully!",
            "green"
        );


        console.log(
            "Course created successfully."
        );


        // =================================
        // RESET FORM
        // =================================

        courseForm.reset();


        // =================================
        // RESET PREVIEW
        // =================================

        updatePreview();


    } catch (error) {

        console.error(
            "SAVE COURSE ERROR:",
            error
        );


        showMessage(
            "❌ " +
            (
                error.message ||
                "Unable to save course."
            ),
            "red"
        );

    } finally {

        // =================================
        // RESTORE BUTTON
        // =================================

        if (saveCourseBtn) {

            saveCourseBtn.disabled =
                false;


            saveCourseBtn.textContent =
                originalButtonText;

        }

    }

}


// =========================================
// FORM SUBMISSION
// =========================================

if (courseForm) {

    courseForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveCourse();

        }
    );

}


// =========================================
// LIVE PREVIEW LISTENERS
// =========================================

const previewFields = [

    courseName,
    field,
    institution,
    description,
    level,
    mode,
    duration,
    courseUrl

];


previewFields.forEach(
    element => {

        if (!element) {
            return;
        }


        element.addEventListener(
            "input",
            updatePreview
        );


        element.addEventListener(
            "change",
            updatePreview
        );

    }
);


// =========================================
// INITIAL PREVIEW
// =========================================

updatePreview();


// =========================================
// GLOBAL ACCESS
// =========================================

window.saveCourse =
    saveCourse;

window.updateCoursePreview =
    updatePreview;
