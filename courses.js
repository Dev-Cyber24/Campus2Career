"use strict";

// =========================================
// CAMPUS2CAREER
// COURSES JAVASCRIPT
// =========================================
// Fetches courses from:
// Node.js + Express + MySQL
//
// Backend endpoint:
// GET /api/courses
//
// Expected response:
//
// [
//     {
//         id,
//         course_name,
//         field,
//         description,
//         institution,
//         level,
//         mode,
//         duration,
//         course_url,
//         created_at,
//         updated_at
//     }
// ]
// =========================================


// =========================================
// API CONFIGURATION
// =========================================

const COURSES_API =
    "https://campus2career-0pi8.onrender.com/api/courses";


// =========================================
// GLOBAL COURSE DATA
// =========================================

let allCourses = [];


// =========================================
// PAGE INITIALIZATION
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupFilters();

        loadCourses();

    }
);


// =========================================
// LOAD COURSES
// =========================================

async function loadCourses() {

    const courseGrid =
        document.getElementById(
            "courseGrid"
        );

    const courseCount =
        document.getElementById(
            "courseCount"
        );


    // =========================================
    // LOADING STATE
    // =========================================

    if (courseGrid) {

        courseGrid.setAttribute(
            "aria-busy",
            "true"
        );

        courseGrid.innerHTML = `
            <div class="loading">
                Loading courses...
            </div>
        `;

    }


    if (courseCount) {

        courseCount.textContent =
            "Loading courses...";

    }


    try {

        console.log(
            "Fetching courses from:",
            COURSES_API
        );


        // =========================================
        // REQUEST TIMEOUT
        // =========================================

        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () => {

                    controller.abort();

                },
                15000
            );


        let response;


        try {

            response =
                await fetch(
                    COURSES_API,
                    {
                        method:
                            "GET",

                        headers: {

                            Accept:
                                "application/json"

                        },

                        cache:
                            "no-store",

                        signal:
                            controller.signal

                    }
                );

        } finally {

            clearTimeout(
                timeout
            );

        }


        console.log(
            "Courses API status:",
            response.status
        );


        // =========================================
        // READ SERVER RESPONSE
        // =========================================

        const responseText =
            await response.text();


        console.log(
            "Courses API response:",
            responseText
        );


        // =========================================
        // PARSE SERVER RESPONSE
        // =========================================

        let data = [];


        if (
            responseText &&
            responseText.trim() !== ""
        ) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch (parseError) {

                console.error(
                    "Invalid courses API response:",
                    parseError
                );


                throw new Error(
                    "The courses server returned invalid data."
                );

            }

        }


        // =========================================
        // HTTP ERROR HANDLING
        // =========================================

        if (!response.ok) {

            const serverMessage =
                data &&
                typeof data === "object"
                    ? (
                        data.error ||
                        data.message ||
                        ""
                    )
                    : "";


            throw new Error(
                serverMessage ||
                `Course server returned HTTP ${response.status}.`
            );

        }


        // =========================================
        // VERIFY RESPONSE FORMAT
        // =========================================

        if (!Array.isArray(data)) {

            console.error(
                "Unexpected courses response:",
                data
            );


            throw new Error(
                "The courses server returned an unexpected data format."
            );

        }


        // =========================================
        // STORE COURSE DATA
        // =========================================

        allCourses =
            data.map(
                normalizeCourse
            );


        console.log(
            `Loaded ${allCourses.length} courses from database.`
        );


        // =========================================
        // BUILD FILTER OPTIONS
        // =========================================

        populateFieldFilter();

        populateLevelFilter();

        populateModeFilter();


        // =========================================
        // DISPLAY COURSES
        // =========================================

        applyFilters();


        // =========================================
        // ACCESSIBILITY STATE
        // =========================================

        if (courseGrid) {

            courseGrid.setAttribute(
                "aria-busy",
                "false"
            );

        }


    } catch (error) {

        console.error(
            "COURSES LOAD ERROR:",
            error
        );


        allCourses = [];


        let errorMessage =
            "Something went wrong while loading courses.";


        if (
            error &&
            error.name === "AbortError"
        ) {

            errorMessage =
                "The course server took too long to respond.";

        } else if (
            error &&
            error.message
        ) {

            errorMessage =
                error.message;

        }


        // =========================================
        // ERROR DISPLAY
        // =========================================

        if (courseGrid) {

            courseGrid.setAttribute(
                "aria-busy",
                "false"
            );


            courseGrid.innerHTML = `

                <div class="no-results">

                    <h3>
                        Unable to load courses
                    </h3>

                    <p>
                        ${escapeHTML(
                            errorMessage
                        )}
                    </p>

                    <button
                        type="button"
                        class="reset-btn"
                        onclick="loadCourses()"
                    >
                        Try Again
                    </button>

                </div>

            `;

        }


        if (courseCount) {

            courseCount.textContent =
                "Unable to load courses.";

        }

    }

}


// =========================================
// NORMALIZE COURSE
// =========================================

function normalizeCourse(
    course
) {

    if (
        !course ||
        typeof course !== "object"
    ) {

        return {

            id:
                "",

            course_name:
                "",

            field:
                "",

            description:
                "",

            institution:
                "",

            level:
                "",

            mode:
                "",

            duration:
                "",

            course_url:
                "",

            created_at:
                "",

            updated_at:
                ""

        };

    }


    return {

        id:
            course.id ?? "",

        course_name:
            course.course_name ?? "",

        field:
            course.field ?? "",

        description:
            course.description ?? "",

        institution:
            course.institution ?? "",

        level:
            course.level ?? "",

        mode:
            course.mode ?? "",

        duration:
            course.duration ?? "",

        course_url:
            course.course_url ?? "",

        created_at:
            course.created_at ?? "",

        updated_at:
            course.updated_at ?? ""

    };

}


// =========================================
// FILTER SETUP
// =========================================

function setupFilters() {

    const courseSearch =
        document.getElementById(
            "courseSearch"
        );


    const fieldFilter =
        document.getElementById(
            "fieldFilter"
        );


    const levelFilter =
        document.getElementById(
            "levelFilter"
        );


    const modeFilter =
        document.getElementById(
            "modeFilter"
        );


    const resetFilters =
        document.getElementById(
            "resetFilters"
        );


    // =========================================
    // SEARCH
    // =========================================

    if (courseSearch) {

        courseSearch.addEventListener(
            "input",
            applyFilters
        );

    }


    // =========================================
    // FIELD FILTER
    // =========================================

    if (fieldFilter) {

        fieldFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // =========================================
    // LEVEL FILTER
    // =========================================

    if (levelFilter) {

        levelFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // =========================================
    // MODE FILTER
    // =========================================

    if (modeFilter) {

        modeFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // =========================================
    // RESET
    // =========================================

    if (resetFilters) {

        resetFilters.addEventListener(
            "click",
            resetCourseFilters
        );

    }

}


// =========================================
// RESET FILTERS
// =========================================

function resetCourseFilters() {

    const courseSearch =
        document.getElementById(
            "courseSearch"
        );


    const fieldFilter =
        document.getElementById(
            "fieldFilter"
        );


    const levelFilter =
        document.getElementById(
            "levelFilter"
        );


    const modeFilter =
        document.getElementById(
            "modeFilter"
        );


    if (courseSearch) {

        courseSearch.value =
            "";

    }


    if (fieldFilter) {

        fieldFilter.value =
            "";

    }


    if (levelFilter) {

        levelFilter.value =
            "";

    }


    if (modeFilter) {

        modeFilter.value =
            "";

    }


    applyFilters();

}


// =========================================
// POPULATE FIELD FILTER
// =========================================

function populateFieldFilter() {

    const fieldFilter =
        document.getElementById(
            "fieldFilter"
        );


    if (!fieldFilter) {

        return;

    }


    const previousValue =
        fieldFilter.value;


    const fields =
        getUniqueValues(
            allCourses,
            "field"
        );


    fieldFilter.replaceChildren();


    fieldFilter.appendChild(
        createOption(
            "",
            "All Fields"
        )
    );


    fields.forEach(
        field => {

            fieldFilter.appendChild(
                createOption(
                    field,
                    field
                )
            );

        }
    );


    if (
        fields.includes(
            previousValue
        )
    ) {

        fieldFilter.value =
            previousValue;

    }

}


// =========================================
// POPULATE LEVEL FILTER
// =========================================

function populateLevelFilter() {

    const levelFilter =
        document.getElementById(
            "levelFilter"
        );


    if (!levelFilter) {

        return;

    }


    const previousValue =
        levelFilter.value;


    const levels =
        getUniqueValues(
            allCourses,
            "level"
        );


    levelFilter.replaceChildren();


    levelFilter.appendChild(
        createOption(
            "",
            "All Levels"
        )
    );


    levels.forEach(
        level => {

            levelFilter.appendChild(
                createOption(
                    level,
                    level
                )
            );

        }
    );


    if (
        levels.includes(
            previousValue
        )
    ) {

        levelFilter.value =
            previousValue;

    }

}


// =========================================
// POPULATE MODE FILTER
// =========================================

function populateModeFilter() {

    const modeFilter =
        document.getElementById(
            "modeFilter"
        );


    if (!modeFilter) {

        return;

    }


    const previousValue =
        modeFilter.value;


    const modes =
        getUniqueValues(
            allCourses,
            "mode"
        );


    modeFilter.replaceChildren();


    modeFilter.appendChild(
        createOption(
            "",
            "All Modes"
        )
    );


    modes.forEach(
        mode => {

            modeFilter.appendChild(
                createOption(
                    mode,
                    mode
                )
            );

        }
    );


    if (
        modes.includes(
            previousValue
        )
    ) {

        modeFilter.value =
            previousValue;

    }

}


// =========================================
// GET UNIQUE FILTER VALUES
// =========================================

function getUniqueValues(
    courses,
    property
) {

    return [

        ...new Set(

            courses

                .map(
                    course =>

                        String(
                            course?.[
                                property
                            ] ?? ""
                        ).trim()

                )

                .filter(
                    value =>
                        value !== ""
                )

        )

    ].sort(
        (
            a,
            b
        ) =>

            a.localeCompare(
                b,
                undefined,
                {
                    sensitivity:
                        "base"
                }
            )

    );

}


// =========================================
// CREATE SELECT OPTION
// =========================================

function createOption(
    value,
    text
) {

    const option =
        document.createElement(
            "option"
        );


    option.value =
        value;


    option.textContent =
        text;


    return option;

}


// =========================================
// APPLY FILTERS
// =========================================

function applyFilters() {

    const courseSearch =
        document.getElementById(
            "courseSearch"
        );


    const fieldFilter =
        document.getElementById(
            "fieldFilter"
        );


    const levelFilter =
        document.getElementById(
            "levelFilter"
        );


    const modeFilter =
        document.getElementById(
            "modeFilter"
        );


    const searchValue =
        courseSearch
            ? courseSearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedField =
        fieldFilter?.value ||
        "";


    const selectedLevel =
        levelFilter?.value ||
        "";


    const selectedMode =
        modeFilter?.value ||
        "";


    const filteredCourses =
        allCourses.filter(
            course => {

                const courseName =
                    String(
                        course.course_name
                    )
                    .toLowerCase();


                const description =
                    String(
                        course.description
                    )
                    .toLowerCase();


                const institution =
                    String(
                        course.institution
                    )
                    .toLowerCase();


                const field =
                    String(
                        course.field
                    )
                    .trim();


                const level =
                    String(
                        course.level
                    )
                    .trim();


                const mode =
                    String(
                        course.mode
                    )
                    .trim();


                // =========================================
                // SEARCH
                // =========================================

                const searchMatch =

                    !searchValue ||

                    courseName.includes(
                        searchValue
                    ) ||

                    description.includes(
                        searchValue
                    ) ||

                    institution.includes(
                        searchValue
                    );


                // =========================================
                // FIELD
                // =========================================

                const fieldMatch =

                    !selectedField ||

                    field ===
                        selectedField;


                // =========================================
                // LEVEL
                // =========================================

                const levelMatch =

                    !selectedLevel ||

                    level ===
                        selectedLevel;


                // =========================================
                // MODE
                // =========================================

                const modeMatch =

                    !selectedMode ||

                    mode ===
                        selectedMode;


                return (

                    searchMatch &&

                    fieldMatch &&

                    levelMatch &&

                    modeMatch

                );

            }
        );


    renderCourses(
        filteredCourses
    );

}


// =========================================
// RENDER COURSES
// =========================================

function renderCourses(
    courseData
) {

    const courseGrid =
        document.getElementById(
            "courseGrid"
        );


    const courseCount =
        document.getElementById(
            "courseCount"
        );


    if (!courseGrid) {

        console.error(
            "Element #courseGrid was not found."
        );

        return;

    }


    courseGrid.replaceChildren();


    // =========================================
    // NO RESULTS
    // =========================================

    if (
        !Array.isArray(courseData) ||
        courseData.length === 0
    ) {

        courseGrid.innerHTML = `

            <div class="no-results">

                <h3>
                    No courses found
                </h3>

                <p>
                    Try changing your search
                    or filter options.
                </p>

            </div>

        `;


        if (courseCount) {

            courseCount.textContent =
                "0 courses found";

        }


        courseGrid.setAttribute(
            "aria-busy",
            "false"
        );


        return;

    }


    // =========================================
    // COURSE COUNT
    // =========================================

    if (courseCount) {

        courseCount.textContent =

            `${courseData.length} ${
                courseData.length === 1
                    ? "course"
                    : "courses"
            } found`;

    }


    // =========================================
    // CREATE FRAGMENT
    // =========================================

    const fragment =
        document.createDocumentFragment();


    courseData.forEach(
        course => {

            const card =
                createCourseCard(
                    course
                );


            if (card) {

                fragment.appendChild(
                    card
                );

            }

        }
    );


    courseGrid.appendChild(
        fragment
    );


    courseGrid.setAttribute(
        "aria-busy",
        "false"
    );

}


// =========================================
// CREATE COURSE CARD
// =========================================

function createCourseCard(
    course
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "course-card";


    // =========================================
    // COURSE DATA
    // =========================================

    const courseId =
        course.id ?? "";


    const courseName =
        course.course_name ||
        "Untitled Course";


    const field =
        course.field ||
        "General";


    const description =
        course.description ||
        "No description available.";


    const institution =
        course.institution ||
        "Institution not specified";


    const level =
        course.level ||
        "Not specified";


    const mode =
        course.mode ||
        "Not specified";


    const duration =
        course.duration ||
        "Not specified";


    const courseUrl =
        normalizeCourseUrl(
            course.course_url
        );


    card.dataset.courseId =
        String(
            courseId
        );


    // =========================================
    // COURSE HEADER
    // =========================================

    const top =
        document.createElement(
            "div"
        );


    top.className =
        "course-top";


    const fieldBadge =
        document.createElement(
            "span"
        );


    fieldBadge.className =
        "course-field";


    fieldBadge.textContent =
        field;


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        courseName;


    top.appendChild(
        fieldBadge
    );


    top.appendChild(
        title
    );


    // =========================================
    // COURSE BODY
    // =========================================

    const body =
        document.createElement(
            "div"
        );


    body.className =
        "course-body";


    // =========================================
    // DESCRIPTION
    // =========================================

    const descriptionElement =
        document.createElement(
            "p"
        );


    descriptionElement.className =
        "course-description";


    descriptionElement.textContent =
        description;


    // =========================================
    // INSTITUTION
    // =========================================

    const institutionElement =
        document.createElement(
            "div"
        );


    institutionElement.className =
        "institution";


    institutionElement.textContent =
        institution;


    // =========================================
    // COURSE DETAILS
    // =========================================

    const details =
        document.createElement(
            "div"
        );


    details.className =
        "course-details";


    details.appendChild(
        createDetail(
            "Level",
            level
        )
    );


    details.appendChild(
        createDetail(
            "Mode",
            mode
        )
    );


    details.appendChild(
        createDetail(
            "Duration",
            duration
        )
    );


    details.appendChild(
        createDetail(
            "Course ID",
            String(
                courseId ||
                "-"
            )
        )
    );


    // =========================================
    // COURSE LINK
    // =========================================

    let courseButton;


    if (courseUrl) {

        courseButton =
            document.createElement(
                "a"
            );


        courseButton.href =
            courseUrl;


        courseButton.target =
            "_blank";


        courseButton.rel =
            "noopener noreferrer";


        courseButton.textContent =
            "View Course";

    } else {

        courseButton =
            document.createElement(
                "button"
            );


        courseButton.type =
            "button";


        courseButton.disabled =
            true;


        courseButton.textContent =
            "Course Link Unavailable";


        courseButton.style.opacity =
            "0.6";


        courseButton.style.cursor =
            "not-allowed";

    }


    courseButton.className =
        "view-course-btn";


    // =========================================
    // ADD CONTENT TO BODY
    // =========================================

    body.appendChild(
        descriptionElement
    );


    body.appendChild(
        institutionElement
    );


    body.appendChild(
        details
    );


    body.appendChild(
        courseButton
    );


    // =========================================
    // ADD TOP + BODY TO CARD
    // =========================================

    card.appendChild(
        top
    );


    card.appendChild(
        body
    );


    return card;

}


// =========================================
// CREATE COURSE DETAIL
// =========================================

function createDetail(
    label,
    value
) {

    const detail =
        document.createElement(
            "div"
        );


    detail.className =
        "detail";


    const labelElement =
        document.createElement(
            "span"
        );


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "strong"
        );


    valueElement.textContent =
        value;


    detail.appendChild(
        labelElement
    );


    detail.appendChild(
        valueElement
    );


    return detail;

}


// =========================================
// NORMALIZE COURSE URL
// =========================================

function normalizeCourseUrl(
    value
) {

    const rawUrl =
        String(
            value ?? ""
        ).trim();


    if (
        !rawUrl ||
        rawUrl === "#"
    ) {

        return "";

    }


    try {

        const url =
            new URL(
                rawUrl,
                window.location.href
            );


        // =========================================
        // ONLY HTTP / HTTPS
        // =========================================

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        ) {

            return "";

        }


        return url.href;

    } catch (error) {

        console.warn(
            "Invalid course URL:",
            rawUrl
        );


        return "";

    }

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}


// =========================================
// GLOBAL ACCESS
// =========================================

window.loadCourses =
    loadCourses;


window.applyCourseFilters =
    applyFilters;


window.resetCourseFilters =
    resetCourseFilters;
