const path = require("path");
const { hash, sqliteExec, sqliteGet, encodeDbString, decodeDbString } = require(path.join(__dirname, "./utils"));
let newProjectContent = false;

// Change project from the format stored in JSON backup file to the format stored in database
const encodeProject = (project) => {
    project.title = encodeDbString(project.title);
    project.dates = encodeDbString(project.dates);
    project.thumbnail = encodeDbString(project.thumbnail);
    project.skills = encodeDbString(project.skills ? project.skills.join("\n") : null);
    project.description = encodeDbString(project.description ? project.description.join("\n"): null);
    project.link = encodeDbString(project.link);
    project.importance = project.importance ? project.importance : 0;
}

// Change project from the format stored in database to the format stored in JSON backup file
const decodeProject = (project) => {
    project.title = decodeDbString(project.title);
    project.dates = decodeDbString(project.dates);
    project.thumbnail = decodeDbString(project.thumbnail);
    project.skills = decodeDbString(project.skills).split("\n");
    project.description = decodeDbString(project.description).split("\n");
    project.link = decodeDbString(project.link);
}

// Read project information from database
const queryAllProject = async () => {
    let projects = await sqliteGet(`SELECT * FROM project ORDER BY importance DESC, date DESC`);
    projects.forEach(project => decodeProject(project));
    return projects;
}

// Insert new project into database
const insertIntoProject = async(project) => {
    encodeProject(project);
    const { title, date, thumbnail, dates, skills, description, link, importance } = project;
    await sqliteExec(
        `INSERT INTO project (title, date, thumbnail, dates, skills, description, link, importance) 
        VALUES(
            ${title},
            ${date},
            ${thumbnail},
            ${dates},
            ${skills},
            ${description},
            ${link},
            ${importance}
            )`
    );
    newProjectContent = true;
}

// Edit information of project in database with given pk
const editProjectDB = async(oldTitle, oldDate, project) => {
    encodeProject(project);
    const { title, date, thumbnail, dates, skills, description, link, importance } = project;
    const setTitle = `title = ${title}`;
    const setDate = `date = ${date}`;
    const setThumbnail = `thumbnail = ${thumbnail}`;
    const setDates = `dates = ${dates}`;
    const setSkills = `skills = ${skills}`;
    const setDescription = `description = ${description}`;
    const setLink = `link = ${link}`;
    const setImportance = `importance = ${importance}`;
    const setAttributes = [setTitle, setDate, setThumbnail, setDates, setSkills, setDescription, setLink, setImportance].join(", ");
    await sqliteExec(
        `UPDATE project SET 
        ${setAttributes} 
        WHERE title = ${encodeDbString(oldTitle)} AND date = ${oldDate}`
    );
    newProjectContent = true;
}

// Delete project from database with given pk
const deleteProjectDB = async(title, date) => {
    await sqliteExec(
        `DELETE FROM project WHERE title = ${encodeDbString(title)} AND date = ${date}`
    );
    newProjectContent = true;
}

// APIs
const addProject = async(req, res) => {
    let { project, password } = req.body;
    const { title, date, thumbnail, dates, skills, description, link, importance } = project;
    msg = {}
    // Sanity checks
    if (!(title && date && thumbnail && dates && link && 
        Array.isArray(skills) && skills.length > 0 && Array.isArray(description) && description.length > 0 && password)) {
        msg.success = false;
        msg.error = "Form not complete";
    } else if (!Number.isInteger(date) || date < 20190610 || date > 20500101) {
        msg.success = false;
        msg.error = "Date not valid";
    } else if (!(!importance || Number.isInteger(importance))) {
        msg.success = false;
        msg.error = "Importance level not valid";
    } else if (hash(password) != "oKaVXnQ0YZ61k3EOJakytljtnkVg49mBjeVqhwRItsf") {
        msg.success = false;
        msg.error = "Wrong password";
    } else {
        try {
            await insertIntoProject(project);
            msg.success = true;
        } catch (error) {
            console.log(error);
            msg.success = false;
            msg.error = "See stack trace in server.log";
        }
    }

    res.write(JSON.stringify(msg));
    res.end();
}

const editProject = async(req, res) => {
    const { project, password } = req.body;
    const oldTitle = req.body.title;
    const oldDate = req.body.date;
    const { title, date, thumbnail, dates, skills, description, link, importance } = project;
    msg = {}
    // Sanity checks
    if (!(oldTitle && oldDate && title && date && thumbnail && dates && link && 
        Array.isArray(skills) && skills.length > 0 && Array.isArray(description) && description.length > 0 && password)) {
        msg.success = false;
        msg.error = "Form not complete";
    } else if (!Number.isInteger(date) || date < 20190610 || date > 20500101) {
        msg.success = false;
        msg.error = "Date not valid";
    } else if (!(!importance || Number.isInteger(importance))) {
        msg.success = false;
        msg.error = "Importance level not valid";
    } else if (hash(password) != "oKaVXnQ0YZ61k3EOJakytljtnkVg49mBjeVqhwRItsf") {
        msg.success = false;
        msg.error = "Wrong password";
    } else {
        try {
            await editProjectDB(title, date, project);
            msg.success = true;
        } catch (error) {
            console.log(error);
            msg.success = false;
            msg.error = "See stack trace in server.log";
        }
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const deleteProject = async(req, res) => {
    const { title, date, password } = req.body;
    if (hash(password) != "oKaVXnQ0YZ61k3EOJakytljtnkVg49mBjeVqhwRItsf") {
        msg.success = false;
        msg.error = "Wrong password";
    }
    try {
        await deleteProjectDB(title, date);
        msg.success = true;
    } catch(error) {
        console.log(error);
        msg.success = false;
        msg.error = "See stack trace in server.log";
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const getProjects = async(req, res) => {
    let page = req.body.page;
    let msg = {};

    let projects = await queryAllProject();

    let totalPages = Math.ceil(projects.length/5);
    page = (Number.isInteger(page) && page >= 1) ? page : 1;
    page = (page > totalPages) ? totalPages : page;

    projects = projects.slice((page-1)*5, page*5);
    msg.page = page;
    msg.totalPages = totalPages;
    msg.projects = projects;

    res.write(JSON.stringify(msg));
    res.end();
}

// Insert initial data to database
const loadProjectFromJSON = async () => {
    const backupPath = path.join(__dirname, "./database/backup/project.json");
    const fs = require("fs");

    const projects = JSON.parse(fs.readFileSync(backupPath));
    for (let project of projects.projects) {
        try {
            await insertIntoProject(project);
        } catch (error) {
            console.log("\n" + project.title + " " + project.date);
            console.log(error);
            console.log("\n");
        }
    }
}

// Backup database information to JSON
const exportProjectToJSON = async () => {
    const backupPath = path.join(__dirname, "./database/backup/project.json");
    const fs = require("fs");

    let projects = await queryAllProject();
    fs.writeFileSync(backupPath, JSON.stringify({projects: projects}));
}

// Backup daemon
{
    let wakeupinterval = 10 * 60 * 1000;
    setInterval(() => {
        if (newProjectContent) {
            exportProjectToJSON();
        }
        newProjectContent = false;
    }, wakeupinterval);
}

exports.addProject = addProject;
exports.editProject = editProject;
exports.deleteProject = deleteProject;
exports.getProjects = getProjects;

exports.loadProjectFromJSON = loadProjectFromJSON;
exports.exportProjectToJSON = exportProjectToJSON;

// For testing purposes
exports.queryAllProject = queryAllProject;
exports.insertIntoProject = insertIntoProject;
exports.editProjectDB = editProjectDB;
exports.deleteProjectDB = deleteProjectDB;