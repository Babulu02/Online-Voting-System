/**
 * Face Recognition Module
 * Handles biometric face verification for voting authentication
 * Manages camera access and face verification processes
 */

let videoStream = null;

document.addEventListener('DOMContentLoaded', function() {
    // =========================================================================
    // Event Listeners Setup
    // =========================================================================
    
    // Initialize face verification when voting modal opens
    document.getElementById('votingModal').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-primary') && e.target.id !== 'verifyFace') {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user) {
                // In real implementation, you would verify face here
                // For demo, we'll show the verification modal
                openFaceVerificationModal();
                e.preventDefault();
            }
        }
    });
    
    // Face verification button handler
    document.getElementById('verifyFace').addEventListener('click', verifyFaceForVoting);
});

/**
 * Opens the face verification modal and starts camera
 */
function openFaceVerificationModal() {
    document.getElementById('faceVerificationModal').style.display = 'block';
    startFaceVerification();
}

/**
 * Starts camera for face verification
 * Requests camera access and initializes video stream
 */
function startFaceVerification() {
    const video = document.getElementById('verificationVideo');
    
    // Check if browser supports camera access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                videoStream = stream;
                video.srcObject = stream;
            })
            .catch(function(error) {
                console.error("Camera error: ", error);
                document.getElementById('verificationStatus').textContent = 
                    "Camera access denied. Please allow camera access to verify your identity.";
                document.getElementById('verificationStatus').className = "status-message error";
            });
    }
}

/**
 * Performs face verification process
 * Compares current face with registered face data
 */
function verifyFaceForVoting() {
    const verificationStatus = document.getElementById('verificationStatus');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    // Check if user is logged in
    if (!user) {
        verificationStatus.textContent = "Please log in first.";
        verificationStatus.className = "status-message error";
        return;
    }
    
    // Update status to show verification in progress
    verificationStatus.textContent = "Verifying your identity...";
    verificationStatus.className = "status-message info";
    
    // In a real implementation, this would:
    // 1. Capture image from video stream
    // 2. Send to face recognition API
    // 3. Compare with registered face data
    // 4. Return verification result
    
    // For demo purposes, simulate face verification process
    setTimeout(() => {
        const storedFaceData = localStorage.getItem(`faceData_${user.id}`);
        
        if (storedFaceData) {
            // Simulate verification with 90% success rate for demo
            const isVerified = Math.random() > 0.1;
            
            if (isVerified) {
                verificationStatus.textContent = "Identity verified successfully!";
                verificationStatus.className = "status-message success";
                
                // Close verification modal and proceed with voting
                setTimeout(() => {
                    document.getElementById('faceVerificationModal').style.display = 'none';
                    stopFaceVerification();
                    
                    // In real implementation, proceed with actual voting
                    alert("Face verification successful! You can now cast your vote.");
                }, 1500);
            } else {
                verificationStatus.textContent = "Face verification failed. Please try again.";
                verificationStatus.className = "status-message error";
            }
        } else {
            verificationStatus.textContent = "No face data found. Please complete registration with face capture.";
            verificationStatus.className = "status-message error";
        }
    }, 3000);
}

/**
 * Stops camera stream and cleans up resources
 */
function stopFaceVerification() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    const video = document.getElementById('verificationVideo');
    if (video.srcObject) {
        video.srcObject = null;
    }
}

// =========================================================================
// Modal Close Handlers
// =========================================================================

/**
 * Sets up close handlers for all modal close buttons
 * Ensures proper cleanup when modals are closed
 */
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal.id === 'faceVerificationModal') {
            stopFaceVerification();
        }
        modal.style.display = 'none';
    });
});