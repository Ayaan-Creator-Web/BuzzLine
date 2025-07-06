const user = JSON.parse(localStorage.getItem('discourseUser'));

function start() {
    document.title = 'Discourse';
    if (localStorage.getItem('discussions')) {
        document.body.innerHTML = `
            <button onclick="newDiscussion()">Add a discussion</button>
            <h1>Here are all the lastest discussions${user ? ', ' + user.username : 'Guest'}</h1>
            <div class="discussionContainer"></div>
        `;
        data();
    } else {
        document.body.innerHTML = `
            <h1>No discussions yet</h1>
            <button onclick="newDiscussion()">Add a discussion</button>
        `;
    }
}

start();

// Convert old string comments to objects with author "Unknown"
function migrateComments(discussions) {
    return discussions.map(discussion => {
        discussion.comments = discussion.comments.map(c =>
            typeof c === "string" ? { text: c, author: "Unknown" } : c
        );
        return discussion;
    });
}

// Only set discussions if not already present (to avoid overwriting user comments)
if (!localStorage.getItem('discussions')) {
    localStorage.setItem('discussions', JSON.stringify(discussions));
} else {
    // Migrate old comments if needed
    let stored = JSON.parse(localStorage.getItem('discussions'));
    stored = migrateComments(stored);
    localStorage.setItem('discussions', JSON.stringify(stored));
}

function data() {
    let discussions = JSON.parse(localStorage.getItem('discussions'));
    discussions = migrateComments(discussions);

    discussions.forEach((discussion) => {
        const discussionDiv = document.createElement('div');
        discussionDiv.className = 'discussion';

        const escapeHtmlAttribute = (str) => {
            if (typeof str !== 'string') return '';
            return str.replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };

        const heading = escapeHtmlAttribute(discussion.heading);
        const subheading = escapeHtmlAttribute(discussion.subheading);
        const user = escapeHtmlAttribute(discussion.user);
        const comments = escapeHtmlAttribute(JSON.stringify(discussion.comments));
        const date = escapeHtmlAttribute(discussion.date);
        const id = discussion.id;

        discussionDiv.innerHTML = `
            <h2 style="cursor: pointer;" onclick="showDiscussionById(${id})">${discussion.heading}</h2>
        `;

        document.querySelector('.discussionContainer').appendChild(discussionDiv);
    });
}

async function showDiscussion(heading, subheading, discussionUser, comments, date, id) {
    document.title = heading;
    comments = JSON.parse(comments);
    comments = comments.map(c =>
        typeof c === "string" ? { text: c, author: "Unknown" } : c
    );
    const currentUser = JSON.parse(localStorage.getItem('discourseUser'));
    document.body.innerHTML = `
        <p>Written by ${discussionUser} on ${date}<p>
        <h1>${heading}</h1>
        <h2>${subheading}</h2>
        <p><strong>Comments:</strong></p>
        <p>${comments.length} comments</p>
        <ul>
            ${comments.map((comment, idx) =>
                `<li>
                    ${comment.text}
                    <span style="font-size:0.8em;color:gray;"> by ${comment.author}</span>
                    ${currentUser && comment.author === currentUser.username
                        ? `<button onclick="removeComment(${id}, ${idx})">Remove</button>`
                        : ""}
                </li>`
            ).join('')}
        </ul>
        ${user ? `<input id="addComment" placeholder="Add a comment" onkeydown="
            if (event.key == 'Enter') addComment(${id}, this.value)
        ">` : `<p>Login to add comments</p>`}
        <button onclick="start()">Back to discussions</button>
    `;
}

function addComment(id, comment) {
    comment = comment.trim();
    if (!comment) return;
    let discussions = JSON.parse(localStorage.getItem('discussions'));
    discussions = migrateComments(discussions);
    const updatedDiscussion = discussions.find(d => Number(id) === Number(d.id));
    const currentUser = JSON.parse(localStorage.getItem('discourseUser'));
    if (updatedDiscussion && currentUser) {
        updatedDiscussion.comments.push({ text: comment, author: currentUser.username });
        localStorage.setItem('discussions', JSON.stringify(discussions));
        showDiscussion(
            updatedDiscussion.heading,
            updatedDiscussion.subheading,
            updatedDiscussion.user,
            JSON.stringify(updatedDiscussion.comments),
            updatedDiscussion.date,
            updatedDiscussion.id
        );
    }
}

function removeComment(id, commentIdx) {
    let discussions = JSON.parse(localStorage.getItem('discussions'));
    discussions = migrateComments(discussions);
    const updatedDiscussion = discussions.find(d => Number(id) === Number(d.id));
    if (updatedDiscussion) {
        if (updatedDiscussion.comments[commentIdx].author === user.username) {
            updatedDiscussion.comments.splice(commentIdx, 1);
            localStorage.setItem('discussions', JSON.stringify(discussions));
            showDiscussion(
                updatedDiscussion.heading,
                updatedDiscussion.subheading,
                updatedDiscussion.user,
                JSON.stringify(updatedDiscussion.comments),
                updatedDiscussion.date,
                updatedDiscussion.id
            );
        }
    }
}

function showDiscussionById(id) {
    let discussions = JSON.parse(localStorage.getItem('discussions'));
    discussions = migrateComments(discussions);
    const discussion = discussions.find(d => Number(d.id) === Number(id));
    if (discussion) {
        showDiscussion(
            discussion.heading,
            discussion.subheading,
            discussion.user,
            JSON.stringify(discussion.comments),
            discussion.date,
            discussion.id
        );
    }
}

function newDiscussion() {
    if (!user) {alert('You must be logged in to add a discussion'); return;}
    document.body.innerHTML = `
        <h1>Add Discussion</h1>
        <br>
        <input id='head' placeholder='Heading'>
        <input id='sub' placeholder='Subheading'>
        <button onclick="addDiscussion()">Add</button>
    `;
}

function addDiscussion() {
    const now = new Date();
    const todaysDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const heading = document.getElementById('head').value;
    const subheading = document.getElementById('sub').value;

    // Retrieve discussions from localStorage
    let discussions = JSON.parse(localStorage.getItem('discussions')) || []; // Initialize as empty array if none exist

    let newDiscussion = {
        heading: heading,
        subheading: subheading,
        user: user.username, // Assuming 'user' is accessible from the global scope or passed
        comments: [],
        date: todaysDate,
        id: discussions.length > 0 ? Math.max(...discussions.map(d => d.id)) + 1 : 1 // Generate a unique ID
    }
    discussions.push(newDiscussion);
    localStorage.setItem('discussions', JSON.stringify(discussions))
    start();
}