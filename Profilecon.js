"use strict";

// =========================================
// CAMPUS2CAREER USER PROFILE JAVASCRIPT
// JWT AUTHENTICATED + PUBLIC VIEW MODE
// BACKEND CONTROLLED CONNECTIONS / RATING / GRADE
// =========================================

console.log("Profilecon.js loaded");


// =========================================
// API
// =========================================

const API_BASE_URL =
    "https://campus2career-0pi8.onrender.com/api";

const MY_PROFILE_API =
    `${API_BASE_URL}/my-profile`;

const PUBLIC_PROFILE_API =
    `${API_BASE_URL}/user-profile`;

const INDUSTRY_READINESS_API =
    `${API_BASE_URL}/industry-readiness/latest`;


// =========================================
// JWT STORAGE KEY
// =========================================

const TOKEN_KEY =
    "authToken";

const USER_ID_KEY =
    "userId";


// =========================================
// EDIT MODE
// =========================================

let editMode = false;


// =========================================
// PROFILE MODE
// =========================================
//
// Profile.html
//      -> own profile
//
// Profile.html?viewUserId=8
//      -> public profile of user 8
//
// =========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const viewedUserIdParam =
    urlParams.get(
        "viewUserId"
    );


// =========================================
// LOGGED-IN USER ID
// =========================================

const storedLoggedInUserId =
    localStorage.getItem(
        USER_ID_KEY
    );

const loggedInUserId =
    Number(
        storedLoggedInUserId
    );


// =========================================
// DETERMINE DISPLAYED PROFILE
// =========================================

let userId = null;

let isOwnProfile = false;


// =========================================
// PUBLIC PROFILE REQUEST
// =========================================

if (
    viewedUserIdParam &&
    Number.isInteger(
        Number(viewedUserIdParam)
    ) &&
    Number(viewedUserIdParam) > 0
) {

    userId =
        Number(
            viewedUserIdParam
        );


    isOwnProfile =
        Number.isInteger(
            loggedInUserId
        ) &&
        loggedInUserId > 0 &&
        userId === loggedInUserId;

}


// =========================================
// OWN PROFILE REQUEST
// =========================================

else {

    if (
        Number.isInteger(
            loggedInUserId
        ) &&
        loggedInUserId > 0
    ) {

        userId =
            loggedInUserId;

        isOwnProfile =
            true;

    }

}


// =========================================
// LOGGING
// =========================================

console.log(
    "Logged-in user ID:",
    loggedInUserId
);

console.log(
    "Requested profile ID:",
    viewedUserIdParam
);

console.log(
    "Displayed profile ID:",
    userId
);

console.log(
    "Own profile:",
    isOwnProfile
);


// =========================================
// FIELD CONFIGURATION
// =========================================

const fields = [

    {
        view: "view-name",
        edit: "edit-name",
        key: "name"
    },

    {
        view: "view-headline",
        edit: "edit-headline",
        key: "headline"
    },

    {
        view: "view-tagline",
        edit: "edit-tagline",
        key: "tagline"
    },

    {
        view: "view-location",
        edit: "edit-location",
        key: "location"
    },

    {
        view: "view-about",
        edit: "edit-about",
        key: "about"
    },

    {
        view: "view-email",
        edit: "edit-email",
        key: "email"
    },

    {
        view: "view-phone",
        edit: "edit-phone",
        key: "phone"
    },

    {
        view: "view-github",
        edit: "edit-github",
        key: "github"
    },

    {
        view: "view-linkedin",
        edit: "edit-linkedin",
        key: "linkedin"
    },

    {
        view: "view-education",
        edit: "edit-education",
        key: "education"
    },

    {
        view: "view-experience",
        edit: "edit-experience",
        key: "experience"
    },

    {
        view: "view-projects",
        edit: "edit-projects",
        key: "projects"
    },

    {
        view: "view-skills",
        edit: "edit-skills",
        key: "skills"
    },

    {
        view: "view-certifications",
        edit: "edit-certifications",
        key: "certifications"
    },

    {
        view: "view-achievements",
        edit: "edit-achievements",
        key: "achievements"
    }
];


// =========================================
// BACKEND CONTROLLED PROFILE FIELDS
// =========================================

const backendControlledFields = {

    connections: [
        "connections",
        "connection_count",
        "connectionCount"
    ],

    followers: [
        "followers",
        "follower_count",
        "followerCount"
    ],

    rating: [
        "test_rating",
        "testRating",
        "rating",
        "overall_rating",
        "overallRating"
    ],

    grade: [
        "grade",
        "test_grade",
        "testGrade",
        "overall_grade",
        "overallGrade"
    ],

    score: [
        "test_score",
        "testScore",
        "readiness_score",
        "readinessScore",
        "percentage"
    ]

};


// =========================================
// CURRENT PROFILE
// =========================================

let currentProfile = null;


// =========================================
// GET AUTH TOKEN
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
// CHECK AUTHENTICATION
// =========================================

function isAuthenticated() {

    return Boolean(
        getAuthToken() &&
        Number.isInteger(
            loggedInUserId
        ) &&
        loggedInUserId > 0
    );

}


// =========================================
// REQUIRE AUTHENTICATION
// =========================================

function requireAuthentication() {

    if (
        !isAuthenticated()
    ) {

        alert(
            "Please log in first."
        );


        window.location.href =
            "login.html";


        return false;
    }


    return true;
}


// =========================================
// GET FIRST AVAILABLE VALUE
// =========================================

function getFirstAvailableValue(
    object,
    possibleKeys
) {

    if (
        !object ||
        typeof object !== "object" ||
        !Array.isArray(possibleKeys)
    ) {

        return null;
    }


    for (
        const key of possibleKeys
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                object,
                key
            )
        ) {

            const value =
                object[key];


            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {

                return value;
            }

        }

    }


    return null;
}


// =========================================
// FORMAT CONNECTION COUNT
// =========================================

function formatConnections(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "0";
    }


    const numericValue =
        Number(value);


    if (
        Number.isFinite(
            numericValue
        )
    ) {

        return numericValue.toLocaleString();
    }


    return String(value);
}


// =========================================
// FORMAT RATING
// =========================================

function formatRating(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "Not Rated";
    }


    const numericValue =
        Number(value);


    if (
        Number.isFinite(
            numericValue
        )
    ) {

        return numericValue.toFixed(
            Number.isInteger(
                numericValue
            )
                ? 0
                : 1
        );
    }


    return String(value);
}


// =========================================
// FORMAT GRADE
// =========================================

function formatGrade(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "Not Available";
    }


    return String(
        value
    );
}


// =========================================
// GET BACKEND VALUE
// =========================================

function getBackendValue(
    profile,
    possibleKeys
) {

    return getFirstAvailableValue(
        profile,
        possibleKeys
    );

}


// =========================================
// UPDATE BACKEND CONTROLLED STATS
// =========================================

function updateBackendControlledStats(
    profile
) {

    if (
        !profile ||
        typeof profile !== "object"
    ) {

        return;
    }


    // =====================================
    // CONNECTIONS
    // =====================================

    const connectionsValue =
        getBackendValue(
            profile,
            backendControlledFields.connections
        );


    const connectionElements = [

        document.getElementById(
            "view-connections"
        ),

        document.getElementById(
            "connections-count"
        )

    ];


    connectionElements.forEach(
        element => {

            if (!element) {
                return;
            }


            element.textContent =
                formatConnections(
                    connectionsValue
                );

        }
    );


    // =====================================
    // FOLLOWERS
    // =====================================

    const followersValue =
        getBackendValue(
            profile,
            backendControlledFields.followers
        );


    const followerElements = [

        document.getElementById(
            "view-followers"
        ),

        document.getElementById(
            "followers-count"
        )

    ];


    followerElements.forEach(
        element => {

            if (!element) {
                return;
            }


            element.textContent =
                formatConnections(
                    followersValue
                );

        }
    );


    // =====================================
    // INDUSTRY READINESS SCORE
    // =====================================

    const scoreValue =
        getBackendValue(
            profile,
            backendControlledFields.score
        );


    const scoreElement =
        document.getElementById(
            "view-test-score"
        );


    if (scoreElement) {

        if (
            scoreValue !== undefined &&
            scoreValue !== null &&
            scoreValue !== ""
        ) {

            const score =
                Number(
                    scoreValue
                );


            if (
                Number.isFinite(
                    score
                )
            ) {

                scoreElement.textContent =
                    `${Number(
                        score.toFixed(
                            2
                        )
                    )}%`;

            } else {

                scoreElement.textContent =
                    "Not tested";
            }

        } else {

            scoreElement.textContent =
                "Not tested";
        }
    }


    // =====================================
    // GRADE
    // =====================================

    const gradeValue =
        getBackendValue(
            profile,
            backendControlledFields.grade
        );


    const gradeElement =
        document.getElementById(
            "view-grade"
        );


    if (gradeElement) {

        gradeElement.textContent =
            gradeValue !== undefined &&
            gradeValue !== null &&
            gradeValue !== ""
                ? formatGrade(
                    gradeValue
                )
                : "Not tested";
    }


    // =====================================
    // RATING
    // =====================================

    const ratingValue =
        getBackendValue(
            profile,
            backendControlledFields.rating
        );


    const ratingElement =
        document.getElementById(
            "view-rating"
        );


    if (ratingElement) {

        ratingElement.textContent =
            ratingValue !== undefined &&
            ratingValue !== null &&
            ratingValue !== ""
                ? `${formatRating(
                    ratingValue
                )} / 5`
                : "Not tested";
    }

}


// =========================================
// AUTHENTICATED FETCH
// =========================================

async function authenticatedFetch(
    url,
    options = {}
) {

    const token =
        getAuthToken();


    if (!token) {

        throw new Error(
            "You are not logged in."
        );
    }


    const headers = {

        ...(options.headers || {}),

        "Accept":
            "application/json",

        "Authorization":
            `Bearer ${token}`

    };


    return fetch(
        url,
        {
            ...options,
            headers
        }
    );

}


// =========================================
// PUBLIC FETCH
// =========================================

async function publicFetch(
    url,
    options = {}
) {

    const headers = {

        ...(options.headers || {}),

        "Accept":
            "application/json"

    };


    return fetch(
        url,
        {
            ...options,
            headers
        }
    );

}


// =========================================
// CLEAR AUTH DATA
// =========================================

function clearAuthenticationData() {

    localStorage.removeItem(
        TOKEN_KEY
    );

    localStorage.removeItem(
        USER_ID_KEY
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "loginEmail"
    );

}


// =========================================
// HANDLE AUTH ERROR
// =========================================

function handleAuthenticationError(
    status,
    redirect = true
) {

    if (
        status === 401 ||
        status === 403
    ) {

        clearAuthenticationData();


        if (redirect) {

            alert(
                "Your login session has expired. Please log in again."
            );


            window.location.href =
                "login.html";
        }


        return true;
    }


    return false;
}


// =========================================
// READ RESPONSE
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
                "JSON parse error:",
                error
            );

            return {};

        }

    }


    const text =
        await response.text();


    return text || "";

}


// =========================================
// GET ERROR MESSAGE
// =========================================

function getErrorMessage(
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


// =========================================
// UPDATE PROFILE PREVIEW
// =========================================

function updateProfile() {

    fields.forEach(
        field => {

            const view =
                document.getElementById(
                    field.view
                );

            const edit =
                document.getElementById(
                    field.edit
                );


            if (
                !view ||
                !edit
            ) {

                return;
            }


            const value =
                edit.value.trim();


            if (
                value !== ""
            ) {

                view.textContent =
                    value;

            }

        }
    );


    // -------------------------------------
    // Restore backend-controlled values
    // -------------------------------------

    if (
        currentProfile
    ) {

        updateBackendControlledStats(
            currentProfile
        );

    }


    updateProfileCompletion();

}


// =========================================
// LOAD INDUSTRY READINESS SCORE
// =========================================

async function loadIndustryReadinessScore() {

    const scoreElement =
        document.getElementById(
            "view-industry-readiness"
        );

    const percentageElement =
        document.getElementById(
            "view-industry-percentage"
        );

    const progressElement =
        document.getElementById(
            "industry-readiness-progress"
        );


    if (
        !scoreElement
    ) {

        console.warn(
            "view-industry-readiness element not found."
        );

        return;
    }


    // =====================================
    // THIS ENDPOINT IS AUTHENTICATED
    // =====================================

    if (
        !isAuthenticated()
    ) {

        scoreElement.textContent =
            "Not Tested";


        if (
            percentageElement
        ) {

            percentageElement.textContent =
                "Login required";
        }


        if (
            progressElement
        ) {

            progressElement.style.width =
                "0%";
        }


        return;
    }


    try {

        const response =
            await authenticatedFetch(
                INDUSTRY_READINESS_API,
                {
                    method: "GET"
                }
            );


        if (
            handleAuthenticationError(
                response.status
            )
        ) {

            return;
        }


        const result =
            await readResponse(
                response
            );


        if (
            !response.ok
        ) {

            throw new Error(
                getErrorMessage(
                    result,
                    `Server returned HTTP ${response.status}.`
                )
            );
        }


        // =================================
        // NO TEST
        // =================================

        if (
            !result.hasScore
        ) {

            scoreElement.textContent =
                "Not Tested";


            if (
                percentageElement
            ) {

                percentageElement.textContent =
                    "No assessment completed";
            }


            if (
                progressElement
            ) {

                progressElement.style.width =
                    "0%";
            }


            return;
        }


        // =================================
        // SCORE
        // =================================

        const score =
            Number(
                result.score
            );

        const total =
            Number(
                result.totalQuestions
            );

        const percentage =
            Number(
                result.percentage
            );


        if (
            Number.isFinite(score) &&
            Number.isFinite(total)
        ) {

            scoreElement.textContent =
                `${score}/${total}`;

        } else {

            scoreElement.textContent =
                "Available";
        }


        if (
            percentageElement
        ) {

            if (
                Number.isFinite(
                    percentage
                )
            ) {

                percentageElement.textContent =
                    `${percentage.toFixed(0)}%`;

            } else {

                percentageElement.textContent =
                    "Available";
            }

        }


        if (
            progressElement
        ) {

            const safePercentage =
                Number.isFinite(
                    percentage
                )
                    ? Math.max(
                        0,
                        Math.min(
                            100,
                            percentage
                        )
                    )
                    : 0;


            progressElement.style.width =
                `${safePercentage}%`;
        }


        // =================================
        // KEEP GRADE / RATING SYNCHRONIZED
        // =================================

        if (
            currentProfile &&
            typeof currentProfile === "object"
        ) {

            if (
                result.grade !== undefined
            ) {

                currentProfile.grade =
                    result.grade;
            }


            if (
                result.testRating !== undefined
            ) {

                currentProfile.test_rating =
                    result.testRating;
            }


            if (
                result.percentage !== undefined
            ) {

                currentProfile.test_score =
                    Number(
                        result.percentage
                    );
            }


            updateBackendControlledStats(
                currentProfile
            );
        }


        console.log(
            "Industry Readiness:",
            result
        );


    } catch (error) {

        console.error(
            "INDUSTRY READINESS ERROR:",
            error
        );


        scoreElement.textContent =
            "Unavailable";
    }

}


// =========================================
// CONFIGURE PROFILE ACCESS
// =========================================

function configureProfileAccess() {

    const editButton =
        document.getElementById(
            "toggleEditBtn"
        );

    const saveButton =
        document.getElementById(
            "saveBtn"
        );

    const editInputs =
        document.querySelectorAll(
            ".edit-input"
        );


    // =====================================
    // PUBLIC PROFILE
    // =====================================

    if (
        !isOwnProfile
    ) {

        editMode =
            false;


        if (
            editButton
        ) {

            editButton.style.display =
                "none";
        }


        if (
            saveButton
        ) {

            saveButton.style.display =
                "none";
        }


        editInputs.forEach(
            input => {

                input.style.display =
                    "none";

                input.disabled =
                    true;
            }
        );


        document
            .querySelectorAll(
                "#profilePicInput, #bannerUpload, .achievement-upload"
            )
            .forEach(
                input => {

                    input.style.display =
                        "none";

                    input.disabled =
                        true;
                }
            );


        const uploadSection =
            document.getElementById(
                "profileUploadControls"
            );


        if (
            uploadSection
        ) {

            uploadSection.classList.remove(
                "show-profile-uploads"
            );

            uploadSection.style.display =
                "none";
        }


        return;
    }


    // =====================================
    // OWN PROFILE
    // =====================================

    if (
        editButton
    ) {

        editButton.style.display =
            "block";
    }


    editInputs.forEach(
        input => {

            if (
                input.id === "edit-connections" ||
                input.id === "edit-followers" ||
                input.id === "edit-rating" ||
                input.id === "edit-grade"
            ) {

                input.style.display =
                    "none";

                input.disabled =
                    true;

                return;
            }


            if (
                input.classList.contains(
                    "achievement-upload"
                )
            ) {

                return;
            }


            input.style.display =
                editMode
                    ? "block"
                    : "none";

            input.disabled =
                !editMode;

        }
    );


    document
        .querySelectorAll(
            "#edit-connections, #edit-followers, #edit-rating, #edit-grade"
        )
        .forEach(
            element => {

                element.style.display =
                    "none";

                element.disabled =
                    true;

            }
        );

}


// =========================================
// TOGGLE EDIT MODE
// =========================================

function toggleEditMode() {

    if (
        !isOwnProfile
    ) {

        alert(
            "You can only edit your own profile."
        );

        return;
    }


    if (
        !requireAuthentication()
    ) {

        return;
    }


    editMode =
        !editMode;


    const inputs =
        document.querySelectorAll(
            ".edit-input"
        );

    const saveBtn =
        document.getElementById(
            "saveBtn"
        );

    const editBtn =
        document.getElementById(
            "toggleEditBtn"
        );

    const profilePicInput =
        document.getElementById(
            "profilePicInput"
        );

    const bannerUpload =
        document.getElementById(
            "bannerUpload"
        );

    const uploadSection =
        document.getElementById(
            "profileUploadControls"
        );


    // =====================================
    // EDIT INPUTS
    // =====================================

    inputs.forEach(
        input => {

            if (
                input.id === "edit-connections" ||
                input.id === "edit-followers" ||
                input.id === "edit-rating" ||
                input.id === "edit-grade"
            ) {

                input.style.display =
                    "none";

                input.disabled =
                    true;

                return;
            }


            if (
                input.classList.contains(
                    "achievement-upload"
                )
            ) {

                return;
            }


            input.style.display =
                editMode
                    ? "block"
                    : "none";

            input.disabled =
                !editMode;
        }
    );


    // =====================================
    // SAVE BUTTON
    // =====================================

    if (
        saveBtn
    ) {

        saveBtn.style.display =
            editMode
                ? "block"
                : "none";
    }


    // =====================================
    // EDIT BUTTON
    // =====================================

    if (
        editBtn
    ) {

        editBtn.textContent =
            editMode
                ? "Cancel"
                : "Edit Profile";
    }


    // =====================================
    // UPLOAD SECTION
    // =====================================

    if (
        uploadSection
    ) {

        uploadSection.classList.toggle(
            "show-profile-uploads",
            editMode
        );


        uploadSection.style.display =
            editMode
                ? "flex"
                : "none";
    }


    // =====================================
    // PROFILE PICTURE INPUT
    // =====================================

    if (
        profilePicInput
    ) {

        profilePicInput.style.display =
            editMode
                ? "block"
                : "none";

        profilePicInput.disabled =
            !editMode;
    }


    // =====================================
    // BANNER INPUT
    // =====================================

    if (
        bannerUpload
    ) {

        bannerUpload.style.display =
            editMode
                ? "block"
                : "none";

        bannerUpload.disabled =
            !editMode;
    }


    // =====================================
    // ACHIEVEMENT UPLOADS
    // =====================================

    document
        .querySelectorAll(
            ".achievement-upload"
        )
        .forEach(
            input => {

                input.style.display =
                    editMode
                        ? "block"
                        : "none";

                input.disabled =
                    !editMode;
            }
        );


    // =====================================
    // PROFILE PICTURE VIEW
    // =====================================

    const profilePic =
        document.getElementById(
            "profilePic"
        );

    const placeholder =
        document.getElementById(
            "dpPlaceholder"
        );


    if (
        profilePic
    ) {

        if (
            editMode
        ) {

            profilePic.style.display =
                "none";

        } else {

            const src =
                profilePic.getAttribute(
                    "src"
                );


            profilePic.style.display =
                src
                    ? "block"
                    : "none";
        }
    }


    if (
        placeholder
    ) {

        placeholder.style.display =
            editMode
                ? "none"
                : "";
    }


    // =====================================
    // BODY CLASS
    // =====================================

    document.body.classList.toggle(
        "editing",
        editMode
    );


    // =====================================
    // RESTORE BACKEND STATS
    // =====================================

    if (
        currentProfile
    ) {

        updateBackendControlledStats(
            currentProfile
        );
    }

}


// =========================================
// HTML COMPATIBILITY
// =========================================

function handleProfileEdit() {

    toggleEditMode();

}


// =========================================
// COLLECT PROFILE DATA
// =========================================

function collectProfileData() {

    const data = {};


    fields.forEach(
        field => {

            const element =
                document.getElementById(
                    field.edit
                );


            if (
                !element
            ) {

                return;
            }


            data[field.key] =
                element.value.trim();
        }
    );


    // =====================================
    // NEVER SEND BACKEND CONTROLLED VALUES
    // =====================================

    delete data.connections;

    delete data.followers;

    delete data.rating;

    delete data.grade;

    delete data.score;


    return data;

}


// =========================================
// EMAIL VALIDATION
// =========================================

function isValidEmail(
    email
) {

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return emailRegex.test(
        email
    );

}


// =========================================
// PHONE VALIDATION
// =========================================

function isValidPhone(
    phone
) {

    const phoneRegex =
        /^[0-9+\-\s()]{7,20}$/;


    return phoneRegex.test(
        phone
    );

}


// =========================================
// GET IMAGE DATA
// =========================================

function getImageData(
    elementId
) {

    const image =
        document.getElementById(
            elementId
        );


    if (
        !image
    ) {

        return null;
    }


    const src =
        image.getAttribute(
            "src"
        );


    if (
        src &&
        src.startsWith(
            "data:image/"
        )
    ) {

        return src;
    }


    return null;

}


// =========================================
// SAVE PROFILE
// =========================================

async function saveProfile() {

    // =====================================
    // ONLY OWNER MAY SAVE
    // =====================================

    if (
        !isOwnProfile
    ) {

        alert(
            "You are not allowed to edit this profile."
        );

        return;
    }


    if (
        !requireAuthentication()
    ) {

        return;
    }


    const saveBtn =
        document.getElementById(
            "saveBtn"
        );


    const originalSaveText =
        saveBtn?.textContent ||
        "Save";


    try {

        // =================================
        // COLLECT DATA
        // =================================

        const data =
            collectProfileData();


        // =================================
        // VALIDATE EMAIL
        // =================================

        if (
            data.email &&
            !isValidEmail(
                data.email
            )
        ) {

            alert(
                "Please enter a valid email address."
            );

            return;
        }


        // =================================
        // VALIDATE PHONE
        // =================================

        if (
            data.phone &&
            !isValidPhone(
                data.phone
            )
        ) {

            alert(
                "Please enter a valid phone number."
            );

            return;
        }


        // =================================
        // PROFILE IMAGE
        // =================================

        const profilePicData =
            getImageData(
                "profilePic"
            );


        if (
            profilePicData
        ) {

            data.profilePic =
                profilePicData;
        }


        // =================================
        // BANNER IMAGE
        // =================================

        const bannerData =
            getImageData(
                "bannerImage"
            );


        if (
            bannerData
        ) {

            data.bannerImage =
                bannerData;
        }


        // =================================
        // ACHIEVEMENT IMAGES
        // =================================

        for (
            let i = 1;
            i <= 6;
            i++
        ) {

            const imageData =
                getImageData(
                    `achievement-img-${i}`
                );


            if (
                imageData
            ) {

                data[
                    `achievement_${i}`
                ] =
                    imageData;
            }
        }


        // =================================
        // SECURITY:
        // DO NOT SEND USER ID
        // =================================

        delete data.userId;

        delete data.id;


        // =================================
        // DO NOT SEND BACKEND FIELDS
        // =================================

        delete data.connections;

        delete data.followers;

        delete data.rating;

        delete data.grade;

        delete data.score;


        console.log(
            "Saving profile:",
            {
                ...data,
                profilePic:
                    data.profilePic
                        ? "[image data]"
                        : undefined,
                bannerImage:
                    data.bannerImage
                        ? "[image data]"
                        : undefined
            }
        );


        // =================================
        // BUTTON STATE
        // =================================

        if (
            saveBtn
        ) {

            saveBtn.disabled =
                true;

            saveBtn.textContent =
                "Saving...";
        }


        // =================================
        // SEND UPDATE
        // =================================

        const response =
            await authenticatedFetch(
                MY_PROFILE_API,
                {
                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            data
                        )
                }
            );


        // =================================
        // AUTH ERROR
        // =================================

        if (
            handleAuthenticationError(
                response.status
            )
        ) {

            return;
        }


        // =================================
        // READ RESPONSE
        // =================================

        const result =
            await readResponse(
                response
            );


        if (
            !response.ok
        ) {

            throw new Error(
                getErrorMessage(
                    result,
                    `Server returned HTTP ${response.status}.`
                )
            );
        }


        // =================================
        // GET UPDATED PROFILE
        // =================================

        const returnedProfile =
            result?.profile ||
            result?.data ||
            null;


        if (
            returnedProfile &&
            typeof returnedProfile ===
                "object"
        ) {

            currentProfile =
                returnedProfile;

        } else {

            currentProfile = {
                ...(currentProfile || {}),
                ...data
            };
        }


        // =================================
        // STORE LOCAL COPY
        // =================================

        localStorage.setItem(
            "userProfile",
            JSON.stringify(
                currentProfile
            )
        );


        // =================================
        // UPDATE SCREEN
        // =================================

        fields.forEach(
            field => {

                const edit =
                    document.getElementById(
                        field.edit
                    );

                const view =
                    document.getElementById(
                        field.view
                    );


                if (
                    !edit
                ) {

                    return;
                }


                const value =
                    currentProfile[
                        field.key
                    ];


                edit.value =
                    value !== undefined &&
                    value !== null
                        ? String(value)
                        : "";


                if (
                    view
                ) {

                    view.textContent =
                        edit.value;
                }

            }
        );


        updateBackendControlledStats(
            currentProfile
        );


        updateProfileCompletion();


        // =================================
        // EXIT EDIT MODE
        // =================================

        if (
            editMode
        ) {

            toggleEditMode();
        }


        alert(
            result?.message ||
            "Profile saved successfully!"
        );


        // =================================
        // REFRESH SERVER DATA
        // =================================

        await refreshOwnProfile();


    } catch (error) {

        console.error(
            "SAVE PROFILE ERROR:",
            error
        );


        alert(
            "Unable to save profile.\n\n" +
            (
                error.message ||
                "Unknown error."
            )
        );


    } finally {

        if (
            saveBtn
        ) {

            saveBtn.disabled =
                false;

            saveBtn.textContent =
                originalSaveText;
        }

    }

}


// =========================================
// REFRESH OWN PROFILE FROM SERVER
// =========================================

async function refreshOwnProfile() {

    if (
        !isOwnProfile ||
        !isAuthenticated()
    ) {

        return;
    }


    try {

        const response =
            await authenticatedFetch(
                MY_PROFILE_API,
                {
                    method:
                        "GET"
                }
            );


        if (
            handleAuthenticationError(
                response.status,
                false
            )
        ) {

            return;
        }


        if (
            !response.ok
        ) {

            return;
        }


        const result =
            await readResponse(
                response
            );


        const profile =
            result?.profile ||
            result?.data ||
            null;


        if (
            !profile ||
            typeof profile !== "object"
        ) {

            return;
        }


        currentProfile =
            profile;


        // ---------------------------------
        // Update all fields
        // ---------------------------------

        fields.forEach(
            field => {

                const edit =
                    document.getElementById(
                        field.edit
                    );

                const view =
                    document.getElementById(
                        field.view
                    );


                if (
                    edit
                ) {

                    const value =
                        profile[
                            field.key
                        ];


                    edit.value =
                        value !== undefined &&
                        value !== null
                            ? String(value)
                            : "";


                    if (
                        view
                    ) {

                        view.textContent =
                            edit.value;
                    }
                }

            }
        );


        // ---------------------------------
        // Backend stats
        // ---------------------------------

        updateBackendControlledStats(
            profile
        );


        // ---------------------------------
        // Images
        // ---------------------------------

        if (
            profile.profilePic
        ) {

            setProfileImage(
                "profilePic",
                "dpPlaceholder",
                profile.profilePic
            );

        }


        if (
            profile.bannerImage
        ) {

            const banner =
                document.getElementById(
                    "bannerImage"
                );


            if (
                banner
            ) {

                banner.src =
                    profile.bannerImage;

                banner.style.display =
                    "block";
            }
        }


        // ---------------------------------
        // Achievements
        // ---------------------------------

        for (
            let i = 1;
            i <= 6;
            i++
        ) {

            const image =
                document.getElementById(
                    `achievement-img-${i}`
                );


            const value =
                profile[
                    `achievement_${i}`
                ];


            if (
                image &&
                value
            ) {

                image.src =
                    value;

                image.style.display =
                    "block";
            }
        }


        localStorage.setItem(
            "userProfile",
            JSON.stringify(
                profile
            )
        );


        updateProfileCompletion();


    } catch (error) {

        console.warn(
            "REFRESH PROFILE ERROR:",
            error
        );

    }

}


// =========================================
// LOAD PROFILE
// =========================================

async function loadProfile() {

    // =====================================
    // PUBLIC PROFILE
    // =====================================

    if (
        !isOwnProfile
    ) {

        if (
            !userId
        ) {

            console.error(
                "No valid public profile user ID."
            );

            return null;
        }


        const url =
            `${PUBLIC_PROFILE_API}/${userId}`;


        console.log(
            "Loading public profile:",
            url
        );


        try {

            const response =
                await publicFetch(
                    url,
                    {
                        method:
                            "GET"
                    }
                );


            console.log(
                "Public profile HTTP status:",
                response.status
            );


            const result =
                await readResponse(
                    response
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    getErrorMessage(
                        result,
                        `Server returned HTTP ${response.status}.`
                    )
                );
            }


            const profile =
                result?.profile ||
                result?.data ||
                null;


            if (
                !profile ||
                typeof profile !== "object"
            ) {

                throw new Error(
                    "No valid public profile was returned."
                );
            }


            currentProfile =
                profile;


            populateProfile(
                profile
            );


            configureProfileAccess();


            updateProfileCompletion();


            updateProfileTitle(
                profile
            );


            return profile;


        } catch (error) {

            console.error(
                "LOAD PUBLIC PROFILE ERROR:",
                error
            );


            return null;
        }

    }


    // =====================================
    // OWN PROFILE
    // =====================================

    if (
        !requireAuthentication()
    ) {

        return null;
    }


    const url =
        MY_PROFILE_API;


    console.log(
        "Loading own profile:",
        url
    );


    try {

        const response =
            await authenticatedFetch(
                url,
                {
                    method:
                        "GET"
                }
            );


        // =================================
        // AUTH ERROR
        // =================================

        if (
            handleAuthenticationError(
                response.status
            )
        ) {

            return null;
        }


        // =================================
        // NOT FOUND
        // =================================

        if (
            response.status === 404
        ) {

            console.log(
                "No profile exists yet."
            );


            currentProfile =
                null;


            clearProfileFields();


            updateBackendControlledStats(
                {}
            );


            configureProfileAccess();


            updateProfileCompletion();


            return null;
        }


        // =================================
        // READ RESPONSE
        // =================================

        const result =
            await readResponse(
                response
            );


        if (
            !response.ok
        ) {

            throw new Error(
                getErrorMessage(
                    result,
                    `Server returned HTTP ${response.status}.`
                )
            );
        }


        // =================================
        // EXTRACT PROFILE
        // =================================

        const profile =
            result?.profile ||
            result?.data ||
            null;


        if (
            !profile ||
            typeof profile !== "object"
        ) {

            throw new Error(
                "No valid profile was returned."
            );
        }


        // =================================
        // SET CURRENT PROFILE
        // =================================

        currentProfile =
            profile;


        console.log(
            "Loaded own profile:",
            profile
        );


        populateProfile(
            profile
        );


        configureProfileAccess();


        updateProfileCompletion();


        updateProfileTitle(
            profile
        );


        // =================================
        // SAVE LOCAL COPY
        // =================================

        localStorage.setItem(
            "userProfile",
            JSON.stringify(
                profile
            )
        );


        return profile;


    } catch (error) {

        console.error(
            "LOAD OWN PROFILE ERROR:",
            error
        );


        // =================================
        // OWN PROFILE ONLY:
        // LOCAL FALLBACK
        // =================================

        const localProfile =
            loadLocalProfile();


        if (
            localProfile
        ) {

            return localProfile;
        }


        return null;
    }

}


// =========================================
// POPULATE PROFILE
// =========================================

function populateProfile(
    profile
) {

    if (
        !profile
    ) {

        return;
    }


    // =====================================
    // NORMALIZE FIELD NAMES
    // =====================================

    normalizeProfileFields(
        profile
    );


    // =====================================
    // TEXT FIELDS
    // =====================================

    fields.forEach(
        field => {

            const edit =
                document.getElementById(
                    field.edit
                );

            const view =
                document.getElementById(
                    field.view
                );


            if (
                !edit &&
                !view
            ) {

                return;
            }


            const value =
                profile[
                    field.key
                ];


            const text =
                value !== undefined &&
                value !== null
                    ? String(value)
                    : "";


            if (
                edit
            ) {

                edit.value =
                    text;
            }


            if (
                view
            ) {

                view.textContent =
                    text;
            }

        }
    );


    // =====================================
    // BACKEND CONTROLLED STATS
    // =====================================

    updateBackendControlledStats(
        profile
    );


    // =====================================
    // PROFILE IMAGE
    // =====================================

    const profilePicture =
        profile.profilePic;


    if (
        profilePicture
    ) {

        setProfileImage(
            "profilePic",
            "dpPlaceholder",
            profilePicture
        );

    } else {

        hideProfileImage();
    }


    // =====================================
    // BANNER
    // =====================================

    const bannerImage =
        profile.bannerImage;


    const banner =
        document.getElementById(
            "bannerImage"
        );


    if (
        banner
    ) {

        if (
            bannerImage
        ) {

            banner.src =
                bannerImage;

            banner.style.display =
                "block";

        } else {

            banner.removeAttribute(
                "src"
            );

            banner.style.display =
                "none";
        }
    }


    // =====================================
    // ACHIEVEMENT IMAGES
    // =====================================

    for (
        let i = 1;
        i <= 6;
        i++
    ) {

        const image =
            document.getElementById(
                `achievement-img-${i}`
            );


        const value =
            profile[
                `achievement_${i}`
            ];


        if (
            image &&
            value
        ) {

            image.src =
                value;

            image.style.display =
                "block";

        } else if (
            image
        ) {

            image.removeAttribute(
                "src"
            );

            image.style.display =
                "none";
        }
    }

}


// =========================================
// NORMALIZE BACKEND FIELD NAMES
// =========================================

function normalizeProfileFields(
    profile
) {

    // -------------------------------------
    // PROFILE PICTURE
    // -------------------------------------

    if (
        !profile.profilePic &&
        profile.profile_picture
    ) {

        profile.profilePic =
            profile.profile_picture;
    }


    // -------------------------------------
    // BANNER
    // -------------------------------------

    if (
        !profile.bannerImage &&
        profile.banner_image
    ) {

        profile.bannerImage =
            profile.banner_image;
    }


    if (
        !profile.bannerImage &&
        profile.banner
    ) {

        profile.bannerImage =
            profile.banner;
    }


    // -------------------------------------
    // SCORE
    // -------------------------------------

    if (
        profile.testScore === undefined &&
        profile.test_score !== undefined
    ) {

        profile.testScore =
            profile.test_score;
    }


    // -------------------------------------
    // RATING
    // -------------------------------------

    if (
        profile.testRating === undefined &&
        profile.test_rating !== undefined
    ) {

        profile.testRating =
            profile.test_rating;
    }


    // -------------------------------------
    // CONNECTIONS
    // -------------------------------------

    if (
        profile.connections === undefined &&
        profile.connection_count !== undefined
    ) {

        profile.connections =
            profile.connection_count;
    }


    // -------------------------------------
    // FOLLOWERS
    // -------------------------------------

    if (
        profile.followers === undefined &&
        profile.follower_count !== undefined
    ) {

        profile.followers =
            profile.follower_count;
    }


    // -------------------------------------
    // READINESS SCORE
    // -------------------------------------

    if (
        profile.readinessScore === undefined &&
        profile.readiness_score !== undefined
    ) {

        profile.readinessScore =
            profile.readiness_score;
    }

}


// =========================================
// CLEAR PROFILE FIELDS
// =========================================

function clearProfileFields() {

    fields.forEach(
        field => {

            const edit =
                document.getElementById(
                    field.edit
                );


            const view =
                document.getElementById(
                    field.view
                );


            if (
                edit
            ) {

                edit.value =
                    "";
            }


            if (
                view
            ) {

                view.textContent =
                    "";
            }

        }
    );


    // -------------------------------------
    // Backend values
    // -------------------------------------

    const connectionsView =
        document.getElementById(
            "view-connections"
        );


    if (
        connectionsView
    ) {

        connectionsView.textContent =
            "0";
    }


    const followersView =
        document.getElementById(
            "view-followers"
        );


    if (
        followersView
    ) {

        followersView.textContent =
            "0";
    }


    const ratingView =
        document.getElementById(
            "view-rating"
        );


    if (
        ratingView
    ) {

        ratingView.textContent =
            "Not Rated";
    }


    const gradeView =
        document.getElementById(
            "view-grade"
        );


    if (
        gradeView
    ) {

        gradeView.textContent =
            "Not Available";
    }


    const testScoreView =
        document.getElementById(
            "view-test-score"
        );


    if (
        testScoreView
    ) {

        testScoreView.textContent =
            "Not tested";
    }


    hideProfileImage();


    const banner =
        document.getElementById(
            "bannerImage"
        );


    if (
        banner
    ) {

        banner.removeAttribute(
            "src"
        );

        banner.style.display =
            "none";
    }

}


// =========================================
// SET PROFILE IMAGE
// =========================================

function setProfileImage(
    imageId,
    placeholderId,
    source
) {

    const image =
        document.getElementById(
            imageId
        );


    const placeholder =
        document.getElementById(
            placeholderId
        );


    if (
        image &&
        source
    ) {

        image.src =
            source;


        image.style.display =
            editMode
                ? "none"
                : "block";


        image.onerror =
            () => {

                image.style.display =
                    "none";


                if (
                    placeholder
                ) {

                    placeholder.style.display =
                        editMode
                            ? "none"
                            : "flex";
                }
            };
    }


    if (
        placeholder
    ) {

        placeholder.style.display =
            editMode
                ? "none"
                : "flex";
    }

}


// =========================================
// HIDE PROFILE IMAGE
// =========================================

function hideProfileImage() {

    const image =
        document.getElementById(
            "profilePic"
        );


    const placeholder =
        document.getElementById(
            "dpPlaceholder"
        );


    if (
        image
    ) {

        image.removeAttribute(
            "src"
        );

        image.style.display =
            "none";
    }


    if (
        placeholder
    ) {

        placeholder.style.display =
            editMode
                ? "none"
                : "flex";
    }

}


// =========================================
// LOCAL PROFILE FALLBACK
// =========================================

function loadLocalProfile() {

    const saved =
        localStorage.getItem(
            "userProfile"
        );


    if (
        !saved
    ) {

        return null;
    }


    try {

        const profile =
            JSON.parse(
                saved
            );


        if (
            !profile ||
            typeof profile !== "object"
        ) {

            return null;
        }


        currentProfile =
            profile;


        populateProfile(
            profile
        );


        configureProfileAccess();


        updateProfileCompletion();


        updateProfileTitle(
            profile
        );


        console.warn(
            "Using locally cached profile."
        );


        return profile;


    } catch (error) {

        console.error(
            "LOCAL PROFILE ERROR:",
            error
        );


        localStorage.removeItem(
            "userProfile"
        );


        return null;
    }

}


// =========================================
// PROFILE PICTURE UPLOAD
// =========================================

function setupProfilePicture() {

    const input =
        document.getElementById(
            "profilePicInput"
        );


    const image =
        document.getElementById(
            "profilePic"
        );


    const placeholder =
        document.getElementById(
            "dpPlaceholder"
        );


    if (
        !input
    ) {

        return;
    }


    input.addEventListener(
        "change",
        event => {

            if (
                !isOwnProfile ||
                !editMode
            ) {

                input.value =
                    "";

                return;
            }


            const file =
                event.target.files[0];


            if (
                !file
            ) {

                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );


                input.value =
                    "";


                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                readerEvent => {

                    if (
                        image
                    ) {

                        image.src =
                            readerEvent.target.result;

                        image.style.display =
                            "none";
                    }


                    if (
                        placeholder
                    ) {

                        placeholder.style.display =
                            "none";
                    }
                };


            reader.onerror =
                () => {

                    alert(
                        "Unable to read the selected image."
                    );


                    input.value =
                        "";
                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =========================================
// BANNER UPLOAD
// =========================================

function setupBannerUpload() {

    const input =
        document.getElementById(
            "bannerUpload"
        );


    if (
        !input
    ) {

        return;
    }


    input.addEventListener(
        "change",
        event => {

            if (
                !isOwnProfile ||
                !editMode
            ) {

                input.value =
                    "";

                return;
            }


            const file =
                event.target.files[0];


            if (
                !file
            ) {

                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );


                input.value =
                    "";


                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                readerEvent => {

                    const banner =
                        document.getElementById(
                            "bannerImage"
                        );


                    if (
                        banner
                    ) {

                        banner.src =
                            readerEvent.target.result;

                        banner.style.display =
                            "block";
                    }

                };


            reader.onerror =
                () => {

                    alert(
                        "Unable to read the selected banner image."
                    );


                    input.value =
                        "";
                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =========================================
// ACHIEVEMENT IMAGE UPLOADS
// =========================================

function setupAchievementUploads() {

    const uploads =
        document.querySelectorAll(
            ".achievement-upload"
        );


    uploads.forEach(
        (
            input,
            index
        ) => {

            input.addEventListener(
                "change",
                event => {

                    if (
                        !isOwnProfile ||
                        !editMode
                    ) {

                        input.value =
                            "";

                        return;
                    }


                    const file =
                        event.target.files[0];


                    if (
                        !file
                    ) {

                        return;
                    }


                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        alert(
                            "Please select an image file."
                        );


                        input.value =
                            "";


                        return;
                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        readerEvent => {

                            const image =
                                document.getElementById(
                                    `achievement-img-${index + 1}`
                                );


                            if (
                                image
                            ) {

                                image.src =
                                    readerEvent.target.result;

                                image.style.display =
                                    "block";
                            }

                        };


                    reader.onerror =
                        () => {

                            alert(
                                "Unable to read the achievement image."
                            );


                            input.value =
                                "";
                        };


                    reader.readAsDataURL(
                        file
                    );

                }
            );

        }
    );

}


// =========================================
// PROFILE COMPLETION
// =========================================

function updateProfileCompletion() {

    let completed =
        0;


    fields.forEach(
        field => {

            const edit =
                document.getElementById(
                    field.edit
                );


            if (
                edit &&
                edit.value.trim() !== ""
            ) {

                completed++;
            }

        }
    );


    const total =
        fields.length;


    const percentage =
        total > 0
            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )
            : 0;


    const progress =
        document.getElementById(
            "profileProgress"
        );


    const completionText =
        document.getElementById(
            "profileCompletion"
        );


    if (
        progress
    ) {

        progress.style.width =
            `${percentage}%`;


        progress.setAttribute(
            "aria-valuenow",
            String(
                percentage
            )
        );
    }


    if (
        completionText
    ) {

        completionText.textContent =
            `${percentage}%`;
    }


    document
        .querySelectorAll(
            ".profile-completion"
        )
        .forEach(
            element => {

                element.textContent =
                    `${percentage}%`;
            }
        );


    document
        .querySelectorAll(
            ".profile-progress"
        )
        .forEach(
            element => {

                element.style.width =
                    `${percentage}%`;
            }
        );

}


// =========================================
// AUTO RESIZE
// =========================================

function setupAutoResize() {

    document
        .querySelectorAll(
            "textarea"
        )
        .forEach(
            textarea => {

                textarea.style.height =
                    "auto";


                textarea.style.height =
                    `${textarea.scrollHeight}px`;


                textarea.addEventListener(
                    "input",
                    () => {

                        textarea.style.height =
                            "auto";


                        textarea.style.height =
                            `${textarea.scrollHeight}px`;


                        updateProfileCompletion();
                    }
                );

            }
        );

}


// =========================================
// COMPLETION LISTENERS
// =========================================

function setupCompletionListeners() {

    document
        .querySelectorAll(
            ".edit-input"
        )
        .forEach(
            input => {

                if (
                    input.id === "edit-connections" ||
                    input.id === "edit-followers" ||
                    input.id === "edit-rating" ||
                    input.id === "edit-grade"
                ) {

                    return;
                }


                input.addEventListener(
                    "input",
                    updateProfileCompletion
                );


                input.addEventListener(
                    "change",
                    updateProfileCompletion
                );

            }
        );

}


// =========================================
// CANCEL EDIT
// =========================================

async function cancelEditMode() {

    if (
        !editMode
    ) {

        return;
    }


    editMode =
        false;


    document.body.classList.remove(
        "editing"
    );


    // =====================================
    // RESTORE LAST SERVER PROFILE
    // =====================================

    if (
        currentProfile
    ) {

        populateProfile(
            currentProfile
        );
    }


    hidePendingUploadControls();


    configureProfileAccess();


    updateProfileCompletion();


    // =====================================
    // RELOAD FROM SERVER
    // =====================================

    if (
        isOwnProfile &&
        isAuthenticated()
    ) {

        await refreshOwnProfile();
    }

}


// =========================================
// HIDE PENDING UPLOAD CONTROLS
// =========================================

function hidePendingUploadControls() {

    const profilePicInput =
        document.getElementById(
            "profilePicInput"
        );


    const bannerUpload =
        document.getElementById(
            "bannerUpload"
        );


    if (
        profilePicInput
    ) {

        profilePicInput.value =
            "";

        profilePicInput.style.display =
            "none";

        profilePicInput.disabled =
            true;
    }


    if (
        bannerUpload
    ) {

        bannerUpload.value =
            "";

        bannerUpload.style.display =
            "none";

        bannerUpload.disabled =
            true;
    }


    document
        .querySelectorAll(
            ".achievement-upload"
        )
        .forEach(
            input => {

                input.value =
                    "";

                input.style.display =
                    "none";

                input.disabled =
                    true;

            }
        );


    const uploadSection =
        document.getElementById(
            "profileUploadControls"
        );


    if (
        uploadSection
    ) {

        uploadSection.classList.remove(
            "show-profile-uploads"
        );


        uploadSection.style.display =
            "none";
    }

}


// =========================================
// IMPROVED EDIT BUTTON
// =========================================

function handleEditButtonClick() {

    if (
        editMode &&
        isOwnProfile
    ) {

        cancelEditMode();

        return;
    }


    toggleEditMode();

}


// =========================================
// KEYBOARD SHORTCUTS
// =========================================

document.addEventListener(
    "keydown",
    event => {

        // =================================
        // CTRL + S
        // =================================

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();


            if (
                editMode &&
                isOwnProfile
            ) {

                saveProfile();
            }

        }


        // =================================
        // ESCAPE
        // =================================

        if (
            event.key === "Escape" &&
            editMode
        ) {

            event.preventDefault();


            cancelEditMode();
        }

    }
);


// =========================================
// RESPONSIVE LAYOUT
// =========================================

function handleResponsiveLayout() {

    document.body.classList.toggle(
        "mobile-layout",
        window.innerWidth < 768
    );

}


window.addEventListener(
    "resize",
    handleResponsiveLayout
);


// =========================================
// INITIALIZATION
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "========================================="
        );


        console.log(
            "Profile page initializing..."
        );


        console.log(
            "Displayed user ID:",
            userId
        );


        console.log(
            "Own profile:",
            isOwnProfile
        );


        // =================================
        // START IN VIEW MODE
        // =================================

        editMode =
            false;


        // =================================
        // HIDE SAVE BUTTON
        // =================================

        const saveBtn =
            document.getElementById(
                "saveBtn"
            );


        if (
            saveBtn
        ) {

            saveBtn.style.display =
                "none";
        }


        // =================================
        // HIDE EDIT INPUTS
        // =================================

        document
            .querySelectorAll(
                ".edit-input"
            )
            .forEach(
                input => {

                    if (
                        input.id === "edit-connections" ||
                        input.id === "edit-followers" ||
                        input.id === "edit-rating" ||
                        input.id === "edit-grade"
                    ) {

                        input.style.display =
                            "none";

                        input.disabled =
                            true;

                        return;
                    }


                    if (
                        input.classList.contains(
                            "achievement-upload"
                        )
                    ) {

                        input.style.display =
                            "none";

                        input.disabled =
                            true;

                        return;
                    }


                    input.style.display =
                        "none";

                    input.disabled =
                        true;

                }
            );


        // =================================
        // HIDE UPLOAD SECTION
        // =================================

        const uploadSection =
            document.getElementById(
                "profileUploadControls"
            );


        if (
            uploadSection
        ) {

            uploadSection.classList.remove(
                "show-profile-uploads"
            );


            uploadSection.style.display =
                "none";
        }


        // =================================
        // CONFIGURE ACCESS
        // =================================

        configureProfileAccess();


        // =================================
        // LOAD PROFILE
        // =================================

        await loadProfile();


        // =================================
        // LOAD INDUSTRY READINESS
        // =================================

        if (
            isOwnProfile
        ) {

            await loadIndustryReadinessScore();
        }


        // =================================
        // SETUP UPLOADS
        // =================================

        setupProfilePicture();

        setupBannerUpload();

        setupAchievementUploads();


        // =================================
        // OTHER UI
        // =================================

        setupAutoResize();

        setupCompletionListeners();

        handleResponsiveLayout();


        // =================================
        // FINAL UPDATE
        // =================================

        updateProfileCompletion();


        if (
            currentProfile
        ) {

            updateBackendControlledStats(
                currentProfile
            );
        }


        configureProfileAccess();


        console.log(
            "Profile page ready."
        );


        console.log(
            "========================================="
        );

    }
);


// =========================================
// GLOBAL FUNCTIONS
// =========================================

window.toggleEditMode =
    toggleEditMode;

window.handleProfileEdit =
    handleProfileEdit;

window.handleEditButtonClick =
    handleEditButtonClick;

window.cancelEditMode =
    cancelEditMode;

window.saveProfile =
    saveProfile;

window.loadProfile =
    loadProfile;

window.refreshOwnProfile =
    refreshOwnProfile;

window.refreshBackendControlledStats =
    refreshBackendControlledStats;

window.updateBackendControlledStats =
    updateBackendControlledStats;

window.loadIndustryReadinessScore =
    loadIndustryReadinessScore;
