const repoLib = require('./repo')

async function getRepoOpenProjects(context, owner, repo) {
    const getProjects = await context.github.projects.listForRepo({
        owner: owner,
        repo: repo,
        state: "open",
        per_page: 100
    })
    return getProjects.data
}

async function getProjectColumns(context, project) {
    const getColumns = await context.github.projects.listColumns({
        project_id: project.id,
    })
    return getColumns.data
    }

async function getColumnCards(context, column) {
    const getCards = await context.github.projects.listCards({
        column_id: column.id,
    })
    return getCards.data
}

async function getProjectWorkflowLabels (context) {
    const config = await context.config("eskworkflow.yaml");
    var workflowLabels = []
    for (const column of config.repo_project_workflow[1].columns) {
      for (label of column.column[1].labels){
        workflowLabels.push(label)
      }
    }
    return workflowLabels
}

async function moveIssuesToColumn(app, context, project, owner, repo) {

    const repoIssues = await repoLib.getRepoIssues(context, owner, repo)
    const config = await context.config("eskworkflow.yaml");

    for (const issue of repoIssues) {
        for (const label of issue.labels) {
        for (const column of config.repo_project_workflow[1].columns) {
            for (columnLabel of column.column[1].labels) {
                if (columnLabel.name == label.name) {
                    moveOrCreateCard(app, context, project, issue, column)
                }
            }
        }
        } 
    }
}

async function moveOrCreateCard(app, context, project, issue, column) {
    // Check if card exists
    var foundCard = null
    const projectColumns = await getProjectColumns(context, project)
    for (const col of projectColumns) {
        const columnCards = await getColumnCards(context, col)
        for (card of columnCards) {
            if (card.content_url == issue.url){
                foundCard = card
                break
            }
        }
        if (foundCard != null) {
        break
        }
    }

    for (const col of projectColumns) {
        if (col.name === column.column[0].name) {
            if (foundCard == null) {
                app.log("Create issue " + issue.title + " in " + column.column[0].name)
                await context.github.projects.createCard({
                column_id: col.id,
                content_id: issue.id,
                content_type: "Issue",
                })
            } else {
                app.log("Move issue " + issue.title + " to " + column.column[0].name)
                await context.github.projects.moveCard({
                card_id: card.id,
                position: "bottom",
                column_id: col.id
                })
            }
            break
        }
    }
}

exports.getRepoOpenProjects = getRepoOpenProjects;
exports.getProjectColumns = getProjectColumns;
exports.getColumnCards = getColumnCards;
exports.getProjectWorkflowLabels = getProjectWorkflowLabels;
exports.moveIssuesToColumn = moveIssuesToColumn;
exports.moveOrCreateCard = moveOrCreateCard;
