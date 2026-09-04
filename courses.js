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
// Server response:
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
// API
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
        document.getElementById("courseGrid");

    const courseCount =
        document.getElementById("courseCount");


    // -----------------------------------------
    // Loading state
    // -----------------------------------------

    if (courseGrid) {

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


        const response =
            await fetch(
                COURSES_API,
                {
                    method: "GET",

                    headers: {
                        Accept:
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        // -----------------------------------------
        // Read response
        // -----------------------------------------

        const responseText =
            await response.text();


        console.log(
            "Courses API status:",
            response.status
        );


        // -----------------------------------------
        // Parse JSON
        // -----------------------------------------

        let data;

        try {

            data =
                responseText
                    ? JSON.parse(responseText)
                    : [];

        } catch (parseError) {

            console.error(
                "Invalid courses API response:",
                responseText
            );

            throw new Error(
                "The courses server returned an invalid response."
            );

        }


        // -----------------------------------------
        // HTTP error handling
        // -----------------------------------------

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
                `Server returned HTTP ${response.status}.`
            );

        }


        // -----------------------------------------
        // IMPORTANT:
        // server.js returns a RAW ARRAY
        //
        // Correct:
        // [
        //   {...},
        //   {...}
        // ]
        // -----------------------------------------

        if (!Array.isArray(data)) {

            console.error(
                "Unexpected courses response:",
                data
            );

            throw new Error(
                "The courses server returned an unexpected data format."
            );

        }


        // -----------------------------------------
        // Store database results
        // -----------------------------------------

        allCourses =
            data.map(
                normalizeCourse
            );


        console.log(
            `Loaded ${allCourses.length} courses from database.`
        );


        // -----------------------------------------
        // Build filters
        // -----------------------------------------

        populateFieldFilter();

        populateLevelFilter();

        populateModeFilter();


        // -----------------------------------------
        // Display courses
        // -----------------------------------------

        applyFilters();


    } catch (error) {

        console.error(
            "COURSES LOAD ERROR:",
            error
        );


        // Clear old data
        allCourses = [];


        if (courseGrid) {

            courseGrid.innerHTML = `

                <div class="no-results">

                    <h3>
                        Unable to load courses
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Something went wrong while loading courses."
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
// Keeps the frontend aligned with the exact
// database fields returned by server.js.
// =========================================

function normalizeCourse(course) {

    if (
        !course ||
        typeof course !== "object"
    ) {

        return {

            id: "",

            course_name: "",

            field: "",

            description: "",

            institution: "",

            level: "",

            mode: "",

            duration: "",

            course_url: "",

            created_at: "",

            updated_at: ""

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


    // -----------------------------------------
    // Search
    // -----------------------------------------

    if (courseSearch) {

        courseSearch.addEventListener(
            "input",
            applyFilters
        );

    }


    // -----------------------------------------
    // Field
    // -----------------------------------------

    if (fieldFilter) {

        fieldFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // -----------------------------------------
    // Level
    // -----------------------------------------

    if (levelFilter) {

        levelFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // -----------------------------------------
    // Mode
    // -----------------------------------------

    if (modeFilter) {

        modeFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // -----------------------------------------
    // Reset
    // -----------------------------------------

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

        courseSearch.value = "";

    }


    if (fieldFilter) {

        fieldFilter.value = "";

    }


    if (levelFilter) {

        levelFilter.value = "";

    }


    if (modeFilter) {

        modeFilter.value = "";

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
                            course?.[property] ?? ""
                        ).trim()
                )

                .filter(
                    value =>
                        value !== ""
                )

        )
    ]
    .sort(
        (a, b) =>
            a.localeCompare(
                b,
                undefined,
                {
                    sensitivity: "base"
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
        fieldFilter?.value || "";


    const selectedLevel =
        levelFilter?.value || "";


    const selectedMode =
        modeFilter?.value || "";


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


                // -----------------------------------------
                // Search
                // -----------------------------------------

                const searchMatch =

                    !searchValue ||

                    courseName.includes(
                        searchValue
                    ) ||

                    description.includes(
                        searchValue
                    );


                // -----------------------------------------
                // Field
                // -----------------------------------------

                const fieldMatch =

                    !selectedField ||

                    field === selectedField;


                // -----------------------------------------
                // Level
                // -----------------------------------------

                const levelMatch =

                    !selectedLevel ||

                    level === selectedLevel;


                // -----------------------------------------
                // Mode
                // -----------------------------------------

                const modeMatch =

                    !selectedMode ||

                    mode === selectedMode;


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

        return;

    }


    courseGrid.replaceChildren();


    // -----------------------------------------
    // No results
    // -----------------------------------------

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


        return;

    }


    // -----------------------------------------
    // Course count
    // -----------------------------------------

    if (courseCount) {

        courseCount.textContent =

            `${courseData.length} ${
                courseData.length === 1
                    ? "course"
                    : "courses"
            } found`;

    }


    // -----------------------------------------
    // Render cards
    // -----------------------------------------

    const fragment =
        document.createDocumentFragment();


    courseData.forEach(
        course => {

            fragment.appendChild(
                createCourseCard(
                    course
                )
            );

        }
    );


    courseGrid.appendChild(
        fragment
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


    // -----------------------------------------
    // Exact database fields from server.js
    // -----------------------------------------

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


    // -----------------------------------------
    // Course button
    // -----------------------------------------

    if (courseUrl) {

        const link =
            document.createElement(
                "a"
            );


        link.className =
            "view-course-btn";


        link.href =
            courseUrl;


        link.target =
            "_blank";


        link.rel =
            "noopener noreferrer";


        link.textContent =
            "View Course";


        card.appendChild(
            createCourseContent(
                course,
                courseId,
                courseName,
                field,
                description,
                institution,
                level,
                mode,
                duration
            )
        );


        card
            .querySelector(
                ".course-body"
            )
            .appendChild(
                link
            );

    } else {

        card.appendChild(
            createCourseContent(
                course,
                courseId,
                courseName,
                field,
                description,
                institution,
                level,
                mode,
                duration
            )
        );


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "view-course-btn";


        button.disabled =
            true;


        button.textContent =
            "Course Link Unavailable";


        button.style.opacity =
            "0.6";


        button.style.cursor =
            "not-allowed";


        card
            .querySelector(
                ".course-body"
            )
            .appendChild(
                button
            );

    }


    return card;

}


// =========================================
// CREATE COURSE CONTENT
// =========================================

function createCourseContent(
    course,
    courseId,
    courseName,
    field,
    description,
    institution,
    level,
    mode,
    duration
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.innerHTML = `

        <div class="course-top">

            <span class="course-field">
                ${escapeHTML(field)}
            </span>

            <h3>
                ${escapeHTML(courseName)}
            </h3>

        </div>


        <div class="course-body">

            <p class="course-description">
                ${escapeHTML(description)}
            </p>


            <div class="institution">
                ${escapeHTML(institution)}
            </div>


            <div class="course-details">

                <div class="detail">

                    <span>
                        Level
                    </span>

                    <strong>
                        ${escapeHTML(level)}
                    </strong>

                </div>


                <div class="detail">

                    <span>
                        Mode
                    </span>

                    <strong>
                        ${escapeHTML(mode)}
                    </strong>

                </div>


                <div class="detail">

                    <span>
                        Duration
                    </span>

                    <strong>
                        ${escapeHTML(duration)}
                    </strong>

                </div>


                <div class="detail">

                    <span>
                        Course ID
                    </span>

                    <strong>
                        ${escapeHTML(
                            String(
                                courseId || "-"
                            )
                        )}
                    </strong>

                </div>

            </div>

        </div>

    `;


    return wrapper.firstElementChild;

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


        // -----------------------------------------
        // Allow normal web links only
        // -----------------------------------------

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
