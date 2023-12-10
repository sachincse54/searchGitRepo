//start checkusername function 
function checkUsername(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    const username = document.getElementById('username').value;

    // Make a request to GitHub API to check if the username exists
    fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            if (response.ok) {
                // Username exists, navigate to repository.html
                window.location.href = `repository.html?username=${username}`;
            } else {
                //if Username does not exist, show a toast message
                showToast('User not exist!!');
            }
        })
        .catch(error => {
            console.error('Error checking username:', error);
            showToast('An error occurred. Please try again.');
        });
}
//end checkusername function

// start showtoast  function
let lastToastPosition = 0; // Variable to store the last toast position
let toastCount = 0; // Variable to generate unique toast IDs

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toastMessage = document.createElement('div');
    const toastId = ++toastCount;

    toastMessage.className = 'toast';
    toastMessage.innerHTML = `
    <i class="uil uil-confused"></i>
    <p>${message}</p>
    <i class="uil uil-times close-toast"></i>
    `;

    toastContainer.insertBefore(toastMessage, toastContainer.firstChild);
    // Add event listener to close button
    const closeButton = toastMessage.querySelector('.close-toast');
    closeButton.addEventListener('click', () => {
        setTimeout(() => {
            toastContainer.removeChild(toastMessage);
        }); 
    });

    // Close the toast after 5 seconds (adjust as needed)
    setTimeout(() => {
        setTimeout(() => {
            toastContainer.removeChild(toastMessage);
        }, 500);
    }, 5000);
}
// end showtoast  function




document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const guserImg = document.getElementById('guserProfile');
    const name = document.getElementById('gusername');
    const publicRepositories = document.getElementById('gpr');
    const followers = document.getElementById('gfr');
    const following = document.getElementById('gfw');
    const location = document.getElementById('glocation');
    const repoListContainer = document.getElementById('repo_list-container');

    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");

    let currentPage = 1;
    const perPage = 12;
    let totalRepositories = 0;

    if (username) {
        // Fetch user information from GitHub API
        fetch(`https://api.github.com/users/${username}`)
            .then(response => response.json())
            .then(userData => {
                // Extract user details
                displayUser(userData);
                totalRepositories = userData.public_repos || 0;
                fetchRepositories(username, currentPage, perPage);
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
            });
    }

    function fetchRepositories(username, page, perPage) {
        fetch(`https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`)
            .then((response) => response.json())
            .then((repos) => {
                displayRepositories(repos);
                updatePaginationButtons();
            })
            .catch((error) => {
                console.error("Error fetching repositories:", error);
            });
    }

    function updatePaginationButtons() {
        const prevButton = document.getElementById("prevButton");
        const nextButton = document.getElementById("nextButton");
    
        // Remove existing event listeners
        prevButton.removeEventListener("click", handlePrevButtonClick);
        nextButton.removeEventListener("click", handleNextButtonClick);
    
        // Add new event listeners based on the current page
        if (currentPage === 1) {
            prevButton.addEventListener("click", handlePrevButtonClick);
        }
    
        const lastPage = Math.ceil(totalRepositories / perPage);
        if (currentPage === lastPage || totalRepositories === 0) {
            nextButton.addEventListener("click", handleNextButtonClick);
        }
    }
    
    function handlePrevButtonClick() {
        showToast('Cannot go back!!');
    }
    
    function handleNextButtonClick() {
        showToast('User has no more repositories!!');
    }
    updatePaginationButtons();
    


    function displayUser(userData) {
        const favatarUrl = userData.avatar_url || 'assets/img/user_icon.png';
        const fname = userData.name || 'Name not provided';
        const flocation = userData.location || 'Location not provided';
        const frepositories = userData.public_repos || 0;
        const ffollowers = userData.followers || 0;
        const ffollowing = userData.following || 0;

        guserImg.src = favatarUrl;
        name.innerText = fname;
        publicRepositories.innerText = frepositories;
        location.innerText = flocation;
        followers.innerText = ffollowers;
        following.innerText = ffollowing;
    }

    function displayRepositories(repos) {
        repoListContainer.innerHTML = "";

        if (repos.length === 0) {
            const noRepoMessage = document.createElement("p");
            noRepoMessage.textContent = "User has no repositories.";
            repoListContainer.appendChild(noRepoMessage);
        } else {
            repos.forEach((repo) => {
                const listItem = document.createElement("div");
                listItem.className = "repo_item";
                listItem.innerHTML = `
                    <h2>${repo.name}</h2>
                    <p>${repo.description || 'No description available'}</p>
                    <p class="topics">${repo.topics.length > 0 ? repo.topics.map(topic => `<span class="topic-button">${topic}</span>`).join('') : 'No topics available'}</p>
                    <a href="${repo.html_url}" target="_blank">View on GitHub<i class="uil uil-angle-double-right"></i></a>
                `;
                repoListContainer.appendChild(listItem);
            });
        }
    }

    // Pagination buttons
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchRepositories(username, currentPage, perPage);
        }
    });

    nextButton.addEventListener("click", () => {
        const lastPage = Math.ceil(totalRepositories / perPage);
        if (currentPage < lastPage) {
            currentPage++;
            fetchRepositories(username, currentPage, perPage);
        }
    });
});