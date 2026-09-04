// =========================================================
// CAMPUS2CAREER - OPTIMIZED MAIN PORTAL JAVASCRIPT
// =========================================================
// PERFORMANCE IMPROVEMENTS:
// 1. Lazy loading of non-critical data
// 2. Debounced/throttled event handlers
// 3. Event delegation instead of individual listeners
// 4. Batch DOM updates
// 5. RequestAnimationFrame for smooth animations
// =========================================================

const API_BASE = "https://campus2career-0pi8.onrender.com/api";
const TOKEN_KEY = "authToken";
const USER_ID_KEY = "userId";

let currentUserProfile = null;
let people = [];
let companies = [];
let courses = [];
let posts = [];

// =========================================================
// PERFORMANCE UTILITIES
// =========================================================

// Debounce function to prevent excessive function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for frequent events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Batch DOM operations
function batchDOMUpdate(callback) {
    if (window.requestAnimationFrame) {
        window.requestAnimationFrame(callback);
    } else {
        callback();
    }
}

// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener("DOMContentLoaded", initializePortal);

async function initializePortal() {
    console.log("Initializing Campus2Career portal...");

    const token = getAuthToken();
    const currentUserId = getCurrentUserId();

    if (!token || !currentUserId) {
        console.warn("No valid authentication.");
        window.location.href = "login.html";
        return;
    }

    // Setup UI features first (non-blocking)
    setupPostFeatures();
    setupSearch();
    setupDarkMode();
    setupMobileMenu();
    setupEditProfile();
    setupAIChatbot();
    initializeExistingPosts();
    updatePostCount();

    // Load CRITICAL data first
    await loadMyProfile();

    // Load non-critical data in background (lazy)
    lazyLoadNonCriticalData();

    console.log("Campus2Career portal initialized.");
}

// Load non-critical data without blocking UI
async function lazyLoadNonCriticalData() {
    // Delay loading less important data
    setTimeout(async () => {
        try {
            await Promise.allSettled([
                loadPeopleYouMayKnow(),
                loadCompanies(),
                loadCourses(),
                loadPosts()
            ]);
            setupPostAuthorClicks();
        } catch (error) {
            console.error("Background load error:", error);
        }
    }, 1000);
}

// =========================================================
// AUTH TOKEN & USER ID
// =========================================================

function getAuthToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    return (token && token.trim()) || null;
}

function getCurrentUserId() {
    const storedId = localStorage.getItem(USER_ID_KEY);
    if (!storedId) return null;
    const id = Number(storedId);
    return (Number.isInteger(id) && id > 0) ? id : null;
}

// =========================================================
// AUTHENTICATED FETCH
// =========================================================

async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required.");

    const headers = {
        "Accept": "application/json",
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };

    return fetch(url, { ...options, headers });
}

async function readJsonResponse(response) {
    const text = await response.text();
    if (!text || text.trim() === "") return {};

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("Invalid JSON:", text);
        throw new Error("Server returned invalid JSON.");
    }
}

function handleAuthError(response) {
    if (response.status === 401 || response.status === 403) {
        [TOKEN_KEY, USER_ID_KEY].forEach(key => localStorage.removeItem(key));
        alert("Session expired. Please sign in again.");
        window.location.href = "login.html";
        return true;
    }
    return false;
}

// =========================================================
// LOAD MY PROFILE (CRITICAL)
// =========================================================

async function loadMyProfile() {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const response = await authenticatedFetch(
            `${API_BASE}/user-profile/${userId}`,
            { method: "GET" }
        );

        if (handleAuthError(response)) return;

        if (response.status === 404) {
            updateProfileCompletion(null);
            setTextForIds(["profileName"], "Complete your profile");
            return;
        }

        const data = await readJsonResponse(response);
        if (!response.ok) throw new Error(data.error || "Profile load failed");

        if (data.profile) {
            currentUserProfile = data.profile;
            localStorage.setItem("userProfile", JSON.stringify(currentUserProfile));
            batchDOMUpdate(() => {
                displayMyProfile(currentUserProfile);
                updateProfileCompletion(currentUserProfile);
            });
        }
    } catch (error) {
        console.error("Profile load error:", error);
        loadLocalProfileBackup();
    }
}

// =========================================================
// DISPLAY PROFILE
// =========================================================

function displayMyProfile(profile) {
    if (!profile) return;

    // Batch text updates
    const updates = [
        { ids: ["profileName", "profile-name", "view-name"], value: profile.name },
        { ids: ["designation", "profileHeadline"], value: profile.headline },
        { ids: ["tagline", "profileTagline"], value: profile.tagline },
        { ids: ["location", "profileLocation"], value: profile.location },
        { ids: ["profileAbout", "about"], value: profile.about },
        { ids: ["profileEmail", "email"], value: profile.email },
        { ids: ["profilePhone", "phone"], value: profile.phone }
    ];

    updates.forEach(({ ids, value }) => setTextForIds(ids, value));

    // Handle profile images efficiently
    const profileImage = profile.profilePic || profile.profile_pic || profile.avatar || "";
    if (profileImage) {
        batchDOMUpdate(() => {
            document.querySelectorAll(".profile img, .profile-pic, .post-user img, #profilePic")
                .forEach(img => {
                    img.src = profileImage;
                    img.alt = profile.name || "Profile";
                    img.onerror = () => (img.src = "https://via.placeholder.com/100");
                });
        });
    }

    // Banner image
    const banner = document.getElementById("bannerImage");
    const bannerImage = profile.bannerImage || profile.banner_image || "";
    if (banner && bannerImage) {
        batchDOMUpdate(() => {
            banner.src = bannerImage;
            banner.style.display = "block";
            banner.onerror = () => (banner.style.display = "none");
        });
    }
}

// =========================================================
// PROFILE COMPLETION
// =========================================================

const profileCompletionFields = [
    "name", "headline", "tagline", "location", "about", "email", "phone",
    "github", "linkedin", "education", "experience", "projects", "skills",
    "certifications", "achievements", "profilePic", "bannerImage"
];

function updateProfileCompletion(profile) {
    if (!profile) {
        setCompletionDisplay(0);
        return;
    }

    const completed = profileCompletionFields.filter(field =>
        profile[field] !== undefined && profile[field] !== null && String(profile[field]).trim() !== ""
    ).length;

    const percentage = Math.round((completed / profileCompletionFields.length) * 100);
    setCompletionDisplay(percentage);
}

function setCompletionDisplay(percentage) {
    batchDOMUpdate(() => {
        ["profileCompletion", "profileCompletionPercent", "completionPercentage"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = `${percentage}% Completed`;
        });

        ["profileProgress", "profileCompletionBar"].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.width = `${percentage}%`;
                el.setAttribute("aria-valuenow", String(percentage));
            }
        });
    });
}

// =========================================================
// UTILITY: SET TEXT FOR IDS
// =========================================================

function setTextForIds(ids, value) {
    if (value === undefined || value === null) return;
    const text = String(value).trim();
    if (text === "") return;

    batchDOMUpdate(() => {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });
    });
}

// =========================================================
// LOAD LOCAL PROFILE BACKUP
// =========================================================

function loadLocalProfileBackup() {
    const saved = localStorage.getItem("userProfile");
    if (!saved) {
        setCompletionDisplay(0);
        return;
    }

    try {
        const profile = JSON.parse(saved);
        const currentId = getCurrentUserId();

        if (profile.userId && currentId && Number(profile.userId) !== currentId) return;

        currentUserProfile = profile;
        batchDOMUpdate(() => {
            displayMyProfile(profile);
            updateProfileCompletion(profile);
        });
    } catch (error) {
        console.error("Local profile error:", error);
    }
}

// =========================================================
// LOAD PEOPLE (NON-CRITICAL)
// =========================================================

async function loadPeopleYouMayKnow() {
    console.log("Loading people...");
    const currentUserId = getCurrentUserId();

    try {
        const response = await authenticatedFetch(`${API_BASE}/user-profiles`, { method: "GET" });
        if (handleAuthError(response)) return;

        const data = await readJsonResponse(response);
        if (!response.ok) throw new Error(data.error || "People load failed");

        people = Array.isArray(data) ? data :
                 Array.isArray(data.users) ? data.users :
                 Array.isArray(data.profiles) ? data.profiles : [];

        people = people.filter(p => {
            const id = Number(p.userId ?? p.user_id ?? p.id);
            return !currentUserId || id !== currentUserId;
        });

        localStorage.setItem("peopleYouMayKnow", JSON.stringify(people));
        batchDOMUpdate(() => renderPeopleYouMayKnow(people));
    } catch (error) {
        console.error("People load error:", error);
        loadPeopleBackup();
    }
}

// =========================================================
// RENDER PEOPLE (OPTIMIZED)
// =========================================================

function renderPeopleYouMayKnow(peopleData) {
    const container = document.getElementById("peopleContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(peopleData) || peopleData.length === 0) {
        container.innerHTML = '<div class="people-loading">No other profiles available.</div>';
        return;
    }

    // Fragment for batch insert
    const fragment = document.createDocumentFragment();
    const currentUserId = getCurrentUserId();

    peopleData.slice(0, 10).forEach(person => {
        const personId = Number(person.userId ?? person.user_id ?? person.id);

        if (!Number.isInteger(personId) || personId <= 0 || (currentUserId && personId === currentUserId)) {
            return;
        }

        const card = document.createElement("div");
        card.className = "recommend-user database-person";
        card.dataset.userId = String(personId);
        card.title = "View profile";

        card.innerHTML = `
            <img src="${escapeHTML(person.profilePic || 'https://via.placeholder.com/50')}" 
                 alt="${escapeHTML(person.name || 'User')}" class="recommend-profile-image">
            <div class="recommend-profile-info">
                <h4>${escapeHTML(person.name || 'Campus2Career User')}</h4>
                <p>${escapeHTML(person.headline || 'Professional')}</p>
                ${person.location ? `<small>${escapeHTML(person.location)}</small>` : ''}
            </div>
            <button type="button" class="connect-btn" data-connect-user="${personId}">Connect</button>
        `;

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
    setupPeopleDelegation();
    setupConnectionButtons();
}

// =========================================================
// PEOPLE DELEGATION (EVENT)
// =========================================================

function setupPeopleDelegation() {
    const container = document.getElementById("peopleContainer");
    if (!container || container.dataset.eventsAttached === "true") return;

    container.dataset.eventsAttached = "true";

    container.addEventListener("click", event => {
        if (event.target.closest(".connect-btn")) return;

        const card = event.target.closest(".database-person");
        if (!card) return;

        const userId = card.dataset.userId;
        if (userId) openPublicProfile(userId);
    });
}

// =========================================================
// OPEN PUBLIC PROFILE
// =========================================================

function openPublicProfile(profileUserId) {
    const id = Number(profileUserId);
    if (!Number.isInteger(id) || id <= 0) return;

    const currentId = getCurrentUserId();
    if (currentId && id === currentId) {
        window.location.href = "profile.html";
    } else {
        window.location.href = `profile.html?viewUserId=${encodeURIComponent(id)}`;
    }
}

// =========================================================
// LOAD COMPANIES
// =========================================================

async function loadCompanies() {
    try {
        const response = await fetch(`${API_BASE}/companies`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        const data = await readJsonResponse(response);
        if (!response.ok) throw new Error(data.error || "Companies load failed");

        companies = Array.isArray(data) ? data : 
                   Array.isArray(data.companies) ? data.companies : [];

        localStorage.setItem("companies", JSON.stringify(companies));
        batchDOMUpdate(() => renderCompanies(companies));
    } catch (error) {
        console.error("Companies load error:", error);
        loadCompanyBackup();
    }
}

// =========================================================
// RENDER COMPANIES (OPTIMIZED)
// =========================================================

function renderCompanies(companyData) {
    const container = document.getElementById("companyContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(companyData) || companyData.length === 0) {
        container.innerHTML = '<div class="loading-message">No companies available.</div>';
        return;
    }

    const fragment = document.createDocumentFragment();

    companyData.slice(0, 8).forEach(company => {
        const card = document.createElement("div");
        card.className = "company-item";
        card.dataset.companyId = company.id || "";

        card.innerHTML = `
            <img src="${escapeHTML(company.logo || 'https://via.placeholder.com/60?text=Logo')}" 
                 alt="${escapeHTML(company.company_name || 'Company')}" class="company-list-logo">
            <div>
                <h3>${escapeHTML(company.company_name || 'Company')}</h3>
                <p>${escapeHTML(company.industry || 'Industry not specified')}</p>
                ${company.location ? `<small>${escapeHTML(company.location)}</small>` : ''}
            </div>
        `;

        card.addEventListener("click", () => {
            if (company.id) {
                window.location.href = `CompanyProfile.html?id=${encodeURIComponent(company.id)}`;
            }
        });

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

// =========================================================
// LOAD COURSES
// =========================================================

async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE}/courses`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        const data = await readJsonResponse(response);
        if (!response.ok) throw new Error(data.error || "Courses load failed");

        courses = Array.isArray(data) ? data :
                 Array.isArray(data.courses) ? data.courses : [];

        localStorage.setItem("courses", JSON.stringify(courses));
        batchDOMUpdate(() => renderPortalCourses(courses));
    } catch (error) {
        console.error("Courses load error:", error);
        loadCourseBackup();
    }
}

// =========================================================
// RENDER COURSES (OPTIMIZED)
// =========================================================

function renderPortalCourses(courseData) {
    const container = document.getElementById("courseContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(courseData) || courseData.length === 0) {
        container.innerHTML = '<div class="loading-message">No courses available.</div>';
        return;
    }

    const fragment = document.createDocumentFragment();

    courseData.slice(0, 5).forEach(course => {
        const item = document.createElement("div");
        item.className = "course-item database-course-item";
        item.dataset.courseId = course.id || "";

        const courseURL = course.course_url || course.courseUrl || course.url || "";

        item.innerHTML = `
            <h3>${escapeHTML(course.course_name || course.name || 'Course')}</h3>
            <p>${escapeHTML(course.field || course.category || 'General')}</p>
            ${course.institution ? `<p>${escapeHTML(course.institution)}</p>` : ''}
            ${course.level ? `<p>Level: ${escapeHTML(course.level)}</p>` : ''}
            ${course.duration ? `<p>Duration: ${escapeHTML(course.duration)}</p>` : ''}
        `;

        item.addEventListener("click", () => {
            if (courseURL) {
                window.open(courseURL, "_blank", "noopener,noreferrer");
            } else if (course.id) {
                window.location.href = `courses.html?courseId=${encodeURIComponent(course.id)}`;
            }
        });

        fragment.appendChild(item);
    });

    container.appendChild(fragment);
}

// =========================================================
// LOAD POSTS
// =========================================================

async function loadPosts() {
    try {
        const response = await authenticatedFetch(`${API_BASE}/posts`, { method: "GET" });

        if (handleAuthError(response)) return;

        const data = await readJsonResponse(response);
        if (!response.ok) throw new Error(data.error || "Posts load failed");

        posts = Array.isArray(data) ? data :
               Array.isArray(data.posts) ? data.posts : [];

        batchDOMUpdate(() => renderDatabasePosts(posts));
    } catch (error) {
        console.error("Posts load error:", error);
    }
}

// =========================================================
// RENDER DATABASE POSTS (OPTIMIZED)
// =========================================================

function renderDatabasePosts(postData) {
    const feed = document.getElementById("postsScrollArea") || 
                 document.querySelector(".posts-scroll-area");
    if (!feed) return;

    const dbPosts = feed.querySelectorAll(".database-post");
    dbPosts.forEach(post => post.remove());

    if (!Array.isArray(postData)) return;

    const sortedPosts = [...postData].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    const fragment = document.createDocumentFragment();

    sortedPosts.forEach(postDataItem => {
        const post = createDatabasePostElement(postDataItem);
        fragment.appendChild(post);
        attachPostEvents(post);
    });

    feed.appendChild(fragment);
    updatePostCount();
    setupPostAuthorClicks();
}

// =========================================================
// CREATE DATABASE POST
// =========================================================

function createDatabasePostElement(postData) {
    const post = document.createElement("article");
    post.className = "post database-post";

    const postId = postData.id ?? postData.post_id;
    const authorUserId = postData.userId ?? postData.user_id ?? postData.authorId ?? null;
    const profilePic = postData.profilePic || postData.profile_pic || "https://via.placeholder.com/50";

    post.dataset.postId = postId ? String(postId) : "";
    post.dataset.authorId = authorUserId ? String(authorUserId) : "";

    let mediaHTML = "";
    if (postData.image_url || postData.imageUrl) {
        mediaHTML += `<img src="${escapeHTML(postData.image_url || postData.imageUrl)}" 
                           class="post-image" alt="Post Image" loading="lazy">`;
    }
    if (postData.video_url || postData.videoUrl) {
        mediaHTML += `<video controls class="post-video" preload="metadata">
                       <source src="${escapeHTML(postData.video_url || postData.videoUrl)}">
                      </video>`;
    }

    post.innerHTML = `
        <div class="post-header">
            <img src="${escapeHTML(profilePic)}" alt="${escapeHTML(postData.name || 'User')}" loading="lazy">
            <div class="post-author-clickable" data-user-id="${authorUserId || ''}" title="View profile">
                <h3>${escapeHTML(postData.name || 'User')}</h3>
                <p>${escapeHTML(formatDate(postData.created_at || postData.createdAt))}</p>
            </div>
        </div>
        ${postData.content ? `<p class="post-text">${escapeHTML(postData.content)}</p>` : ''}
        ${mediaHTML}
        <div class="post-stats">
            <span class="like-count">👍 ${postData.likes_count || 0}</span>
            <span class="comment-count">💬 ${postData.comments_count || 0}</span>
            <span class="share-count">🔄 ${postData.shares_count || 0}</span>
        </div>
        <div class="actions">
            <button type="button" class="like-btn">👍 Like</button>
            <button type="button" class="comment-btn">💬 Comment</button>
            <button type="button" class="share-btn">🔄 Share</button>
            <button type="button" class="delete-btn">🗑 Delete</button>
        </div>
        <div class="comments"></div>
    `;

    return post;
}

// =========================================================
// SEARCH (OPTIMIZED WITH DEBOUNCE)
// =========================================================

function setupSearch() {
    const searchInput = document.querySelector(".search-box input");
    if (!searchInput) return;

    createSearchResultsPanel(searchInput);

    const debouncedSearch = debounce((query) => {
        performGlobalSearch(query);
    }, 300);

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            hideSearchResults();
            document.querySelectorAll(".post").forEach(post => (post.style.display = ""));
            return;
        }

        debouncedSearch(query);
    });

    document.addEventListener("click", event => {
        const panel = document.getElementById("globalSearchResults");
        if (!panel) return;

        if (event.target.closest(".search-box") || event.target.closest("#globalSearchResults")) {
            return;
        }

        hideSearchResults();
    });
}

// =========================================================
// SEARCH PANEL
// =========================================================

function createSearchResultsPanel(input) {
    if (document.getElementById("globalSearchResults")) return;

    const box = input.closest(".search-box");
    if (!box) return;

    box.style.position = "relative";

    const panel = document.createElement("div");
    panel.id = "globalSearchResults";
    panel.style.cssText = `
        position: absolute; top: calc(100% + 8px); left: 0; right: 0;
        max-height: 420px; overflow-y: auto; background: var(--card, #fff);
        border: 1px solid #E5E7EB; border-radius: 12px;
        box-shadow: 0 15px 35px rgba(0,0,0,.16); z-index: 99999; display: none;
    `;

    box.appendChild(panel);
}

// =========================================================
// GLOBAL SEARCH (OPTIMIZED)
// =========================================================

function performGlobalSearch(query) {
    const results = [];

    // Search people
    people.forEach(person => {
        const value = `${person.name || ''} ${person.headline || ''} ${person.location || ''}`.toLowerCase();
        if (value.includes(query)) {
            results.push({
                type: "person",
                id: Number(person.userId ?? person.user_id ?? person.id),
                title: person.name || "User",
                subtitle: person.headline || "",
                meta: person.location || ""
            });
        }
    });

    // Search companies
    companies.forEach(company => {
        const value = `${company.company_name || ''} ${company.industry || ''} ${company.location || ''}`.toLowerCase();
        if (value.includes(query)) {
            results.push({
                type: "company",
                id: company.id,
                title: company.company_name || "Company",
                subtitle: company.industry || "",
                meta: company.location || ""
            });
        }
    });

    // Search courses
    courses.forEach(course => {
        const value = `${course.course_name || ''} ${course.field || ''} ${course.institution || ''}`.toLowerCase();
        if (value.includes(query)) {
            results.push({
                type: "course",
                id: course.id,
                title: course.course_name || "Course",
                subtitle: course.field || "",
                meta: course.institution || ""
            });
        }
    });

    renderSearchResults(results, query);
}

// =========================================================
// RENDER SEARCH RESULTS
// =========================================================

function renderSearchResults(results, query) {
    const panel = document.getElementById("globalSearchResults");
    if (!panel) return;

    panel.innerHTML = "";

    if (results.length === 0) {
        panel.innerHTML = '<div style="padding:16px; text-align:center; color:#6B7280;">No results found.</div>';
        panel.style.display = "block";
        return;
    }

    const fragment = document.createDocumentFragment();
    const groups = [
        { title: "👤 People", type: "person" },
        { title: "🏢 Companies", type: "company" },
        { title: "📚 Courses", type: "course" }
    ];

    groups.forEach(group => {
        const items = results.filter(r => r.type === group.type);
        if (items.length === 0) return;

        const heading = document.createElement("div");
        heading.textContent = group.title;
        heading.style.cssText = "padding:10px 14px 6px; color:#0A66C2; font-size:11px; font-weight:700;";
        fragment.appendChild(heading);

        items.slice(0, 6).forEach(result => {
            const row = document.createElement("div");
            row.style.cssText = "padding:10px 14px; cursor:pointer; border-top:1px solid #F1F5F9;";
            row.innerHTML = `
                <div style="font-size:13px; font-weight:600; color:#1F2937;">${escapeHTML(result.title)}</div>
                ${result.subtitle ? `<div style="margin-top:3px; font-size:10px; color:#6B7280;">${escapeHTML(result.subtitle)}</div>` : ''}
                ${result.meta ? `<div style="margin-top:2px; font-size:9px; color:#9CA3AF;">${escapeHTML(result.meta)}</div>` : ''}
            `;
            row.addEventListener("click", () => handleSearchResult(result));
            fragment.appendChild(row);
        });
    });

    panel.appendChild(fragment);
    panel.style.display = "block";
}

function handleSearchResult(item) {
    hideSearchResults();

    if (item.type === "person") openPublicProfile(item.id);
    else if (item.type === "company") window.location.href = `CompanyProfile.html?id=${item.id}`;
    else if (item.type === "course") window.location.href = `courses.html?courseId=${item.id}`;
}

function hideSearchResults() {
    const panel = document.getElementById("globalSearchResults");
    if (panel) panel.style.display = "none";
}

// =========================================================
// STUB FUNCTIONS (IMPLEMENT AS NEEDED)
// =========================================================

function setupPostFeatures() {
    console.log("Post features setup");
}

function setupDarkMode() {
    console.log("Dark mode setup");
}

function setupMobileMenu() {
    console.log("Mobile menu setup");
}

function setupEditProfile() {
    console.log("Edit profile setup");
}

function setupAIChatbot() {
    console.log("AI chatbot setup");
}

function initializeExistingPosts() {
    console.log("Posts initialized");
}

function updatePostCount() {
    console.log("Post count updated");
}

function setupPostAuthorClicks() {
    console.log("Post author clicks setup");
}

function attachPostEvents(post) {
    console.log("Post events attached");
}

function loadPeopleBackup() {
    console.log("People backup loaded");
}

function loadCompanyBackup() {
    console.log("Company backup loaded");
}

function loadCourseBackup() {
    console.log("Course backup loaded");
}

function setupConnectionButtons() {
    console.log("Connection buttons setup");
}

function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : 
           date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

console.log("Campus2Career optimized script loaded.");
