"use strict";

document.addEventListener("DOMContentLoaded", () => {

    console.log("=========================================");
    console.log("CO.js loaded successfully");
    console.log("=========================================");


    // =========================================
    // API CONFIGURATION
    // =========================================

    const API_BASE_URL =
        "https://campus2career-0pi8.onrender.com";

    const API_URL =
        `${API_BASE_URL}/api/companies`;

    const USER_PROFILE_API_URL =
        `${API_BASE_URL}/api/user-profile`;

    const APPLICATION_API_URL =
        `${API_BASE_URL}/api/applications`;


    // =========================================
    // HTML ELEMENTS
    // =========================================

    const companyContainer =
        document.getElementById(
            "companyContainer"
        );

    const companyName =
        document.getElementById(
            "companyName"
        );

    const companyIndustry =
        document.getElementById(
            "companyIndustry"
        );

    const companyAbout =
        document.getElementById(
            "companyAbout"
        );

    const industry =
        document.getElementById(
            "industry"
        );

    const location =
        document.getElementById(
            "location"
        );

    const companyLogo =
        document.getElementById(
            "companyLogo"
        );

    const websiteLink =
        document.getElementById(
            "websiteLink"
        );

    const searchCompany =
        document.getElementById(
            "searchCompany"
        );

    const followBtn =
        document.getElementById(
            "followBtn"
        );

    const applyBtn =
        document.getElementById(
            "applyBtn"
        );

    const applicationMessage =
        document.getElementById(
            "applicationMessage"
        );


    // =========================================
    // DATA STATE
    // =========================================

    let companies = [];

    let selectedCompany = null;


    // =========================================
    // AUTHENTICATION
    // =========================================

    function getAuthToken() {

        return (
            localStorage.getItem(
                "authToken"
            ) || ""
        ).trim();

    }


    function getLoggedInUserId() {

        const storedUserId =
            localStorage.getItem(
                "userId"
            );

        if (
            !storedUserId ||
            String(storedUserId).trim() === ""
        ) {

            return null;

        }


        const userId =
            Number(
                storedUserId
            );


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return null;

        }


        return userId;

    }


    // =========================================
    // CLEAR LOGIN DATA
    // =========================================

    function clearLoginData() {

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
    // GET COMPANY INITIAL
    // =========================================

    function getCompanyInitial(
        company
    ) {

        const name =
            company?.company_name ||
            company?.name ||
            "C";


        return String(
            name
        )
            .charAt(0)
            .toUpperCase();

    }


    // =========================================
    // ESCAPE HTML
    // =========================================

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // =========================================
    // CREATE LOGO FALLBACK
    // =========================================

    function createLogoFallback(
        company,
        className
    ) {

        const fallback =
            document.createElement(
                "div"
            );


        fallback.className =
            className;


        fallback.textContent =
            getCompanyInitial(
                company
            );


        fallback.setAttribute(
            "aria-label",
            `${company?.company_name || company?.name || "Company"} logo`
        );


        return fallback;

    }


    // =========================================
    // GET LOGO URL
    // =========================================

    function getLogo(
        company
    ) {

        if (
            company &&
            typeof company.logo ===
                "string" &&
            company.logo.trim() !== ""
        ) {

            return company.logo.trim();

        }


        return null;

    }


    // =========================================
    // GET API ERROR MESSAGE
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
    // READ RESPONSE SAFELY
    // =========================================

    async function readResponseData(
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
                "Failed to read response text:",
                error
            );

            return "";

        }

    }


    // =========================================
    // APPLICATION MESSAGE
    // =========================================

    function showApplicationMessage(
        message,
        success = true
    ) {

        if (!applicationMessage) {

            if (message) {

                console.log(
                    message
                );

            }

            return;

        }


        applicationMessage.textContent =
            message || "";


        applicationMessage.style.display =
            message
                ? "block"
                : "none";


        applicationMessage.style.marginTop =
            "15px";


        applicationMessage.style.padding =
            "12px 15px";


        applicationMessage.style.borderRadius =
            "10px";


        applicationMessage.style.fontSize =
            "14px";


        applicationMessage.style.lineHeight =
            "1.5";


        if (success) {

            applicationMessage.style.background =
                "#dcfce7";

            applicationMessage.style.color =
                "#166534";

            applicationMessage.style.border =
                "1px solid #86efac";

        } else {

            applicationMessage.style.background =
                "#fee2e2";

            applicationMessage.style.color =
                "#991b1b";

            applicationMessage.style.border =
                "1px solid #fca5a5";

        }

    }


    // =========================================
    // GET SELECTED JOB ID
    // =========================================

    /*
     * The company/job page can receive the job ID
     * through:
     *
     * 1. window.selectedJobId
     * 2. localStorage.selectedJobId
     * 3. URL ?jobId=123
     *
     * The backend requires a valid job ID for
     * POST /api/applications.
     */

    function getSelectedJobId() {

        // --------------------------------------
        // 1. window.selectedJobId
        // --------------------------------------

        const windowValue =
            window.selectedJobId;


        if (
            windowValue !== undefined &&
            windowValue !== null &&
            String(windowValue).trim() !== ""
        ) {

            const windowJobId =
                Number(
                    windowValue
                );


            if (
                Number.isInteger(
                    windowJobId
                ) &&
                windowJobId > 0
            ) {

                return windowJobId;

            }

        }


        // --------------------------------------
        // 2. localStorage
        // --------------------------------------

        const storedValue =
            localStorage.getItem(
                "selectedJobId"
            );


        if (
            storedValue &&
            storedValue.trim() !== ""
        ) {

            const storedJobId =
                Number(
                    storedValue
                );


            if (
                Number.isInteger(
                    storedJobId
                ) &&
                storedJobId > 0
            ) {

                return storedJobId;

            }

        }


        // --------------------------------------
        // 3. URL parameter
        // --------------------------------------

        const params =
            new URLSearchParams(
                window.location.search
            );


        const urlValue =
            params.get(
                "jobId"
            );


        if (
            urlValue &&
            urlValue.trim() !== ""
        ) {

            const urlJobId =
                Number(
                    urlValue
                );


            if (
                Number.isInteger(
                    urlJobId
                ) &&
                urlJobId > 0
            ) {

                return urlJobId;

            }

        }


        return null;

    }


    // =========================================
    // VERIFY CURRENT LOGIN
    // =========================================

    function isUserLoggedIn() {

        const token =
            getAuthToken();

        const userId =
            getLoggedInUserId();


        return Boolean(
            token &&
            userId
        );

    }


    // =========================================
    // FETCH CURRENT USER PROFILE
    // =========================================

    async function getCurrentUserProfile() {

        const token =
            getAuthToken();


        const userId =
            getLoggedInUserId();


        // --------------------------------------
        // Check authentication
        // --------------------------------------

        if (!token) {

            throw new Error(
                "Please login before applying."
            );

        }


        if (!userId) {

            throw new Error(
                "User ID not found. Please login again."
            );

        }


        console.log(
            "Fetching candidate profile for user:",
            userId
        );


        console.log(
            "Profile API:",
            `${USER_PROFILE_API_URL}/${userId}`
        );


        // --------------------------------------
        // Request profile
        // --------------------------------------

        let response;

        try {

            response =
                await fetch(
                    `${USER_PROFILE_API_URL}/${userId}`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Accept":
                                "application/json"
                        },

                        cache:
                            "no-store"
                    }
                );

        } catch (networkError) {

            console.error(
                "PROFILE NETWORK ERROR:",
                networkError
            );

            throw new Error(
                "Unable to connect to the backend while loading your profile."
            );

        }


        console.log(
            "Profile HTTP status:",
            response.status
        );


        // --------------------------------------
        // Unauthorized
        // --------------------------------------

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            clearLoginData();


            throw new Error(
                "Your login session has expired. Please login again."
            );

        }


        // --------------------------------------
        // Read data
        // --------------------------------------

        const data =
            await readResponseData(
                response
            );


        console.log(
            "Profile API response:",
            data
        );


        // --------------------------------------
        // API error
        // --------------------------------------

        if (!response.ok) {

            throw new Error(
                getErrorMessage(
                    data,
                    "Unable to load your profile."
                )
            );

        }


        // --------------------------------------
        // Support different response formats
        // --------------------------------------

        const profile =
            data?.profile ??
            data?.userProfile ??
            data?.user ??
            data;


        if (
            !profile ||
            typeof profile !== "object"
        ) {

            throw new Error(
                "Candidate profile was not found."
            );

        }


        return profile;

    }


    // =========================================
    // APPLY TO COMPANY
    // =========================================

    async function applyToCompany() {

        // --------------------------------------
        // Check company
        // --------------------------------------

        if (!selectedCompany) {

            showApplicationMessage(
                "Please select a company first.",
                false
            );

            return;

        }


        // --------------------------------------
        // Check company ID
        // --------------------------------------

        const companyId =
            Number(
                selectedCompany.id ??
                selectedCompany.company_id
            );


        if (
            !Number.isInteger(companyId) ||
            companyId <= 0
        ) {

            console.error(
                "Invalid company object:",
                selectedCompany
            );


            showApplicationMessage(
                "This company does not have a valid ID.",
                false
            );

            return;

        }


        // --------------------------------------
        // Check login
        // --------------------------------------

        const token =
            getAuthToken();


        if (!token) {

            showApplicationMessage(
                "Please login before applying.",
                false
            );


            setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                500
            );


            return;

        }


        // --------------------------------------
        // Check user ID
        // --------------------------------------

        const userId =
            getLoggedInUserId();


        if (!userId) {

            clearLoginData();


            showApplicationMessage(
                "Your login information is incomplete. Please login again.",
                false
            );


            setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                500
            );


            return;

        }


        // --------------------------------------
        // IMPORTANT:
        // Backend REQUIRES a valid job ID
        // --------------------------------------

        const jobId =
            getSelectedJobId();


        if (!jobId) {

            showApplicationMessage(
                "Please open a specific job before applying. A job ID is required.",
                false
            );


            console.warn(
                "Application blocked because no valid jobId was found."
            );


            return;

        }


        // --------------------------------------
        // Disable button
        // --------------------------------------

        if (applyBtn) {

            applyBtn.disabled =
                true;


            applyBtn.dataset.originalHTML =
                applyBtn.innerHTML;


            applyBtn.innerHTML =
                `
                <i class="fas fa-spinner fa-spin"></i>
                Sending Profile...
                `;

        }


        try {

            // =====================================
            // GET CURRENT USER PROFILE
            // =====================================

            const profile =
                await getCurrentUserProfile();


            console.log(
                "Candidate profile received:",
                profile
            );


            // =====================================
            // BUILD APPLICATION DATA
            // =====================================

            const profileData = {

                user_id:
                    profile.user_id ??
                    profile.userId ??
                    profile.id ??
                    userId,


                name:
                    profile.name ??
                    profile.full_name ??
                    profile.username ??
                    "",


                headline:
                    profile.headline ??
                    "",


                tagline:
                    profile.tagline ??
                    "",


                location:
                    profile.location ??
                    "",


                connections:
                    profile.connections ??
                    0,


                followers:
                    profile.followers ??
                    0,


                about:
                    profile.about ??
                    "",


                email:
                    profile.email ??
                    localStorage.getItem(
                        "loginEmail"
                    ) ??
                    "",


                phone:
                    profile.phone ??
                    "",


                github:
                    profile.github ??
                    "",


                linkedin:
                    profile.linkedin ??
                    "",


                education:
                    profile.education ??
                    "",


                experience:
                    profile.experience ??
                    "",


                projects:
                    profile.projects ??
                    "",


                skills:
                    profile.skills ??
                    "",


                certifications:
                    profile.certifications ??
                    "",


                achievements:
                    profile.achievements ??
                    "",


                achievement_1:
                    profile.achievement_1 ??
                    "",


                achievement_2:
                    profile.achievement_2 ??
                    "",


                achievement_3:
                    profile.achievement_3 ??
                    "",


                achievement_4:
                    profile.achievement_4 ??
                    "",


                achievement_5:
                    profile.achievement_5 ??
                    "",


                achievement_6:
                    profile.achievement_6 ??
                    "",


                profile_pic:
                    profile.profile_pic ??
                    profile.profilePic ??
                    "",


                banner_image:
                    profile.banner_image ??
                    profile.bannerImage ??
                    "",


                resume_url:
                    profile.resume_url ??
                    profile.resumeUrl ??
                    "",


                cover_letter:
                    profile.cover_letter ??
                    profile.coverLetter ??
                    ""

            };


            // =====================================
            // APPLICATION PAYLOAD
            // =====================================

            const applicationData = {

                company_id:
                    companyId,


                job_id:
                    jobId,


                profile:
                    profileData

            };


            console.log(
                "========================================="
            );

            console.log(
                "Sending application..."
            );

            console.log(
                "Company ID:",
                companyId
            );

            console.log(
                "Job ID:",
                jobId
            );

            console.log(
                "User ID:",
                userId
            );

            console.log(
                "Application payload:",
                applicationData
            );

            console.log(
                "========================================="
            );


            // =====================================
            // SEND APPLICATION
            // =====================================

            let response;

            try {

                response =
                    await fetch(
                        APPLICATION_API_URL,
                        {
                            method: "POST",

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
                                    applicationData
                                )
                        }
                    );

            } catch (networkError) {

                console.error(
                    "APPLICATION NETWORK ERROR:",
                    networkError
                );

                throw new Error(
                    "Unable to connect to the backend while submitting your application."
                );

            }


            console.log(
                "Application HTTP status:",
                response.status
            );


            // =====================================
            // READ RESPONSE
            // =====================================

            const data =
                await readResponseData(
                    response
                );


            console.log(
                "Application API response:",
                data
            );


            // =====================================
            // AUTHORIZATION ERROR
            // =====================================

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                clearLoginData();


                throw new Error(
                    "Your login session has expired. Please login again."
                );

            }


            // =====================================
            // SERVER ERROR
            // =====================================

            if (!response.ok) {

                throw new Error(
                    getErrorMessage(
                        data,
                        "Application submission failed."
                    )
                );

            }


            // =====================================
            // SUCCESS
            // =====================================

            console.log(
                "Application submitted successfully."
            );


            const successMessage =
                data?.message ||
                data?.successMessage ||
                `Your profile has been sent to ${selectedCompany.company_name || "the company"}.`;


            showApplicationMessage(
                successMessage,
                true
            );


            // =====================================
            // UPDATE APPLY BUTTON
            // =====================================

            if (applyBtn) {

                applyBtn.disabled =
                    true;


                applyBtn.classList.add(
                    "applied"
                );


                applyBtn.innerHTML =
                    `
                    <i class="fas fa-check"></i>
                    Applied
                    `;

            }


            // =====================================
            // SAVE UI STATE
            // =====================================

            sessionStorage.setItem(
                "lastApplication",
                JSON.stringify({

                    companyId:
                        companyId,

                    companyName:
                        selectedCompany.company_name ||
                        "",

                    jobId:
                        jobId,

                    userId:
                        userId,

                    appliedAt:
                        new Date().toISOString()

                })
            );


        } catch (error) {

            console.error(
                "========================================="
            );

            console.error(
                "APPLICATION ERROR:",
                error
            );

            console.error(
                "========================================="
            );


            showApplicationMessage(
                error.message ||
                "Unable to submit application.",
                false
            );


            // --------------------------------------
            // Restore button
            // --------------------------------------

            if (applyBtn) {

                applyBtn.disabled =
                    false;


                applyBtn.classList.remove(
                    "applied"
                );


                applyBtn.innerHTML =
                    applyBtn.dataset.originalHTML ||
                    `
                    <i class="fas fa-paper-plane"></i>
                    Apply Now
                    `;

            }

        }

    }


    // =========================================
    // SHOW COMPANY DETAILS
    // =========================================

    function showCompany(
        company
    ) {

        if (!company) {

            return;

        }


        // --------------------------------------
        // Store selected company
        // --------------------------------------

        selectedCompany =
            company;


        window.selectedCompany =
            company;


        window.selectedCompanyId =
            Number(
                company.id ??
                company.company_id
            );


        console.log(
            "Selected company:",
            company
        );


        // =====================================
        // COMPANY NAME
        // =====================================

        if (companyName) {

            companyName.textContent =
                company.company_name ||
                company.name ||
                "Company";

        }


        // =====================================
        // COMPANY INDUSTRY
        // =====================================

        if (companyIndustry) {

            companyIndustry.textContent =
                company.industry ||
                "Industry not available";

        }


        // =====================================
        // COMPANY ABOUT
        // =====================================

        if (companyAbout) {

            companyAbout.textContent =
                company.about ||
                company.description ||
                "No company information available.";

        }


        // =====================================
        // INDUSTRY DETAIL
        // =====================================

        if (industry) {

            industry.textContent =
                company.industry ||
                "Not available";

        }


        // =====================================
        // LOCATION
        // =====================================

        if (location) {

            location.textContent =
                company.location ||
                "Not available";

        }


        // =====================================
        // COMPANY LOGO
        // =====================================

        const logoUrl =
            getLogo(
                company
            );


        const oldFallback =
            document.getElementById(
                "mainLogoFallback"
            );


        if (oldFallback) {

            oldFallback.remove();

        }


        if (
            logoUrl &&
            companyLogo
        ) {

            companyLogo.src =
                logoUrl;


            companyLogo.alt =
                `${company.company_name || "Company"} Logo`;


            companyLogo.style.display =
                "block";


            companyLogo.onload =
                () => {

                    companyLogo.style.display =
                        "block";

                };


            companyLogo.onerror =
                () => {

                    companyLogo.style.display =
                        "none";


                    const fallback =
                        createLogoFallback(
                            company,
                            "company-text-logo main-logo-fallback"
                        );


                    fallback.id =
                        "mainLogoFallback";


                    if (
                        companyLogo.parentNode
                    ) {

                        companyLogo.parentNode.insertBefore(
                            fallback,
                            companyLogo
                        );

                    }

                };

        }

        else if (companyLogo) {

            companyLogo.style.display =
                "none";


            const fallback =
                createLogoFallback(
                    company,
                    "company-text-logo main-logo-fallback"
                );


            fallback.id =
                "mainLogoFallback";


            if (
                companyLogo.parentNode
            ) {

                companyLogo.parentNode.insertBefore(
                    fallback,
                    companyLogo
                );

            }

        }


        // =====================================
        // WEBSITE
        // =====================================

        if (
            company.website &&
            String(
                company.website
            ).trim() !== ""
        ) {

            let companyWebsite =
                String(
                    company.website
                ).trim();


            // ---------------------------------
            // Add protocol if missing
            // ---------------------------------

            if (
                !/^https?:\/\//i.test(
                    companyWebsite
                )
            ) {

                companyWebsite =
                    `https://${companyWebsite}`;

            }


            if (websiteLink) {

                websiteLink.href =
                    companyWebsite;


                websiteLink.textContent =
                    "Visit Website";


                websiteLink.target =
                    "_blank";


                websiteLink.rel =
                    "noopener noreferrer";


                websiteLink.style.pointerEvents =
                    "auto";


                websiteLink.style.opacity =
                    "1";

            }

        }

        else {

            if (websiteLink) {

                websiteLink.removeAttribute(
                    "href"
                );


                websiteLink.textContent =
                    "Website not available";


                websiteLink.style.pointerEvents =
                    "none";


                websiteLink.style.opacity =
                    "0.6";

            }

        }


        // =====================================
        // APPLY BUTTON STATE
        // =====================================

        updateApplyButtonState();

    }


    // =========================================
    // UPDATE APPLY BUTTON
    // =========================================

    function updateApplyButtonState() {

        if (!applyBtn) {

            return;

        }


        // --------------------------------------
        // Default state
        // --------------------------------------

        applyBtn.disabled =
            false;


        applyBtn.classList.remove(
            "applied"
        );


        applyBtn.innerHTML =
            `
            <i class="fas fa-paper-plane"></i>
            Apply Now
            `;


        // --------------------------------------
        // No company
        // --------------------------------------

        if (!selectedCompany) {

            applyBtn.disabled =
                true;

            return;

        }


        // --------------------------------------
        // Check previous application
        // --------------------------------------

        const lastApplication =
            sessionStorage.getItem(
                "lastApplication"
            );


        if (!lastApplication) {

            return;

        }


        try {

            const saved =
                JSON.parse(
                    lastApplication
                );


            const selectedCompanyId =
                Number(
                    selectedCompany.id ??
                    selectedCompany.company_id
                );


            const savedCompanyId =
                Number(
                    saved.companyId
                );


            const currentJobId =
                getSelectedJobId();


            const savedJobId =
                saved.jobId
                    ? Number(saved.jobId)
                    : null;


            const sameCompany =
                selectedCompanyId ===
                savedCompanyId;


            const sameJob =
                currentJobId &&
                savedJobId &&
                currentJobId ===
                savedJobId;


            if (
                sameCompany &&
                sameJob
            ) {

                applyBtn.disabled =
                    true;


                applyBtn.classList.add(
                    "applied"
                );


                applyBtn.innerHTML =
                    `
                    <i class="fas fa-check"></i>
                    Applied
                    `;

            }

        } catch (error) {

            console.warn(
                "Could not read application state:",
                error
            );

        }

    }


    // =========================================
    // RENDER COMPANY LIST
    // =========================================

    function renderCompanies(
        companyData
    ) {

        if (!companyContainer) {

            console.warn(
                "companyContainer not found."
            );

            return;

        }


        companyContainer.innerHTML =
            "";


        // =====================================
        // NO COMPANIES
        // =====================================

        if (
            !Array.isArray(companyData) ||
            companyData.length === 0
        ) {

            companyContainer.innerHTML =
                `
                <div class="loading-message">
                    No companies found.
                </div>
                `;

            return;

        }


        // =====================================
        // CREATE COMPANY CARDS
        // =====================================

        companyData.forEach(
            company => {

                if (!company) {

                    return;

                }


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "company-item";


                card.dataset.companyId =
                    company.id ??
                    company.company_id ??
                    "";


                // =================================
                // LOGO
                // =================================

                const logoUrl =
                    getLogo(
                        company
                    );


                // =================================
                // CARD HTML
                // =================================

                card.innerHTML =
                    `
                    <div class="company-logo-container">

                        ${
                            logoUrl
                                ? `
                                <img
                                    src="${escapeHTML(logoUrl)}"
                                    alt="${escapeHTML(
                                        company.company_name ||
                                        company.name ||
                                        "Company"
                                    )} Logo"
                                    class="company-list-logo"
                                >
                                `
                                : ""
                        }

                    </div>

                    <div class="company-info">

                        <h3>
                            ${escapeHTML(
                                company.company_name ||
                                company.name ||
                                "Company"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                company.industry ||
                                "Industry not available"
                            )}
                        </p>

                    </div>
                    `;


                // =================================
                // LOGO HANDLING
                // =================================

                const logoContainer =
                    card.querySelector(
                        ".company-logo-container"
                    );


                const image =
                    card.querySelector(
                        ".company-list-logo"
                    );


                if (image) {

                    image.onload =
                        () => {

                            image.style.display =
                                "block";

                        };


                    image.onerror =
                        () => {

                            image.remove();


                            const fallback =
                                createLogoFallback(
                                    company,
                                    "company-text-logo company-list-fallback"
                                );


                            if (logoContainer) {

                                logoContainer.appendChild(
                                    fallback
                                );

                            }

                        };

                }

                else {

                    const fallback =
                        createLogoFallback(
                            company,
                            "company-text-logo company-list-fallback"
                        );


                    if (logoContainer) {

                        logoContainer.appendChild(
                            fallback
                        );

                    }

                }


                // =================================
                // CARD CLICK
                // =================================

                card.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".company-item"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        card.classList.add(
                            "active"
                        );


                        showCompany(
                            company
                        );

                    }
                );


                // =================================
                // ADD CARD
                // =================================

                companyContainer.appendChild(
                    card
                );

            }
        );

    }


    // =========================================
    // LOAD COMPANIES FROM BACKEND
    // =========================================

    async function loadCompanies() {

        console.log(
            "========================================="
        );

        console.log(
            "Loading companies from:"
        );

        console.log(
            API_URL
        );

        console.log(
            "========================================="
        );


        if (companyContainer) {

            companyContainer.innerHTML =
                `
                <div class="loading-message">
                    Loading companies...
                </div>
                `;

        }


        try {

            let response;

            try {

                response =
                    await fetch(
                        API_URL,
                        {
                            method: "GET",

                            headers: {
                                "Accept":
                                    "application/json"
                            },

                            cache:
                                "no-store"
                        }
                    );

            } catch (networkError) {

                console.error(
                    "COMPANY API NETWORK ERROR:",
                    networkError
                );

                throw new Error(
                    "Unable to connect to the Campus2Career backend."
                );

            }


            console.log(
                "Companies HTTP status:",
                response.status
            );


            // =====================================
            // READ API RESPONSE
            // =====================================

            const data =
                await readResponseData(
                    response
                );


            console.log(
                "Companies API response:",
                data
            );


            // =====================================
            // HANDLE SERVER ERROR
            // =====================================

            if (!response.ok) {

                throw new Error(
                    getErrorMessage(
                        data,
                        `Company API returned status ${response.status}.`
                    )
                );

            }


            // =====================================
            // SUPPORT POSSIBLE API RESPONSE SHAPES
            // =====================================

            let companyData;


            if (Array.isArray(data)) {

                companyData =
                    data;

            }

            else if (
                data &&
                Array.isArray(
                    data.companies
                )
            ) {

                companyData =
                    data.companies;

            }

            else if (
                data &&
                Array.isArray(
                    data.data
                )
            ) {

                companyData =
                    data.data;

            }

            else {

                throw new Error(
                    "The companies API did not return a valid company list."
                );

            }


            // =====================================
            // SAVE COMPANY DATA
            // =====================================

            companies =
                companyData;


            console.log(
                `Loaded ${companies.length} companies.`
            );


            // =====================================
            // RENDER COMPANY LIST
            // =====================================

            renderCompanies(
                companies
            );


            // =====================================
            // SELECT FIRST COMPANY
            // =====================================

            if (
                companies.length > 0
            ) {

                showCompany(
                    companies[0]
                );


                const firstCard =
                    companyContainer?.querySelector(
                        ".company-item"
                    );


                if (firstCard) {

                    firstCard.classList.add(
                        "active"
                    );

                }

            }


            else {

                selectedCompany =
                    null;


                if (companyName) {

                    companyName.textContent =
                        "No company available";

                }


                if (companyIndustry) {

                    companyIndustry.textContent =
                        "";

                }


                if (companyAbout) {

                    companyAbout.textContent =
                        "";

                }


                if (industry) {

                    industry.textContent =
                        "";

                }


                if (location) {

                    location.textContent =
                        "";

                }


                if (applyBtn) {

                    applyBtn.disabled =
                        true;

                }

            }

        } catch (error) {

            console.error(
                "========================================="
            );

            console.error(
                "COMPANY FETCH ERROR:",
                error
            );

            console.error(
                "========================================="
            );


            if (companyContainer) {

                companyContainer.innerHTML =
                    `
                    <div class="loading-message">

                        Error loading companies.

                        <br>
                        <br>

                        ${escapeHTML(
                            error.message ||
                            "Unable to load companies."
                        )}

                    </div>
                    `;

            }

        }

    }


    // =========================================
    // COMPANY SEARCH
    // =========================================

    if (searchCompany) {

        searchCompany.addEventListener(
            "input",
            function () {

                const searchText =
                    this.value
                        .trim()
                        .toLowerCase();


                // =================================
                // FILTER COMPANIES
                // =================================

                const filtered =
                    companies.filter(
                        company => {

                            const name =
                                String(
                                    company.company_name ||
                                    company.name ||
                                    ""
                                )
                                    .toLowerCase();


                            const companyIndustry =
                                String(
                                    company.industry ||
                                    ""
                                )
                                    .toLowerCase();


                            const companyLocation =
                                String(
                                    company.location ||
                                    ""
                                )
                                    .toLowerCase();


                            const companyAboutText =
                                String(
                                    company.about ||
                                    company.description ||
                                    ""
                                )
                                    .toLowerCase();


                            return (

                                name.includes(
                                    searchText
                                )

                                ||

                                companyIndustry.includes(
                                    searchText
                                )

                                ||

                                companyLocation.includes(
                                    searchText
                                )

                                ||

                                companyAboutText.includes(
                                    searchText
                                )

                            );

                        }
                    );


                // =================================
                // RENDER RESULTS
                // =================================

                renderCompanies(
                    filtered
                );


                // =================================
                // SHOW FIRST RESULT
                // =================================

                if (
                    filtered.length > 0
                ) {

                    showCompany(
                        filtered[0]
                    );


                    const firstCard =
                        companyContainer?.querySelector(
                            ".company-item"
                        );


                    if (firstCard) {

                        firstCard.classList.add(
                            "active"
                        );

                    }

                }

                else {

                    selectedCompany =
                        null;


                    if (companyName) {

                        companyName.textContent =
                            "No company found";

                    }


                    if (companyIndustry) {

                        companyIndustry.textContent =
                            "";

                    }


                    if (companyAbout) {

                        companyAbout.textContent =
                            "";

                    }


                    if (applyBtn) {

                        applyBtn.disabled =
                            true;


                        applyBtn.innerHTML =
                            `
                            <i class="fas fa-paper-plane"></i>
                            Apply Now
                            `;

                    }

                }

            }
        );

    }


    // =========================================
    // APPLY BUTTON EVENT
    // =========================================

    if (applyBtn) {

        applyBtn.addEventListener(
            "click",
            async event => {

                event.preventDefault();

                event.stopPropagation();


                await applyToCompany();

            }
        );

    }


    // =========================================
    // FOLLOW BUTTON
    // =========================================

    /*
     * No follow API endpoint was present in the
     * supplied CO.js flow, so this remains a local
     * UI state only. It does NOT pretend that the
     * database has been updated.
     */

    if (followBtn) {

        followBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                if (!selectedCompany) {

                    showApplicationMessage(
                        "Please select a company first.",
                        false
                    );

                    return;

                }


                const following =
                    followBtn.dataset.following ===
                    "true";


                if (!following) {

                    followBtn.dataset.following =
                        "true";


                    followBtn.textContent =
                        "Following";


                    followBtn.classList.add(
                        "following"
                    );

                }

                else {

                    followBtn.dataset.following =
                        "false";


                    followBtn.textContent =
                        "Follow Company";


                    followBtn.classList.remove(
                        "following"
                    );

                }

            }
        );

    }


    // =========================================
    // CHECK PAGE AUTH STATE
    // =========================================

    console.log(
        "Authentication state:",
        isUserLoggedIn()
            ? "Logged in"
            : "Not logged in"
    );


    // =========================================
    // START
    // =========================================

    loadCompanies();

});
