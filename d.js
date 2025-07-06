const user = JSON.parse(localStorage.getItem('discourseUser'));
const API_BASE_URL = 'https://discourse-lasp.onrender.com';

async function start() {
    document.title = 'Discourse';
    try {
        const response = await fetch(`${API_BASE_URL}/discussions`);
        const discussions = await response.json();

        if (discussions.length > 0) {
            document.body.innerHTML = `
                <button onclick="newDiscussion()">Add a discussion</button>
                <h1>All discussions</h1>
                <div class="discussionContainer"></div>
            `;
            data(discussions);
        } else {
            document.body.innerHTML = `
                <h1>No discussions yet</h1>
                <button onclick="newDiscussion()">Add a discussion</button>
            `;
        }
    } catch (error) {
        console.error('Error fetching discussions:', error);
        document.body.innerHTML = `
            <h1>Failed to load discussions. Please try again later.</h1>
            <button onclick="newDiscussion()">Add a discussion</button>
        `;
    }
}

start();

function data(discussions) {
    discussions.forEach((discussion) => {
        const discussionDiv = document.createElement('div');
        discussionDiv.className = 'discussion';

        const escapeHtmlAttribute = (str) => {
            if (typeof str !== 'string') return '';
            return str.replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '>').replace(/>/g, '&gt;');
        };

        const heading = escapeHtmlAttribute(discussion.heading);
        const subheading = escapeHtmlAttribute(discussion.subheading);
        const discussionUser = escapeHtmlAttribute(discussion.user);
        const date = escapeHtmlAttribute(discussion.date);
        const id = discussion.id;

        discussionDiv.innerHTML = `
            <h2 style="cursor: pointer;" onclick="showDiscussionById(${id})">${heading}</h2>
            <p>Written by ${discussionUser} on ${date}</p>
        `;

        document.querySelector('.discussionContainer').appendChild(discussionDiv);
    });
}

async function showDiscussion(heading, subheading, discussionUser, comments, date, id) {
    document.title = heading;
    const currentUser = JSON.parse(localStorage.getItem('discourseUser'));

    let fetchedComments = [];
    try {
        const response = await fetch(`${API_BASE_URL}/comments/${id}`);
        const commentsData = await response.json();
        if (Array.isArray(commentsData)) {
            fetchedComments = commentsData;
        } else {
            console.warn('Comments data fetched was not an array, defaulting to empty:', commentsData);
            fetchedComments = [];
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
    }

    document.body.innerHTML = `
        <p>Written by ${discussionUser} on ${date}<p>
        <h1>${heading}</h1>
        <h2>${subheading}</h2>
        <p><strong>Comments:</strong></p>
        <p>${fetchedComments.length} comments</p>
        <ul>
            ${fetchedComments.map((comment, idx) =>
                `<li>
                    ${comment.comment}
                    <span style="font-size:0.8em;color:gray;"> by ${comment.author}</span>
                    ${currentUser && comment.author === currentUser.username
                        ? `<button onclick="removeComment(${id}, ${comment.commentId})">Remove</button>`
                        : ""}
                </li>`
            ).join('')}
        </ul>
        ${`<input id="addComment" placeholder="Add a comment" onkeydown="
            if (event.key == 'Enter') addComment(${id}, this.value)
        ">`}
        <button onclick="start()">Back to discussions</button>
    `;
}

async function addComment(discussionId, commentText) {
    commentText = commentText.trim();
    if (!commentText) return;
    const currentUser = JSON.parse(localStorage.getItem('discourseUser'));
    if (!currentUser) {
        alert('You must be logged in to add a comment.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                discussionId: discussionId,
                comment: commentText,
                author: currentUser.username
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showDiscussionById(discussionId);

    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
    }
}

async function removeComment(discussionId, commentId) {
    const currentUser = JSON.parse(localStorage.getItem('discourseUser'));
    if (!currentUser) {
        alert('You must be logged in to remove a comment.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showDiscussionById(discussionId);

    } catch (error) {
        console.error('Error removing comment:', error);
        alert('Failed to remove comment. Please try again.');
    }
}


async function showDiscussionById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/discussions`);
        const discussions = await response.json();
        const discussion = discussions.find(d => Number(d.id) === Number(id));
        if (discussion) {
            showDiscussion(
                discussion.heading,
                discussion.subheading,
                discussion.user,
                null,
                discussion.date,
                discussion.id
            );
        } else {
            console.error('Discussion not found:', id);
            alert('Discussion not found.');
            start();
        }
    } catch (error) {
        console.error('Error fetching discussion by ID:', error);
        alert('Failed to load discussion. Please try again.');
        start();
    }
}

function newDiscussion() {
    if (!user) {
        alert('You must be logged in to add a discussion');
        return;
    }
    document.body.innerHTML = `
        <h1>Add Discussion</h1>
        <br>
        <input id='head' placeholder='Heading'>
        <input id='sub' placeholder='Subheading'>
        <button onclick="addDiscussion()">Add</button>
        <button onclick="start()">Cancel</button>
    `;
}

async function addDiscussion() {
    const now = new Date();
    const todaysDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const heading = document.getElementById('head').value;
    const subheading = document.getElementById('sub').value;

    if (!heading || !subheading) {
        alert('Please enter both a heading and a subheading.');
        return;
    }

    const newId = Date.now().toString();

    const newDiscussionData = {
        id: newId,
        heading: heading,
        subheading: subheading,
        user: user.username,
        date: todaysDate,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/discussions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newDiscussionData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Discussion added:', result.message, 'ID:', result.id);
        start();

    } catch (error) {
        console.error('Error adding discussion:', error);
        alert('Failed to add discussion. Please try again.');
    }
}
