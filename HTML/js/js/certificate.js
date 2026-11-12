
// ==========================================
// AMAN PORTFOLIO - CERTIFICATE MANAGEMENT
// ==========================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ==========================================
// CLOUDINARY CONFIGURATION - AMAN
// ==========================================

const CLOUDINARY_CLOUD_NAME = "dfc2ygv3";
const CLOUDINARY_UPLOAD_PRESET = "aman_portfolio";

// ==========================================
// AUTHENTICATION
// ==========================================

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (!user) {
        window.location.href = "admin.html";
        return;
    }

    loadCertificates();
});

// ==========================================
// HTML ELEMENTS
// ==========================================

const certificateTitle = document.getElementById("certificateTitle");
const certificateFile = document.getElementById("certificateFile");
const uploadCertificateBtn = document.getElementById("uploadCertificateBtn");
const certificateList = document.getElementById("certificateList");

// ==========================================
// UPLOAD CERTIFICATE
// ==========================================

if (uploadCertificateBtn) {
    uploadCertificateBtn.addEventListener("click", uploadCertificate);
}

async function uploadCertificate() {
    if (!currentUser) {
        alert("Please log in first.");
        return;
    }

    const title = certificateTitle?.value.trim();
    const file = certificateFile?.files?.[0];

    if (!title || !file) {
        alert("Please enter a certificate name and select a file.");
        return;
    }

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        alert("Please select a PDF, JPG, PNG, or WEBP file.");
        return;
    }

    // Maximum file size: 10 MB
    if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10 MB.");
        return;
    }

    const originalText = uploadCertificateBtn.textContent;

    uploadCertificateBtn.disabled = true;
    uploadCertificateBtn.textContent = "Uploading...";

    try {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const resourceType = file.type === "application/pdf"
            ? "raw"
            : "image";

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error?.message || "Cloudinary upload failed."
            );
        }

        // Save certificate details in Aman Firestore
        await addDoc(collection(db, "certificates"), {
            title: title,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            resourceType: resourceType,
            fileName: file.name,
            uploadedAt: serverTimestamp(),
            order: Date.now(),
            ownerUid: currentUser.uid
        });

        alert("Certificate uploaded successfully!");

        certificateTitle.value = "";
        certificateFile.value = "";

        await loadCertificates();

    } catch (error) {
        console.error("Certificate upload error:", error);
        alert("Certificate upload failed: " + error.message);

    } finally {
        uploadCertificateBtn.disabled = false;
        uploadCertificateBtn.textContent = originalText;
    }
}

// ==========================================
// LOAD CERTIFICATES
// ==========================================

async function loadCertificates() {
    if (!certificateList || !currentUser) {
        return;
    }

    certificateList.textContent = "Loading certificates...";

    try {
        const certificatesQuery = query(
            collection(db, "certificates"),
            orderBy("order", "asc")
        );

        const snapshot = await getDocs(certificatesQuery);

        certificateList.replaceChildren();

        if (snapshot.empty) {
            certificateList.textContent = "No certificates uploaded yet.";
            return;
        }

        snapshot.forEach((certificateDoc) => {
            const data = certificateDoc.data();

            // Only show records belonging to the logged-in user.
            // Firestore Security Rules must enforce access as well.
            if (data.ownerUid !== currentUser.uid) {
                return;
            }

            const card = document.createElement("div");
            card.className = "certificate-card";

            const title = document.createElement("h3");
            title.textContent = data.title || "Certificate";

            const viewLink = document.createElement("a");
            viewLink.href = data.fileUrl;
            viewLink.target = "_blank";
            viewLink.rel = "noopener noreferrer";
            viewLink.className = "view-btn";
            viewLink.textContent = "View Certificate";
            const upButton = document.createElement("button");
            upButton.className = "up-btn";
            upButton.textContent = "⬆ Up";
            upButton.type = "button";

            const downButton = document.createElement("button");
            downButton.className = "down-btn";
            downButton.textContent = "⬇ Down";
            downButton.type = "button";

            upButton.addEventListener("click", () => {
                moveCertificate(certificateDoc.id, "up");
            });

            downButton.addEventListener("click", () => {
                moveCertificate(certificateDoc.id, "down");
            });
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", async () => {
                const confirmed = confirm(
                    `Delete certificate "${data.title}" from your portfolio?`
                );

                if (!confirmed) {
                    return;
                }

                try {
                    await deleteDoc(
                        doc(db, "certificates", certificateDoc.id)
                    );

                    alert(
                        "Certificate record deleted. The uploaded Cloudinary file may still exist."
                    );

                    await loadCertificates();

                } catch (error) {
                    console.error("Delete certificate error:", error);
                    alert("Could not delete the certificate record.");
                }
            });

            card.append(
                title,
                upButton,
                downButton,
                viewLink,
                deleteButton
            );
                        certificateList.appendChild(card);
        });

        if (!certificateList.hasChildNodes()) {
            certificateList.textContent = "No certificates uploaded yet.";
        }

    } catch (error) {
        console.error("Load certificates error:", error);
        certificateList.textContent =
            "Unable to load certificates. Check Firestore settings and permissions.";
    }
}
// ==========================================
// MOVE CERTIFICATE UP / DOWN
// ==========================================

async function moveCertificate(id, direction) {
    if (!currentUser) {
        alert("Please log in first.");
        return;
    }

    try {
        const certificatesQuery = query(
            collection(db, "certificates"),
            orderBy("order", "asc")
        );

        const snapshot = await getDocs(certificatesQuery);

        const certificates = [];

        snapshot.forEach((certificateDoc) => {
            const data = certificateDoc.data();

            if (data.ownerUid === currentUser.uid) {
                certificates.push({
                    id: certificateDoc.id,
                    ...data
                });
            }
        });

        certificates.sort(
            (a, b) => Number(a.order) - Number(b.order)
        );

        const currentIndex = certificates.findIndex(
            (certificate) => certificate.id === id
        );

        if (currentIndex === -1) {
            alert("Certificate not found.");
            return;
        }

        const newIndex =
            direction === "up"
                ? currentIndex - 1
                : currentIndex + 1;

        if (
            newIndex < 0 ||
            newIndex >= certificates.length
        ) {
            return;
        }

        // Swap the two certificates
        [
            certificates[currentIndex],
            certificates[newIndex]
        ] = [
            certificates[newIndex],
            certificates[currentIndex]
        ];

        // Save the new order in Firestore
        for (let i = 0; i < certificates.length; i++) {
            await updateDoc(
                doc(db, "certificates", certificates[i].id),
                {
                    order: i + 1
                }
            );
        }

        // Refresh the dashboard
        await loadCertificates();

    } catch (error) {
        console.error("Move certificate error:", error);
        alert("Could not reorder certificates. Check the browser console.");
    }
}
