// =========================================================
// CAMPUS2CAREER MAIN PORTAL JAVASCRIPT
// =========================================================
// DATABASE + JWT + PROFILE + PEOPLE + COMPANIES + COURSES
// + POSTS + LIKES + SHARES + COMMENTS + SEARCH
// + AI CHATBOT + INDUSTRY READINESS TEST
// =========================================================


// =========================================================
// API
// =========================================================

const API_BASE =
    "https://campus2career-0pi8.onrender.com/api";


// =========================================================
// PROFILE APIs
// =========================================================

// Logged-in user's own profile.
const MY_PROFILE_API =
    `${API_BASE}/my-profile`;

// Public profile of another user.
const PUBLIC_PROFILE_API =
    `${API_BASE}/user-profile`;

// People list.
const PEOPLE_API =
    `${API_BASE}/user-profiles`;


// =========================================================
// COMPANY / COURSE / POST APIs
// =========================================================

const COMPANIES_API =
    `${API_BASE}/companies`;

const COURSES_API =
    `${API_BASE}/courses`;

const POSTS_API =
    `${API_BASE}/posts`;


// =========================================================
// OPTIONAL CONNECTION API
// =========================================================
//
// The current server does not expose /api/connections.
// Do not pretend a connection was created when the backend
// cannot persist it.
// =========================================================

const CONNECTIONS_API =
    `${API_BASE}/connections`;

const CONNECTIONS_API_AVAILABLE =
    false;


// =========================================================
// AI
// =========================================================

const AI_CHATBOT_URL =
    `${API_BASE}/ai-chat`;


// =========================================================
// INDUSTRY READINESS
// =========================================================

const INDUSTRY_TEST_START_URL =
    `${API_BASE}/industry-readiness/start`;

const INDUSTRY_TEST_SUBMIT_URL =
    `${API_BASE}/industry-readiness/submit`;

const INDUSTRY_TEST_LATEST_URL =
    `${API_BASE}/industry-readiness/latest`;


// =========================================================
// PAGE FILE NAMES
// =========================================================

const PROFILE_PAGE =
    "Profile.html";

const COMPANY_PAGE =
    "Companyprofile.html";

const COURSES_PAGE =
    "Courses.html";

const COURSE_PROFILE_PAGE =
    "courseprofile.html";

const LOGIN_PAGE =
    "login.html";


// =========================================================
// INDUSTRY TEST STATE
// =========================================================

let industryTest =
    null;

let industryTestAnswers =
    [];

let industryCurrentQuestion =
    0;


// =========================================================
// STORAGE KEYS
// =========================================================

const TOKEN_KEY =
    "authToken";

const USER_ID_KEY =
    "userId";

const USERNAME_KEY =
    "username";

const EMAIL_KEY =
    "loginEmail";


// =========================================================
// GLOBAL DATA
// =========================================================

let currentUserProfile =
    null;

let people =
    [];

let companies =
    [];

let courses =
    [];

let posts =
    [];


// =========================================================
// PROFILE COMPLETION FIELDS
// =========================================================

const profileCompletionFields = [

    "name",

    "headline",

    "tagline",

    "location",

    "about",

    "email",

    "phone",

    "github",

    "linkedin",

    "education",

    "experience",

    "projects",

    "skills",

    "certifications",

    "achievements",

    "profilePic",

    "bannerImage"

];


// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    initializePortal
);


// =========================================================
// INITIALIZE PORTAL
// =========================================================

async function initializePortal() {

    console.log(
        "Campus2Career main portal initialized."
    );


    const token =
        getAuthToken();

    const currentUserId =
        getCurrentUserId();


    // -----------------------------------------------------
    // AUTHENTICATION CHECK
    // -----------------------------------------------------

    if (
        !token ||
        !currentUserId
    ) {

        console.warn(
            "No valid authentication session."
        );


        window.location.href =
            LOGIN_PAGE;


        return;
    }


    // -----------------------------------------------------
    // UI INITIALIZATION
    // -----------------------------------------------------

    setupPostFeatures();

    setupSearch();

    setupDarkMode();

    setupMobileMenu();

    setupEditProfile();

    setupAIChatbot();

    initializeExistingPosts();

    updatePostCount();


    // -----------------------------------------------------
    // LOAD DATABASE DATA
    // -----------------------------------------------------

    await Promise.allSettled([

        loadMyProfile(),

        loadLatestIndustryReadiness(),

        loadPeopleYouMayKnow(),

        loadCompanies(),

        loadCourses(),

        loadPosts()

    ]);


    // -----------------------------------------------------
    // POST AUTHOR LINKS
    // -----------------------------------------------------

    setupPostAuthorClicks();


    console.log(
        "Campus2Career portal loading completed."
    );
}


// =========================================================
// GET AUTH TOKEN
// =========================================================

function getAuthToken() {

    const token =
        localStorage.getItem(
            TOKEN_KEY
        );


    if (
        !token ||
        token.trim() === ""
    ) {

        return null;
    }


    return token.trim();
}


// =========================================================
// GET CURRENT USER ID
// =========================================================

function getCurrentUserId() {

    const storedId =
        localStorage.getItem(
            USER_ID_KEY
        );


    if (!storedId) {

        return null;
    }


    const id =
        Number(
            storedId
        );


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        return null;
    }


    return id;
}


// =========================================================
// NORMALIZE USER ID
// =========================================================
//
// The backend returns user_profiles.user_id as "userId".
// Other older frontend responses may use user_id or id.
// =========================================================

function getPersonUserId(
    person
) {

    if (
        !person ||
        typeof person !==
        "object"
    ) {

        return null;
    }


    const rawId =
        person.userId ??
        person.user_id ??
        person.userID ??
        person.id;


    const id =
        Number(
            rawId
        );


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        return null;
    }


    return id;
}


// =========================================================
// AUTHENTICATED FETCH
// =========================================================

async function authenticatedFetch(
    url,
    options = {}
) {

    const token =
        getAuthToken();


    if (!token) {

        throw new Error(
            "Authentication required."
        );
    }


    const headers = {

        Accept:
            "application/json",

        ...(options.headers || {}),

        Authorization:
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


// =========================================================
// SAFE JSON RESPONSE
// =========================================================

async function readJsonResponse(
    response
) {

    const text =
        await response.text();


    console.log(
        "HTTP:",
        response.status
    );


    if (
        !text ||
        text.trim() === ""
    ) {

        return {};
    }


    try {

        return JSON.parse(
            text
        );

    } catch (error) {

        console.error(
            "Invalid JSON response:",
            text
        );


        throw new Error(
            "Server returned an invalid JSON response."
        );
    }
}


// =========================================================
// AUTH ERROR
// =========================================================

function handleAuthError(
    response
) {

    if (
        response.status === 401 ||
        response.status === 403
    ) {

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


        alert(
            "Your login session has expired. Please sign in again."
        );


        window.location.href =
            LOGIN_PAGE;


        return true;
    }


    return false;
}


// =========================================================
// LOAD MY PROFILE
// =========================================================

async function loadMyProfile() {

    console.log(
        "Loading current user's profile..."
    );


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
            handleAuthError(
                response
            )
        ) {

            return;
        }


        if (
            response.status === 404
        ) {

            currentUserProfile =
                null;


            updateProfileCompletion(
                null
            );


            displayMyProfile(
                null
            );


            return;
        }


        const data =
            await readJsonResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                `Profile request failed (${response.status}).`
            );
        }


        if (
            !data ||
            !data.profile
        ) {

            currentUserProfile =
                null;


            updateProfileCompletion(
                null
            );


            return;
        }


        currentUserProfile =
            data.profile;


        displayMyProfile(
            currentUserProfile
        );


        updateProfileCompletion(
            currentUserProfile
        );


        localStorage.setItem(
            "userProfile",
            JSON.stringify(
                currentUserProfile
            )
        );


    } catch (error) {

        console.error(
            "MY PROFILE LOAD ERROR:",
            error
        );


        loadLocalProfileBackup();
    }
}


// =========================================================
// DISPLAY MY PROFILE
// =========================================================

function displayMyProfile(
    profile
) {

    if (!profile) {

        setTextForIds(
            [
                "profileName"
            ],
            "Complete your profile"
        );


        return;
    }


    setTextForIds(
        [
            "profileName",
            "profile-name",
            "view-name",
            "viewName"
        ],
        profile.name
    );


    setTextForIds(
        [
            "designation",
            "profileHeadline",
            "headline",
            "view-headline",
            "viewHeadline"
        ],
        profile.headline
    );


    setTextForIds(
        [
            "tagline",
            "profileTagline",
            "view-tagline",
            "viewTagline"
        ],
        profile.tagline
    );


    setTextForIds(
        [
            "location",
            "profileLocation",
            "view-location",
            "viewLocation"
        ],
        profile.location
    );


    setTextForIds(
        [
            "profileAbout",
            "about",
            "view-about",
            "viewAbout"
        ],
        profile.about
    );


    setTextForIds(
        [
            "profileEmail",
            "email",
            "view-email",
            "viewEmail"
        ],
        profile.email
    );


    setTextForIds(
        [
            "profilePhone",
            "phone",
            "view-phone",
            "viewPhone"
        ],
        profile.phone
    );


    setTextForIds(
        [
            "github",
            "profileGithub",
            "view-github",
            "viewGithub"
        ],
        profile.github
    );


    setTextForIds(
        [
            "linkedin",
            "profileLinkedin",
            "view-linkedin",
            "viewLinkedin"
        ],
        profile.linkedin
    );


    setTextForIds(
        [
            "connectionsCount",
            "view-connections",
            "viewConnections"
        ],
        profile.connections
    );


    setTextForIds(
        [
            "followersCount",
            "view-followers",
            "viewFollowers"
        ],
        profile.followers
    );


    const testRating =
        profile.test_rating ??
        profile.testRating ??
        profile.rating ??
        profile.overall_rating ??
        profile.overallRating ??
        "";


    if (
        testRating !== ""
    ) {

        setTextForIds(
            [
                "profileTestRating",
                "view-rating",
                "viewRating"
            ],
            testRating
        );
    }


    const grade =
        profile.grade ??
        profile.test_grade ??
        profile.testGrade ??
        profile.overall_grade ??
        profile.overallGrade ??
        "";


    if (
        grade !== ""
    ) {

        setTextForIds(
            [
                "profileGrade",
                "view-grade",
                "viewGrade"
            ],
            grade
        );
    }


    const profileImage =
        profile.profilePic ||
        profile.profile_pic ||
        profile.profileImage ||
        profile.profile_image ||
        profile.avatar ||
        "";


    if (
        profileImage
    ) {

        document
            .querySelectorAll(
                ".profile img, .profile-pic, .post-user img, #profilePic"
            )
            .forEach(
                image => {

                    image.src =
                        profileImage;


                    image.alt =
                        profile.name ||
                        "Profile";


                    image.onerror =
                        () => {

                            image.onerror =
                                null;


                            image.src =
                                "https://via.placeholder.com/100";

                        };

                }
            );
    }


    const banner =
        document.getElementById(
            "bannerImage"
        );


    const bannerImage =
        profile.bannerImage ||
        profile.banner_image ||
        profile.banner ||
        "";


    if (
        banner &&
        bannerImage
    ) {

        banner.src =
            bannerImage;


        banner.style.display =
            "block";


        banner.onerror =
            () => {

                banner.style.display =
                    "none";

            };
    }
}


// =========================================================
// SET TEXT FOR IDS
// =========================================================

function setTextForIds(
    ids,
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return;
    }


    const text =
        String(
            value
        ).trim();


    if (
        text === ""
    ) {

        return;
    }


    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    text;
            }

        }
    );
}


// =========================================================
// PROFILE COMPLETION
// =========================================================

function updateProfileCompletion(
    profile
) {

    if (!profile) {

        setCompletionDisplay(
            0
        );


        return;
    }


    let completed =
        0;


    profileCompletionFields.forEach(
        field => {

            const value =
                profile[field];


            if (
                value !== undefined &&
                value !== null &&
                String(
                    value
                ).trim() !== ""
            ) {

                completed++;
            }

        }
    );


    const percentage =
        Math.round(
            (
                completed /
                profileCompletionFields.length
            ) * 100
        );


    console.log(
        `Profile Completion: ${percentage}%`
    );


    setCompletionDisplay(
        percentage
    );
}


// =========================================================
// COMPLETION DISPLAY
// =========================================================

function setCompletionDisplay(
    percentage
) {

    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    percentage
                ) || 0
            )
        );


    const textIds = [

        "profileCompletion",

        "profileCompletionPercent",

        "completionPercentage",

        "profileProgressText"

    ];


    textIds.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    `${safePercentage}% Completed`;

            }

        }
    );


    const progressIds = [

        "profileProgress",

        "profileCompletionBar",

        "completionProgress"

    ];


    progressIds.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.style.width =
                    `${safePercentage}%`;


                element.setAttribute(
                    "aria-valuenow",
                    String(
                        safePercentage
                    )
                );
            }

        }
    );


    document
        .querySelectorAll(
            ".profile-completion"
        )
        .forEach(
            element => {

                element.textContent =
                    `${safePercentage}%`;

            }
        );


    document
        .querySelectorAll(
            ".profile-progress"
        )
        .forEach(
            element => {

                element.style.width =
                    `${safePercentage}%`;

            }
        );
}


// =========================================================
// LOCAL PROFILE BACKUP
// =========================================================

function loadLocalProfileBackup() {

    const saved =
        localStorage.getItem(
            "userProfile"
        );


    if (!saved) {

        setCompletionDisplay(
            0
        );


        return;
    }


    try {

        const profile =
            JSON.parse(
                saved
            );


        const currentId =
            getCurrentUserId();


        if (
            profile.userId &&
            currentId &&
            Number(
                profile.userId
            ) !== currentId
        ) {

            return;
        }


        currentUserProfile =
            profile;


        displayMyProfile(
            profile
        );


        updateProfileCompletion(
            profile
        );


    } catch (error) {

        console.error(
            "LOCAL PROFILE ERROR:",
            error
        );
    }
}


// =========================================================
// LOAD LATEST INDUSTRY READINESS
// =========================================================

async function loadLatestIndustryReadiness(
    silent = true
) {

    try {

        const response =
            await authenticatedFetch(
                INDUSTRY_TEST_LATEST_URL,
                {
                    method:
                        "GET"
                }
            );


        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }


        const data =
            await readJsonResponse(
                response
            );


        if (!response.ok) {

            if (!silent) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to load readiness score."
                );
            }


            return;
        }


        if (
            !data.hasScore
        ) {

            return;
        }


        if (
            currentUserProfile
        ) {

            currentUserProfile.test_rating =
                data.testRating;

            currentUserProfile.grade =
                data.grade;
        }


        setTextForIds(
            [
                "profileTestRating",
                "view-rating",
                "viewRating"
            ],
            data.testRating
        );


        setTextForIds(
            [
                "profileGrade",
                "view-grade",
                "viewGrade"
            ],
            data.grade
        );


        setTextForIds(
            [
                "readinessScore",
                "profileReadinessScore"
            ],
            data.percentage
        );


        if (
            currentUserProfile
        ) {

            localStorage.setItem(
                "userProfile",
                JSON.stringify(
                    currentUserProfile
                )
            );
        }


        console.log(
            "Latest Industry Readiness loaded:",
            data
        );


    } catch (error) {

        if (!silent) {

            console.error(
                "READINESS SCORE LOAD ERROR:",
                error
            );
        }
    }
}


// =========================================================
// LOAD PEOPLE
// =========================================================

async function loadPeopleYouMayKnow() {

    console.log(
        "Loading People You May Know..."
    );


    try {

        const response =
            await authenticatedFetch(
                PEOPLE_API,
                {
                    method:
                        "GET"
                }
            );


        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }


        const data =
            await readJsonResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                `People request failed (${response.status}).`
            );
        }


        // -------------------------------------------------
        // server.js returns:
        //
        // {
        //     success: true,
        //     users: [...]
        // }
        // -------------------------------------------------

        if (
            Array.isArray(
                data?.users
            )
        ) {

            people =
                data.users;

        } else if (
            Array.isArray(
                data?.profiles
            )
        ) {

            people =
                data.profiles;

        } else if (
            Array.isArray(
                data
            )
        ) {

            people =
                data;

        } else {

            people =
                [];
        }


        const currentUserId =
            getCurrentUserId();


        people =
            people
                .map(
                    person => {

                        const userId =
                            getPersonUserId(
                                person
                            );


                        if (
                            userId
                        ) {

                            person.userId =
                                userId;
                        }


                        return person;

                    }
                )
                .filter(
                    person => {

                        const userId =
                            getPersonUserId(
                                person
                            );


                        return (
                            Number.isInteger(
                                userId
                            ) &&
                            userId > 0 &&
                            (
                                !currentUserId ||
                                userId !== currentUserId
                            )
                        );

                    }
                );


        localStorage.setItem(
            "peopleYouMayKnow",
            JSON.stringify(
                people
            )
        );


        console.log(
            "People loaded:",
            people.length
        );


        console.log(
            "People user IDs:",
            people.map(
                person =>
                    getPersonUserId(
                        person
                    )
            )
        );


        renderPeopleYouMayKnow(
            people
        );


    } catch (error) {

        console.error(
            "PEOPLE LOAD ERROR:",
            error
        );


        loadPeopleBackup();
    }
}


// =========================================================
// PEOPLE BACKUP
// =========================================================

function loadPeopleBackup() {

    const saved =
        localStorage.getItem(
            "peopleYouMayKnow"
        );


    if (!saved) {

        renderPeopleYouMayKnow(
            []
        );


        return;
    }


    try {

        const savedPeople =
            JSON.parse(
                saved
            );


        people =
            Array.isArray(
                savedPeople
            )
                ? savedPeople
                : [];


        const currentUserId =
            getCurrentUserId();


        people =
            people
                .map(
                    person => {

                        const userId =
                            getPersonUserId(
                                person
                            );


                        if (
                            userId
                        ) {

                            person.userId =
                                userId;
                        }


                        return person;

                    }
                )
                .filter(
                    person => {

                        const userId =
                            getPersonUserId(
                                person
                            );


                        return (
                            Number.isInteger(
                                userId
                            ) &&
                            userId > 0 &&
                            (
                                !currentUserId ||
                                userId !== currentUserId
                            )
                        );

                    }
                );


        renderPeopleYouMayKnow(
            people
        );


    } catch (error) {

        console.error(
            "PEOPLE BACKUP ERROR:",
            error
        );


        renderPeopleYouMayKnow(
            []
        );
    }
}


// =========================================================
// RENDER PEOPLE
// =========================================================

function renderPeopleYouMayKnow(
    peopleData
) {

    const container =
        document.getElementById(
            "peopleContainer"
        );


    if (!container) {

        console.warn(
            "#peopleContainer not found."
        );


        return;
    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(
            peopleData
        ) ||
        peopleData.length === 0
    ) {

        container.innerHTML = `

            <div class="people-loading">
                No other profiles available.
            </div>

        `;


        return;
    }


    const currentUserId =
        getCurrentUserId();


    peopleData
        .slice(
            0,
            10
        )
        .forEach(
            person => {

                const personId =
                    getPersonUserId(
                        person
                    );


                if (
                    !personId
                ) {

                    console.warn(
                        "Skipping People card because userId is missing:",
                        person
                    );


                    return;
                }


                if (
                    currentUserId &&
                    personId === currentUserId
                ) {

                    return;
                }


                const name =
                    person.name ||
                    person.username ||
                    person.fullname ||
                    "Campus2Career User";


                const headline =
                    person.headline ||
                    person.designation ||
                    "Professional";


                const location =
                    person.location ||
                    "";


                const profilePic =
                    person.profilePic ||
                    person.profile_pic ||
                    person.avatar ||
                    "https://via.placeholder.com/50";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "recommend-user database-person";


                // CANONICAL USER ID
                card.dataset.userId =
                    String(
                        personId
                    );


                card.setAttribute(
                    "data-user-id",
                    String(
                        personId
                    )
                );


                card.title =
                    `View profile #${personId}`;


                card.innerHTML = `

                    <img
                        src="${escapeHTML(profilePic)}"
                        alt="${escapeHTML(name)}"
                        class="recommend-profile-image"
                        loading="lazy"
                    >

                    <div class="recommend-profile-info">

                        <h4>
                            ${escapeHTML(name)}
                        </h4>

                        <p>
                            ${escapeHTML(headline)}
                        </p>

                        ${
                            location
                                ? `
                                    <small>
                                        ${escapeHTML(location)}
                                    </small>
                                `
                                : ""
                        }

                    </div>

                    <button
                        type="button"
                        class="connect-btn"
                        data-connect-user="${personId}"
                        data-user-id="${personId}"
                        title="Connections API is not currently available"
                    >
                        Connect
                    </button>

                `;


                const image =
                    card.querySelector(
                        "img"
                    );


                if (image) {

                    image.onerror =
                        () => {

                            image.onerror =
                                null;

                            image.src =
                                "https://via.placeholder.com/50";

                        };
                }


                container.appendChild(
                    card
                );

            }
        );


    setupPeopleDelegation();

    setupConnectionButtons();
}


// =========================================================
// PEOPLE CLICK HANDLER
// =========================================================

function setupPeopleDelegation() {

    const container =
        document.getElementById(
            "peopleContainer"
        );


    if (
        !container ||
        container.dataset.eventsAttached ===
            "true"
    ) {

        return;
    }


    container.dataset.eventsAttached =
        "true";


    container.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    ".connect-btn"
                )
            ) {

                return;
            }


            const card =
                event.target.closest(
                    ".database-person"
                );


            if (!card) {

                return;
            }


            const userId =
                card.dataset.userId;


            if (!userId) {

                return;
            }


            openPublicProfile(
                userId
            );

        }
    );
}


// =========================================================
// OPEN PUBLIC PROFILE
// =========================================================

function openPublicProfile(
    profileUserId
) {

    const id =
        Number(
            profileUserId
        );


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        console.error(
            "Invalid profile ID:",
            profileUserId
        );


        return;
    }


    const currentId =
        getCurrentUserId();


    if (
        currentId &&
        id === currentId
    ) {

        window.location.href =
            PROFILE_PAGE;


        return;
    }


    window.location.href =
        `${PROFILE_PAGE}?viewUserId=${encodeURIComponent(
            id
        )}`;
}


// =========================================================
// LOAD COMPANIES
// =========================================================

async function loadCompanies() {

    console.log(
        "Loading companies..."
    );


    try {

        const response =
            await fetch(
                COMPANIES_API,
                {
                    method:
                        "GET",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        const data =
            await readJsonResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                `Companies request failed (${response.status}).`
            );
        }


        if (
            Array.isArray(
                data
            )
        ) {

            companies =
                data;

        } else if (
            Array.isArray(
                data.companies
            )
        ) {

            companies =
                data.companies;

        } else {

            companies =
                [];
        }


        localStorage.setItem(
            "companies",
            JSON.stringify(
                companies
            )
        );


        console.log(
            "Companies loaded:",
            companies.length
        );


        renderCompanies(
            companies
        );


    } catch (error) {

        console.error(
            "COMPANY LOAD ERROR:",
            error
        );


        loadCompanyBackup();
    }
}


// =========================================================
// COMPANY BACKUP
// =========================================================

function loadCompanyBackup() {

    const saved =
        localStorage.getItem(
            "companies"
        );


    if (!saved) {

        renderCompanies(
            []
        );


        return;
    }


    try {

        companies =
            JSON.parse(
                saved
            );


        if (
            !Array.isArray(
                companies
            )
        ) {

            companies =
                [];
        }


        renderCompanies(
            companies
        );


    } catch (error) {

        console.error(
            "COMPANY BACKUP ERROR:",
            error
        );


        renderCompanies(
            []
        );
    }
}


// =========================================================
// RENDER COMPANIES
// =========================================================

function renderCompanies(
    companyData
) {

    const container =
        document.getElementById(
            "companyContainer"
        );


    if (!container) {

        console.warn(
            "#companyContainer not found."
        );


        return;
    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(
            companyData
        ) ||
        companyData.length === 0
    ) {

        container.innerHTML = `

            <div class="loading-message">
                No companies available.
            </div>

        `;


        return;
    }


    companyData
        .slice(
            0,
            8
        )
        .forEach(
            company => {

                const companyId =
                    Number(
                        company.id
                    );


                const companyName =
                    company.company_name ||
                    company.companyName ||
                    "Company";


                const logo =
                    company.logo ||
                    "https://via.placeholder.com/60?text=Logo";


                const industry =
                    company.industry ||
                    "Industry not specified";


                const location =
                    company.location ||
                    "";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "company-item";


                card.dataset.companyId =
                    companyId > 0
                        ? String(
                            companyId
                        )
                        : "";


                card.innerHTML = `

                    <img
                        src="${escapeHTML(logo)}"
                        alt="${escapeHTML(companyName)}"
                        class="company-list-logo"
                        loading="lazy"
                    >

                    <div>

                        <h3>
                            ${escapeHTML(companyName)}
                        </h3>

                        <p>
                            ${escapeHTML(industry)}
                        </p>

                        ${
                            location
                                ? `
                                    <small>
                                        ${escapeHTML(location)}
                                    </small>
                                `
                                : ""
                        }

                    </div>

                `;


                const image =
                    card.querySelector(
                        "img"
                    );


                if (image) {

                    image.onerror =
                        () => {

                            image.onerror =
                                null;


                            image.src =
                                "https://via.placeholder.com/60?text=Logo";

                        };
                }


                card.addEventListener(
                    "click",
                    () => {

                        if (
                            companyId > 0
                        ) {

                            window.location.href =
                                `${COMPANY_PAGE}?id=${encodeURIComponent(
                                    companyId
                                )}`;
                        }

                    }
                );


                container.appendChild(
                    card
                );

            }
        );
}


// =========================================================
// LOAD COURSES
// =========================================================

async function loadCourses() {

    console.log(
        "Loading courses..."
    );


    try {

        const response =
            await fetch(
                COURSES_API,
                {
                    method:
                        "GET",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        const data =
            await readJsonResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                `Courses request failed (${response.status}).`
            );
        }


        if (
            Array.isArray(
                data
            )
        ) {

            courses =
                data;

        } else if (
            Array.isArray(
                data.courses
            )
        ) {

            courses =
                data.courses;

        } else {

            courses =
                [];
        }


        localStorage.setItem(
            "courses",
            JSON.stringify(
                courses
            )
        );


        console.log(
            "Courses loaded:",
            courses.length
        );


        renderPortalCourses(
            courses
        );


    } catch (error) {

        console.error(
            "COURSE LOAD ERROR:",
            error
        );


        loadCourseBackup();
    }
}


// =========================================================
// COURSE BACKUP
// =========================================================

function loadCourseBackup() {

    const saved =
        localStorage.getItem(
            "courses"
        );


    if (!saved) {

        renderPortalCourses(
            []
        );


        return;
    }


    try {

        courses =
            JSON.parse(
                saved
            );


        if (
            !Array.isArray(
                courses
            )
        ) {

            courses =
                [];
        }


        renderPortalCourses(
            courses
        );


    } catch (error) {

        console.error(
            "COURSE BACKUP ERROR:",
            error
        );


        renderPortalCourses(
            []
        );
    }
}


// =========================================================
// RENDER COURSES
// =========================================================

function renderPortalCourses(
    courseData
) {

    const container =
        document.getElementById(
            "courseContainer"
        );


    if (!container) {

        console.warn(
            "#courseContainer not found."
        );


        return;
    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(
            courseData
        ) ||
        courseData.length === 0
    ) {

        container.innerHTML = `

            <div class="loading-message">
                No courses available.
            </div>

        `;


        return;
    }


    courseData
        .slice(
            0,
            5
        )
        .forEach(
            course => {

                const id =
                    Number(
                        course.id
                    );


                const name =
                    course.course_name ||
                    course.courseName ||
                    course.name ||
                    "Course";


                const field =
                    course.field ||
                    course.course_field ||
                    course.category ||
                    "General";


                const institution =
                    course.institution ||
                    course.provider ||
                    course.organization ||
                    "";


                const level =
                    course.level ||
                    course.course_level ||
                    "";


                const mode =
                    course.mode ||
                    course.learning_mode ||
                    "";


                const duration =
                    course.duration ||
                    "";


                const courseURL =
                    course.course_url ||
                    course.courseUrl ||
                    course.url ||
                    "";


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "course-item database-course-item";


                item.dataset.courseId =
                    id > 0
                        ? String(
                            id
                        )
                        : "";


                item.innerHTML = `

                    <h3>
                        ${escapeHTML(name)}
                    </h3>


                    <p>
                        ${escapeHTML(field)}
                    </p>


                    ${
                        institution
                            ? `
                                <p>
                                    ${escapeHTML(institution)}
                                </p>
                            `
                            : ""
                    }


                    ${
                        level
                            ? `
                                <p>
                                    Level:
                                    ${escapeHTML(level)}
                                </p>
                            `
                            : ""
                    }


                    ${
                        mode
                            ? `
                                <p>
                                    Mode:
                                    ${escapeHTML(mode)}
                                </p>
                            `
                            : ""
                    }


                    ${
                        duration
                            ? `
                                <p>
                                    Duration:
                                    ${escapeHTML(duration)}
                                </p>
                            `
                            : ""
                    }

                `;


                item.addEventListener(
                    "click",
                    () => {

                        if (
                            isValidHttpUrl(
                                courseURL
                            )
                        ) {

                            window.open(
                                courseURL,
                                "_blank",
                                "noopener,noreferrer"
                            );


                            return;
                        }


                        if (
                            id > 0
                        ) {

                            window.location.href =
                                `${COURSES_PAGE}?courseId=${encodeURIComponent(
                                    id
                                )}`;
                        }

                    }
                );


                container.appendChild(
                    item
                );

            }
        );
}

// =========================================================
// LOAD POSTS
// =========================================================

async function loadPosts() {

    console.log(
        "Loading posts..."
    );


    try {

        const response =
            await authenticatedFetch(
                POSTS_API,
                {
                    method:
                        "GET"
                }
            );


        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }


        const data =
            await readJsonResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                `Posts request failed (${response.status}).`
            );
        }


        // -------------------------------------------------
        // server.js returns:
        //
        // {
        //     success: true,
        //     posts: [...]
        // }
        // -------------------------------------------------

        if (
            Array.isArray(
                data
            )
        ) {

            posts =
                data;

        } else if (
            Array.isArray(
                data.posts
            )
        ) {

            posts =
                data.posts;

        } else {

            posts =
                [];
        }


        console.log(
            "Posts loaded:",
            posts.length
        );


        renderDatabasePosts(
            posts
        );


    } catch (error) {

        console.error(
            "POST LOAD ERROR:",
            error
        );


        posts =
            [];


        updatePostCount();
    }
}


// =========================================================
// NORMALIZE BACKEND MEDIA URL
// =========================================================
//
// server.js returns:
//
// /api/posts/123/image
// /api/posts/123/video
//
// Because the frontend is hosted on GitHub Pages,
// those relative URLs would otherwise point to GitHub Pages.
//
// This converts them into:
//
// https://campus2career-0pi8.onrender.com/api/posts/123/image
//
// =========================================================

function normalizeMediaUrl(
    value
) {

    if (
        !value ||
        typeof value !==
        "string"
    ) {

        return "";
    }


    const url =
        value.trim();


    if (
        !url
    ) {

        return "";
    }


    // Already absolute.

    if (
        isValidHttpUrl(
            url
        )
    ) {

        return url;
    }


    // Backend returned an API-relative URL.

    if (
        url.startsWith(
            "/api/"
        )
    ) {

        return (
            API_BASE.replace(
                /\/$/,
                ""
            ) +
            url.substring(
                4
            )
        );

    }


    // Generic root-relative URL.

    if (
        url.startsWith(
            "/"
        )
    ) {

        return (
            API_BASE.replace(
                /\/api$/,
                ""
            ) +
            url
        );

    }


    return url;
}


// =========================================================
// RENDER DATABASE POSTS
// =========================================================

function renderDatabasePosts(
    postData
) {

    const feed =
        document.getElementById(
            "postsScrollArea"
        ) ||
        document.querySelector(
            ".posts-scroll-area"
        );


    if (!feed) {

        console.error(
            "#postsScrollArea was not found."
        );


        return;
    }


    feed
        .querySelectorAll(
            ".database-post"
        )
        .forEach(
            post => post.remove()
        );


    if (
        !Array.isArray(
            postData
        )
    ) {

        updatePostCount();

        return;
    }


    const sortedPosts =
        [...postData].sort(
            (
                a,
                b
            ) => {

                const dateA =
                    new Date(
                        a.created_at ||
                        a.createdAt ||
                        0
                    ).getTime();


                const dateB =
                    new Date(
                        b.created_at ||
                        b.createdAt ||
                        0
                    ).getTime();


                return dateB - dateA;

            }
        );


    sortedPosts.forEach(
        postDataItem => {

            const post =
                createDatabasePostElement(
                    postDataItem
                );


            if (!post) {

                return;
            }


            feed.appendChild(
                post
            );


            attachPostEvents(
                post
            );

        }
    );


    updatePostCount();


    setupPostAuthorClicks();
}


// =========================================================
// CREATE DATABASE POST ELEMENT
// =========================================================

function createDatabasePostElement(
    postData
) {

    if (
        !postData ||
        typeof postData !==
        "object"
    ) {

        return null;
    }


    const post =
        document.createElement(
            "article"
        );


    post.className =
        "post database-post";


    const postId =
        postData.id ??
        postData.post_id;


    if (
        postId !== undefined &&
        postId !== null
    ) {

        post.dataset.postId =
            String(
                postId
            );
    }


    const authorUserId =
        postData.userId ??
        postData.user_id ??
        postData.authorId ??
        postData.author_id ??
        null;


    if (
        authorUserId !== null &&
        authorUserId !== undefined
    ) {

        post.dataset.authorId =
            String(
                authorUserId
            );
    }


    const authorName =
        postData.name ||
        postData.username ||
        postData.fullname ||
        postData.author_name ||
        "Campus2Career User";


    const profilePic =
        postData.profilePic ||
        postData.profile_pic ||
        postData.author_profile_pic ||
        "https://via.placeholder.com/50";


    const content =
        postData.content ||
        "";


    const createdAt =
        postData.created_at ||
        postData.createdAt ||
        "";


    // -----------------------------------------------------
    // IMPORTANT:
    // server.js now returns these as API endpoints.
    // -----------------------------------------------------

    const imageURL =
        normalizeMediaUrl(
            postData.image_url ||
            postData.imageUrl ||
            postData.image_data_url ||
            ""
        );


    const videoURL =
        normalizeMediaUrl(
            postData.video_url ||
            postData.videoUrl ||
            postData.video_data_url ||
            ""
        );


    const likes =
        Number(
            postData.likes_count ??
            postData.like_count ??
            postData.likes ??
            0
        );


    const comments =
        Number(
            postData.comments_count ??
            postData.comment_count ??
            postData.comments ??
            0
        );


    const shares =
        Number(
            postData.shares_count ??
            postData.share_count ??
            postData.shares ??
            0
        );


    const liked =
        Boolean(
            Number(
                postData.liked_by_current_user ??
                postData.is_liked ??
                postData.isLiked ??
                0
            )
        );


    let mediaHTML =
        "";


    // =====================================================
    // IMAGE
    // =====================================================

    if (
        imageURL
    ) {

        mediaHTML += `

            <img
                src="${escapeHTML(imageURL)}"
                class="post-image"
                alt="Post Image"
                loading="lazy"
            >

        `;

    }


    // =====================================================
    // VIDEO
    // =====================================================

    if (
        videoURL
    ) {

        mediaHTML += `

            <video
                controls
                class="post-video"
                preload="metadata"
                playsinline
            >

                <source
                    src="${escapeHTML(videoURL)}"
                >

                Your browser does not support video playback.

            </video>

        `;

    }


    // =====================================================
    // POST HTML
    // =====================================================

    post.innerHTML = `

        <div class="post-header">

            <img
                src="${escapeHTML(profilePic)}"
                alt="${escapeHTML(authorName)}"
                loading="lazy"
            >


            <div
                class="post-author-clickable"
                data-user-id="${
                    authorUserId !== null &&
                    authorUserId !== undefined
                        ? escapeHTML(
                            String(
                                authorUserId
                            )
                        )
                        : ""
                }"
                title="View profile"
            >

                <h3>
                    ${escapeHTML(authorName)}
                </h3>


                <p>
                    ${escapeHTML(
                        formatDate(
                            createdAt
                        )
                    )}
                </p>

            </div>

        </div>


        ${
            content
                ? `
                    <p class="post-text">
                        ${escapeHTML(content)}
                    </p>
                `
                : ""
        }


        ${mediaHTML}


        <div class="post-stats">

            <span class="like-count">
                👍 ${likes}
                ${likes === 1 ? "Like" : "Likes"}
            </span>


            <span class="comment-count">
                💬 ${comments}
                ${comments === 1 ? "Comment" : "Comments"}
            </span>


            <span class="share-count">
                🔄 ${shares}
                ${shares === 1 ? "Share" : "Shares"}
            </span>

        </div>


        <div class="actions">

            <button
                type="button"
                class="like-btn"
            >
                ${
                    liked
                        ? "❤️ Liked"
                        : "👍 Like"
                }
            </button>


            <button
                type="button"
                class="comment-btn"
            >
                💬 Comment
            </button>


            <button
                type="button"
                class="share-btn"
            >
                🔄 Share
            </button>


            <button
                type="button"
                class="delete-btn"
            >
                🗑 Delete
            </button>

        </div>


        <div class="comments"></div>

    `;


    // =====================================================
    // IMAGE ERROR HANDLING
    // =====================================================

    const profileImage =
        post.querySelector(
            ".post-header > img"
        );


    if (
        profileImage
    ) {

        profileImage.onerror =
            () => {

                profileImage.onerror =
                    null;


                profileImage.src =
                    "https://via.placeholder.com/50";

            };

    }


    const postImage =
        post.querySelector(
            ".post-image"
        );


    if (
        postImage
    ) {

        postImage.onerror =
            () => {

                postImage.style.display =
                    "none";

                console.warn(
                    "Unable to load post image:",
                    imageURL
                );

            };

    }


    // =====================================================
    // VIDEO ERROR HANDLING
    // =====================================================

    const postVideo =
        post.querySelector(
            ".post-video"
        );


    if (
        postVideo
    ) {

        postVideo.addEventListener(
            "error",
            () => {

                console.warn(
                    "Unable to load post video:",
                    videoURL
                );

            }
        );

    }


    // =====================================================
    // LIKE STATE
    // =====================================================

    post.dataset.liked =
        String(
            liked
        );


    // =====================================================
    // DELETE VISIBILITY
    // =====================================================

    const currentUserId =
        getCurrentUserId();


    const deleteButton =
        post.querySelector(
            ".delete-btn"
        );


    if (
        deleteButton &&
        authorUserId &&
        currentUserId &&
        Number(
            authorUserId
        ) !== currentUserId
    ) {

        deleteButton.style.display =
            "none";
    }


    return post;
}


// =========================================================
// POST AUTHOR CLICK HANDLER
// =========================================================

function setupPostAuthorClicks() {

    document
        .querySelectorAll(
            ".post-author-clickable"
        )
        .forEach(
            author => {

                if (
                    author.dataset.profileClickAttached ===
                    "true"
                ) {

                    return;
                }


                const userId =
                    author.dataset.userId;


                if (
                    !userId
                ) {

                    return;
                }


                author.dataset.profileClickAttached =
                    "true";


                author.style.cursor =
                    "pointer";


                author.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        openPublicProfile(
                            userId
                        );

                    }
                );

            }
        );
}


// =========================================================
// CREATE POST
// =========================================================
//
// Sends:
//
// multipart/form-data
//
// Fields:
//
// content
// image
// video
//
// The backend's multer middleware receives the files,
// converts them into Buffers and stores them in MySQL
// LONGBLOB columns.
// =========================================================

async function createPost() {

    const postInput =
        document.getElementById(
            "postInput"
        );


    const imageUpload =
        document.getElementById(
            "imageUpload"
        );


    const videoUpload =
        document.getElementById(
            "videoUpload"
        );


    const postButton =
        document.getElementById(
            "postBtn"
        );


    if (
        !postInput
    ) {

        console.error(
            "#postInput not found."
        );


        return;
    }


    const text =
        postInput.value.trim();


    const imageFile =
        imageUpload?.files?.length
            ? imageUpload.files[0]
            : null;


    const videoFile =
        videoUpload?.files?.length
            ? videoUpload.files[0]
            : null;


    // =====================================================
    // VALIDATE EMPTY POST
    // =====================================================

    if (
        !text &&
        !imageFile &&
        !videoFile
    ) {

        alert(
            "Create a post first."
        );


        return;
    }


    // =====================================================
    // VALIDATE CONTENT LENGTH
    // =====================================================

    if (
        text.length >
        500
    ) {

        alert(
            "Your post cannot exceed 500 characters."
        );


        return;
    }


    // =====================================================
    // VALIDATE IMAGE + VIDEO
    // =====================================================

    if (
        imageFile &&
        videoFile
    ) {

        alert(
            "Please upload either an image or a video, not both."
        );


        return;
    }


    // =====================================================
    // VALIDATE FILE TYPES
    // =====================================================

    const allowedImageTypes = [

        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"

    ];


    const allowedVideoTypes = [

        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime"

    ];


    if (
        imageFile &&
        !allowedImageTypes.includes(
            imageFile.type
        )
    ) {

        alert(
            "Unsupported image format.\n\n" +
            "Supported formats: JPG, PNG, GIF and WEBP."
        );


        return;
    }


    if (
        videoFile &&
        !allowedVideoTypes.includes(
            videoFile.type
        )
    ) {

        alert(
            "Unsupported video format.\n\n" +
            "Supported formats: MP4, WebM, OGG and MOV."
        );


        return;
    }


    // =====================================================
    // CLIENT-SIDE SIZE CHECK
    // =====================================================
    //
    // The backend allows up to 100 MB.
    // We enforce the same limit here to prevent
    // unnecessary uploads.
    // =====================================================

    const MAX_FILE_SIZE =
        100 *
        1024 *
        1024;


    const selectedFile =
        imageFile ||
        videoFile;


    if (
        selectedFile &&
        selectedFile.size >
        MAX_FILE_SIZE
    ) {

        alert(
            "The selected file is too large.\n\n" +
            "Maximum allowed size is 100 MB."
        );


        return;
    }


    // =====================================================
    // CREATE FORM DATA
    // =====================================================

    const formData =
        new FormData();


    // Always send content, even when empty.

    formData.append(
        "content",
        text
    );


    // Backend multer expects "image".

    if (
        imageFile
    ) {

        formData.append(
            "image",
            imageFile,
            imageFile.name
        );
    }


    // Backend multer expects "video".

    if (
        videoFile
    ) {

        formData.append(
            "video",
            videoFile,
            videoFile.name
        );
    }


    // =====================================================
    // DISABLE POST BUTTON
    // =====================================================

    const originalButtonText =
        postButton?.textContent ||
        "";


    if (
        postButton
    ) {

        postButton.disabled =
            true;


        postButton.textContent =
            "Posting...";

    }


    try {

        // =================================================
        // IMPORTANT:
        //
        // Do NOT set Content-Type manually.
        //
        // The browser automatically creates:
        //
        // multipart/form-data;
        // boundary=...
        // =================================================

        const response =
            await authenticatedFetch(
                POSTS_API,
                {
                    method:
                        "POST",

                    body:
                        formData
                }
            );


        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }


        const result =
            await readJsonResponse(
                response
            );


        if (
            !response.ok
        ) {

            throw new Error(
                result.error ||
                result.message ||
                `Unable to save post (${response.status}).`
            );
        }


        console.log(
            "Post saved successfully:",
            result
        );


        // =================================================
        // CLEAR FORM
        // =================================================

        postInput.value =
            "";


        if (
            imageUpload
        ) {

            imageUpload.value =
                "";

        }


        if (
            videoUpload
        ) {

            videoUpload.value =
                "";

        }


        updateCharacterCount();


        // =================================================
        // RELOAD FROM MYSQL
        // =================================================

        await loadPosts();


    } catch (error) {

        console.error(
            "CREATE POST ERROR:",
            error
        );


        alert(
            "Unable to save post.\n\n" +
            error.message
        );


    } finally {

        if (
            postButton
        ) {

            postButton.disabled =
                false;


            postButton.textContent =
                originalButtonText ||
                "Post";

        }

    }
}


// =========================================================
// SETUP POST FEATURES
// =========================================================

function setupPostFeatures() {

    const postInput =
        document.getElementById(
            "postInput"
        );


    const postButton =
        document.getElementById(
            "postBtn"
        );


    const imageUpload =
        document.getElementById(
            "imageUpload"
        );


    const videoUpload =
        document.getElementById(
            "videoUpload"
        );


    // =====================================================
    // POST TEXT INPUT
    // =====================================================

    if (
        postInput &&
        postInput.dataset.eventsAttached !==
            "true"
    ) {

        postInput.dataset.eventsAttached =
            "true";


        postInput.addEventListener(
            "input",
            updateCharacterCount
        );


        postInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();


                    createPost();

                }

            }
        );

    }


    // =====================================================
    // POST BUTTON
    // =====================================================

    if (
        postButton &&
        postButton.dataset.eventsAttached !==
            "true"
    ) {

        postButton.dataset.eventsAttached =
            "true";


        postButton.addEventListener(
            "click",
            createPost
        );

    }


    // =====================================================
    // IMAGE INPUT
    // =====================================================

    if (
        imageUpload &&
        imageUpload.dataset.eventsAttached !==
            "true"
    ) {

        imageUpload.dataset.eventsAttached =
            "true";


        imageUpload.addEventListener(
            "change",
            () => {

                const file =
                    imageUpload.files?.[0];


                if (
                    !file
                ) {

                    return;
                }


                // Prevent both media types.

                if (
                    videoUpload &&
                    videoUpload.files.length
                ) {

                    videoUpload.value =
                        "";

                }


                // Optional browser-level type check.

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Please select a valid image file."
                    );


                    imageUpload.value =
                        "";

                }

            }
        );

    }


    // =====================================================
    // VIDEO INPUT
    // =====================================================

    if (
        videoUpload &&
        videoUpload.dataset.eventsAttached !==
            "true"
    ) {

        videoUpload.dataset.eventsAttached =
            "true";


        videoUpload.addEventListener(
            "change",
            () => {

                const file =
                    videoUpload.files?.[0];


                if (
                    !file
                ) {

                    return;
                }


                // Prevent both media types.

                if (
                    imageUpload &&
                    imageUpload.files.length
                ) {

                    imageUpload.value =
                        "";

                }


                // Optional browser-level type check.

                if (
                    !file.type.startsWith(
                        "video/"
                    )
                ) {

                    alert(
                        "Please select a valid video file."
                    );


                    videoUpload.value =
                        "";

                }

            }
        );

    }


    updateCharacterCount();
}


// =========================================================
// CHARACTER COUNT
// =========================================================

function updateCharacterCount() {

    const input =
        document.getElementById(
            "postInput"
        );


    const counter =
        document.getElementById(
            "charCount"
        );


    if (
        !input ||
        !counter
    ) {

        return;
    }


    if (
        input.value.length >
        500
    ) {

        input.value =
            input.value.substring(
                0,
                500
            );
    }


    counter.textContent =
        `${input.value.length}/500`;
}


// =========================================================
// POST COUNT
// =========================================================

function updatePostCount() {

    const counter =
        document.getElementById(
            "postCount"
        );


    if (
        !counter
    ) {

        return;
    }


    const currentUserId =
        getCurrentUserId();


    if (
        !currentUserId
    ) {

        counter.textContent =
            "0";


        return;
    }


    const myPosts =
        posts.filter(
            post => {

                const authorId =
                    Number(
                        post.userId ??
                        post.user_id ??
                        post.authorId ??
                        post.author_id ??
                        0
                    );


                return (
                    authorId ===
                    currentUserId
                );

            }
        );


    counter.textContent =
        String(
            myPosts.length
        );
}


// =========================================================
// ATTACH POST EVENTS
// =========================================================

function attachPostEvents(
    post
) {

    if (
        !post ||
        post.dataset.eventsAttached ===
            "true"
    ) {

        return;
    }


    post.dataset.eventsAttached =
        "true";



    // =====================================================
    // LIKE
    // =====================================================

    const likeButton =
        post.querySelector(
            ".like-btn"
        );


    const likeCount =
        post.querySelector(
            ".like-count"
        );


    if (
        likeButton &&
        likeCount
    ) {

        likeButton.addEventListener(
            "click",
            async () => {

                const postId =
                    post.dataset.postId;


                if (!postId) {

                    return;
                }


                if (
                    likeButton.disabled
                ) {

                    return;
                }


                likeButton.disabled =
                    true;


                try {

                    const response =
                        await authenticatedFetch(
                            `${POSTS_API}/${encodeURIComponent(
                                postId
                            )}/like`,
                            {
                                method:
                                    "POST"
                            }
                        );


                    if (
                        handleAuthError(
                            response
                        )
                    ) {

                        return;
                    }


                    const result =
                        await readJsonResponse(
                            response
                        );


                    if (!response.ok) {

                        throw new Error(
                            result.error ||
                            result.message ||
                            "Unable to update like."
                        );
                    }


                    const count =
                        Number(
                            result.likes_count ??
                            result.like_count ??
                            result.likes ??
                            extractNumber(
                                likeCount.textContent
                            )
                        );


                    const liked =
                        result.liked !== undefined

                            ? Boolean(
                                result.liked
                            )

                            : !(
                                post.dataset.liked ===
                                "true"
                            );


                    post.dataset.liked =
                        String(
                            liked
                        );


                    likeCount.textContent =
                        `👍 ${count} ${
                            count === 1
                                ? "Like"
                                : "Likes"
                        }`;


                    likeButton.textContent =
                        liked
                            ? "❤️ Liked"
                            : "👍 Like";


                } catch (error) {

                    console.error(
                        "LIKE ERROR:",
                        error
                    );


                    alert(
                        "Unable to update like.\n\n" +
                        error.message
                    );


                } finally {

                    likeButton.disabled =
                        false;
                }

            }
        );
    }

    // =====================================================
    // COMMENT
    // =====================================================

    const commentButton =
        post.querySelector(
            ".comment-btn"
        );


    if (
        commentButton
    ) {

        commentButton.addEventListener(
            "click",
            async () => {

                const postId =
                    post.dataset.postId;


                if (!postId) {

                    return;
                }


                const comment =
                    prompt(
                        "Write your comment:"
                    );


                if (
                    !comment ||
                    !comment.trim()
                ) {

                    return;
                }


                try {

                    const response =
                        await authenticatedFetch(
                            `${POSTS_API}/${encodeURIComponent(
                                postId
                            )}/comments`,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        content:
                                            comment.trim()
                                    })
                            }
                        );


                    if (
                        handleAuthError(
                            response
                        )
                    ) {

                        return;
                    }


                    const result =
                        await readJsonResponse(
                            response
                        );


                    if (!response.ok) {

                        throw new Error(
                            result.error ||
                            result.message ||
                            "Unable to save comment."
                        );
                    }


                    await loadPostComments(
                        postId
                    );


                    // Reload post data so the count is always
                    // synchronized with MySQL.

                    await loadPosts();


                } catch (error) {

                    console.error(
                        "COMMENT ERROR:",
                        error
                    );


                    alert(
                        "Unable to save comment.\n\n" +
                        error.message
                    );
                }

            }
        );
    }


    // =====================================================
    // SHARE
    // =====================================================

    const shareButton =
        post.querySelector(
            ".share-btn"
        );


    if (
        shareButton
    ) {

        shareButton.addEventListener(
            "click",
            async () => {

                const postId =
                    post.dataset.postId;


                if (!postId) {

                    return;
                }


                try {

                    const response =
                        await authenticatedFetch(
                            `${POSTS_API}/${encodeURIComponent(
                                postId
                            )}/share`,
                            {
                                method:
                                    "POST"
                            }
                        );


                    if (
                        handleAuthError(
                            response
                        )
                    ) {

                        return;
                    }


                    const result =
                        await readJsonResponse(
                            response
                        );


                    if (!response.ok) {

                        throw new Error(
                            result.error ||
                            result.message ||
                            "Unable to update share."
                        );
                    }


                    const shareCount =
                        post.querySelector(
                            ".share-count"
                        );


                    if (
                        shareCount
                    ) {

                        const count =
                            Number(
                                result.shares_count ??
                                result.share_count ??
                                result.shares ??
                                extractNumber(
                                    shareCount.textContent
                                )
                            );


                        shareCount.textContent =
                            `🔄 ${count} ${
                                count === 1
                                    ? "Share"
                                    : "Shares"
                            }`;
                    }


                    const shareText =
                        post.querySelector(
                            ".post-text"
                        )?.textContent ||
                        "Campus2Career post";


                    const shareUrl =
                        `${window.location.origin}${window.location.pathname}#post-${postId}`;


                    if (
                        typeof navigator.share ===
                        "function"
                    ) {

                        try {

                            await navigator.share({

                                title:
                                    "Campus2Career",

                                text:
                                    shareText,

                                url:
                                    shareUrl

                            });

                        } catch (shareError) {

                            if (
                                shareError.name !==
                                "AbortError"
                            ) {

                                console.warn(
                                    "Native sharing failed:",
                                    shareError
                                );
                            }
                        }

                    } else if (
                        navigator.clipboard &&
                        typeof navigator.clipboard.writeText ===
                        "function"
                    ) {

                        await navigator.clipboard.writeText(
                            `${shareText}\n${shareUrl}`
                        );


                        alert(
                            "Post link copied to clipboard."
                        );
                    }


                } catch (error) {

                    console.error(
                        "SHARE ERROR:",
                        error
                    );


                    alert(
                        "Unable to share post.\n\n" +
                        error.message
                    );
                }

            }
        );
    }


    // =====================================================
    // DELETE
    // =====================================================

    const deleteButton =
        post.querySelector(
            ".delete-btn"
        );


    if (
        deleteButton
    ) {

        deleteButton.addEventListener(
            "click",
            async () => {

                const postId =
                    post.dataset.postId;


                if (!postId) {

                    return;
                }


                if (
                    !confirm(
                        "Are you sure you want to delete this post?"
                    )
                ) {

                    return;
                }


                try {

                    const response =
                        await authenticatedFetch(
                            `${POSTS_API}/${encodeURIComponent(
                                postId
                            )}`,
                            {
                                method:
                                    "DELETE"
                            }
                        );


                    if (
                        handleAuthError(
                            response
                        )
                    ) {

                        return;
                    }


                    const result =
                        await readJsonResponse(
                            response
                        );


                    if (!response.ok) {

                        throw new Error(
                            result.error ||
                            result.message ||
                            "Unable to delete post."
                        );
                    }


                    posts =
                        posts.filter(
                            postItem => {

                                const itemId =
                                    postItem.id ??
                                    postItem.post_id;


                                return (
                                    String(
                                        itemId
                                    ) !==
                                    String(
                                        postId
                                    )
                                );

                            }
                        );


                    post.remove();


                    updatePostCount();


                } catch (error) {

                    console.error(
                        "DELETE ERROR:",
                        error
                    );


                    alert(
                        "Unable to delete post.\n\n" +
                        error.message
                    );
                }

            }
        );
    }
}


// =========================================================
// LOAD COMMENTS
// =========================================================

async function loadPostComments(
    postId
) {

    try {

        const response =
            await authenticatedFetch(
                `${POSTS_API}/${encodeURIComponent(
                    postId
                )}/comments`,
                {
                    method:
                        "GET"
                }
            );


        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }


        const data =
            await readJsonResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Unable to load comments."
            );
        }


        const post =
            Array.from(
                document.querySelectorAll(
                    ".post[data-post-id]"
                )
            ).find(
                element =>
                    String(
                        element.dataset.postId
                    ) ===
                    String(
                        postId
                    )
            );


        if (!post) {

            return;
        }


        const box =
            post.querySelector(
                ".comments"
            );


        if (!box) {

            return;
        }


        const comments =
            Array.isArray(
                data
            )

                ? data

                : Array.isArray(
                    data.comments
                )

                    ? data.comments

                    : [];


        box.innerHTML =
            "";


        comments.forEach(
            comment => {

                const element =
                    document.createElement(
                        "p"
                    );


                const author =
                    comment.name ||
                    comment.username ||
                    "User";


                element.textContent =
                    `${author}: ${
                        comment.content ||
                        ""
                    }`;


                box.appendChild(
                    element
                );

            }
        );


    } catch (error) {

        console.error(
            "COMMENTS LOAD ERROR:",
            error
        );
    }
}


// =========================================================
// INITIALIZE EXISTING POSTS
// =========================================================

function initializeExistingPosts() {

    document
        .querySelectorAll(
            ".post"
        )
        .forEach(
            post => {

                attachPostEvents(
                    post
                );

            }
        );


    setupPostAuthorClicks();


    updatePostCount();
}


// =========================================================
// SEARCH
// =========================================================

function setupSearch() {

    const searchInput =
        document.querySelector(
            ".search-box input"
        );


    if (!searchInput) {

        return;
    }


    createSearchResultsPanel(
        searchInput
    );


    if (
        searchInput.dataset.eventsAttached ===
        "true"
    ) {

        return;
    }


    searchInput.dataset.eventsAttached =
        "true";


    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!query) {

                hideSearchResults();


                document
                    .querySelectorAll(
                        ".post"
                    )
                    .forEach(
                        post => {

                            post.style.display =
                                "";

                        }
                    );


                return;
            }


            performGlobalSearch(
                query
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            const panel =
                document.getElementById(
                    "globalSearchResults"
                );


            if (!panel) {

                return;
            }


            if (
                event.target.closest(
                    ".search-box"
                ) ||
                event.target.closest(
                    "#globalSearchResults"
                )
            ) {

                return;
            }


            hideSearchResults();

        }
    );
}


// =========================================================
// CREATE SEARCH PANEL
// =========================================================

function createSearchResultsPanel(
    input
) {

    if (
        document.getElementById(
            "globalSearchResults"
        )
    ) {

        return;
    }


    const box =
        input.closest(
            ".search-box"
        );


    if (!box) {

        return;
    }


    box.style.position =
        "relative";


    const panel =
        document.createElement(
            "div"
        );


    panel.id =
        "globalSearchResults";


    Object.assign(
        panel.style,
        {
            position:
                "absolute",

            top:
                "calc(100% + 8px)",

            left:
                "0",

            right:
                "0",

            maxHeight:
                "420px",

            overflowY:
                "auto",

            background:
                "var(--card, #fff)",

            border:
                "1px solid #E5E7EB",

            borderRadius:
                "12px",

            boxShadow:
                "0 15px 35px rgba(0,0,0,.16)",

            zIndex:
                "99999",

            display:
                "none"
        }
    );


    box.appendChild(
        panel
    );
}


// =========================================================
// GLOBAL SEARCH
// =========================================================

function performGlobalSearch(
    query
) {

    const normalizedQuery =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (!normalizedQuery) {

        hideSearchResults();

        return;
    }


    const results =
        [];


    people.forEach(
        person => {

            const id =
                getPersonUserId(
                    person
                );


            const name =
                String(
                    person.name ||
                    person.username ||
                    person.fullname ||
                    ""
                );


            const headline =
                String(
                    person.headline ||
                    person.designation ||
                    ""
                );


            const location =
                String(
                    person.location ||
                    ""
                );


            const value =
                `${name} ${headline} ${location}`
                    .toLowerCase();


            if (
                value.includes(
                    normalizedQuery
                ) &&
                Number.isInteger(
                    id
                ) &&
                id > 0
            ) {

                results.push({

                    type:
                        "person",

                    id:
                        id,

                    title:
                        name ||
                        "Campus2Career User",

                    subtitle:
                        headline,

                    meta:
                        location

                });
            }

        }
    );


    companies.forEach(
        company => {

            const id =
                Number(
                    company.id
                );


            const name =
                String(
                    company.company_name ||
                    company.companyName ||
                    ""
                );


            const industry =
                String(
                    company.industry ||
                    ""
                );


            const location =
                String(
                    company.location ||
                    ""
                );


            const value =
                `${name} ${industry} ${location}`
                    .toLowerCase();


            if (
                value.includes(
                    normalizedQuery
                )
            ) {

                results.push({

                    type:
                        "company",

                    id:
                        id,

                    title:
                        name ||
                        "Company",

                    subtitle:
                        industry,

                    meta:
                        location

                });
            }

        }
    );


    courses.forEach(
        course => {

            const id =
                Number(
                    course.id
                );


            const name =
                String(
                    course.course_name ||
                    course.courseName ||
                    course.name ||
                    ""
                );


            const field =
                String(
                    course.field ||
                    course.course_field ||
                    course.category ||
                    ""
                );


            const institution =
                String(
                    course.institution ||
                    course.provider ||
                    course.organization ||
                    ""
                );


            const description =
                String(
                    course.description ||
                    course.about ||
                    ""
                );


            const value =
                `${name} ${field} ${institution} ${description}`
                    .toLowerCase();


            if (
                value.includes(
                    normalizedQuery
                )
            ) {

                results.push({

                    type:
                        "course",

                    id:
                        id,

                    title:
                        name ||
                        "Course",

                    subtitle:
                        field,

                    meta:
                        institution

                });
            }

        }
    );


    posts.forEach(
        post => {

            const id =
                post.id ??
                post.post_id;


            const author =
                String(
                    post.name ||
                    post.username ||
                    post.fullname ||
                    ""
                );


            const content =
                String(
                    post.content ||
                    ""
                );


            const value =
                `${author} ${content}`
                    .toLowerCase();


            if (
                value.includes(
                    normalizedQuery
                )
            ) {

                results.push({

                    type:
                        "post",

                    id:
                        id,

                    title:
                        author ||
                        "Post",

                    subtitle:
                        content,

                    meta:
                        formatDate(
                            post.created_at ||
                            post.createdAt
                        )

                });
            }

        }
    );


    renderSearchResults(
        results
    );


    document
        .querySelectorAll(
            ".post"
        )
        .forEach(
            post => {

                post.style.display =
                    post.innerText
                        .toLowerCase()
                        .includes(
                            normalizedQuery
                        )
                        ? ""
                        : "none";

            }
        );
}


// =========================================================
// RENDER SEARCH RESULTS
// =========================================================

function renderSearchResults(
    results
) {

    const panel =
        document.getElementById(
            "globalSearchResults"
        );


    if (!panel) {

        return;
    }


    panel.innerHTML =
        "";


    if (
        results.length === 0
    ) {

        panel.innerHTML = `

            <div style="
                padding:16px;
                text-align:center;
                color:#6B7280;
            ">
                No results found.
            </div>

        `;


        panel.style.display =
            "block";


        return;
    }


    const groups = [

        {
            title:
                "👤 People",

            type:
                "person"
        },

        {
            title:
                "🏢 Companies",

            type:
                "company"
        },

        {
            title:
                "📚 Courses",

            type:
                "course"
        },

        {
            title:
                "📝 Posts",

            type:
                "post"
        }

    ];


    groups.forEach(
        group => {

            const items =
                results.filter(
                    result =>
                        result.type ===
                        group.type
                );


            if (
                items.length ===
                0
            ) {

                return;
            }


            const heading =
                document.createElement(
                    "div"
                );


            heading.textContent =
                group.title;


            heading.style.padding =
                "10px 14px 6px";


            heading.style.color =
                "#0A66C2";


            heading.style.fontSize =
                "11px";


            heading.style.fontWeight =
                "700";


            panel.appendChild(
                heading
            );


            items
                .slice(
                    0,
                    6
                )
                .forEach(
                    result => {

                        const row =
                            document.createElement(
                                "div"
                            );


                        row.style.padding =
                            "10px 14px";


                        row.style.cursor =
                            "pointer";


                        row.style.borderTop =
                            "1px solid #F1F5F9";


                        row.innerHTML = `

                            <div style="
                                font-size:13px;
                                font-weight:600;
                                color:#1F2937;
                            ">
                                ${escapeHTML(
                                    result.title
                                )}
                            </div>


                            ${
                                result.subtitle
                                    ? `
                                        <div style="
                                            margin-top:3px;
                                            font-size:10px;
                                            color:#6B7280;
                                        ">
                                            ${escapeHTML(
                                                result.subtitle
                                            )}
                                        </div>
                                    `
                                    : ""
                            }


                            ${
                                result.meta
                                    ? `
                                        <div style="
                                            margin-top:2px;
                                            font-size:9px;
                                            color:#9CA3AF;
                                        ">
                                            ${escapeHTML(
                                                result.meta
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                        `;


                        row.addEventListener(
                            "click",
                            () => {

                                handleSearchResult(
                                    result
                                );

                            }
                        );


                        panel.appendChild(
                            row
                        );

                    }
                );

        }
    );


    panel.style.display =
        "block";
}


// =========================================================
// SEARCH RESULT ACTION
// =========================================================

function handleSearchResult(
    item
) {

    hideSearchResults();


    if (
        item.type ===
        "person"
    ) {

        openPublicProfile(
            item.id
        );


        return;
    }


    if (
        item.type ===
        "company"
    ) {

        const companyId =
            Number(
                item.id
            );


        if (
            Number.isInteger(
                companyId
            ) &&
            companyId > 0
        ) {

            window.location.href =
                `${COMPANY_PAGE}?id=${encodeURIComponent(
                    companyId
                )}`;
        }


        return;
    }


    if (
        item.type ===
        "course"
    ) {

        const courseId =
            Number(
                item.id
            );


        if (
            Number.isInteger(
                courseId
            ) &&
            courseId > 0
        ) {

            window.location.href =
                `${COURSES_PAGE}?courseId=${encodeURIComponent(
                    courseId
                )}`;
        }


        return;
    }


    if (
        item.type ===
        "post"
    ) {

        if (
            item.id === undefined ||
            item.id === null
        ) {

            return;
        }


        const safeId =
            String(
                item.id
            );


        const post =
            Array.from(
                document.querySelectorAll(
                    ".post[data-post-id]"
                )
            ).find(
                element =>
                    String(
                        element.dataset.postId
                    ) ===
                    safeId
            );


        if (post) {

            document
                .querySelectorAll(
                    ".post"
                )
                .forEach(
                    element => {

                        element.style.display =
                            "";

                    }
                );


            post.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });
        }
    }
}


// =========================================================
// HIDE SEARCH RESULTS
// =========================================================

function hideSearchResults() {

    const panel =
        document.getElementById(
            "globalSearchResults"
        );


    if (
        panel
    ) {

        panel.style.display =
            "none";
    }
}


// =========================================================
// DARK MODE
// =========================================================

function setupDarkMode() {

    const header =
        document.querySelector(
            "header"
        );


    if (!header) {

        return;
    }


    let button =
        document.querySelector(
            ".dark-toggle"
        );


    if (!button) {

        button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "dark-toggle";


        button.setAttribute(
            "aria-label",
            "Toggle dark mode"
        );


        header.appendChild(
            button
        );
    }


    const updateButton =
        () => {

            const dark =
                document.body.classList.contains(
                    "dark-mode"
                );


            button.textContent =
                dark
                    ? "☀️"
                    : "🌙";


            button.setAttribute(
                "aria-label",
                dark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );

        };


    if (
        localStorage.getItem(
            "theme"
        ) === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );
    }


    updateButton();


    if (
        button.dataset.eventsAttached ===
        "true"
    ) {

        return;
    }


    button.dataset.eventsAttached =
        "true";


    button.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            );


            const dark =
                document.body.classList.contains(
                    "dark-mode"
                );


            localStorage.setItem(
                "theme",
                dark
                    ? "dark"
                    : "light"
            );


            updateButton();

        }
    );
}


// =========================================================
// MOBILE MENU
// =========================================================

function setupMobileMenu() {

    const header =
        document.querySelector(
            "header"
        );


    const nav =
        document.querySelector(
            "nav"
        );


    if (
        !header ||
        !nav
    ) {

        return;
    }


    let button =
        document.querySelector(
            ".menu-toggle"
        );


    if (!button) {

        button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "menu-toggle";


        button.textContent =
            "☰";


        button.setAttribute(
            "aria-label",
            "Open navigation"
        );


        header.prepend(
            button
        );
    }


    const updateMenu =
        () => {

            if (
                window.innerWidth <=
                768
            ) {

                button.style.display =
                    "flex";


                nav.style.flexDirection =
                    "column";


                if (
                    nav.dataset.mobileOpen !==
                    "true"
                ) {

                    nav.style.display =
                        "none";
                }


            } else {

                button.style.display =
                    "none";


                nav.style.display =
                    "flex";


                nav.style.flexDirection =
                    "row";


                nav.dataset.mobileOpen =
                    "false";
            }

        };


    updateMenu();


    if (
        button.dataset.eventsAttached !==
        "true"
    ) {

        button.dataset.eventsAttached =
            "true";


        button.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth >
                    768
                ) {

                    return;
                }


                const isOpen =
                    nav.dataset.mobileOpen ===
                    "true";


                nav.dataset.mobileOpen =
                    isOpen
                        ? "false"
                        : "true";


                nav.style.display =
                    isOpen
                        ? "none"
                        : "flex";

            }
        );
    }


    window.addEventListener(
        "resize",
        updateMenu
    );
}


// =========================================================
// CONNECTION BUTTONS
// =========================================================
//
// There is currently no /api/connections endpoint in the
// backend. Therefore we do not send a request that will
// inevitably fail.
//
// Clicking Connect directs the user to the selected profile
// rather than falsely reporting "Connected".
// =========================================================

function setupConnectionButtons() {

    document
        .querySelectorAll(
            ".connect-btn"
        )
        .forEach(
            button => {

                if (
                    button.dataset.eventsAttached ===
                    "true"
                ) {

                    return;
                }


                button.dataset.eventsAttached =
                    "true";


                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        const targetId =
                            getPersonUserId({
                                userId:
                                    button.dataset.connectUser
                            });


                        if (
                            !targetId
                        ) {

                            console.error(
                                "Invalid connection target ID:",
                                button.dataset.connectUser
                            );


                            return;
                        }


                        if (
                            !CONNECTIONS_API_AVAILABLE
                        ) {

                            openPublicProfile(
                                targetId
                            );


                            return;
                        }

                    }
                );

            }
        );
}


// =========================================================
// CONNECTION COUNTER
// =========================================================

function incrementConnectionCount() {

    const counter =
        document.getElementById(
            "connectionsCount"
        );


    if (!counter) {

        return;
    }


    const count =
        parseInt(
            counter.textContent,
            10
        ) || 0;


    counter.textContent =
        String(
            count + 1
        );
}


// =========================================================
// EDIT PROFILE
// =========================================================

function setupEditProfile() {

    const editButton =
        document.getElementById(
            "editProfileLink"
        );


    if (!editButton) {

        return;
    }


    if (
        editButton.dataset.eventsAttached ===
        "true"
    ) {

        return;
    }


    editButton.dataset.eventsAttached =
        "true";


    editButton.addEventListener(
        "click",
        event => {

            event.preventDefault();


            if (
                !getAuthToken() ||
                !getCurrentUserId()
            ) {

                alert(
                    "Please log in before editing your profile."
                );


                window.location.href =
                    LOGIN_PAGE;


                return;
            }


            window.location.href =
                PROFILE_PAGE;

        }
    );
}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
    value
) {

    if (!value) {

        return "";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );
    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    );
}


// =========================================================
// EXTRACT NUMBER
// =========================================================

function extractNumber(
    value
) {

    const match =
        String(
            value ?? ""
        ).match(
            /\d+(?:\.\d+)?/
        );


    return match
        ? Number(
            match[0]
        )
        : 0;
}


// =========================================================
// VALID HTTP URL
// =========================================================

function isValidHttpUrl(
    value
) {

    if (
        !value ||
        typeof value !==
        "string"
    ) {

        return false;
    }


    try {

        const parsed =
            new URL(
                value.trim()
            );


        return (
            parsed.protocol ===
                "http:" ||

            parsed.protocol ===
                "https:"
        );


    } catch (error) {

        return false;
    }
}


// =========================================================
// VALID MEDIA URL
// =========================================================

function isValidMediaUrl(
    value
) {

    if (
        typeof value !==
        "string"
    ) {

        return false;
    }


    const trimmed =
        value.trim();


    return (
        isValidHttpUrl(
            trimmed
        ) ||

        trimmed.startsWith(
            "data:image/"
        ) ||

        trimmed.startsWith(
            "data:video/"
        )
    );
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}


// =========================================================
// AI CHATBOT
// =========================================================
//
// IMPORTANT:
//
// There is ONE chatbot implementation only.
//
// MainPortal.html loads script.js with defer.
// initializePortal() explicitly calls setupAIChatbot().
//
// The chatbot communicates with:
//
// POST /api/ai-chat
//
// server.js returns:
//
// {
//     success: true,
//     reply: "..."
// }
//
// =========================================================

let aiChatInitialized =
    false;


function setupAIChatbot() {

    const chatButton =
        document.getElementById(
            "aiChatButton"
        );


    const chatWindow =
        document.getElementById(
            "aiChatWindow"
        );


    const closeButton =
        document.getElementById(
            "aiChatClose"
        );


    const input =
        document.getElementById(
            "aiChatInput"
        );


    const sendButton =
        document.getElementById(
            "aiChatSend"
        );


    const messages =
        document.getElementById(
            "aiChatBody"
        );


    console.log(
        "Checking Campus2Career AI chatbot..."
    );


    if (!chatButton) {

        console.warn(
            "#aiChatButton not found."
        );

        return;
    }


    if (!chatWindow) {

        console.warn(
            "#aiChatWindow not found."
        );

        return;
    }


    if (!input) {

        console.warn(
            "#aiChatInput not found."
        );

        return;
    }


    if (!sendButton) {

        console.warn(
            "#aiChatSend not found."
        );

        return;
    }


    if (!messages) {

        console.warn(
            "#aiChatBody not found."
        );

        return;
    }


    if (
        aiChatInitialized
    ) {

        return;
    }


    aiChatInitialized =
        true;


    // -----------------------------------------------------
    // INITIAL CHAT STATE
    // -----------------------------------------------------

    const initialDisplay =
        window.getComputedStyle(
            chatWindow
        ).display;


    if (
        initialDisplay !== "flex" &&
        initialDisplay !== "block"
    ) {

        chatWindow.style.display =
            "none";

    }


    chatWindow.classList.remove(
        "active"
    );


    // -----------------------------------------------------
    // INDUSTRY READINESS TEST BUTTON
    // -----------------------------------------------------

    let startTestButton =
        messages.querySelector(
            ".ai-start-test-btn"
        );


    if (!startTestButton) {

        startTestButton =
            document.createElement(
                "button"
            );


        startTestButton.type =
            "button";


        startTestButton.className =
            "ai-start-test-btn";


        startTestButton.textContent =
            "🎯 Start Industry Readiness Test";


        messages.appendChild(
            startTestButton
        );

    }


    if (
        startTestButton.dataset.eventsAttached !==
        "true"
    ) {

        startTestButton.dataset.eventsAttached =
            "true";


        startTestButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                startIndustryReadinessTest();

            }
        );
    }


    // -----------------------------------------------------
    // OPEN / CLOSE HELPER
    // -----------------------------------------------------

    function openChat() {

        chatWindow.style.display =
            "flex";

        chatWindow.style.visibility =
            "visible";

        chatWindow.style.opacity =
            "1";

        chatWindow.classList.add(
            "active"
        );


        setTimeout(
            () => {

                try {

                    input.focus();

                } catch (error) {

                    console.warn(
                        "AI input focus failed:",
                        error
                    );
                }

            },
            100
        );
    }


    function closeChat() {

        chatWindow.style.display =
            "none";

        chatWindow.style.visibility =
            "hidden";

        chatWindow.style.opacity =
            "0";

        chatWindow.classList.remove(
            "active"
        );
    }


    // -----------------------------------------------------
    // OPEN CHAT
    // -----------------------------------------------------

    if (
        chatButton.dataset.eventsAttached !==
        "true"
    ) {

        chatButton.dataset.eventsAttached =
            "true";


        chatButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                const isOpen =
                    chatWindow.classList.contains(
                        "active"
                    ) ||
                    chatWindow.style.display ===
                        "flex";


                if (
                    isOpen
                ) {

                    closeChat();

                } else {

                    openChat();

                }

            }
        );

    }


    // -----------------------------------------------------
    // CLOSE CHAT
    // -----------------------------------------------------

    if (
        closeButton &&
        closeButton.dataset.eventsAttached !==
            "true"
    ) {

        closeButton.dataset.eventsAttached =
            "true";


        closeButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                closeChat();

            }
        );

    }


    // -----------------------------------------------------
    // ADD USER MESSAGE
    // -----------------------------------------------------

    function addUserMessage(
        text
    ) {

        if (
            !text
        ) {

            return null;
        }


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "ai-message user-message";


        element.textContent =
            text;


        messages.appendChild(
            element
        );


        messages.scrollTop =
            messages.scrollHeight;


        return element;
    }


    // -----------------------------------------------------
    // ADD AI MESSAGE
    // -----------------------------------------------------

    function addAIMessage(
        text
    ) {

        if (
            text === undefined ||
            text === null
        ) {

            return null;
        }


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "ai-message";


        element.textContent =
            String(
                text
            );


        messages.appendChild(
            element
        );


        messages.scrollTop =
            messages.scrollHeight;


        return element;
    }


    // -----------------------------------------------------
    // EXTRACT BACKEND AI RESPONSE
    // -----------------------------------------------------

    function extractAIReply(
        rawResponse
    ) {

        if (
            !rawResponse ||
            !rawResponse.trim()
        ) {

            return "";
        }


        const text =
            rawResponse.trim();


        try {

            const data =
                JSON.parse(
                    text
                );


            // Primary server.js response.
            if (
                typeof data.reply ===
                "string"
            ) {

                return data.reply.trim();
            }


            if (
                typeof data.response ===
                "string"
            ) {

                return data.response.trim();
            }


            if (
                typeof data.answer ===
                "string"
            ) {

                return data.answer.trim();
            }


            if (
                typeof data.message ===
                "string" &&
                data.success !== true
            ) {

                return data.message.trim();
            }


            if (
                typeof data.content ===
                "string"
            ) {

                return data.content.trim();
            }


            if (
                typeof data.text ===
                "string"
            ) {

                return data.text.trim();
            }


            // OpenAI-compatible response.
            if (
                Array.isArray(
                    data.choices
                ) &&
                data.choices.length > 0
            ) {

                const choice =
                    data.choices[0];


                if (
                    choice?.message?.content
                ) {

                    return String(
                        choice.message.content
                    ).trim();
                }


                if (
                    choice?.text
                ) {

                    return String(
                        choice.text
                    ).trim();
                }
            }


            // Gemini response.
            if (
                Array.isArray(
                    data.candidates
                ) &&
                data.candidates.length > 0
            ) {

                const result =
                    data.candidates[0]
                        ?.content
                        ?.parts
                        ?.map(
                            part =>
                                part?.text ||
                                ""
                        )
                        .join("")
                        .trim();


                if (
                    result
                ) {

                    return result;
                }
            }


            return "";


        } catch (error) {

            return text;
        }
    }


    // -----------------------------------------------------
    // SEND MESSAGE TO REAL BACKEND AI
    // -----------------------------------------------------

    async function sendAIMessage() {

        const userMessage =
            input.value.trim();


        if (
            !userMessage ||
            input.disabled
        ) {

            return;
        }


        addUserMessage(
            userMessage
        );


        input.value =
            "";


        input.disabled =
            true;


        sendButton.disabled =
            true;


        const thinking =
            addAIMessage(
                "Thinking..."
            );


        try {

            const response =
                await fetch(
                    AI_CHATBOT_URL,
                    {
                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Accept:
                                "application/json"

                        },

                        body:
                            JSON.stringify({
                                message:
                                    userMessage
                            })
                    }
                );


            const rawResponse =
                await response.text();


            if (!response.ok) {

                let errorMessage =
                    `AI server returned HTTP ${response.status}`;


                try {

                    const errorData =
                        JSON.parse(
                            rawResponse
                        );


                    errorMessage =
                        errorData.message ||
                        errorData.error ||
                        errorMessage;


                } catch (error) {

                    // Keep HTTP fallback message.

                }


                throw new Error(
                    errorMessage
                );
            }


            if (
                thinking
            ) {

                thinking.remove();
            }


            const reply =
                extractAIReply(
                    rawResponse
                );


            if (
                !reply
            ) {

                throw new Error(
                    "The AI endpoint returned an empty response."
                );
            }


            addAIMessage(
                reply
            );


        } catch (error) {

            console.error(
                "AI CHATBOT ERROR:",
                error
            );


            if (
                thinking
            ) {

                thinking.remove();
            }


            addAIMessage(
                "Unable to contact the AI chatbot: " +
                error.message
            );


        } finally {

            input.disabled =
                false;


            sendButton.disabled =
                false;


            input.focus();

        }

    }


    // -----------------------------------------------------
    // SEND BUTTON
    // -----------------------------------------------------

    if (
        sendButton.dataset.eventsAttached !==
        "true"
    ) {

        sendButton.dataset.eventsAttached =
            "true";


        sendButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                sendAIMessage();

            }
        );
    }


    // -----------------------------------------------------
    // ENTER KEY
    // -----------------------------------------------------

    if (
        input.dataset.eventsAttached !==
        "true"
    ) {

        input.dataset.eventsAttached =
            "true";


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();


                    sendAIMessage();

                }

            }
        );
    }


    // -----------------------------------------------------
    // DEBUG / PUBLIC FUNCTIONS
    // -----------------------------------------------------

    window.sendAIMessage =
        sendAIMessage;


    window.addAIMessage =
        addAIMessage;


    window.addUserMessage =
        addUserMessage;


    window.extractAIReply =
        extractAIReply;


    console.log(
        "Campus2Career AI chatbot initialized successfully."
    );
}
