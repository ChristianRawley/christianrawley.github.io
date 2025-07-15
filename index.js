// Auto Theme Switching
const preference = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-bs-theme', preference ? 'dark' : 'light');

// Fetch portfolio data and render the page
fetch('portfolio.json').then(res => res.json()).then(data => {
    renderBio(data.bio);
    renderContact(data.contact);
    renderEducation(data.education);
    renderExperience(data.experience);
    renderProjects(data.projects);
});

// Render bio card
function renderBio(bio) {
    document.getElementById('bio-card').innerHTML = `
        <div class="card">
            <img src="src/banner.jpg" class="card-img-top" alt="">
            <div class="card-body p-3">  
                <h5 class="card-title">${bio.name}</h5>
                <p class="card-text text-muted">${bio.about}</p>
            </div>
        </div>
    `;
}

// Render contact list
function renderContact(contacts) {
    const contactItems = contacts.map(contact => `
        <li class="list-group-item">
            <a href="${contact.href}" class="link-body-emphasis text-decoration-none" target="_blank">
                <i class="bi ${contact.icon} me-2"></i>${contact.label}
            </a>
        </li>
    `).join('');

    document.getElementById('contact-card').innerHTML = `
        <div class="card-header">Contact Me</div>
        <ul class="list-group list-group-flush">${contactItems}</ul>
    `;
}

// Render education
function renderEducation(edu) {
    const details = edu.details.map(d => `<p class="m-0">${d}</p>`).join('');
    document.getElementById('education-card').innerHTML = `
        <div class="card-header">Education</div>
        <div class="card-body p-3">
            <h5 class="card-title">${edu.school}</h5>
            <p class="m-0 mb-1 text-muted"><i>${edu.degree}</i></p>
            ${details}
        </div>
    `;
}

// Render experience
function renderExperience(experiences) {
    const items = experiences.map(exp => `
        <li class="list-group-item">
            <h6 class="mt-1 mb-0">${exp.title}</h6>
            <small class="text-muted">${exp.company} · ${exp.duration} · ${exp.location}</small>
            <p class="mt-1 mb-1">${exp.description}</p>
        </li>
    `).join('');

    document.getElementById('experience-card').innerHTML = `
        <div class="card-header">Relevant Work Experience</div>
        <ul class="list-group list-group-flush">${items}</ul>
    `;
}

// Render projects
function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    projects.forEach(project => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100">
                <img src="${project.image}" class="card-img-top" alt="">
                <div class="card-body">
                    <h5 class="card-title">${project.title}</h5>
                    <p class="card-text">${project.description}</p>
                    <a href="${project.link}" class="btn btn-success" target="_blank">GitHub</a>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}