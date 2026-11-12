// ==========================================
// AMAN PORTFOLIO - DASHBOARD
// ==========================================

import { auth, db } from "./firebase.js";

import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ==========================================
// CLOUDINARY CONFIGURATION - AMAN
// ==========================================

const CLOUDINARY_CLOUD_NAME = "dfc2ygv3";
const CLOUDINARY_UPLOAD_PRESET = "aman_portfolio";


// ==========================================
// AUTHENTICATION CHECK
// ==========================================

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "admin.html";
    }
});


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "admin.html";
        } catch (error) {
            console.error("Logout error:", error);
            alert("Logout failed. Please try again.");
        }
    });
}


// ==========================================
// DASHBOARD NAVIGATION
// ==========================================

const menuIds = [
    "dashboardMenu",
    "resumeMenu",
    "certificateMenu",
    "projectMenu"
];

const sectionIds = [
    "dashboardSection",
    "resumeSection",
    "certificateSection",
    "projectSection"
];

function showSection(sectionId) {
    sectionIds.forEach((id) => {
        const section = document.getElementById(id);

        if (section) {
            section.style.display =
                id === sectionId ? "block" : "none";
        }
    });
}

const menuSectionMap = {
    dashboardMenu: "dashboardSection",
    resumeMenu: "resumeSection",
    certificateMenu: "certificateSection",
    projectMenu: "projectSection"
};

menuIds.forEach((menuId) => {
    const menu = document.getElementById(menuId);

    if (menu) {
        menu.addEventListener("click", () => {
            showSection(menuSectionMap[menuId]);
        });
    }
});


// ==========================================
// DASHBOARD CARD NAVIGATION
// ==========================================

const cardMenuMap = {
    resumeCard: "resumeMenu",
    certificateCard: "certificateMenu",
    projectCard: "projectMenu"
};

Object.entries(cardMenuMap).forEach(([cardId, menuId]) => {
    const card = document.getElementById(cardId);
    const menu = document.getElementById(menuId);

    if (card && menu) {
        card.addEventListener("click", () => {
            menu.click();
        });
    }
});


// ==========================================
// RESUME UPLOAD
// ==========================================

const resumeTitle = document.getElementById("resumeTitle");
const resumeFile = document.getElementById("resumeFile");
const uploadResumeBtn = document.getElementById("uploadResumeBtn");
const resumeList = document.getElementById("resumeList");


if (uploadResumeBtn) {
    uploadResumeBtn.addEventListener("click", uploadResume);
}


async function uploadResume() {
    const title = resumeTitle?.value.trim();
    const file = resumeFile?.files?.[0];

    if (!title || !file) {
        alert("Please enter the resume title and select a PDF.");
        return;
    }

    if (file.type !== "application/pdf") {
        alert("Please select a PDF file.");
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert("Resume must be smaller than 10 MB.");
        return;
    }

    uploadResumeBtn.disabled = true;
    uploadResumeBtn.textContent = "Uploading...";

    try {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "Cloudinary upload failed."
            );
        }

        await setDoc(doc(db, "resume", "current"), {
            title: title,
            pdfUrl: data.secure_url,
            publicId: data.public_id,
            uploadedAt: new Date().toISOString()
        });

        alert("Resume uploaded successfully!");

        resumeTitle.value = "";
        resumeFile.value = "";

        await loadResume();

    } catch (error) {
        console.error("Resume upload error:", error);
        alert("Resume upload failed: " + error.message);

    } finally {
        uploadResumeBtn.disabled = false;
        uploadResumeBtn.textContent = "Upload Resume";
    }
}


// ==========================================
// LOAD RESUME
// ==========================================

async function loadResume() {
    if (!resumeList) return;

    try {
        const resumeRef = doc(db, "resume", "current");
        const snapshot = await getDoc(resumeRef);

        if (!snapshot.exists()) {
            resumeList.textContent = "No resume uploaded yet.";
            return;
        }

        const data = snapshot.data();

        resumeList.replaceChildren();

        const titleElement = document.createElement("p");
        const strong = document.createElement("strong");

        strong.textContent = data.title || "Resume";
        titleElement.appendChild(strong);

        const viewLink = document.createElement("a");
        viewLink.href = data.pdfUrl;
        viewLink.target = "_blank";
        viewLink.rel = "noopener noreferrer";
        viewLink.className = "view-btn";
        viewLink.textContent = "View Resume";

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete Resume";

        deleteButton.addEventListener("click", deleteResume);

        resumeList.append(
            titleElement,
            viewLink,
            deleteButton
        );

    } catch (error) {
        console.error("Load resume error:", error);
        resumeList.textContent = "Unable to load resume.";
    }
}


// ==========================================
// DELETE RESUME RECORD
// ==========================================

async function deleteResume() {
    const confirmed = confirm(
        "Are you sure you want to delete the resume record?"
    );

    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, "resume", "current"));

        alert(
            "Resume record deleted. The Cloudinary file may still exist."
        );

        await loadResume();

    } catch (error) {
        console.error("Delete resume error:", error);
        alert("Unable to delete resume record.");
    }
}


// ==========================================
// INITIALIZE
// ==========================================

loadResume();