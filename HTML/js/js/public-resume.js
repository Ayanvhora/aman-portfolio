import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const resumeMessage = document.getElementById("publicResumeMessage");
const resumeButtons = document.getElementById("publicResumeButtons");
const certificatesContainer = document.getElementById("publicCertificates");

// Load public resume
async function loadPublicResume() {
    try {
        const resumeRef = doc(db, "resume", "current");
        const resumeSnap = await getDoc(resumeRef);

        if (!resumeSnap.exists()) {
            resumeMessage.textContent = "Resume is not available yet.";
            return;
        }

        const data = resumeSnap.data();

        resumeMessage.textContent = data.title || "My Resume";

        if (data.pdfUrl) {
            const viewButton = document.createElement("a");

            viewButton.className = "btn";
            viewButton.href = data.pdfUrl;
            viewButton.target = "_blank";
            viewButton.rel = "noopener noreferrer";
            viewButton.textContent = "View Resume";

            const downloadButton = document.createElement("a");

            downloadButton.className = "btn btn2";
            downloadButton.classList.add("btn");
            const downloadUrl = data.pdfUrl.replace(
                "/raw/upload/",
                "/raw/upload/fl_attachment/"
            );

            downloadButton.href = downloadUrl;
            downloadButton.textContent = "Download Resume";

            resumeButtons.replaceChildren(
                viewButton,
                downloadButton
            );
        }

    } catch (error) {
        console.error("Public resume load error:", error);

        resumeMessage.textContent =
            "Unable to load resume.";
    }
}


// Load public certificates
async function loadPublicCertificates() {
    try {
        const certificatesRef = collection(db, "certificates");

        let snapshot;

        try {
            snapshot = await getDocs(
                query(certificatesRef, orderBy("order", "asc"))
            );
        } catch (error) {
            snapshot = await getDocs(certificatesRef);
        }

        certificatesContainer.replaceChildren();

        if (snapshot.empty) {
            certificatesContainer.textContent =
                "No certificates available yet.";

            return;
        }

        snapshot.forEach((certificateDoc) => {
            const certificate = certificateDoc.data();

            if (!certificate.fileUrl) {
                return;
            }

            const card = document.createElement("div");
            card.className = "timeline-card";

            const title = document.createElement("h2");

            title.textContent =
                "🏆 " + (certificate.title || "Certificate");

            const viewButton = document.createElement("a");

            viewButton.className = "btn";
            viewButton.href = certificate.fileUrl;
            viewButton.target = "_blank";
            viewButton.rel = "noopener noreferrer";
            viewButton.textContent = "View Certificate";

            
            const downloadButton = document.createElement("a");

            downloadButton.className = "btn btn2";

            const certificateDownloadUrl = certificate.fileUrl.replace(
                "/raw/upload/",
                "/raw/upload/fl_attachment/"
            );

            downloadButton.href = certificateDownloadUrl;
            downloadButton.textContent = "Download Certificate";




            card.append(
                title,
                viewButton,
                downloadButton
            );

            certificatesContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Public certificates load error:", error);

        certificatesContainer.textContent =
            "Unable to load certificates.";
    }
}

loadPublicResume();
loadPublicCertificates();